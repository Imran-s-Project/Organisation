/* verify.html — বাংলা/ইংরেজি টগল বাটনের লজিক */
import { state } from './state.js';
import { dictionary } from './dictionary.js';
import { getMemberId } from './member-id.js';
import { renderDynamicInfo } from './render-member-info.js';

export const updateLanguage = (lang) => {
    state.lang = lang;
    const dict = dictionary[lang];
    for (let selector in dict) {
        if (selector.startsWith('.')) {
            const el = document.querySelector(selector);
            if (el) el.innerHTML = el.innerHTML.includes('<i') && !dict[selector].includes('<i')
                ? el.innerHTML.replace(/<\/i>.*$/, `</i> ${dict[selector]}`)
                : dict[selector];
        }
    }
    const memberId = getMemberId();
    if (memberId && document.getElementById('verified-card').classList.contains('hidden') === false) {
        const data = JSON.parse(sessionStorage.getItem(`rjf_member_${memberId}`));
        if (data) renderDynamicInfo(data, lang);
    }
};

export const initLanguageToggle = () => {
    const langToggleBtn = document.getElementById('lang-toggle');
    langToggleBtn.addEventListener('click', () => {
        updateLanguage(state.lang === 'bn' ? 'en' : 'bn');
    });
};
