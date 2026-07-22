/* verify.html — এন্ট্রি পয়েন্ট: বাকি সব ছোট মডিউল এখানে জোড়া লেগে চালু হয় */
import { initThemeToggle } from './theme.js';
import { initLanguageToggle } from './language.js';
import { initVoiceSearch } from './voice-search.js';
import { initQrScanner } from './qr-scanner.js';
import { initSearchForm } from './search-form.js';
import { verifyMember } from './member-lookup.js';

initThemeToggle();
initLanguageToggle();
initVoiceSearch();
initQrScanner();
initSearchForm();

// পেজ লোড হওয়ার সাথে সাথে URL থেকে আইডি পড়ে ভেরিফিকেশন শুরু
verifyMember();
