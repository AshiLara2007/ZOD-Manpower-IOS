import { supabase } from './supabase';

// Chat Message Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  options?: ChatOption[];
  candidates?: any[];
  timestamp: Date;
}

export interface ChatOption {
  id: string;
  label: string;
  action: string;
}

// Country List (8 Countries)
const COUNTRIES = [
  { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { id: 'sri_lanka', name: 'Sri Lanka', flag: '🇱🇰' },
  { id: 'philippines', name: 'Philippines', flag: '🇵🇭' },
  { id: 'bangladesh', name: 'Bangladesh', flag: '🇧🇩' },
  { id: 'india', name: 'India', flag: '🇮🇳' },
  { id: 'ethiopia', name: 'Ethiopia', flag: '🇪🇹' },
  { id: 'uganda', name: 'Uganda', flag: '🇺🇬' },
  { id: 'kenya', name: 'Kenya', flag: '🇰🇪' },
];

// Job List
const JOBS = [
  'Driver', 'Nurse', 'Cook', 'House Maid', 'Teacher',
  'Baby sitting', 'Domestic Worker'
];

// ============================================
// LANGUAGE TRANSLATIONS
// ============================================
const LANGUAGES = {
  en: {
    welcome: '👋 Welcome to ZOD Manpower AI Assistant!\n\nI\'m here to help you find the perfect candidates, answer your questions, and assist with recruitment.\n\nHow can I help you today?',
    search: '🔍 *Search Candidates*\n\nHow would you like to search?\n\n1️⃣ Show All Candidates (8 Countries)\n2️⃣ Search by Country\n3️⃣ Search by Job\n\nType the number or tap below:',
    searchAll: '🌍 *Latest Candidates from 8 Countries:*\n\n',
    searchCountry: '🌏 *Select a Country:*\n\n',
    searchJob: '💼 *Select a Job:*\n\n',
    noCandidates: '😕 No candidates found at the moment.',
    error: '❌ Error fetching candidates. Please try again.',
    menu: '🔙 Main Menu',
    selectCountry: '🌏 Search by Country',
    selectJob: '💼 Search by Job',
    showAll: '🌍 Show All Candidates (8 Countries)',
    back: '🔙 Main Menu',
    info: 'ℹ️ *More Information*\n\n📌 *Processing Time:* 20 days after visa approval\n\n💰 *Pricing Information:*\n• Recruitment Fee: Contact us\n• Visa Processing: Contact us\n• Medical Insurance: Contact us\n• Air Ticket: Contact us\n\n📞 For exact pricing, please Contact Us or visit our website.',
    pricing: '💰 *ZOD Manpower Pricing*\n\n🇮🇩 *Indonesia:* $500 - $800\n🇱🇰 *Sri Lanka:* $450 - $700\n🇵🇭 *Philippines:* $550 - $850\n🇧🇩 *Bangladesh:* $400 - $650\n🇮🇳 *India:* $450 - $750\n🇪🇹 *Ethiopia:* $350 - $550\n🇺🇬 *Uganda:* $350 - $550\n🇰🇪 *Kenya:* $400 - $600\n\n💡 *Note:* Prices may vary based on job type and experience.',
    processing: '⏱️ *Processing Time*\n\n📌 *Visa Processing:* 20 days after visa approval\n\n📋 *Process Steps:*\n1️⃣ Document Collection (2-3 days)\n2️⃣ Medical Examination (3-5 days)\n3️⃣ Visa Application (5-7 days)\n4️⃣ Visa Approval (7-10 days)\n5️⃣ Travel Arrangement (2-3 days)',
    contact: '📞 *Contact Us*\n\n🏢 *ZOD Manpower Recruitment*\n📍 Location: Doha, Qatar\n\n📱 *WhatsApp:* +974 5535 5206\n📧 *Email:* info@zodmanpower.info\n🌐 *Website:* https://zodmanpower.info\n\n🕐 *Working Hours:*\nSaturday - Thursday: 9AM - 10PM\nFriday: Closed',
    whatsapp: '📱 *Chat on WhatsApp*\n\nClick below to chat with our team on WhatsApp!\n\n📞 +974 5535 5206',
    email: '📧 *Send Email*\n\n📧 info@zodmanpower.info\n\nWe will respond within 24 hours.',
    languageSelect: '🌐 *Select Language / اختر اللغة*\n\n🇬🇧 English\n🇶🇦 العربية\n\nType "en" for English or "ar" for Arabic.',
    greeting: 'Hello! How can I assist you today?',
    goodbye: 'Thank you for chatting with us! Have a great day!',
    unknown: '🤔 I didn\'t understand that.\n\nType "menu" to see available options.\n\nYou can also type:\n• "Search" to find candidates\n• "Info" for more information\n• "Contact" to reach us',
    candidateNotFound: 'Candidate not found. Please try again.',
    countryList: 'Please select a country from the list below:',
    jobList: 'Please select a job from the list below:',
  },
  ar: {
    welcome: '👋 مرحباً بك في مساعد ZOD Manpower الذكي!\n\nأنا هنا لمساعدتك في العثور على المرشحين المثاليين، والإجابة على أسئلتك، والمساعدة في التوظيف.\n\nكيف يمكنني مساعدتك اليوم؟',
    search: '🔍 *بحث عن مرشحين*\n\nكيف تريد البحث؟\n\n١️⃣ عرض جميع المرشحين (8 دول)\n٢️⃣ البحث حسب الدولة\n٣️⃣ البحث حسب الوظيفة\n\nاكتب الرقم أو اضغط أدناه:',
    searchAll: '🌍 *أحدث المرشحين من 8 دول:*\n\n',
    searchCountry: '🌏 *اختر دولة:*\n\n',
    searchJob: '💼 *اختر وظيفة:*\n\n',
    noCandidates: '😕 لم يتم العثور على مرشحين في الوقت الحالي.',
    error: '❌ حدث خطأ في جلب المرشحين. يرجى المحاولة مرة أخرى.',
    menu: '🔙 القائمة الرئيسية',
    selectCountry: '🌏 البحث حسب الدولة',
    selectJob: '💼 البحث حسب الوظيفة',
    showAll: '🌍 عرض جميع المرشحين (8 دول)',
    back: '🔙 القائمة الرئيسية',
    info: 'ℹ️ *مزيد من المعلومات*\n\n📌 *وقت المعالجة:* 20 يومًا بعد الموافقة على التأشيرة\n\n💰 *معلومات الأسعار:*\n• رسوم التوظيف: اتصل بنا\n• معالجة التأشيرة: اتصل بنا\n• التأمين الطبي: اتصل بنا\n• تذكرة الطيران: اتصل بنا\n\n📞 للحصول على أسعار دقيقة، يرجى الاتصال بنا.',
    pricing: '💰 *أسعار ZOD Manpower*\n\n🇮🇩 *إندونيسيا:* 500 - 800 دولار\n🇱🇰 *سريلانكا:* 450 - 700 دولار\n🇵🇭 *الفلبين:* 550 - 850 دولار\n🇧🇩 *بنغلاديش:* 400 - 650 دولار\n🇮🇳 *الهند:* 450 - 750 دولار\n🇪🇹 *إثيوبيا:* 350 - 550 دولار\n🇺🇬 *أوغندا:* 350 - 550 دولار\n🇰🇪 *كينيا:* 400 - 600 دولار\n\n💡 *ملاحظة:* قد تختلف الأسعار حسب نوع الوظيفة والخبرة.',
    processing: '⏱️ *وقت المعالجة*\n\n📌 *معالجة التأشيرة:* 20 يومًا بعد الموافقة على التأشيرة\n\n📋 *خطوات العملية:*\n١️⃣ جمع المستندات (2-3 أيام)\n٢️⃣ الفحص الطبي (3-5 أيام)\n٣️⃣ طلب التأشيرة (5-7 أيام)\n٤️⃣ الموافقة على التأشيرة (7-10 أيام)\n٥️⃣ ترتيب السفر (2-3 أيام)',
    contact: '📞 *اتصل بنا*\n\n🏢 *ZOD Manpower Recruitment*\n📍 الموقع: الدوحة، قطر\n\n📱 *واتساب:* +974 5535 5206\n📧 *البريد الإلكتروني:* info@zodmanpower.info\n🌐 *الموقع الإلكتروني:* https://zodmanpower.info\n\n🕐 *ساعات العمل:*\nالسبت - الخميس: 9 صباحاً - 10 مساءً\nالجمعة: مغلق',
    whatsapp: '📱 *الدردشة عبر واتساب*\n\nانقر أدناه للدردشة مع فريقنا على واتساب!\n\n📞 +974 5535 5206',
    email: '📧 *إرسال بريد إلكتروني*\n\n📧 info@zodmanpower.info\n\nسوف نرد في غضون 24 ساعة.',
    languageSelect: '🌐 *اختر اللغة*\n\n🇬🇧 English\n🇶🇦 العربية\n\nاكتب "en" للإنجليزية أو "ar" للعربية.',
    greeting: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
    goodbye: 'شكراً لتحدثك معنا! أتمنى لك يوماً سعيداً!',
    unknown: '🤔 لم أفهم ذلك.\n\nاكتب "menu" لرؤية الخيارات المتاحة.\n\nيمكنك أيضاً كتابة:\n• "Search" للبحث عن مرشحين\n• "Info" لمزيد من المعلومات\n• "Contact" للاتصال بنا',
    candidateNotFound: 'لم يتم العثور على المرشح. يرجى المحاولة مرة أخرى.',
    countryList: 'يرجى اختيار دولة من القائمة أدناه:',
    jobList: 'يرجى اختيار وظيفة من القائمة أدناه:',
  }
};

// ============================================
// MAIN CHAT BOT FUNCTION
// ============================================
export const getBotResponse = async (
  message: string,
  language: 'en' | 'ar' = 'en',
  context?: any
): Promise<{ text: string; options?: ChatOption[]; candidates?: any[] }> => {
  const lowerMsg = message.toLowerCase().trim();
  const t = LANGUAGES[language];

  // ============================================
  // LANGUAGE SELECTION
  // ============================================
  if (lowerMsg === 'language' || lowerMsg === 'lang' || lowerMsg === 'en' || lowerMsg === 'ar') {
    if (lowerMsg === 'en') {
      return {
        text: '🌐 Language set to English.\n\nType "menu" to continue.',
        options: [{ id: 'menu', label: '📋 Show Menu', action: 'menu' }],
      };
    } else if (lowerMsg === 'ar') {
      return {
        text: '🌐 تم تعيين اللغة إلى العربية.\n\nاكتب "menu" للمتابعة.',
        options: [{ id: 'menu', label: '📋 عرض القائمة', action: 'menu' }],
      };
    }
  }

  // ============================================
  // MENU OPTIONS
  // ============================================
  if (lowerMsg === 'menu' || lowerMsg === 'help' || lowerMsg === 'start' || lowerMsg === '') {
    return {
      text: t.welcome,
      options: [
        { id: 'search', label: '🔍 Search Candidates', action: 'search' },
        { id: 'info', label: 'ℹ️ More Information', action: 'info' },
        { id: 'contact', label: '📞 Contact Us', action: 'contact' },
        { id: 'language', label: '🌐 Language', action: 'language' },
      ],
    };
  }

  // ============================================
  // LANGUAGE CHANGE
  // ============================================
  if (lowerMsg.includes('language') || lowerMsg === 'language') {
    return {
      text: t.languageSelect,
      options: [
        { id: 'lang_en', label: '🇬🇧 English', action: 'en' },
        { id: 'lang_ar', label: '🇶🇦 العربية', action: 'ar' },
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // SEARCH CANDIDATES
  // ============================================
  if (lowerMsg.includes('search') || lowerMsg === '1' || lowerMsg === '1️⃣') {
    return {
      text: t.search,
      options: [
        { id: 'search_all', label: t.showAll, action: 'search_all' },
        { id: 'search_country', label: t.selectCountry, action: 'search_country' },
        { id: 'search_job', label: t.selectJob, action: 'search_job' },
        { id: 'menu', label: t.back, action: 'menu' },
      ],
    };
  }

  // ============================================
  // SHOW ALL CANDIDATES (8 Countries)
  // ============================================
  if (lowerMsg.includes('all candidates') || lowerMsg === 'search_all') {
    try {
      const countryPromises = COUNTRIES.map(async (country) => {
        const { data, error } = await supabase
          .from('talents')
          .select('*')
          .ilike('country', country.name)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
      });

      const results = await Promise.all(countryPromises);
      const candidates = results.filter(c => c !== null);

      if (candidates.length > 0) {
        const candidateList = candidates.map((c, i) => 
          `${i + 1}. ${c.country_flag || '🌍'} *${c.name}*\n   📍 ${c.country} | 💼 ${c.job}\n   💰 ${c.salary} QAR`
        ).join('\n\n');

        return {
          text: `${t.searchAll}${candidateList}\n\n💡 Tap a candidate to view full profile.\n\nType "menu" to go back.`,
          candidates: candidates,
          options: [
            { id: 'menu', label: t.back, action: 'menu' },
          ],
        };
      } else {
        return {
          text: `${t.noCandidates}\n\nType "menu" to go back.`,
          options: [{ id: 'menu', label: t.back, action: 'menu' }],
        };
      }
    } catch (error) {
      return {
        text: t.error,
        options: [{ id: 'menu', label: t.back, action: 'menu' }],
      };
    }
  }

  // ============================================
  // SEARCH BY COUNTRY
  // ============================================
  if (lowerMsg.includes('search by country') || lowerMsg === 'search_country') {
    const countryList = COUNTRIES.map((c, i) => 
      `${i + 1}. ${c.flag} ${c.name}`
    ).join('\n');

    return {
      text: `${t.searchCountry}${countryList}\n\nTap a country below to search:`,
      options: COUNTRIES.map(c => ({
        id: `country_${c.id}`,
        label: `${c.flag} ${c.name}`,
        action: `country_${c.id}`
      })).concat([
        { id: 'menu', label: t.back, action: 'menu' }
      ]),
    };
  }

  // ============================================
  // SEARCH BY JOB
  // ============================================
  if (lowerMsg.includes('search by job') || lowerMsg === 'search_job') {
    const jobList = JOBS.map((j, i) => 
      `${i + 1}. 💼 ${j}`
    ).join('\n');

    return {
      text: `${t.searchJob}${jobList}\n\nTap a job below to search:`,
      options: JOBS.map(j => ({
        id: `job_${j.toLowerCase().replace(/\s/g, '_')}`,
        label: `💼 ${j}`,
        action: `job_${j.toLowerCase().replace(/\s/g, '_')}`
      })).concat([
        { id: 'menu', label: t.back, action: 'menu' }
      ]),
    };
  }

  // ============================================
  // COUNTRY SELECTION (Dynamic)
  // ============================================
  for (const country of COUNTRIES) {
    if (lowerMsg.includes(country.name.toLowerCase()) || 
        lowerMsg === `country_${country.id}`) {
      
      try {
        const { data, error } = await supabase
          .from('talents')
          .select('*')
          .ilike('country', country.name)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          const candidateList = data.map((c, i) => 
            `${i + 1}. 👤 *${c.name}*\n   💼 ${c.job} | 💰 ${c.salary} QAR\n   📍 ${c.country}`
          ).join('\n\n');

          return {
            text: `${country.flag} *Candidates from ${country.name}:*\n\n${candidateList}\n\n💡 Tap a candidate to view full profile.`,
            candidates: data,
            options: [
              { id: 'search_country', label: '🌏 Search Another Country', action: 'search_country' },
              { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
            ],
          };
        } else {
          return {
            text: `😕 No candidates found from ${country.name}.\n\nType "menu" to go back.`,
            options: [{ id: 'menu', label: '🔙 Main Menu', action: 'menu' }],
          };
        }
      } catch (error) {
        return {
          text: t.error,
          options: [{ id: 'menu', label: t.back, action: 'menu' }],
        };
      }
    }
  }

  // ============================================
  // JOB SELECTION (Dynamic)
  // ============================================
  for (const job of JOBS) {
    const jobKey = job.toLowerCase().replace(/\s/g, '_');
    if (lowerMsg.includes(job.toLowerCase()) || 
        lowerMsg === `job_${jobKey}`) {
      
      try {
        const { data, error } = await supabase
          .from('talents')
          .select('*')
          .ilike('job', job)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (data && data.length > 0) {
          const candidateList = data.map((c, i) => 
            `${i + 1}. 👤 *${c.name}*\n   📍 ${c.country} | 💰 ${c.salary} QAR`
          ).join('\n\n');

          return {
            text: `💼 *${job} Candidates:*\n\n${candidateList}\n\n💡 Tap a candidate to view full profile.`,
            candidates: data,
            options: [
              { id: 'search_job', label: '💼 Search Another Job', action: 'search_job' },
              { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
            ],
          };
        } else {
          return {
            text: `😕 No ${job} candidates found.\n\nType "menu" to go back.`,
            options: [{ id: 'menu', label: '🔙 Main Menu', action: 'menu' }],
          };
        }
      } catch (error) {
        return {
          text: t.error,
          options: [{ id: 'menu', label: t.back, action: 'menu' }],
        };
      }
    }
  }

  // ============================================
  // MORE INFORMATION
  // ============================================
  if (lowerMsg.includes('more information') || lowerMsg === '2' || lowerMsg === '2️⃣' || lowerMsg === 'info') {
    return {
      text: t.info,
      options: [
        { id: 'pricing', label: '💰 View Prices', action: 'pricing' },
        { id: 'processing', label: '⏱️ Processing Time', action: 'processing' },
        { id: 'contact', label: '📞 Contact Us', action: 'contact' },
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // PRICING
  // ============================================
  if (lowerMsg.includes('pricing') || lowerMsg === 'pricing') {
    return {
      text: t.pricing,
      options: [
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // PROCESSING TIME
  // ============================================
  if (lowerMsg.includes('processing') || lowerMsg === 'processing') {
    return {
      text: t.processing,
      options: [
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // CONTACT US
  // ============================================
  if (lowerMsg.includes('contact') || lowerMsg === '3' || lowerMsg === '3️⃣' || lowerMsg === 'contact') {
    return {
      text: t.contact,
      options: [
        { id: 'whatsapp', label: '📱 Chat on WhatsApp', action: 'whatsapp' },
        { id: 'email', label: '📧 Send Email', action: 'email' },
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // WHATSAPP
  // ============================================
  if (lowerMsg.includes('whatsapp') || lowerMsg === 'whatsapp') {
    return {
      text: t.whatsapp,
      options: [
        { id: 'open_whatsapp', label: '📱 Open WhatsApp', action: 'open_whatsapp' },
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // EMAIL
  // ============================================
  if (lowerMsg.includes('email') || lowerMsg === 'email') {
    return {
      text: t.email,
      options: [
        { id: 'send_email', label: '📧 Compose Email', action: 'send_email' },
        { id: 'menu', label: '🔙 Main Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // GREETINGS & FAREWELL
  // ============================================
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return {
      text: t.greeting,
      options: [
        { id: 'menu', label: '📋 Show Menu', action: 'menu' },
      ],
    };
  }

  if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye')) {
    return {
      text: t.goodbye,
      options: [
        { id: 'menu', label: '📋 Show Menu', action: 'menu' },
      ],
    };
  }

  // ============================================
  // DEFAULT / UNKNOWN
  // ============================================
  return {
    text: t.unknown,
    options: [
      { id: 'menu', label: '📋 Show Menu', action: 'menu' },
    ],
  };
};