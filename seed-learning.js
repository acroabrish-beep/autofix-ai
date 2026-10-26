#!/usr/bin/env node
/**
 * seed-learning.js
 *
 * Inserts six learning modules into the `learning_modules` collection in
 * the `autofix-ai-db` database.
 *
 * Safe to re-run: deterministic document IDs are used, so existing seed
 * documents are updated instead of duplicated.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: databases.read, databases.write)
 *
 * Optional:
 *   APPWRITE_ENDPOINT   default: https://fra.cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_DATABASE_ID default: autofix-ai-db
 *
 * Run:
 *   npm run seed:learning
 * or:
 *   node --env-file=.env seed-learning.js
 */

import { Client, Databases } from 'node-appwrite';

const endpoint =
  process.env.APPWRITE_ENDPOINT ||
  process.env.VITE_APPWRITE_ENDPOINT ||
  'https://fra.cloud.appwrite.io/v1';

const projectId =
  process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;

const apiKey = process.env.APPWRITE_API_KEY;

const databaseId =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.VITE_APPWRITE_DATABASE_ID ||
  'autofix-ai-db';

const COLLECTION_ID = 'learning_modules';

/**
 * Categories below match the frontend CategoryFilter exactly, so the
 * category chips will find these modules.
 */
const MODULES = [
  {
    id: 'engine-basics',
    data: {
      title: 'Engine Basics',
      title_am: 'የሞተር መሰረታዊ ነገሮች',
      title_om: 'Mootora Waa\'ee Jalqabaa',
      title_sid: 'Injini Waa\'ee Jalqabaa',
      description:
        'Understand how internal combustion engines work: the four-stroke cycle, major components, lubrication, cooling, and the routine checks that keep an engine healthy.',
      description_am: 'የውስጥ የሚቃጠል ሞተሮች እንዴት እንደሚሰሩ ይረዱ፡ አራት-ዙሪ ዑደት፣ ዋና ክፍሎች፣ ዘይቤ፣ ኮሊንግ እና ሞተሩን ጤነኛ የሚያደርጉ መደበኛ መመልከቻዎች።',
      description_om: 'Mootora warra keessatti qabxii uumamu hubachuuf: dhaabbii afuur, qabxiilee jalqabaa, sirna qabxii sirrii, sirna dhimaa fi qorannoo walitti dhufeenya mootora cimaa taasisuu.',
      description_sid: 'Injinii warra keessatti qabxii uumamu hubachuuf: dhaabbii afuur, qabxiilee jalqabaa, sirna qabxii sirrii, sirna dhimaa fi qorannoo walitti dhufeenya injinii cimaa taasisuu.',
      category: 'Engine Systems',
      duration: '45 min',
      level: 'beginner',
      content:
        'A four-stroke engine completes intake, compression, power, and exhaust in a repeating cycle. The crankshaft converts the pistons\' motion into rotation, while the valve train controls the movement of air and exhaust gases.\n\n' +
        'Lubrication reduces friction between moving parts, and the cooling system carries excess heat away from the engine. A change in oil level, coolant temperature, exhaust color, or engine noise can provide useful evidence during an inspection.\n\n' +
        'Begin with the vehicle history and a visual inspection, then compare measurements with the manufacturer\'s service data. Keep hands and tools clear of belts, fans, hot surfaces, and other moving components.',
      content_am: 'የአራት-ዙሪ ሞተር በድግግ የሚደጋገመ ዑደት ውስጥ መግቢያ፣ ግፊት፣ ኃይል እና ውጫ ያጠናቃል። ክራንክሻፍት ንቁ እንቅስቃሴዎችን ወደ ምዕራፍ ይለውጣል፣ የቫልቭ ትሬንም የአየር እና የውጫ ጋዝ እንቅስቃሴዎችን ያስተዳድራል።\n\n' +
        'ዘይቤ በንቁ ክፍሎች መካከል ግፊትን ይቀንሳል፣ የኮሊንግ ስርዓትም በጣም ከፍተኛ ሙቀትን ከሞተሩ ይወጣል። በዘይቤ ደረጃ፣ በኮሊንት ሙቀት፣ በውጫ ቀለም ወይም በሞተር ድምጽ ላይ የሚከሰት ለውጥ በንቃየት ጊዜ ጠቃሚ ማስረጫ ሊሰጥ ይችላል።\n\n' +
        'ከመኪና ታሪክ እና ከእይታ ንቃየት ይጀምሩ፣ ከዚያም መለኪያዎችን ከአምራች የአገብት ውሂብ ጋር ያነፃፃሩ። እጅን እና መሳሪያዎችን ከቤልቶች፣ ከፋንሶች፣ ከትኩስ ቦታዎች እና ከሌሎች ንቁ ክፍሎች ይራቁ።',
      content_om: 'Mootora dhaabbii afuur dorgommii keessa qabxii fayyadamaa, gaddiseessa, dhiibbaa fi uummama ergaa irra deebi\'a ciccittaa. Kaarinkaankii dorgommii pistoonota gara jechootti jijjiira, garuu walitti dhiyeenyaan qabxii angoo fi gaasii uummamaa sirritti qabata.\n\n' +
        'Sirna qabxii sirrii gaddiseessa qabxii waliin jiru gidduutti hir\'isa, sirna dhimaa immoo qabxii baay\'ee irraa gara mootora kaachuu danda\'a. Sirna qabxiin, dhimaa coolanti, uummama ergaa ykn sagalee mootora irratti jijjiirama qabxii qorannoo irratti gargaara.\n\n' +
        'Seenaa konkolaataa fi qorannoo ifa irraa jalqabi, kaartaa waliin walitti dhiyeenya. Qabxii fi meeshaalee walitti dhiyeenya qabxiiwwan, faansa, dhangiiwwan qabxiilee fi biroota irraa eegaa.',
      content_sid: 'Injinii dhaabbii afuur dorgommii keessa qabxii fayyadamaa, gaddiseessa, dhiibbaa fi uummama ergaa irra deebi\'a ciccittaa. Kaarinkaankii dorgommii pistoonota gara jechootti jijjiira, garuu walitti dhiyeenyaan qabxii angoo fi gaasii uummamaa sirritti qabata.\n\n' +
        'Sirna qabxii sirrii gaddiseessa qabxii waliin jiru gidduutti hir\'isa, sirna dhimaa immoo qabxii baay\'ee irraa gara injinii kaachuu danda\'a. Sirna qabxiin, dhimaa coolanti, uummama ergaa ykn sagalee injinii irratti jijjiirama qabxii qorannoo irratti gargaara.\n\n' +
        'Seenaa konkolaataa fi qorannoo ifa irraa jalqabi, kaartaa waliin walitti dhiyeenya. Qabxii fi meeshaalee walitti dhiyeenya qabxiiwwan, faansa, dhangiiwwan qabxiilee fi biroota irraa eegaa.',
    },
  },
  {
    id: 'electrical-systems-101',
    data: {
      title: 'Electrical Systems 101',
      title_am: 'የኤሌክትሪክ ስርዓቶች 101',
      title_om: 'Sirna Elektirikii 101',
      title_sid: 'Sirna Elektirikii 101',
      description:
        'Learn the fundamentals of automotive electrical systems, including batteries, alternators, starting circuits, fuses, relays, and safe multimeter testing procedures.',
      description_am: 'የመኪና ኤሌክትሪክ ስርዓቶች መሰረታዊ ነገሮችን ይማሩ፡ ባትሪዎች፣ አልተርኔተሮች፣ የመጀመሪያ ዑደቶች፣ ፊዩዝ፣ ሬሌዎች እና ደህንነቱ የተጠበቀ ማልቲሜተር መፈተን ወዘተ።',
      description_om: 'Sirna elektirikii konkolaataa waliin walqabatee baradhaa: baattirii, alternetara, sirna jalqabaa, fiyuuzi, reelayii fi qorannoo multimeetara nageenyaan hojjedhu.',
      description_sid: 'Sirna elektirikii konkolaataa waliin walqabatee baradhaa: baattirii, alternetara, sirna jalqabaa, fiyuuzi, reelayii fi qorannoo multimeetara nageenyaan hojjedhu.',
      category: 'Electrical Systems',
      duration: '60 min',
      level: 'beginner',
      content:
        'A vehicle electrical system stores energy in the battery and uses circuits to start the engine, charge the battery, and power accessories. Voltage describes electrical potential, current describes flow, and resistance describes opposition to that flow.\n\n' +
        'A multimeter helps test these conditions, but the measurement must be made at the correct points and under the right load. Check battery terminals, fuses, grounds, and wiring before assuming a component has failed. Voltage-drop testing can reveal resistance that a simple continuity check may miss.\n\n' +
        'Use insulated probes and follow the meter and vehicle instructions. Avoid shorting battery terminals, and disconnect power when the service procedure requires it.',
      content_am: 'የመኪና ኤሌክትሪክ ስርዓት ኃይልን በባትሪ ውስጥ ያከማቻል እና ዑደቶችን ሞተሩን ለማጀምር፣ ባትሪውን ለማስቀመጥ እና ተጨማሪዎችን ለማስነሳት ይጠቀማል። ቮልቴጅ የኤሌክትሪክ እድልን ያሳያል፣ ከረዳት ደግሞ የሚፈሰውን ያሳያል፣ ከተቃውሞም የሚቃወምትን ያሳያል።\n\n' +
        'ማልቲሜተር ይኼውን ሁኔታ ለመፈተን ይረዳል፣ ነገር ግን መለኪያው በትክክለኛው ቦታ እና በትክክለኛው ጭነት ላይ መወሰድ አለበት። ክፍል እንደተሳሳተ ከማሰብዎ በፊት የባትሪ ተርሚናሎችን፣ ፊዩዝን፣ መሬቶችን እና የገመድ ግልቢዎችን ይመልከቱ። የቮልቴጅ-ንቀስ ፈተና የቀላል የቅጥያ ፈተና የማያገኝባቸውን ቃውማ ሊገልጽ ይችላል።\n\n' +
        'የተከለከሉ ፕሮቦዎችን ይጠቀሙ እና የሜተር እና የመኪና መመሪያዎችን ይከተሉ። የባትሪ ተርሚናሎችን አይሰርቁ፣ እና ኃይልን አይኖርቁ ከሆነ የአገልጋይ ወራት ይፈልጋል።',
      content_om: 'Sirna elektirikii konkolaataa baattirii keessatti qabxii kuusa, sirna injinii jalqabuuf, baattirii chaarjiisuu fi afaan biroo fayyadamaa. Volteejii dandeettii elektirikii ibsa, kaarantii daawwamaa fi sirriin daawwamaa ibsa.\n\n' +
        'Multimeetara qorannoo kana gargaara, garuu qorannoon bakka sirrii fi qabxiin sirrii ta\'een qophaa\'uu qaba. Terminalii baattirii, fiyuuzi, groundii fi wiiriiingii qoruu itti fufi komponentii dogoggorraa ta\'e jechuu dhiifachaa.\n\n' +
        'Probe insuleeshinii qabu fayyadami, maqaan meeterii fi konkolaataa hordofu. Terminalii baattirii shortii gochuu dhiifachaa, qabxiin sirrii ta\'e hin qabne qabxii haqi.',
      content_sid: 'Sirna elektirikii konkolaataa baattirii keessatti qabxii kuusa, sirna injinii jalqabuuf, baattirii chaarjiisuu fi afaan biroo fayyadamaa. Volteejii dandeettii elektirikii ibsa, kaarantii daawwamaa fi sirriin daawwamaa ibsa.\n\n' +
        'Multimeetara qorannoo kana gargaara, garuu qorannoon bakka sirrii fi qabxiin sirrii ta\'een qophaa\'uu qaba. Terminalii baattirii, fiyuuzi, groundii fi wiiriiingii qoruu itti fufi komponentii dogoggorraa ta\'e jechuu dhiifachaa.\n\n' +
        'Probe insuleeshinii qabu fayyadami, maqaan meeterii fi konkolaataa hordofu. Terminalii baattirii shortii gochuu dhiifachaa, qabxiin sirrii ta\'e hin qabne qabxii haqi.',
    },
  },
  {
    id: 'brake-diagnostics',
    data: {
      title: 'Brake Diagnostics',
      title_am: 'የብሬክ ንቃየት',
      title_om: 'Qorannoo Bireekii',
      title_sid: 'Qorannoo Bireekii',
      description:
        'Diagnose common braking problems such as squealing, grinding, pedal pulsation and fluid leaks. Covers pads, rotors, calipers, ABS basics and safety inspection.',
      description_am: 'የተለመዱ የብሬክ ችግሮችን እንደ ስኩዌሊንግ፣ ግራይንዲንግ፣ የፔዳል ፈሳሽ እና የፍሉድ መፍሰስ ይንቀሱ። ፓድስ፣ ሮቶሮች፣ ካሊፐርስ፣ የABS መሰረታዊ ነገሮች እና ደህንነት ንቃየትን ያካትታል።',
      description_om: 'Rakkoo bireekii bal\'aa kan akka sagalee cuquliisaa, gubaa, faallamaa pedali fi daabii fuulduraa qoruu. Paadii, rotorii, kaaliperaa, ABS fi qorannoo nageenyaa qabata.',
      description_sid: 'Rakkoo bireekii bal\'aa kan akka sagalee cuquliisaa, gubaa, faallamaa pedali fi daabii fuulduraa qoruu. Paadii, rotorii, kaaliperaa, ABS fi qorannoo nageenyaa qabata.',
      category: 'Diagnostics',
      duration: '50 min',
      level: 'intermediate',
      content:
        'Braking force is created when pads press against rotors, with hydraulic pressure transferring pedal effort to the calipers. The tires then convert that friction into a controlled reduction in vehicle speed. Uneven wear, vibration, pulling, noise, or a changing pedal feel can point toward different faults.\n\n' +
        'Inspect both sides of the axle and measure pads and rotors against the vehicle\'s service limits. Check for leaks, damaged hoses, seized hardware, and warning indicators before drawing a conclusion. A road test should only be performed when the vehicle is safe to operate.\n\n' +
        'Support the vehicle with correctly rated stands and never rely on a jack alone. Brake work is safety-critical; follow the service procedure and verify the repair before returning the vehicle to use.',
      content_am: 'የመከርከር ኃይል ፓድስ ሮቶሮችን ሲጎሉሉ ይፈጥራል፣ ከዚያም የሃይድሮሊክ ግፊት የፔዳል ጥረት ወደ ካሊፐርስ ይወሰዳል። ቲየሮችም ያንን ግፊት ወደ የመኪና ፍጥነት ቁጠባ የተቆጣጠረ ቀንስ ይለውጣሉ። ያልተለመደ ሽፍታ፣ ንቅጠት፣ አሰራር፣ ድምጽ ወይም የፔዳል ስሜት የሚለው ለየት የሚሉ ችግሮች ሊጠቁሙ ይችላሉ።\n\n' +
        'የአክስል ሁለት ጎንዎችን ይመልከቱ እና ፓድስን እና ሮቶሮችን ከመኪናዋ የአገልጋይ ገደቦች ጋር ያነፃፃሉ። ከማንኛውም መውጫ በፊት ለመፍሰስ፣ ለተበሳሸ ሆዝዎች፣ ለተያዘ ሃርድዌር እና ለማስጠንቀቂያ ምልክቶች ይመልከቱ። መኪናዋ ለመንቀር ተዘጋጀ ከሆነ ብቻ የመንገድ ፈተና መያዝ ይችላሉ።\n\n' +
        'መኪናዋን በትክክለኛ የተመዘገበ ቁልፎች ይደግፉ እና በጃክ ብቻ አይታመኑም። የብሬክ ስራ ደህንነት አስፈላጊ ነው፤ የአገልጋይ ወራትን ይከተሉ እና መኪናዋን ከመመለስ በፊት ጥገኙነቱን ያረጋግጡ።',
      content_om: 'Qabxii bireekii paadii rotorii waliin walitti dhiyeenyyu uumama, dhiibaa haayidroolikii dhiibbaa pedali gara kaaliperaa dhaabuuf. Tayerii gargarummaan kan uumamuuf kanatti dorgommii kanatti jijjiira. Sirna walaalaa, faallama, sagalee ykn dhangii pedali jijjiiramu dogoggorra adda addaa ibisa.\n\n' +
        'Gara akkaa lamaffaa qoruu, paadii fi rotorii waliin walitti dhiyeenya konkolaataa. Daabii, hoosii miidhaame, hardware cufame fi mallattoo dhiibuu itti fufi dogoggorraa mirkaneessi. Konkolaataa nageenyaan hojjedhu yoo ta\'e qorannoo torban irratti qofa raawwachuu danda\'a.\n\n' +
        'Konkolaataa waliin standii sirrii ta\'e deeggari, jack qofa fayyadami. Hojii bireekii nageenyaa qabata; adeemsa tajaajilaa hordofi, suphee mirkaneessi konkolaataa deebisuu itti fufi.',
      content_sid: 'Qabxii bireekii paadii rotorii waliin walitti dhiyeenyyu uumama, dhiibaa haayidroolikii dhiibbaa pedali gara kaaliperaa dhaabuuf. Tayerii gargarummaan kan uumamuuf kanatti dorgommii kanatti jijjiira. Sirna walaalaa, faallama, sagalee ykn dhangii pedali jijjiiramu dogoggorra adda addaa ibisa.\n\n' +
        'Gara akkaa lamaffaa qoruu, paadii fi rotorii waliin walitti dhiyeenya konkolaataa. Daabii, hoosii miidhaame, hardware cufame fi mallattoo dhiibuu itti fufi dogoggorraa mirkaneessi. Konkolaataa nageenyaan hojjedhu yoo ta\'e qorannoo torban irratti qofa raawwachuu danda\'a.\n\n' +
        'Konkolaataa waliin standii sirrii ta\'e deeggari, jack qofa fayyadami. Hojii bireekii nageenyaa qabata; adeemsa tajaajilaa hordofi, suphee mirkaneessi konkolaataa deebisuu itti fufi.',
    },
  },
  {
    id: 'transmission-drivetrain',
    data: {
      title: 'Transmission & Drivetrain',
      title_am: 'ትራንስሚሽን እና የአሰራር ስርዓት',
      title_om: 'Tiraanmissionii fi Drivetrain',
      title_sid: 'Tiraanmissionii fi Drivetrain',
      description:
        'Explore manual and automatic transmissions, clutches, differentials and drivetrain layout. Learn symptom-based diagnosis and preventive maintenance.',
      description_am: 'የእጅ እና ራስ-ሰር ትራንስሚሽኖች፣ ክላችዎች፣ ዲፈሬንሻሎች እና የአሰራር ስርዓት አቀማመጥን ያስተምራሉ። በምልክት የተመሰረተ ንቃየት እና የመከረር ጥገናን ይማሩ።',
      description_om: 'Tiraanmissionii manualii fi otomaatikii, klaachii, differentialii fi qaawwa drivetrain baradhaa. Qorannoo alaamota irratti hundaa\'uuf fi suphaa eegaa baradhaa.',
      description_sid: 'Tiraanmissionii manualii fi otomaatikii, klaachii, differentialii fi qaawwa drivetrain baradhaa. Qorannoo alaamota irratti hundaa\'uuf fi suphaa eegaa baradhaa.',
      category: 'Vehicle Maintenance',
      duration: '75 min',
      level: 'intermediate',
      content:
        'The transmission and drivetrain deliver engine torque to the wheels. A clutch or torque converter connects engine output to the transmission, while gearsets change the relationship between engine speed and wheel speed. Differentials allow driven wheels to rotate at different speeds when turning.\n\n' +
        'Delayed engagement, slipping, unusual noise, vibration, or fluid leaks should be documented with the conditions in which they occur. Check the correct fluid level and condition procedure, scan for relevant trouble codes, and inspect mounts and driveline components before recommending repairs.\n\n' +
        'Many components require specialized lifting and diagnostic equipment. Use vehicle-specific service data and do not work beneath an unsupported vehicle.',
      content_am: 'ትራንስሚሽን እና የአሰራር ስርዓት የሞተር ቶርክን ወደ ጎማዎች ይወሰዳል። ክላች ወይም ቶርክ ኮንቨርተር የሞተር ውጤትን ወደ ትራንስሚሽን ያገናኛል፣ የጊር ስብስቦችም የሞተር ፍጥነት እና የጎማ ፍጥነት መካከል ያለውን ግንኙነት ይለውጣሉ። ዲፈሬንሻሎች የሚነዱ ጎማዎች በማዞር ጊዜ በተለያዩ ፍጥነቶች እንዲሮቱ ያስችላሉ።\n\n' +
        'የተወረወረ ስራ፣ መንሸት፣ ያልተለመደ ድምጽ፣ ንቅጠት ወይም የፍሉድ መፍሰስ ከሚከሰቱበት ሁኔታዎች ጋር መዘገዝ አለበት። ከማንኛውም ጥገና ከመጠየቅዎ በፊት ትክክለኛውን የፍሉድ ደረጃ እና ሁኔታን ይመልከቱ፣ ለተዛመዱ የችግር ኮዶች ይቃኑ እና የተሸከሙ ክፍሎችን እና የአሰራር መስረቶችን ይመልከቱ።\n\n' +
        'ብዙ ክፍሎች የተለየ የመውረድ እና የንቃየት መሳሪያዎችን ይፈልጋሉ። የመኪና-ተከታዊ የአገልጋይ ውሂብን ይጠቀሙ እና ከተደገፈ መኪና ስር አትስሩም።',
      content_om: 'Tiraanmissionii fi drivetrain torque injinii gara roobii geessuu. Klaachii ykn torque converter injinii gara tiraanmissionii qabsiisuu, gearsetiin immoo dhangii waliin jiru injinii fi roobii gidduutti jijjiira. Differentialiin roobii dorgomuu yeroo jira xiqqaa fi guddutti akka dorgomuu si danda\'isa.\n\n' +
        'Qabxii hawwiin, dorgommii, sagalee addaa, faallama ykn daabii fuulduraa yeroo uumamu haala waliin galmeessi. Qabxii sirrii fi haala qoruu, koodota rakkoo qoruu, mountii fi komponentii driveline qoruu suphaa itti fufi mirkaneessi.\n\n' +
        'Komponentii bal\'aa meeshaa qorannoo fi liftingii addaa barbaachisa. Deetaa tajaajila konkolaataa sirrii fayyadami, konkolaataa deeggaraa hin qabne jala hojii hin qabu.',
      content_sid: 'Tiraanmissionii fi drivetrain torque injinii gara roobii geessuu. Klaachii ykn torque converter injinii gara tiraanmissionii qabsiisuu, gearsetiin immoo dhangii waliin jiru injinii fi roobii gidduutti jijjiira. Differentialiin roobii dorgomuu yeroo jira xiqqaa fi guddutti akka dorgomuu si danda\'isa.\n\n' +
        'Qabxii hawwiin, dorgommii, sagalee addaa, faallama ykn daabii fuulduraa yeroo uumamu haala waliin galmeessi. Qabxii sirrii fi haala qoruu, koodota rakkoo qoruu, mountii fi komponentii driveline qoruu suphaa itti fufi mirkaneessi.\n\n' +
        'Komponentii bal\'aa meeshaa qorannoo fi liftingii addaa barbaachisa. Deetaa tajaajila konkolaataa sirrii fayyadami, konkolaataa deeggaraa hin qabne jala hojii hin qabu.',
    },
  },
  {
    id: 'hvac-climate-control',
    data: {
      title: 'HVAC & Climate Control',
      title_am: 'HVAC እና የአየር ሁኔታ ቁጥጥር',
      title_om: 'HVAC fi Qabxii Qilleensaa',
      title_sid: 'HVAC fi Qabxii Qilleensaa',
      description:
        'Understand heating, ventilation and air-conditioning systems: refrigerant cycle, compressor, condenser, cabin filters and common performance faults.',
      description_am: 'የማሽቀድ፣ የአየር ማስተላለፍ እና የአየር ማቀውም ስርዓቶችን ይረዱ፡ የሪፍሪጄራንት ዑደት፣ ኮምፕረሰር፣ ኮንደንሰር፣ የካቢን ፊልተሮች እና የተለመዱ የአፈርቃሪ ችግሮች።',
      description_om: 'Sirna qabaa, qilleensaa fi qilleensaa barbaa\'uu hubachuuf: dorgommii refrigerantii, kompreesorii, kondensera, fiilterii kabiinii fi dogoggorri walsisaa.',
      description_sid: 'Sirna qabaa, qilleensaa fi qilleensaa barbaa\'uu hubachuuf: dorgommii refrigerantii, kompreesorii, kondensera, fiilterii kabiinii fi dogoggorri walsisaa.',
      category: 'Automotive Fundamentals',
      duration: '40 min',
      level: 'beginner',
      content:
        'Heating, ventilation, and air conditioning move and condition air inside the cabin. In cooling mode, refrigerant carries heat from the evaporator to the condenser; the compressor circulates it through the system while metering devices regulate flow.\n\n' +
        'Weak airflow may begin with a restricted cabin filter or blower issue, while warm air can have several causes including control, airflow, or refrigerant-system faults. Record vent temperature and operating conditions, and inspect accessible components before choosing a test.\n\n' +
        'Refrigerant systems operate under pressure and require approved recovery equipment. Do not vent refrigerant or open the system without the required training and tools.',
      content_am: 'ማሽቀድ፣ የአየር ማስተላለፍ እና የአየር ማቀውም አየርን በካቢኑ ውስጥ ይዞራሉ እና ይተለፋሉ። በማቀውም ሁኔታ፣ ሪፍሪጄራንት ሙቀትን ከኢቫፖሬተር ወደ ኮንደንሰር ይወስዳል፤ ኮምፕረሰርም እሱን በስርዓቱ ውስጥ ያነጋግራል እንዲሁም የመለኪያ መሳሪያዎች የሚፈሰውን ይቆጣጠራሉ።\n\n' +
        'ደካማ የአየር ፍሰት ከተወሰነ የካቢን ፊልተር ወይም ከብሎወር ችግር ሊጀምር ይችላል፣ እንደዚያም ሙቀት አየር በቁጥጥር፣ በአየር ፍሰት ወይም በሪፍሪጄራንት ስርዓት ችግሮች ምክንያቶች ሊኖሩት ይችላል። የቬንት ሙቀት እና የአሰራር ሁኔታዎችን ይመዝግቡ እና ፈተናን ከመምረጥዎ በፊት የሚደርሱ ክፍሎችን ይመልከቱ።\n\n' +
        'የሪፍሪጄራንት ስርዓቶች በግፊት ስር ይሰሩ እና የተፈቀደ የመመለሻ መሳሪያ ይፈልጋሉ። ሪፍሪጄራንትን አይልቁ ወይም ስርዓቱን ያስፈልጉ የሚፈለግጉ ትምህርት እና መሳሪያዎች ሳይኖሩት።',
      content_om: 'Qabaa, qilleensaa fi qilleensaa barbaa\'uu qilleensaa kabiinii keessa jiru fayyadamaa fi sirrii taasisuu. Dorgommii qabarsuu keessatti, refrigerantii qabxii evaporatorii irraa gara kondensera geessuu; kompreesorii isaa sirna keessa jiru darbeessa, meeshaalee miira daawwamuun daawwama.\n\n' +
        'Qilleensaa dhibeessa filitira kabiinii cufame ykn rakkoo blower irraa jalqabuu danda\'a, qilleensaa qabaa immoo qabxii, qilleensaa ykn sirna refrigerantii dogoggorra adda addaa qaba. Qabxii ventii fi haala hojii galmeessi, komponentii dandeessamuu qoruu qorannoo filuu itti fufi.\n\n' +
        'Sirna refrigerantii dhiibaa keessa hojii fi meeshaa recoveryii kan dandaafamuu barbaachisa. Refrigerantii ventii gochuu dhiifachaa, sirna qabxii barbaachisuu hin qabne sirrii ta\'e hin banu.',
      content_sid: 'Qabaa, qilleensaa fi qilleensaa barbaa\'uu qilleensaa kabiinii keessa jiru fayyadamaa fi sirrii taasisuu. Dorgommii qabarsuu keessatti, refrigerantii qabxii evaporatorii irraa gara kondensera geessuu; kompreesorii isaa sirna keessa jiru darbeessa, meeshaalee miira daawwamuun daawwama.\n\n' +
        'Qilleensaa dhibeessa filitira kabiinii cufame ykn rakkoo blower irraa jalqabuu danda\'a, qilleensaa qabaa immoo qabxii, qilleensaa ykn sirna refrigerantii dogoggorra adda addaa qaba. Qabxii ventii fi haala hojii galmeessi, komponentii dandeessamuu qoruu qorannoo filuu itti fufi.\n\n' +
        'Sirna refrigerantii dhiibaa keessa hojii fi meeshaa recoveryii kan dandaafamuu barbaachisa. Refrigerantii ventii gochuu dhiifachaa, sirna qabxii barbaachisuu hin qabne sirrii ta\'e hin banu.',
    },
  },
  {
    id: 'obd-ii-scan-tools',
    data: {
      title: 'OBD-II & Scan Tools',
      title_am: 'OBD-II እና ስካን ቱሎች',
      title_om: 'OBD-II fi Meeshaalee Qorannoo',
      title_sid: 'OBD-II fi Meeshaalee Qorannoo',
      description:
        'Read and interpret OBD-II diagnostic trouble codes, use live data and freeze-frame information, and turn scan-tool results into a structured repair plan.',
      description_am: 'OBD-II የንቃየት ችግር ኮዶችን አንብቡ እና ተርጉሙ፣ በእውነተኛ ጊዜ ውሂብ እና የተቆለፈ ክፍል መረጃን ይጠቀሙ፣ እንዲሁም የስካን-ቱል ውጤቶችን ወደ የተዋቀረ የጥገና እቅድ ይለውጡ።',
      description_om: 'Koodota rakkoo OBD-II dubbisi fi ibsu, deetaa to\'aa\'aa fi deetaa freeze-frame fayyadami, bu\'aa meeshaa qorannoo gara qajeelfama suphee qophaa\'e jijjiiru.',
      description_sid: 'Koodota rakkoo OBD-II dubbisi fi ibsu, deetaa to\'aa\'aa fi deetaa freeze-frame fayyadami, bu\'aa meeshaa qorannoo gara qajeelfama suphee qophaa\'e jijjiiru.',
      category: 'Electronics',
      duration: '55 min',
      level: 'advanced',
      content:
        'OBD-II scan tools communicate with vehicle control modules and report diagnostic trouble codes, freeze-frame snapshots, and live data. A code identifies a detected condition; it does not automatically identify a failed part.\n\n' +
        'Record all codes before clearing anything, note whether they are current or pending, and review freeze-frame data to understand when the fault occurred. Compare live readings with expected values and use a wiring diagram or service procedure to test the suspected circuit.\n\n' +
        'Confirm the repair by repeating the relevant test and checking monitor status. Preserve useful scan data for the service record, and follow safety instructions when working around moving or energized components.',
      content_am: 'OBD-II ስካን ቱሎች ከመኪና ቁጥጥር ሞጁሎች ጋር ይነጋገራሉ እና የንቃየት ችግር ኮዶችን፣ የተቆለፈ ክፍል ምስሎች እና በእውነተኛ ጊዜ ውሂብ ያሳውቃሉ። ኮድ የተገኘውን ሁኔታ ይለያል፤ የተሳሳተ ክፍልን በራስ-ሰር አይለያል።\n\n' +
        'ማንኛውንም ነገር ከማጽዱ በፊት ሁሉንም ኮዶች ይመዝግቡ፣ አሁን እንዳሉ ወይም በጥበብ እንደሆኑ ያስታውቁ፣ እና የችግሩ የተከሰተበትን ጊዜ ለመረዳት የተቆለፈ ክፍል ውሂብን ይመልከቱ። የእውነተኛ ጊዜ ማንበብን ከተገመቱ ዋጋዎች ጋር ያነፃፃሉ እና የተጠራገመውን ዑደት ለመፈተን የገመድ ንድፍ ወይም የአገልጋይ ወራት ይጠቀሙ።\n\n' +
        'ጥገኑነቱን በተዛመደ ፈተና እና በሞኒተር ሁኔታ ማረጋገጥ ያረጋግጡ። ጠቃሚ የሆካቸውን የስካን ውሂብ ለአገልጋይ መዝገብ ያስቀምጡ፣ እና በንቁ ወይም በኃይል ላይ ያሉ ክፍሎች ስራ ሲያደርጉ የደህንነት መመሪያዎችን ይከተሉ።',
      content_om: 'Meeshaalee qorannoo OBD-II waliin wal dhageenya module kontrolii konkolaataa fi koodota rakkoo, snapshot freeze-frame data fi deetaa to\'aa\'aa ibsu. Koodiin haala argamuu ibsa, komponentii dogoggorraa ta\'e sirritti hin ibsu.\n\n' +
        'Koodota hunda galmeessi itti fufi haala amma ykn pending ta\'een yaadachiisi, deetaa freeze-frame qoruu dogoggorri yeroo uumamu hubachuuf. Deetaa to\'aa\'aa waliin walitti dhiyeenya, wiring diagram ykn adeemsa tajaajila fayyadami sirna dogoggorraa ta\'e qoruu.\n\n' +
        'Suphee mirkaneessi qorannoo mirkaneessaa deebi\'ii raawwachuu, monitor status qoruu. Deetaa qorannoo gargaara qorannoo galmeessi, nageenya hordofi qabxii moving ykn energized irratti hojii gochuu.',
      content_sid: 'Meeshaalee qorannoo OBD-II waliin wal dhageenya module kontrolii konkolaataa fi koodota rakkoo, snapshot freeze-frame data fi deetaa to\'aa\'aa ibsu. Koodiin haala argamuu ibsa, komponentii dogoggorraa ta\'e sirritti hin ibsu.\n\n' +
        'Koodota hunda galmeessi itti fufi haala amma ykn pending ta\'een yaadachiisi, deetaa freeze-frame qoruu dogoggorri yeroo uumamu hubachuuf. Deetaa to\'aa\'aa waliin walitti dhiyeenya, wiring diagram ykn adeemsa tajaajila fayyadami sirna dogoggorraa ta\'e qoruu.\n\n' +
        'Suphee mirkaneessi qorannoo mirkaneessaa deebi\'ii raawwachuu, monitor status qoruu. Deetaa qorannoo gargaara qorannoo galmeessi, nageenya hordofi qabxii moving ykn energized irratti hojii gochuu.',
    },
  },
];

