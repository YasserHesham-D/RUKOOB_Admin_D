import React, { createContext, useContext } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
  nav_dashboard: 'لوحة التحكم',
  nav_verification: 'توثيق الكباتن',
  nav_drivers: 'إدارة الكباتن',
  nav_passengers: 'الركاب والعملاء',
  nav_rides: 'الرحلات والخرائط',
  nav_support: 'الدعم الفني',
  nav_broadcast: 'إشعارات جماعية',
  nav_settings: 'التسعير والإعدادات',
  nav_admins: 'المشرفين والأمان',
};

const LanguageContext = createContext<LanguageContextType>({
  isRTL: true,
  t: (k) => translations[k] || k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageContext.Provider value={{ isRTL: true, t: (k) => translations[k] || k }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
