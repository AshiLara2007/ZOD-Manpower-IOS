import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    // Navigation
    home: 'Home',
    candidates: 'Candidates',
    jobs: 'Jobs',
    about: 'About',
    settings: 'Settings',
    favorites: 'Favorites',
    
    // Admin
    admin: 'Admin',
    adminLogin: 'Admin Login',
    adminLogout: 'Logout',
    adminPanel: 'Admin Panel',
    deleteCandidate: 'Delete Candidate',
    confirmDelete: 'Confirm Delete',
    deleteConfirmMsg: 'Are you sure you want to delete this candidate? This action cannot be undone.',
    deleteSuccess: 'Candidate deleted successfully',
    deleteFailed: 'Failed to delete candidate',
    loginSuccess: 'Welcome Admin!',
    loginFailed: 'Invalid username or password',
    loggedOut: 'Logged out successfully',
    
    // Home - Hero Section
    heroTitle: 'Find Your Perfect Candidate Today',
    heroSubtitle: 'We provide skilled and reliable workforce solutions for businesses across Qatar',
    browseCandidates: 'Browse Candidates',
    viewJobs: 'View Jobs',
    
    // Home - Stats
    total: 'Total',
    available: 'Available',
    returned: 'Returned',
    availableCandidates: 'Available Candidates',
    seeAll: 'See All',
    noAvailableCandidates: 'No available candidates',
    loading: 'Loading...',
    
    // Candidates
    searchCandidates: 'Search candidates...',
    all: 'All',
    noCandidatesFound: 'No candidates found',
    share: 'Share',
    shareCandidate: 'Share Candidate',
    noFavorites: 'No favorites yet',
    
    // Jobs
    findRightCandidate: 'Find the right candidate for your job',
    noJobsAvailable: 'No Jobs Available',
    noJobsMessage: 'There are currently no open job positions. Please check back later for new opportunities.',
    browseCandidatesBtn: 'Browse Candidates',
    back: 'Back',
    
    // About
    aboutUs: 'About Us',
    whoWeAre: 'Who We Are',
    whoWeAreText: 'We are a leading manpower recruitment agency based in Doha, Qatar. We specialize in providing skilled and reliable workforce solutions for businesses and households across the Middle East.',
    yearsExperience: 'Years Experience',
    happyClients: 'Happy Clients',
    workersPlaced: 'Workers Placed',
    ourMission: 'Our Mission',
    ourMissionText: 'To connect employers with qualified, reliable, and skilled workers while ensuring a smooth and transparent recruitment process.',
    ourVision: 'Our Vision',
    ourVisionText: 'To be the most trusted and preferred manpower recruitment agency in Qatar and the Middle East region.',
    contactUs: 'Contact Us',
    callUs: 'Call Us',
    emailUs: 'Email Us',
    registeredOffice: 'Registered Office',
    workingHours: 'Working Hours',
    allRightsReserved: 'All rights reserved',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    english: 'English',
    arabic: 'العربية',
    lightMode: 'Light',
    darkMode: 'Dark',
    developerBy: 'Developer By',
    makeNumberSupport: 'Make Number / Support',
    version: 'Version',
    copyright: '© 2026 ZOD Manpower',
    prispointStudios: 'Prispoint Studios',
    success: 'Success',
    settingsSaved: 'Settings saved!',
    
    // Status
    statusAvailable: 'Available',
    statusReturned: 'Returned',
    statusRecruitment: 'Recruitment',
    
    // Candidate Profile
    salary: 'Salary',
    country: 'Country',
    experience: 'Experience',
    age: 'Age',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    religion: 'Religion',
    reference: 'Reference',
    years: 'years',
    contactViaWhatsApp: 'Contact via WhatsApp',
    candidateNotFound: 'Candidate not found',
    viewCV: 'View CV',
    personalInfo: 'Personal Information',
    nationality: 'Nationality',
    whatsapp: 'WhatsApp',
    noData: 'No data available',
    
    // Common
    qar: 'QAR',
    perMonth: '/month',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    candidates: 'المرشحون',
    jobs: 'الوظائف',
    about: 'من نحن',
    settings: 'الإعدادات',
    favorites: 'المفضلة',
    
    // Admin
    admin: 'المشرف',
    adminLogin: 'تسجيل دخول المشرف',
    adminLogout: 'تسجيل الخروج',
    adminPanel: 'لوحة التحكم',
    deleteCandidate: 'حذف المرشح',
    confirmDelete: 'تأكيد الحذف',
    deleteConfirmMsg: 'هل أنت متأكد من حذف هذا المرشح؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteSuccess: 'تم حذف المرشح بنجاح',
    deleteFailed: 'فشل حذف المرشح',
    loginSuccess: 'مرحباً أيها المشرف!',
    loginFailed: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    loggedOut: 'تم تسجيل الخروج بنجاح',
    
    // Home - Hero Section
    heroTitle: 'ابحث عن مرشحك المثالي اليوم',
    heroSubtitle: 'نقدم حلول قوى عاملة ماهرة وموثوقة للشركات في جميع أنحاء قطر',
    browseCandidates: 'تصفح المرشحين',
    viewJobs: 'عرض الوظائف',
    
    // Home - Stats
    total: 'الإجمالي',
    available: 'متاح',
    returned: 'عادوا',
    availableCandidates: 'المرشحون المتاحون',
    seeAll: 'عرض الكل',
    noAvailableCandidates: 'لا يوجد مرشحين متاحين',
    loading: 'جاري التحميل...',
    
    // Candidates
    searchCandidates: 'البحث عن مرشحين...',
    all: 'الكل',
    noCandidatesFound: 'لم يتم العثور على مرشحين',
    share: 'مشاركة',
    shareCandidate: 'مشاركة المرشح',
    noFavorites: 'لا توجد مفضلات بعد',
    
    // Jobs
    findRightCandidate: 'ابحث عن المرشح المناسب لوظيفتك',
    noJobsAvailable: 'لا توجد وظائف متاحة',
    noJobsMessage: 'لا توجد وظائف شاغرة حالياً. يرجى التحقق مرة أخرى لاحقاً للحصول على فرص جديدة.',
    browseCandidatesBtn: 'تصفح المرشحين',
    back: 'رجوع',
    
    // About
    aboutUs: 'من نحن',
    whoWeAre: 'من نحن',
    whoWeAreText: 'نحن وكالة توظيف رائدة مقرها الدوحة، قطر. نحن متخصصون في توفير حلول القوى العاملة الماهرة والموثوقة للشركات والأسر في جميع أنحاء الشرق الأوسط.',
    yearsExperience: 'سنوات من الخبرة',
    happyClients: 'عملاء سعداء',
    workersPlaced: 'عمال تم توظيفهم',
    ourMission: 'مهمتنا',
    ourMissionText: 'ربط أصحاب العمل بالعمال المؤهلين والموثوقين والمهرة مع ضمان عملية توظيف سلسة وشفافة.',
    ourVision: 'رؤيتنا',
    ourVisionText: 'أن نكون وكالة التوظيف الأكثر ثقة والأكثر تفضيلاً في قطر ومنطقة الشرق الأوسط.',
    contactUs: 'اتصل بنا',
    callUs: 'اتصل بنا',
    emailUs: 'راسلنا',
    registeredOffice: 'المكتب المسجل',
    workingHours: 'ساعات العمل',
    allRightsReserved: 'جميع الحقوق محفوظة',
    
    // Settings
    language: 'اللغة',
    theme: 'المظهر',
    english: 'English',
    arabic: 'العربية',
    lightMode: 'فاتح',
    darkMode: 'داكن',
    developerBy: 'تم التطوير بواسطة',
    makeNumberSupport: 'رقم التواصل / الدعم',
    version: 'الإصدار',
    copyright: '© 2026 ZOD Manpower',
    prispointStudios: 'بريسبوينت ستوديوز',
    success: 'نجاح',
    settingsSaved: 'تم حفظ الإعدادات!',
    
    // Status
    statusAvailable: 'متاح',
    statusReturned: 'عادوا',
    statusRecruitment: 'توظيف',
    
    // Candidate Profile
    salary: 'الراتب',
    country: 'الدولة',
    experience: 'الخبرة',
    age: 'العمر',
    gender: 'الجنس',
    maritalStatus: 'الحالة الاجتماعية',
    religion: 'الديانة',
    reference: 'المرجع',
    years: 'سنوات',
    contactViaWhatsApp: 'اتصل عبر واتساب',
    candidateNotFound: 'المرشح غير موجود',
    viewCV: 'عرض السيرة الذاتية',
    personalInfo: 'المعلومات الشخصية',
    nationality: 'الجنسية',
    whatsapp: 'واتساب',
    noData: 'لا توجد بيانات',
    
    // Common
    qar: 'ريال',
    perMonth: '/شهر',
  }
};