if (!projectId) {
  console.error(
    'Missing project ID. Set APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID in .env).'
  );
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY. Set it in your shell or in .env.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function seedModule({ id, data }) {
  try {
    await databases.getDocument(databaseId, COLLECTION_ID, id);
    await databases.updateDocument(databaseId, COLLECTION_ID, id, data);
    console.log(`↻ updated  ${id}`);
  } catch (error) {
    if (error.code !== 404) throw error;
    await databases.createDocument(databaseId, COLLECTION_ID, id, data);
    console.log(`+ created  ${id}`);
  }
}

async function main() {
  console.log('\nAutoFix AI — seeding learning_modules');
  console.log(`  Endpoint:   ${endpoint}`);
  console.log(`  Project:    ${projectId}`);
  console.log(`  Database:   ${databaseId}`);
  console.log(`  Collection: ${COLLECTION_ID}\n`);

  for (const module of MODULES) {
    await seedModule(module);
  }

  console.log(`\nDone. ${MODULES.length} modules are available.\n`);
}

main().catch((error) => {
  console.error('\nSeeding failed:', error?.message || error);

  if (error?.code === 401) {
    console.error(
      'Authentication failed. Verify APPWRITE_API_KEY and its databases.read / databases.write scopes.'
    );
  } else if (error?.code === 404) {
    console.error(
      `Collection "${COLLECTION_ID}" (or database "${databaseId}") was not found. ` +
        'Run "npm run setup:db" first.'
    );
  } else if (error?.code === 400) {
    console.error(
      'Bad request. Make sure the collection has title, description, category, duration, level, and content attributes.'
    );
  }

  process.exitCode = 1;
});
