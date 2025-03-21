let translations = {};
const defaultLang = 'en';
let currentLang = localStorage.getItem('selectedLanguage') || defaultLang;

async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok)
            throw new Error(`Failed to load translations for ${lang}`);
        
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);

        if (lang !== defaultLang) {
            console.log(`Falling back to ${defaultLang}`);
            return loadTranslations(defaultLang);
        };

        return {};
    };
};

const t = key => translate(key);
function translate(key) {
    const keyParts = key.split('.');
    let result = translations;
    
    for (const part of keyParts) {
        if (!result || typeof result !== 'object') {
            return key;
        };

        result = result[part];
    };
    
    return result || key;
};

function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translate(key);
        
        if (translation !== key) {
            const attrName = el.getAttribute('data-i18n-attr');
            if (attrName) {
                el.setAttribute(attrName, translation);
            } else {
                el.textContent = translation;
            };
        };
    });
    
    document.documentElement.lang = currentLang;
};

function updateLanguageDisplay(lang) {
    const selectedLanguage = document.querySelector('.selected-language');
    if (!selectedLanguage) return;
    
    const langOption = document.querySelector(`.language-dropdown li[data-lang="${lang}"]`);
    if (!langOption) return;
    
    const flagSrc = langOption.querySelector('.flag-icon').src;
    const langName = langOption.querySelector('span').textContent;
    
    selectedLanguage.querySelector('.flag-icon').src = flagSrc;
    selectedLanguage.querySelector('span').textContent = langName;
};

async function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLanguage', lang);
    await loadTranslations(lang);
    translatePage();
};

document.addEventListener('DOMContentLoaded', async function() {
    await loadTranslations(currentLang);
    updateLanguageDisplay(currentLang)
    translatePage();
    setupLanguageSelector();
});

function setupLanguageSelector() {
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = document.querySelector('.selected-language');
    const languageOptions = document.querySelectorAll('.language-dropdown li');
    
    if (!languageSelector || !selectedLanguage) return;
    
    selectedLanguage.addEventListener('click', function(e) {
        e.stopPropagation();
        languageSelector.classList.toggle('active');
    });
    
    document.addEventListener('click', function() {
        languageSelector.classList.remove('active');
    });
    
    languageOptions.forEach(option => {
        option.addEventListener('click', async function() {
            languageSelector.classList.remove('active');
            alert("This feature is still in development.")
            return;
            const lang = this.getAttribute('data-lang');
            const flagSrc = this.querySelector('.flag-icon').src;
            const langName = this.querySelector('span').textContent;
            
            selectedLanguage.querySelector('.flag-icon').src = flagSrc;
            selectedLanguage.querySelector('span').textContent = langName;
            
            languageSelector.classList.remove('active');
            
            
            await changeLanguage(lang);
        });
    });
};