// ============================================
// THEME COLORS
// ============================================
export const Colors = {
  light: {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#1a237e',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#e0e0e0',
    primary: '#1a237e',
    accent: '#D4880F',
    hero: '#1a237e',
    heroText: '#ffffff',
    shadow: '#000000',
    statusAvailable: '#e8f5e9',
    statusReturned: '#e3f2fd',
    statusTextAvailable: '#2e7d32',
    statusTextReturned: '#1565c0',
  },
  dark: {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    textMuted: '#777777',
    border: '#333333',
    primary: '#4a6cf7',
    accent: '#D4880F',
    hero: '#0d1b3e',
    heroText: '#ffffff',
    shadow: '#000000',
    statusAvailable: '#1a3a1a',
    statusReturned: '#1a2a4a',
    statusTextAvailable: '#4caf50',
    statusTextReturned: '#42a5f5',
  }
};

// ============================================
// CONTEXT TYPE
// ============================================
interface AppContextType {
  language: Language;
  theme: Theme;
  colors: typeof Colors.light;
  t: (key: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  updateLanguage: (lang: Language) => void;
  updateTheme: (theme: Theme) => void;
}

// ============================================
// CONTEXT
// ============================================
const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('manpower_app_preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setLanguage(prefs.language || 'en');
        setTheme(prefs.theme || 'light');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLanguage = async (lang: Language) => {
    setLanguage(lang);
    try {
      const saved = await AsyncStorage.getItem('manpower_app_preferences');
      const prefs = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem('manpower_app_preferences', JSON.stringify({
        ...prefs,
        language: lang,
      }));
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const updateTheme = async (thm: Theme) => {
    setTheme(thm);
    try {
      const saved = await AsyncStorage.getItem('manpower_app_preferences');
      const prefs = saved ? JSON.parse(saved) : {};
      await AsyncStorage.setItem('manpower_app_preferences', JSON.stringify({
        ...prefs,
        theme: thm,
      }));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const colors = Colors[theme];
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  if (isLoading) {
    return null;
  }

  return (
    <AppContext.Provider value={{
      language,
      theme,
      colors,
      t,
      isRTL,
      dir,
      updateLanguage,
      updateTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}