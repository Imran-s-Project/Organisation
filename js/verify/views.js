/* verify.html — কার্ড ভিউ সুইচার (search / loader / verified / error) */

export const showView = (viewId) => {
    ['search-card', 'loader', 'verified-card', 'error-card'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
};
