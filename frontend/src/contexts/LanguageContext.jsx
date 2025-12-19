import React, { createContext, useState, useContext, useEffect } from 'react';
import ja from '../i18n/ja.json';

const LanguageContext = createContext();

const languages = {
    ja: { label: '日本語', data: ja }
};

export const LanguageProvider = ({ children }) => {
    // 只保留日语
    const [currentLang] = useState('ja');
    const [t] = useState(ja);

    useEffect(() => {
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    const toggleLanguage = (langCode) => {
        // noop: 日语固定
        return;
    };

    return (
        <LanguageContext.Provider value={{ currentLang, t, toggleLanguage, languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
