// Data generator
// Generates consistent fake Japanese data for a user

import { generateJapaneseName } from '../data/japanese-names';
import { generateJapaneseAddress } from '../data/japanese-addresses';
import { generateJapanesePhoneNumber } from '../data/japanese-phone';
import { generateJapaneseEmail } from '../data/japanese-email';
import { generateJapaneseCompanyName } from '../data/japanese-companies';
import { JapaneseName, JapaneseAddress } from './types';

export interface UserData {
  name: JapaneseName;
  address: JapaneseAddress;
  phone: string;
  email: string;
  companyName: string;
  dateOfBirth: string;
}

export class DataGenerator {
  generateUserData(gender?: 'male' | 'female'): UserData {
    const name = generateJapaneseName(gender);
    const address = generateJapaneseAddress();
    const phone = generateJapanesePhoneNumber('mobile');
    const email = generateJapaneseEmail(name);
    const companyName = generateJapaneseCompanyName();
    const dateOfBirth = this.generateDateOfBirth();

    return {
      name,
      address,
      phone,
      email,
      companyName,
      dateOfBirth
    };
  }

  private generateDateOfBirth(): string {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Math.floor(Math.random() * 50) - 20; // Age 20-70
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;

    // Use yyyy-MM-dd format for HTML date inputs
    return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
}
