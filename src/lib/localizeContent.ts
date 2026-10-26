import type { TFunction } from 'i18next';
import i18n from 'i18next';
import type { RepairGuide, LearningModule } from '../types';

/** Known learning categories stored in the database. */
const LEARNING_CATEGORY_KEYS: Record<string, string> = {
  'Automotive Fundamentals': 'learning.cat_fundamentals',
  'Electrical Systems': 'learning.cat_electrical',
  Electronics: 'learning.cat_electronics',
  'Engine Systems': 'learning.cat_engine',
  Diagnostics: 'learning.cat_diagnostics',
  'Vehicle Maintenance': 'learning.cat_maintenance',
};

/** Known repair categories stored in the database. */
const REPAIR_CATEGORY_KEYS: Record<string, string> = {
  'Electrical Systems': 'repairs.cat_electrical',
  'Engine Systems': 'repairs.cat_engine',
  'Braking System': 'repairs.cat_braking',
  'Suspension & Steering': 'repairs.cat_suspension',
  Drivetrain: 'repairs.cat_drivetrain',
  Diagnostics: 'repairs.cat_diagnostics',
};

const DIFFICULTY_KEYS: Record<string, string> = {
  beginner: 'repairs.difficulty_beginner',
  intermediate: 'repairs.difficulty_intermediate',
  advanced: 'repairs.difficulty_advanced',
  Beginner: 'repairs.difficulty_beginner',
  Intermediate: 'repairs.difficulty_intermediate',
  Advanced: 'repairs.difficulty_advanced',
};

const SERVICE_TYPE_KEYS: Record<string, string> = {
  Maintenance: 'vehicles.general_maintenance',
  'Oil Change': 'vehicles.oil_change',
  'Brake Service': 'vehicles.brake_service',
  'Tire Rotation': 'vehicles.tire_rotation',
  'Battery Replacement': 'vehicles.battery_replacement',
  'Engine Diagnostic': 'vehicles.engine_diagnostic',
  'General Maintenance': 'vehicles.general_maintenance',
  Repair: 'vehicles.repair',
};

type MockGuideKeys = { title: string; description: string; steps: string[] };

const MOCK_GUIDE_KEYS: Record<string, MockGuideKeys> = {
  'demo-battery-voltage-check': {
    title: 'repairs.mock_battery_title',
    description: 'repairs.mock_battery_description',
    steps: [
      'repairs.mock_battery_step1',
      'repairs.mock_battery_step2',
      'repairs.mock_battery_step3',
      'repairs.mock_battery_step4',
    ],
  },
  'demo-brake-pad-inspection': {
    title: 'repairs.mock_brake_title',
    description: 'repairs.mock_brake_description',
    steps: [
      'repairs.mock_brake_step1',
      'repairs.mock_brake_step2',
      'repairs.mock_brake_step3',
      'repairs.mock_brake_step4',
    ],
  },
  'demo-read-obd-codes': {
    title: 'repairs.mock_obd_title',
    description: 'repairs.mock_obd_description',
    steps: [
      'repairs.mock_obd_step1',
      'repairs.mock_obd_step2',
      'repairs.mock_obd_step3',
      'repairs.mock_obd_step4',
    ],
  },
  'demo-engine-air-filter': {
    title: 'repairs.mock_air_title',
    description: 'repairs.mock_air_description',
    steps: [
      'repairs.mock_air_step1',
      'repairs.mock_air_step2',
      'repairs.mock_air_step3',
      'repairs.mock_air_step4',
    ],
  },
};

const translate = (key: string | undefined, fallback: string, t: TFunction): string =>
  key ? t(key, { defaultValue: fallback }) : fallback;

export const localizeLearningCategory = (category: string, t: TFunction): string =>
  translate(LEARNING_CATEGORY_KEYS[category], category, t);

export const localizeRepairCategory = (category: string, t: TFunction): string =>
  translate(REPAIR_CATEGORY_KEYS[category], category, t);

export const localizeDifficulty = (difficulty: string, t: TFunction): string =>
  translate(DIFFICULTY_KEYS[difficulty], difficulty, t);

export const localizeLevel = (level: string, t: TFunction): string =>
  translate(DIFFICULTY_KEYS[level] ?? DIFFICULTY_KEYS[level.toLowerCase()], level, t);

export const localizeServiceType = (serviceType: string, t: TFunction): string =>
  translate(SERVICE_TYPE_KEYS[serviceType], serviceType, t);

/**
 * Translate the bundled demo guides. Guides that came from Appwrite keep their
 * original (English) content, but their category and difficulty labels are
 * still localized so the surrounding UI is consistent.
 */
export const localizeRepairGuide = (guide: RepairGuide, t: TFunction): RepairGuide => {
  const mock = MOCK_GUIDE_KEYS[guide.$id];

  return {
    ...guide,
    title: mock ? t(mock.title, { defaultValue: guide.title }) : guide.title,
    description: mock
      ? t(mock.description, { defaultValue: guide.description })
      : guide.description,
    steps: mock
      ? mock.steps.map((key, index) => t(key, { defaultValue: guide.steps?.[index] ?? '' }))
      : guide.steps,
    category: localizeRepairCategory(guide.category, t),
    difficulty: localizeDifficulty(guide.difficulty, t),
  };
};

/**
 * Localize a learning module based on the current language.
 * Parses the translations JSON string and falls back to English if the localized version is not available.
 */
export const localizeLearningModule = (module: LearningModule, t: TFunction): LearningModule => {
  const currentLang = i18n.language || 'en';

  // Parse the translations JSON string
  let translations: Record<string, { title?: string; description?: string; content?: string }> = {};
  if (module.translations) {
    try {
      translations = JSON.parse(module.translations);
    } catch (e) {
      console.error('Failed to parse translations JSON:', e);
    }
  }

  // Get localized content from translations, falling back to base English fields
  const langTranslations = translations[currentLang] || {};
  const enTranslations = translations.en || {};

  const getLocalizedField = (baseField: string, translationField?: string): string => {
    return translationField || baseField;
  };

  return {
    ...module,
    title: getLocalizedField(module.title, langTranslations.title || enTranslations.title),
    description: getLocalizedField(
      module.description,
      langTranslations.description || enTranslations.description
    ),
    content: getLocalizedField(
      module.content || '',
      langTranslations.content || enTranslations.content
    ),
  };
};
