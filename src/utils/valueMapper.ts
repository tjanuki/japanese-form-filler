// Maps field types to appropriate values

import { FieldType, FieldDetector } from './fieldDetector';
import { UserData } from './dataGenerator';
import { getGenericTextSample } from '../data/japanese-text-samples';
import { JobPostingData, detectJobPostingFieldContext, getJobPostingValue } from '../data/japanese-job-posting';

export type PageContext = 'default' | 'job-posting';

export interface ValueMapperConfig {
  nameFormat: 'surname-first' | 'given-first';
  pageContext: PageContext;
  jobPostingData: JobPostingData;
}

export function getValueForFieldType(
  fieldType: FieldType,
  userData: UserData,
  config: ValueMapperConfig,
  element?: HTMLElement
): string | null {
  // For job posting pages, use job-specific values for relevant fields
  if (config.pageContext === 'job-posting' && element) {
    const identifiers = FieldDetector.getElementIdentifiers(element);
    const fieldContext = detectJobPostingFieldContext(identifiers);
    const jobPostingValue = getJobPostingValue(config.jobPostingData, fieldContext);
    if (jobPostingValue !== null) {
      return jobPostingValue;
    }
  }

  const surnameFirst = config.nameFormat === 'surname-first';

  switch (fieldType) {
    case FieldType.FULL_NAME_KANJI:
      return surnameFirst
        ? `${userData.name.kanjiSurname} ${userData.name.kanjiGivenName}`
        : `${userData.name.kanjiGivenName} ${userData.name.kanjiSurname}`;
    case FieldType.SURNAME_KANJI:
      return userData.name.kanjiSurname;
    case FieldType.GIVEN_NAME_KANJI:
      return userData.name.kanjiGivenName;
    case FieldType.FULL_NAME_HIRAGANA:
      return surnameFirst
        ? `${userData.name.hiraganaSurname} ${userData.name.hiraganaGivenName}`
        : `${userData.name.hiraganaGivenName} ${userData.name.hiraganaSurname}`;
    case FieldType.SURNAME_HIRAGANA:
      return userData.name.hiraganaSurname;
    case FieldType.GIVEN_NAME_HIRAGANA:
      return userData.name.hiraganaGivenName;
    case FieldType.FULL_NAME_KATAKANA:
      return surnameFirst
        ? `${userData.name.katakanaSurname} ${userData.name.katakanaGivenName}`
        : `${userData.name.katakanaGivenName} ${userData.name.katakanaSurname}`;
    case FieldType.EMAIL:
      return userData.email;
    case FieldType.PHONE:
    case FieldType.MOBILE_PHONE:
      return userData.phone;
    case FieldType.POSTAL_CODE:
      return userData.address.postalCode;
    case FieldType.PREFECTURE:
      return userData.address.prefecture;
    case FieldType.CITY:
      return userData.address.city;
    case FieldType.ADDRESS:
      return userData.address.town + userData.address.blockNumber;
    case FieldType.FULL_ADDRESS:
      return userData.address.fullAddress;
    case FieldType.COMPANY_NAME:
      return userData.companyName;
    case FieldType.DATE:
      return userData.dateOfBirth;
    case FieldType.PASSWORD:
      return 'password';
    case FieldType.GENERIC_TEXT:
      return getGenericTextSample();
    default:
      return null;
  }
}
