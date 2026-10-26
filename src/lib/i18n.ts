import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { APP_TRANSLATIONS } from './appTranslations';

/**
 * Languages shipped with AutoFix AI.
 *
 * `short` is what appears in the compact language switcher; `label` is the
 * full endonym shown in tooltips/accessible names.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'am', short: 'አማ', label: 'አማርኛ' },
  { code: 'om', short: 'OM', label: 'Afaan Oromoo' },
  { code: 'sid', short: 'SID', label: 'Sidaama Afoo' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const LANGUAGE_STORAGE_KEY = 'autofix-language';

type TranslationResource = {
  common: Record<string, string>;
  nav: Record<string, string>;
  dashboard: Record<string, string>;
  footer: Record<string, string>;
};

/** Landing-page and diagnostics-page namespaces, bundled per language. */
type PageTranslations = {
  hero: Record<string, string>;
  features: Record<string, string>;
  who: Record<string, string>;
  diagnostics: Record<string, string>;
};

/**
 * Starter translations for the shared shell (navigation, footer, dashboard).
 * A native-speaker review is recommended before a public launch, especially
 * for Sidaama Afoo, which has limited published technical vocabulary.
 */
const en: TranslationResource = {
  common: {
    search: 'Search',
    send: 'Send',
    thinking: 'Thinking…',
    login: 'Login',
    logout: 'Logout',
    get_started: 'Get Started',
    dashboard: 'Dashboard',
    user: 'User',
    none: 'None',
    status: 'Status',
    loading: 'Loading…',
    open_menu: 'Open menu',
    close_menu: 'Close menu',
    language: 'Language',
    home_aria: 'AutoFix AI home',
    avatar: 'Avatar',
    coming_soon: 'coming soon',
  },
  nav: {
    home: 'Home',
    features: 'Features',
    modules: 'Modules',
    about: 'About',
    contact: 'Contact',
    academy: 'Academy',
    learning: 'Learning',
    diagnostics: 'Diagnostics',
    my_garage: 'My Garage',
    vehicles: 'Vehicles',
    repairs: 'Repairs',
    settings: 'Settings',
    profile: 'Your profile',
    go_to_dashboard: 'Go to Dashboard',
  },
  dashboard: {
    command_center: 'Command Center',
    welcome_back: 'Welcome back, {{name}}',
    technician: 'Technician',
    intelligence_status: 'Global Automotive Intelligence status:',
    optimal: 'Optimal',
    academy: 'Academy',
    library: 'Library',
    garage: 'Garage',
    new_diagnostic: 'New Diagnostic',
    ai_assistant: 'AI Assistant',
    ai_assistant_subtitle: 'Ask about symptoms, repairs or modules — history is saved to your account.',
    chat: 'Chat',
    no_conversations: 'No conversations yet. Send your first message to get started.',
    chat_placeholder: "e.g. My car cranks but won't start...",
    active_vehicle: 'Active Vehicle Intelligence',
    primary_tracked: 'Primary Tracked',
    mileage: 'Mileage',
    last_service: 'Last Service',
    maintenance_health: 'Maintenance Health',
    status: 'Status:',
    no_vehicles: 'No vehicles registered yet.',
    register_first_vehicle: 'Register Your First Vehicle',
    ecosystem_stream: 'Ecosystem Activity Stream',
    full_history: 'Full History',
    ecosystem_empty:
      'Ecosystem stream is empty. Start using diagnostics or academy modules to populate your activity.',
    maintenance_advisor: 'Maintenance Advisor',
    no_immediate_actions: 'No Immediate Actions',
    synchronized: 'Your vehicle data is currently synchronized.',
    academy_status: 'Academy Status',
    module_completion: 'Module Completion',
    academy_cta:
      'Unlock technical certifications by completing professional modules in the Academy.',
    enter_academy: 'Enter Academy',
    syncing: 'Syncing with AutoFix AI Ecosystem...',
    could_not_load_history: 'Could not load chat history. Check the "chat_history" collection.',
    failed_send: 'Failed to send message.',
    chat_fallback:
      'I couldn\'t reach the AI assistant right now. Your message ("{{message}}") has been saved to your history. Once the "{{id}}" Appwrite Function is deployed, live responses will appear here.',
    health_optimal: 'Optimal',
    health_fair: 'Fair',
    health_attention: 'Attention Needed',
    health_unknown: 'Not enough data',
    start_learning: 'Start Learning',
    start_diagnostic: 'Start AI Diagnostic',
  },
  footer: {
    mission: 'Building Africa’s Intelligent Automotive Ecosystem.',
    quick_links: 'Quick Links',
    platform: 'Platform',
    contact: 'Contact',
    languages: 'Languages',
    get_started_free: 'Get started free',
    rights: '© {{year}} AutoFix AI. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
};

const am: TranslationResource = {
  common: {
    search: 'ፈልግ',
    send: 'ላክ',
    thinking: 'በማሰብ ላይ…',
    login: 'ግባ',
    logout: 'ውጣ',
    get_started: 'ጀምር',
    dashboard: 'ዳሽቦርድ',
    user: 'ተጠቃሚ',
    none: 'የለም',
    status: 'ሁኔታ',
    loading: 'በመጫን ላይ…',
    open_menu: 'ምናሌ ክፈት',
    close_menu: 'ምናሌ ዝጋ',
    language: 'ቋንቋ',
    home_aria: 'የAutoFix AI መነሻ',
    avatar: 'የመገለጫ ምስል',
    coming_soon: 'በቅርቡ',
  },
  nav: {
    home: 'መነሻ',
    features: 'ባህሪያት',
    modules: 'ሞጁሎች',
    about: 'ስለ እኛ',
    contact: 'አግኙን',
    academy: 'አካዳሚ',
    learning: 'ትምህርት',
    diagnostics: 'ምርመራዎች',
    my_garage: 'የእኔ ጋራዥ',
    vehicles: 'ተሽከርካሪዎች',
    repairs: 'ጥገናዎች',
    settings: 'ቅንብሮች',
    profile: 'የእርስዎ መገለጫ',
    go_to_dashboard: 'ወደ ዳሽቦርድ ይሂዱ',
  },
  dashboard: {
    command_center: 'የትዕዛዝ ማዕከል',
    welcome_back: 'እንኳን ደህና መጡ፣ {{name}}',
    technician: 'ቴክኒሻን',
    intelligence_status: 'የዓለም አቀፍ የመኪና ብልህነት ሁኔታ፦',
    optimal: 'በጥሩ ሁኔታ',
    academy: 'አካዳሚ',
    library: 'ቤተ መጻሕፍት',
    garage: 'ጋራዥ',
    new_diagnostic: 'አዲስ ምርመራ',
    ai_assistant: 'የAI ረዳት',
    ai_assistant_subtitle: 'ስለ ምልክቶች፣ ጥገናዎች ወይም ሞጁሎች ይጠይቁ — ታሪኩ በመገለጫዎ ይቀመጣል።',
    chat: 'ውይይት',
    no_conversations: 'እስካሁን ውይይት የለም። ለመጀመር የመጀመሪያ መልእክትዎን ይላኩ።',
    chat_placeholder: 'ለምሳሌ፦ መኪናዬ ይነሳል ግን አይሄድም...',
    active_vehicle: 'የተሽከርካሪ ብልህነት',
    primary_tracked: 'ዋና ክትትል',
    mileage: 'የተጓዘ ርቀት',
    last_service: 'የመጨረሻ ጥገና',
    maintenance_health: 'የጥገና ሁኔታ',
    status: 'ሁኔታ፦',
    no_vehicles: 'እስካሁን ምንም ተሽከርካሪ አልተመዘገበም።',
    register_first_vehicle: 'የመጀመሪያ ተሽከርካሪዎን ይመዝግቡ',
    ecosystem_stream: 'የሥነ-ምህዳር እንቅስቃሴ ማሳያ',
    full_history: 'ሙሉ ታሪክ',
    ecosystem_empty:
      'የሥነ-ምህዳር ማሳያው ባዶ ነው። እንቅስቃሴዎን ለመሙላት ምርመራዎችን ወይም የአካዳሚ ሞጁሎችን መጠቀም ይጀምሩ።',
    maintenance_advisor: 'የጥገና አማካሪ',
    no_immediate_actions: 'ወዲያውኑ የሚያስፈልግ እርምጃ የለም',
    synchronized: 'የተሽከርካሪዎ መረጃ አሁን ተመሳስሏል።',
    academy_status: 'የአካዳሚ ሁኔታ',
    module_completion: 'የሞጁል ማጠናቀቅ',
    academy_cta: 'በአካዳሚ ውስጥ ሙያዊ ሞጁሎችን በማጠናቀቅ የቴክኒክ ምስክር ወረቀቶችን ይክፈቱ።',
    enter_academy: 'አካዳሚ ይግቡ',
    syncing: 'ከAutoFix AI ሥነ-ምህዳር ጋር በመመሳሰል ላይ...',
    could_not_load_history: 'የውይይት ታሪክ ሊጫን አልቻለም። የ"chat_history" ስብስብን ያረጋግጡ።',
    failed_send: 'መልእክት መላክ አልተቻለም።',
    chat_fallback:
      'የAI ረዳቱን አሁን ማግኘት አልቻልኩም። የእርስዎ መልእክት ("{{message}}") በታሪክዎ ተቀምጧል። "{{id}}" የAppwrite Function ከተሰማራ በኋላ ቀጥታ ምላሾች እዚህ ይታያሉ።',
    health_optimal: 'በጥሩ ሁኔታ',
    health_fair: 'መካከለኛ',
    health_attention: 'ትኩረት ይፈልጋል',
    health_unknown: 'በቂ መረጃ የለም',
    start_learning: 'ትምህርት ይጀምሩ',
    start_diagnostic: 'የAI ምርመራ ይጀምሩ',
  },
  footer: {
    mission: 'የአፍሪካ ብልህ የመኪና ሥነ-ምህዳርን እየገነባን ነው።',
    quick_links: 'ፈጣን አገናኞች',
    platform: 'መድረክ',
    contact: 'አግኙን',
    languages: 'ቋንቋዎች',
    get_started_free: 'በነጻ ይጀምሩ',
    rights: '© {{year}} AutoFix AI። ሁሉም መብቶች የተጠበቁ ናቸው።',
    privacy: 'የግላዊነት ፖሊሲ',
    terms: 'የአገልግሎት ውሎች',
  },
};

const om: TranslationResource = {
  common: {
    search: 'Barbaadi',
    send: 'Ergi',
    thinking: 'Yaadaa jira…',
    login: 'Seeni',
    logout: "Ba'i",
    get_started: 'Jalqabi',
    dashboard: 'Daashboordii',
    user: 'Fayyadamaa',
    none: 'Hin jiru',
    status: 'Haala',
    loading: "Fe'aa jira…",
    open_menu: 'Menu banuu',
    close_menu: 'Menu cufuu',
    language: 'Afaan',
    home_aria: 'Fuula duraa AutoFix AI',
    avatar: 'Suuraa fayyadamaa',
    coming_soon: 'dhiyootti dhufa',
  },
  nav: {
    home: 'Fuula Duraa',
    features: 'Amaloota',
    modules: 'Mooduulota',
    about: "Waa'ee Keenya",
    contact: 'Nu Qunnamaa',
    academy: 'Akaadaamii',
    learning: 'Barumsa',
    diagnostics: 'Qorannoowwan',
    my_garage: 'Gaaraajii Koo',
    vehicles: 'Konkolaataawwan',
    repairs: 'Suphaawwan',
    settings: "Qindaa'ina",
    profile: 'Profaayilii keessan',
    go_to_dashboard: 'Daashboordii dhaqi',
  },
  dashboard: {
    command_center: 'Giddu-gala Ajajaa',
    welcome_back: 'Baga nagaan deebitee dhu, {{name}}',
    technician: 'Teekniishaanii',
    intelligence_status: 'Haala Beekumsa Konkolaataa Addunyaa:',
    optimal: 'Gaarii',
    academy: 'Akaadaamii',
    library: 'Mana Kitaabaa',
    garage: 'Gaaraajii',
    new_diagnostic: 'Qorannoo Haaraa',
    ai_assistant: 'Gargaaraa AI',
    ai_assistant_subtitle:
      "Alaamota, suphaa yookaan mooduulota gaafadhaa — seenaan akkaawuntii keessanitti olkaa'ama.",
    chat: 'Haasawa',
    no_conversations: 'Ammas haasawwaan hin jiran. Jalqabuuf ergaa keessan jalqabaa ergaa.',
    chat_placeholder: "Fkn. Konkolaataan koo ka'a garuu hin deemu...",
    active_vehicle: 'Beekumsa Konkolaataa Sochii',
    primary_tracked: 'Hordoffii Guddaa',
    mileage: 'Fageenya',
    last_service: 'Suphaa Dhumaa',
    maintenance_health: 'Fayyaa Suphaa',
    status: 'Haala:',
    no_vehicles: "Ammas konkolaataan hin galmaa'in.",
    register_first_vehicle: 'Konkolaataa Keessan Jalqabaa Galmeessaa',
    ecosystem_stream: 'Madda Sochii Eekosisteemii',
    full_history: 'Seenaa Guutuu',
    ecosystem_empty:
      'Maddi sochii eekosisteemii duwwaa dha. Sochii keessan guutuuf qorannoo yookaan mooduulota akaadaamii fayyadamaa.',
    maintenance_advisor: 'Gorsaa Suphaa',
    no_immediate_actions: 'Gochi Ariifachiisaa Hin Jiru',
    synchronized: 'Daataan konkolaataa keessan amma walsimuuf jira.',
    academy_status: 'Haala Akaadaamii',
    module_completion: 'Xumura Mooduulii',
    academy_cta: 'Akaadaamii keessatti mooduulota ogeessaa xumuruun ragaa teekniikaa banadhaa.',
    enter_academy: 'Akaadaamii Seeni',
    syncing: 'Eekosisteemii AutoFix AI waliin walsimuuf jira...',
    could_not_load_history: 'Seenaan haasawaa fe\'uu hin dandeenye. Walqabata "chat_history" ilaalaa.',
    failed_send: 'Ergaan erguu hin dandeenye.',
    chat_fallback:
      'Gargaaraa AI amma qunnamuu hin dandeenye. Ergaan keessan ("{{message}}") seenaa keessan keessatti kuufameera. Yeroo "{{id}}" Appwrite Function hojiirra oolu, deebiin kallattii asitti mul\'ata.',
    health_optimal: 'Gaarii',
    health_fair: 'Giddu-galeessa',
    health_attention: 'Xiyyeeffannoo Barbaachisa',
    health_unknown: 'Odeeffannoon gahaan hin jiru',
    start_learning: 'Barumsa Jalqabi',
    start_diagnostic: 'Qorannoo AI Jalqabi',
  },
  footer: {
    mission: 'Eekosisteemii Konkolaataa Beekaa Afrikaa Ijaaruu.',
    quick_links: 'Geessituu Saffisaa',
    platform: 'Waltajjii',
    contact: 'Nu Qunnamaa',
    languages: 'Afaanota',
    get_started_free: 'Bilisaan jalqabi',
    rights: '© {{year}} AutoFix AI. Mirgi hundi seeraan eegameera.',
    privacy: 'Imaammata Dhuunfaa',
    terms: 'Haalawwan Tajaajilaa',
  },
};

const sid: TranslationResource = {
  common: {
    search: 'Barbaadi',
    send: 'Ergisi',
    thinking: 'Yaadaa jira…',
    login: 'Seemi',
    logout: 'Fuli',
    get_started: 'Jalqabi',
    dashboard: 'Daashboorde',
    user: 'Fayyadama',
    none: 'Hin jiru',
    status: 'Haala',
    loading: "Fe'aa jira…",
    open_menu: 'Menu bani',
    close_menu: 'Menu cufi',
    language: 'Afoo',
    home_aria: 'Fuula duraa AutoFix AI',
    avatar: 'Suura fayyadama',
    coming_soon: 'dhiyootti dhufa',
  },
  nav: {
    home: 'Daafira',
    features: 'Amaloota',
    modules: 'Mooduuloote',
    about: 'Xaafee Keenna',
    contact: 'Nu Qunnaama',
    academy: 'Akaadaami',
    learning: 'Barro',
    diagnostics: 'Qorannoote',
    my_garage: 'Gaaraaji Koo',
    vehicles: 'Konkolaataate',
    repairs: 'Supheente',
    settings: "Qindaa'ina",
    profile: 'Profaayilii Keessan',
    go_to_dashboard: 'Daashboorde dhaqi',
  },
  dashboard: {
    command_center: 'Mana Ajajaa',
    welcome_back: 'Baga nagaan deebitee dhuftan, {{name}}',
    technician: 'Teekniishaanii',
    intelligence_status: 'Haala Beekumsa Konkolaataa Addunyaa:',
    optimal: 'Gaarii',
    academy: 'Akaadaami',
    library: 'Mana Kitaabaa',
    garage: 'Gaaraaji',
    new_diagnostic: 'Qorannoo Haaraa',
    ai_assistant: 'Gargaaraa AI',
    ai_assistant_subtitle:
      "Alaamoota, suphe yookaan mooduuloote gaafadhaa — seenaan akkaawuntii keessanitti olkaa'ama.",
    chat: 'Haasawa',
    no_conversations: 'Ammas haasawwaan hin jiran. Jalqabuuf ergaa keessan jalqabaa ergisi.',
    chat_placeholder: "Fkn. Konkolaataan koo ka'a garuu hin deemu...",
    active_vehicle: 'Beekumsa Konkolaataa Sochii',
    primary_tracked: 'Hordoffii Guddaa',
    mileage: 'Fageenya',
    last_service: 'Suphe Dhumaa',
    maintenance_health: 'Fayyaa Suphee',
    status: 'Haala:',
    no_vehicles: "Ammas konkolaataate hin galma'in.",
    register_first_vehicle: 'Konkolaataa Keessan Jalqabaa Galmeessaa',
    ecosystem_stream: 'Madda Sochii Eekosisteemii',
    full_history: 'Seenaa Guutuu',
    ecosystem_empty:
      'Maddi sochii eekosisteemii duwwaa dha. Sochii keessan guutuuf qorannoo yookaan mooduuloota akaadaamii fayyadamaa.',
    maintenance_advisor: 'Gorsaa Suphee',
    no_immediate_actions: 'Gochi Ariifachiisaa Hin Jiru',
    synchronized: 'Daataan konkolaataa keessan amma walsimuuf jira.',
    academy_status: 'Haala Akaadaamii',
    module_completion: 'Xumura Mooduulii',
    academy_cta: 'Akaadaamii keessatti mooduuloota ogeessaa xumuruun ragaa teekniikaa banadhaa.',
    enter_academy: 'Akaadaamii Seemi',
    syncing: 'Eekosisteemii AutoFix AI waliin walsimuuf jira...',
    could_not_load_history: 'Seenaan haasawaa fe\'uu hin dandeenye. Walqabata "chat_history" ilaalaa.',
    failed_send: 'Ergaan erguu hin dandeenye.',
    chat_fallback:
      'Gargaaraa AI amma qunnamuu hin dandeenye. Ergaan keessan ("{{message}}") seenaa keessan keessatti kuufameera. Yeroo "{{id}}" Appwrite Function hojiirra oolu, deebiin kallattii asitti mul\'ata.',
    health_optimal: 'Gaarii',
    health_fair: 'Giddu-galeessa',
    health_attention: 'Xiyyeeffannoo Barbaachisa',
    health_unknown: 'Odeeffannoon gahaan hin jiru',
    start_learning: 'Barro Jalqabi',
    start_diagnostic: 'Qorannoo AI Jalqabi',
  },
  footer: {
    mission: 'Eekosisteemii Konkolaataa Beekaa Afrikaa Ijaaruu.',
    quick_links: 'Geessituu Saffisaa',
    platform: 'Waltajjii',
    contact: 'Nu Qunnaama',
    languages: 'Afaanote',
    get_started_free: 'Bilisaan jalqabi',
    rights: '© {{year}} AutoFix AI. Mirgi hundi seeraan eegameera.',
    privacy: 'Imaammata Dhuunfaa',
    terms: 'Haalawwan Tajaajilaa',
  },
};

const enPages: PageTranslations = {
  hero: {
    badge: 'AI-Powered Automotive Platform',
    subtitle: 'AI-Powered Automotive Learning, Diagnosis & Repair Platform',
    tag_learn: 'Learn',
    tag_diagnose: 'Diagnose',
    tag_repair: 'Repair',
    tag_empower: 'Empower',
    description:
      'Transforming TVET education in Africa through multilingual, offline-first AI technology.',
    start_learning: 'Start Learning',
    see_features: 'See Features',
    highlight_multilingual: 'Multilingual',
    highlight_multilingual_detail: 'EN · AM · SW · FR',
    highlight_offline: 'Offline-first',
    highlight_offline_detail: 'Works without internet',
    highlight_tvet: 'TVET-aligned',
    highlight_tvet_detail: 'Curriculum ready',
    live_diagnostics: 'Live Diagnostics',
    ecu_online: 'ECU · Online',
    engine_rpm: 'Engine RPM',
    battery: 'Battery',
    vehicle_health: 'Vehicle health',
    detected_codes: 'Detected fault codes',
    code_misfire: 'Cylinder 1 misfire',
    code_lean: 'System too lean',
    code_comms: 'Lost comms with ECU',
    repair_confidence: 'Repair confidence',
    offline_active: 'Offline mode active',
    cached_swahili: 'Cached · Swahili',
  },
  features: {
    title: 'One Platform. Complete Automotive Intelligence.',
    subtitle:
      'Empowering automotive professionals with the tools they need to excel in a rapidly evolving industry.',
    learn_more: 'Learn more',
    tutor_title: 'AI Automotive Tutor',
    tutor_description:
      'Learn automotive systems with an intelligent AI tutor tailored to your pace.',
    diagnostics_title: 'Smart Diagnostics',
    diagnostics_description:
      'Understand vehicle problems, symptoms and diagnostic codes instantly.',
    lab_title: 'Electrical & Electronics Lab',
    lab_description:
      'Practice circuits, electrical systems and electronics concepts virtually.',
    repair_title: 'Practical Repair Guidance',
    repair_description:
      'Get step-by-step guidance from initial diagnosis to final repair.',
  },
  who: {
    title: 'Who We Serve',
    subtitle:
      'Built for everyone in the automotive ecosystem — from the classroom to the fleet yard.',
    students: 'TVET Students',
    students_description: 'Practical skills development',
    mechanics: 'Mechanics',
    mechanics_description: 'Professional diagnosis tools',
    owners: 'Car Owners',
    owners_description: 'Affordable diagnostics & trusted mechanics',
    fleets: 'Fleet Companies',
    fleets_description: 'Predictive maintenance & fuel efficiency',
  },
  diagnostics: {
    title: 'AI Diagnostics Workspace',
    subtitle:
      'Professional automotive troubleshooting powered by intelligent models. Describe your vehicle symptoms to get structured guidance.',
    view_history: 'View History',
    new_analysis: 'New Analysis',
    analysis_failed: 'Analysis Failed',
    select_vehicle: '1. Select Vehicle',
    no_vehicles: 'No vehicles added to your profile.',
    add_vehicle_first: 'Add Vehicle First',
    describe_problem: '2. Describe the Problem',
    describe_placeholder:
      "Describe the symptoms (e.g., My car cranks but won't start).",
    when_started: 'When did it start?',
    timing_recently: 'Recently',
    timing_days: 'A few days ago',
    timing_week: 'More than a week ago',
    timing_intermittent: 'Intermittent problem',
    warning_lights: 'Warning Lights',
    light_check_engine: 'Check Engine',
    light_abs: 'ABS',
    light_battery: 'Battery',
    light_oil: 'Oil',
    light_brake: 'Brake',
    analyzing: 'Analyzing...',
    start_diagnostic: 'Start AI Diagnostic',
    guidance_only: 'informational guidance only',
  },
};

const amPages: PageTranslations = {
  hero: {
    badge: 'በAI የተደገፈ የመኪና መድረክ',
    subtitle: 'በAI የተደገፈ የመኪና ትምህርት፣ ምርመራ እና ጥገና መድረክ',
    tag_learn: 'ተማር',
    tag_diagnose: 'መርምር',
    tag_repair: 'ጠግን',
    tag_empower: 'አቅም ስጥ',
    description:
      'በብዙ ቋንቋ እና ከመስመር ውጭ በሚሠራ AI ቴክኖሎጂ አማካኝነት በአፍሪካ የTVET ትምህርትን እየቀየርን ነው።',
    start_learning: 'ትምህርት ይጀምሩ',
    see_features: 'ባህሪያትን ይመልከቱ',
    highlight_multilingual: 'ብዙ ቋንቋ',
    highlight_multilingual_detail: 'EN · AM · SW · FR',
    highlight_offline: 'ከመስመር ውጭ የሚሠራ',
    highlight_offline_detail: 'ያለ ኢንተርኔት ይሠራል',
    highlight_tvet: 'ከTVET ጋር የተጣጣመ',
    highlight_tvet_detail: 'ለሥርዓተ-ትምህርት ዝግጁ',
    live_diagnostics: 'በቀጥታ ምርመራ',
    ecu_online: 'ECU · በመስመር ላይ',
    engine_rpm: 'የሞተር RPM',
    battery: 'ባትሪ',
    vehicle_health: 'የተሽከርካሪ ሁኔታ',
    detected_codes: 'የተገኙ የስህተት ኮዶች',
    code_misfire: 'ሲሊንደር 1 አልተቀጣጠለም',
    code_lean: 'የነዳጅ ድብልቅ በጣም ቀጭን ነው',
    code_comms: 'ከECU ጋር ግንኙነት ተቋርጧል',
    repair_confidence: 'የጥገና እርግጠኝነት',
    offline_active: 'ከመስመር ውጭ ሁነታ ነቅቷል',
    cached_swahili: 'የተቀመጠ · ስዋሂሊ',
  },
  features: {
    title: 'አንድ መድረክ። ሙሉ የመኪና ብልህነት።',
    subtitle:
      'በፍጥነት እየተሻሻለ በሚገኝ ኢንዱስትሪ ውስጥ ለመሳካት የሚያስፈልጉ መሣሪያዎችን ለመኪና ባለሙያዎች እናቀርባለን።',
    learn_more: 'ተጨማሪ ይወቁ',
    tutor_title: 'የAI የመኪና አስተማሪ',
    tutor_description:
      'በእርስዎ ፍጥነት የተዘጋጀ ብልህ የAI አስተማሪ ጋር የመኪና ስርዓቶችን ይማሩ።',
    diagnostics_title: 'ብልህ ምርመራ',
    diagnostics_description:
      'የተሽከርካሪ ችግሮችን፣ ምልክቶችን እና የምርመራ ኮዶችን ወዲያውኑ ይረዱ።',
    lab_title: 'የኤሌክትሪክ እና ኤሌክትሮኒክስ ላብራቶሪ',
    lab_description:
      'ወረዳዎችን፣ የኤሌክትሪክ ስርዓቶችን እና የኤሌክትሮኒክስ ፅንሰ-ሀሳቦችን በምናባዊ መንገድ ይለማመዱ።',
    repair_title: 'ተግባራዊ የጥገና መመሪያ',
    repair_description:
      'ከመጀመሪያ ምርመራ እስከ የመጨረሻ ጥገና ደረጃ በደረጃ መመሪያ ያግኙ።',
  },
  who: {
    title: 'ለማን እናገለግላለን',
    subtitle:
      'ከክፍል እስከ የቡድን ተሽከርካሪዎች ማቆሚያ ድረስ በመኪና ሥነ-ምህዳር ውስጥ ላሉ ሁሉ የተሠራ።',
    students: 'የTVET ተማሪዎች',
    students_description: 'ተግባራዊ ክህሎት ማዳበር',
    mechanics: 'መካኒኮች',
    mechanics_description: 'ሙያዊ የምርመራ መሣሪያዎች',
    owners: 'የመኪና ባለቤቶች',
    owners_description: 'ተመጣጣኝ ምርመራ እና ታማኝ መካኒኮች',
    fleets: 'የቡድን ተሽከርካሪ ኩባንያዎች',
    fleets_description: 'ቀዳሚ ጥገና እና የነዳጅ ቆጣቢነት',
  },
  diagnostics: {
    title: 'የAI ምርመራ የሥራ ቦታ',
    subtitle:
      'በብልህ ሞዴሎች የተደገፈ ሙያዊ የመኪና ችግር መፍታት። የተሽከርካሪዎን ምልክቶች ይግለጹ እና የተዋቀረ መመሪያ ያግኙ።',
    view_history: 'ታሪክ ይመልከቱ',
    new_analysis: 'አዲስ ትንተና',
    analysis_failed: 'ትንተና አልተሳካም',
    select_vehicle: '1. ተሽከርካሪ ይምረጡ',
    no_vehicles: 'በመገለጫዎ ውስጥ ምንም ተሽከርካሪ አልተጨመረም።',
    add_vehicle_first: 'መጀመሪያ ተሽከርካሪ ይጨምሩ',
    describe_problem: '2. ችግሩን ይግለጹ',
    describe_placeholder:
      'ምልክቶቹን ይግለጹ (ለምሳሌ፦ መኪናዬ ይነሳል ግን አይሄድም)።',
    when_started: 'መቼ ጀመረ?',
    timing_recently: 'በቅርብ ጊዜ',
    timing_days: 'ከጥቂት ቀናት በፊት',
    timing_week: 'ከአንድ ሳምንት በላይ በፊት',
    timing_intermittent: 'አልፎ አልፎ የሚከሰት ችግር',
    warning_lights: 'የማስጠንቀቂያ መብራቶች',
    light_check_engine: 'የሞተር ምርመራ',
    light_abs: 'ABS',
    light_battery: 'ባትሪ',
    light_oil: 'ዘይት',
    light_brake: 'ብሬክ',
    analyzing: 'በመተንተን ላይ...',
    start_diagnostic: 'የAI ምርመራ ይጀምሩ',
    guidance_only: 'ለመረጃ ብቻ የሚሆን መመሪያ',
  },
};

const omPages: PageTranslations = {
  hero: {
    badge: "Waltajjii Konkolaataa AI'n Deeggarame",
    subtitle: "Waltajjii Barumsaa, Qorannoo fi Suphaa Konkolaataa AI'n Deeggarame",
    tag_learn: 'Baradhu',
    tag_diagnose: 'Qoradhu',
    tag_repair: 'Suphi',
    tag_empower: 'Dandeettii Kenni',
    description:
      "Teknoolojii AI afaan hedduu fi interneedla malee hojjetuun barnoota TVET Afriikaa jijjiiraa jirra.",
    start_learning: 'Barumsa Jalqabi',
    see_features: 'Amaloota Ilaali',
    highlight_multilingual: 'Afaan Hedduu',
    highlight_multilingual_detail: 'EN · AM · SW · FR',
    highlight_offline: 'Interneedla Malee',
    highlight_offline_detail: 'Interneetii malee hojjeta',
    highlight_tvet: 'TVET Waliin Walsimu',
    highlight_tvet_detail: 'Sillaabasii qophaa\'e',
    live_diagnostics: 'Qorannoo Kallattii',
    ecu_online: 'ECU · Toora Irra',
    engine_rpm: 'RPM Injinii',
    battery: 'Baattirii',
    vehicle_health: 'Fayyaa Konkolaataa',
    detected_codes: 'Koodota Dogoggoraa Argaman',
    code_misfire: 'Silindarii 1 hin gubne',
    code_lean: "Walnyaatiin boba'aa baay'ee qal'aa dha",
    code_comms: 'ECU waliin quunnamtii cime',
    repair_confidence: 'Amanamummaa Suphaa',
    offline_active: 'Haalli interneedla malee hojiirra jira',
    cached_swahili: 'Kuufame · Sawaahilii',
  },
  features: {
    title: 'Waltajjii Tokko. Beekumsa Konkolaataa Guutuu.',
    subtitle:
      "Ogeeyyii konkolaataa industirii saffisaan jijjiiramaa jiru keessatti milkaa'uuf meeshaalee barbaachisan dandeessisuu.",
    learn_more: 'Dabalata baradhu',
    tutor_title: 'Barsiisaa Konkolaataa AI',
    tutor_description:
      "Barsiisaa AI beekaa, saffisa keessanitti qophaa'e waliin sirna konkolaataa baradhaa.",
    diagnostics_title: 'Qorannoo Beekaa',
    diagnostics_description:
      'Rakkoo konkolaataa, alaamota fi koodota qorannoo battalumatti hubadhaa.',
    lab_title: 'Laaboraatoorii Elektirikii fi Elektirooniksii',
    lab_description:
      'Sarkitoota, sirna elektirikii fi yaadrimee elektirooniksii mala yaadaa keessatti shaakalaa.',
    repair_title: 'Qajeelfama Suphaa Qabatamaa',
    repair_description:
      'Qorannoo jalqabaa irraa hanga suphaa dhumaaatti tarkaanfii tarkaanfiin qajeelfama argadhaa.',
  },
  who: {
    title: 'Eenyu Tajaajilla',
    subtitle:
      'Hundaaf kan ijaarame — eekosisteemii konkolaataa keessatti, kutaa barnootaa irraa hanga bakka konkolaataa oomishaa.',
    students: 'Barattoota TVET',
    students_description: 'Dandeettii qabatamaa guddisuu',
    mechanics: 'Mekaanikoota',
    mechanics_description: 'Meeshaalee qorannoo ogeessaa',
    owners: 'Abbootii Konkolaataa',
    owners_description: 'Qorannoo gatii madaalawaa fi mekaanikoota amanamoo',
    fleets: 'Dhaabbilee Konkolaataa',
    fleets_description: "Suphee duraanii fi qusannaa boba'aa",
  },
  diagnostics: {
    title: 'Bakka Hojii Qorannoo AI',
    subtitle:
      "Rakkoo konkolaataa ogeessaan, moodeelota beekaa'n deeggarame. Alaamota konkolaataa keessan ibsaa, qajeelfama caasaa argadhaa.",
    view_history: 'Seenaa Ilaali',
    new_analysis: 'Xiinxala Haaraa',
    analysis_failed: 'Xiinxalli Hin Milkoofne',
    select_vehicle: '1. Konkolaataa Filadhu',
    no_vehicles: 'Profaayilii keessan keessatti konkolaataan hin dabalamne.',
    add_vehicle_first: 'Dursa Konkolaataa Dabali',
    describe_problem: '2. Rakkoo Ibsi',
    describe_placeholder:
      "Alaamota ibsaa (fkn. Konkolaataan koo ka'a garuu hin deemu).",
    when_started: 'Yoom jalqabe?',
    timing_recently: 'Dhiyeenya kana',
    timing_days: 'Guyyoota muraasa dura',
    timing_week: 'Torban tokkoo ol dura',
    timing_intermittent: "Rakkoo yeroo yerootti mul'atu",
    warning_lights: 'Ibsaa Akeekkachiisaa',
    light_check_engine: 'Qorannoo Injinii',
    light_abs: 'ABS',
    light_battery: 'Baattirii',
    light_oil: 'Zayitii',
    light_brake: 'Bireekii',
    analyzing: 'Xiinxalaa jira...',
    start_diagnostic: 'Qorannoo AI Jalqabi',
    guidance_only: 'qajeelfama odeeffannoo qofa',
  },
};

const sidPages: PageTranslations = {
  hero: {
    badge: "Waltajjii Konkolaataa AI'n Deeggaramine",
    subtitle: 'Waltajjii Barru, Qorannoo fi Suphee Konkolaataa AI\'n Deeggaramine',
    tag_learn: 'Barri',
    tag_diagnose: 'Qori',
    tag_repair: 'Suphi',
    tag_empower: 'Dandeettii Kenni',
    description:
      'Teknoolojii AI afaano heddunte fi interneedla malee hojjetteen barnoota TVET Afriikaa jijjiiraa jirra.',
    start_learning: 'Barru Jalqabi',
    see_features: 'Amaloota Ilaali',
    highlight_multilingual: 'Afaano Heddunte',
    highlight_multilingual_detail: 'EN · AM · SW · FR',
    highlight_offline: 'Interneedla Malee',
    highlight_offline_detail: 'Interneetii malee hojjetti',
    highlight_tvet: 'TVET Waliin Walsime',
    highlight_tvet_detail: "Sillaabasii Qophaa'e",
    live_diagnostics: 'Qorannoo Kallattii',
    ecu_online: 'ECU · Toora Irra',
    engine_rpm: 'RPM Injinii',
    battery: 'Baattirii',
    vehicle_health: 'Fayyaa Konkolaataa',
    detected_codes: 'Koodoota Dogoggoraa Argamane',
    code_misfire: 'Silindare 1 hin gubne',
    code_lean: "Walnyaatiin boba'aa baay'ee qal'aa dha",
    code_comms: 'ECU waliin quunnamtii cime',
    repair_confidence: 'Amanamummaa Suphee',
    offline_active: 'Haalli interneedla malee hojiirra jira',
    cached_swahili: 'Kuufame · Sawaahilii',
  },
  features: {
    title: 'Waltajjii Tokko. Beekumsa Konkolaataa Guutuu.',
    subtitle:
      "Ogeeyyi konkolaataa industirii saffisaan jijjiiramaa jiru keessatti milkaa'uuf meeshaalee barbaachisane dandeessisuu.",
    learn_more: 'Dabalata barri',
    tutor_title: 'Barsiisaa Konkolaataa AI',
    tutor_description:
      "Barsiisaa AI beekaa, saffisa keessanitti qophaa'e waliin sirna konkolaataa barra.",
    diagnostics_title: 'Qorannoo Beekaa',
    diagnostics_description:
      'Rakkoo konkolaataa, alaamoota fi koodoota qorannoo battalumatti hubadhaa.',
    lab_title: 'Laaboraatoorii Elektirikii fi Elektirooniksii',
    lab_description:
      'Sarkitoota, sirna elektirikii fi yaadrimee elektirooniksii mala yaadaa keessatti shaakalaa.',
    repair_title: 'Qajeelfama Suphee Qabatamaa',
    repair_description:
      'Qorannoo jalqabaa irraa hanga suphee dhumaaatti tarkaanfii tarkaanfiin qajeelfama argadhaa.',
  },
  who: {
    title: 'Eeyyu Tajaajilla',
    subtitle:
      'Hundaaf kan ijaaramine — eekosisteemii konkolaataa keessatti, kutaa barnootaa irraa hanga bakka konkolaataa oomishaa.',
    students: 'Barattoota TVET',
    students_description: 'Dandeettii qabatamaa guddisuu',
    mechanics: 'Mekaanikoota',
    mechanics_description: 'Meeshaalee qorannoo ogeessaa',
    owners: 'Abbootii Konkolaataa',
    owners_description: 'Qorannoo gatii madaalawaa fi mekaanikoota amanamoo',
    fleets: 'Dhaabbilee Konkolaataa',
    fleets_description: "Suphee duraanii fi qusannaa boba'aa",
  },
  diagnostics: {
    title: 'Bakka Hojii Qorannoo AI',
    subtitle:
      "Rakkoo konkolaataa ogeessaan, moodeeloota beekaa'n deeggaramine. Alaamoota konkolaataa keessan ibsaa, qajeelfama caasaa argadhaa.",
    view_history: 'Seenaa Ilaali',
    new_analysis: 'Xiinxala Haaraa',
    analysis_failed: 'Xiinxalli Hin Milkoofne',
    select_vehicle: '1. Konkolaataa Filadhu',
    no_vehicles: 'Profaayilii keessan keessatti konkolaataan hin dabalamne.',
    add_vehicle_first: 'Dursa Konkolaataa Dabali',
    describe_problem: '2. Rakkoo Ibsi',
    describe_placeholder:
      "Alaamoota ibsaa (fkn. Konkolaataan koo ka'a garuu hin deemu).",
    when_started: 'Yoom jalqabe?',
    timing_recently: 'Dhiyeenya kana',
    timing_days: 'Guyyoota muraasa dura',
    timing_week: 'Torban tokkoo ol dura',
    timing_intermittent: "Rakkoo yeroo yerootti mul'atu",
    warning_lights: 'Ibsaa Akeekkachiisaa',
    light_check_engine: 'Qorannoo Injinii',
    light_abs: 'ABS',
    light_battery: 'Baattirii',
    light_oil: 'Zayitii',
    light_brake: 'Bireekii',
    analyzing: 'Xiinxalaa jira...',
    start_diagnostic: 'Qorannoo AI Jalqabi',
    guidance_only: 'qajeelfama odeeffannoo qofa',
  },
};

const isLanguageCode = (value: string | null): value is LanguageCode =>
  SUPPORTED_LANGUAGES.some((language) => language.code === value);

/** Read the persisted choice, defaulting to English. */
const readStoredLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguageCode(stored) ? stored : 'en';
};

const initialLanguage = readStoredLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...en, ...enPages, ...APP_TRANSLATIONS.en } },
    am: { translation: { ...am, ...amPages, ...APP_TRANSLATIONS.am } },
    om: { translation: { ...om, ...omPages, ...APP_TRANSLATIONS.om } },
    sid: { translation: { ...sid, ...sidPages, ...APP_TRANSLATIONS.sid } },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES.map((language) => language.code),
  interpolation: {
    // React already escapes interpolated values.
    escapeValue: false,
  },
  returnNull: false,
});

/* Persist the selection and keep <html lang> in sync. */
i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export const changeLanguage = (language: LanguageCode) => i18n.changeLanguage(language);

export default i18n;
