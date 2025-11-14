#!/bin/bash

# Deploy script for sakiko-januki-ca
# Usage: ./deploy.sh [--skip-npm] [--skip-sidecar]

SKIP_NPM=false
SKIP_SIDECAR=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-npm)
            SKIP_NPM=true
            shift
            ;;
        --skip-sidecar)
            SKIP_SIDECAR=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./deploy.sh [--skip-npm] [--skip-sidecar]"
            exit 1
            ;;
    esac
done

echo "🚀 Starting deployment to production..."
echo "   Skip NPM build: $SKIP_NPM"
echo "   Skip Sidecar deploy: $SKIP_SIDECAR"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to production server
echo "🔄 Deploying to production server..."
ssh caws bash -s -- "$SKIP_NPM" "$SKIP_SIDECAR" << 'EOF'
    # Receive arguments from local script
    SKIP_NPM=$1
    SKIP_SIDECAR=$2

    cd /var/www/sakiko-januki-ca
    echo "📥 Pulling latest changes..."
    sudo git pull origin main

    echo "📦 Installing composer dependencies..."
    sudo composer install --no-dev --optimize-autoloader

    if [ "$SKIP_NPM" = false ]; then
        echo "🏗️ Building frontend assets..."
        sudo npm install
        sudo NODE_OPTIONS="--max-old-space-size=1024" npm run build
    else
        echo "⏭️  Skipping npm build (--skip-npm flag used)"
    fi

    echo "🔧 Running Laravel optimizations..."
    sudo php artisan config:cache
    sudo php artisan route:cache
    sudo php artisan view:cache

    echo "🗃️ Running migrations..."
    sudo php artisan migrate --force

    if [ "$SKIP_SIDECAR" = false ]; then
        echo "☁️ Deploying Lambda functions (Sidecar)..."
        sudo php artisan sidecar:deploy --activate --env=production
    else
        echo "⏭️  Skipping Sidecar deployment (--skip-sidecar flag used)"
    fi

    echo "🔄 Restarting services..."
    sudo systemctl daemon-reload
    sudo systemctl reload nginx
    # Skip supervisor if not installed
    command -v supervisorctl &> /dev/null && sudo supervisorctl restart all || echo "Supervisor not installed, skipping..."

    echo "✅ Deployment complete!"
EOF

echo "✨ Deployment finished successfully!"
