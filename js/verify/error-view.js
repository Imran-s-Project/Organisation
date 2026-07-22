/* verify.html — আইডি না পেলে error-card দেখানো */
import { showView } from './views.js';

export function showError(customMessage = null) {
    showView('error-card');
    if (customMessage) document.getElementById('error-message').innerHTML = customMessage;
}
