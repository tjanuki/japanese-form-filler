// Form filling engine - orchestrator
// Delegates to specialized fillers for each form element type

import { DataGenerator } from '../utils/dataGenerator';
import { FormFillerSettings } from '../utils/types';
import { generateJobPostingData } from '../data/japanese-job-posting';
import { ValueMapperConfig, PageContext } from '../utils/valueMapper';
import { fillNativeField } from './fillers/nativeElementFiller';
import { fillPrimeVueSelect, fillPrimeVueMultiSelect } from './fillers/primeVueSelectFiller';
import { fillPrimeVueInputNumber } from './fillers/primeVueNumberFiller';
import { fillPrimeVueDatePicker } from './fillers/primeVueDateFiller';

export { FormFillerSettings } from '../utils/types';

export class FormFiller {
  private dataGenerator: DataGenerator;
  private settings: FormFillerSettings;
  private valueMapperConfig: ValueMapperConfig;

  constructor(settings?: FormFillerSettings) {
    this.settings = settings || {
      skipHiddenFields: true,
      skipReadonlyFields: true,
      defaultGender: 'random',
      nameFormat: 'surname-first'
    };
    this.dataGenerator = new DataGenerator();
    this.valueMapperConfig = {
      nameFormat: this.settings.nameFormat,
      pageContext: this.detectPageContext(),
      jobPostingData: generateJobPostingData()
    };
  }

  private detectPageContext(): PageContext {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/job-postings/create') || currentPath.includes('/job-posting/create')) {
      return 'job-posting';
    }

    return 'default';
  }

  public fillAllForms(): number {
    const gender = this.settings.defaultGender === 'random'
      ? undefined
      : this.settings.defaultGender;

    const userData = this.dataGenerator.generateUserData(gender);

    let fieldsFilledCount = 0;

    // Fill native form elements
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((element) => {
      if (fillNativeField(element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, userData, this.settings, this.valueMapperConfig)) {
        fieldsFilledCount++;
      }
    });

    // Fill PrimeVue select components
    const primeSelects = document.querySelectorAll('.p-select');
    primeSelects.forEach((element) => {
      if (fillPrimeVueSelect(element as HTMLElement, userData, this.valueMapperConfig)) {
        fieldsFilledCount++;
      }
    });

    // Fill PrimeVue multiselect components
    const primeMultiSelects = document.querySelectorAll('.p-multiselect');
    primeMultiSelects.forEach((element) => {
      if (fillPrimeVueMultiSelect(element as HTMLElement, userData)) {
        fieldsFilledCount++;
      }
    });

    // Fill PrimeVue InputNumber components
    const primeInputNumbers = document.querySelectorAll('.p-inputnumber');
    primeInputNumbers.forEach((element) => {
      if (fillPrimeVueInputNumber(element as HTMLElement)) {
        fieldsFilledCount++;
      }
    });

    // Fill PrimeVue DatePicker components
    const primeDatePickers = document.querySelectorAll('.p-datepicker');
    primeDatePickers.forEach((element) => {
      if (fillPrimeVueDatePicker(element as HTMLElement, userData)) {
        fieldsFilledCount++;
      }
    });

    return fieldsFilledCount;
  }
}
