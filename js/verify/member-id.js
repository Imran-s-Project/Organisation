/* verify.html — URL থেকে মেম্বার আইডি বের করা ও নম্বর মাস্ক করা */

export const getMemberId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) {
        const pathParts = window.location.pathname.split('/');
        id = pathParts[pathParts.length - 1];
        if (id === 'verify.html' || id === '') return null;
    }
    return id ? id.trim().toUpperCase() : null;
};

export const maskMobile = (number) => {
    if (!number || number.length < 11) return number;
    return number.substring(0, 3) + '*****' + number.substring(number.length - 3);
};
