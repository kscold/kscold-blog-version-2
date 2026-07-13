import type {
  AdminNightProgramExperienceLevel,
  AdminNightProgramFoodPreference,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
} from '@/entities/admin-night';
import { type AdminNightOption } from '@/widgets/admin-night/lib/adminNight';

export interface BloomVoteFormState {
  requesterName: string;
  contactEmail: string;
  contact: string;
  interestLevel: AdminNightProgramInterestLevel;
  experienceLevel: AdminNightProgramExperienceLevel;
  sessionStyle: AdminNightProgramSessionStyle;
  sessionLength: AdminNightProgramSessionLength;
  foodPreference: AdminNightProgramFoodPreference;
  preferredDays: AdminNightProgramPreferredDay[];
  preferredTimes: string[];
  interestedTopics: string[];
  desiredTakeaways: string;
  message: string;
}

export type BloomVoteFormErrors = Partial<Record<keyof BloomVoteFormState, string>>;

export type UpdateBloomVoteForm = <TKey extends keyof BloomVoteFormState>(
  key: TKey,
  value: BloomVoteFormState[TKey]
) => void;

export const initialFormState: BloomVoteFormState = {
  requesterName: '',
  contactEmail: '',
  contact: '',
  interestLevel: 'WANT_TO_ATTEND',
  experienceLevel: 'NEW_TO_AGENT',
  sessionStyle: 'MIXED',
  sessionLength: 'STANDARD_120',
  foodPreference: 'LIGHT_SNACK',
  preferredDays: ['SATURDAY', 'SUNDAY'],
  preferredTimes: ['weekend-day'],
  interestedTopics: ['agent-methodology', 'tool-rag-memory'],
  desiredTakeaways: '',
  message: '',
};

const NAME_PATTERN = /^[가-힣A-Za-z][가-힣A-Za-z\s·.-]{1,39}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function onlyPhoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatPhoneNumber(value: string) {
  const rawDigits = onlyPhoneDigits(value);
  const digits = rawDigits.startsWith('02') ? rawDigits.slice(0, 10) : rawDigits.slice(0, 11);

  if (digits.startsWith('02')) {
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 5) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhoneNumber(value: string) {
  const digits = onlyPhoneDigits(value);
  return /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d{8,9})$/.test(digits);
}

export function optionLabel(options: AdminNightOption[], value: string) {
  return options.find(option => option.value === value)?.label ?? value;
}

export function topEntries(counts?: Record<string, number>, limit = 3) {
  return Object.entries(counts ?? {})
    .sort(([, left], [, right]) => right - left)
    .slice(0, limit);
}

export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

export function validateBloomVoteForm(form: BloomVoteFormState) {
  const errors: BloomVoteFormErrors = {};
  const requesterName = form.requesterName.trim();
  const contactEmail = form.contactEmail.trim();

  if (!requesterName) {
    errors.requesterName = '실제 본명을 적어주세요.';
  } else if (!NAME_PATTERN.test(requesterName)) {
    errors.requesterName = '본명은 한글/영문 기준 2~40자로 적어주세요.';
  }

  if (!contactEmail) {
    errors.contactEmail = '안내 받을 이메일을 적어주세요.';
  } else if (contactEmail.length > 120 || !EMAIL_PATTERN.test(contactEmail)) {
    errors.contactEmail = '이메일 형식이 올바르지 않습니다.';
  }

  if (!form.contact.trim()) {
    errors.contact = '연락처를 적어주세요.';
  } else if (!isValidPhoneNumber(form.contact)) {
    errors.contact = '연락처는 010-1234-5678처럼 숫자 10~11자리로 적어주세요.';
  }

  if (!form.interestLevel) {
    errors.interestLevel = '참여 의향을 골라주세요.';
  }
  if (!form.experienceLevel) {
    errors.experienceLevel = '현재 경험 수준을 골라주세요.';
  }
  if (!form.sessionStyle) {
    errors.sessionStyle = '선호 Bloom 형식을 골라주세요.';
  }
  if (!form.sessionLength) {
    errors.sessionLength = '좋은 Bloom 시간을 골라주세요.';
  }
  if (!form.foodPreference) {
    errors.foodPreference = '음식/음료 선호를 골라주세요.';
  }
  if (form.preferredDays.length === 0) {
    errors.preferredDays = '희망 요일을 하나 이상 골라주세요.';
  }
  if (form.preferredTimes.length === 0) {
    errors.preferredTimes = '가능한 시간대를 하나 이상 골라주세요.';
  }
  if (form.interestedTopics.length === 0) {
    errors.interestedTopics = '듣고 싶은 주제를 하나 이상 골라주세요.';
  }

  return errors;
}

export function firstFormError(errors: BloomVoteFormErrors) {
  const order: (keyof BloomVoteFormState)[] = [
    'requesterName',
    'contactEmail',
    'contact',
    'interestLevel',
    'experienceLevel',
    'sessionStyle',
    'sessionLength',
    'foodPreference',
    'preferredDays',
    'preferredTimes',
    'interestedTopics',
  ];
  const firstKey = order.find(key => errors[key]);
  return firstKey ? errors[firstKey] ?? null : null;
}
