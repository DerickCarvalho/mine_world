(function () {
    const currentScript = document.currentScript ? document.currentScript.src : window.location.href;
    const domain = currentScript.replace(/\/env\.deploy\.js(?:\?.*)?$/, '');
    const keyPrefix = 'mineworld@';

    window.ENV = Object.freeze({
        DOMAIN: domain,
        API_BASE_URL: domain + '/api/',
        KEY_PREFIX: keyPrefix,
        TOKEN_KEY: keyPrefix + 'token',
        USER_KEY: keyPrefix + 'user',
        API_TIMEOUT_MS: 15000
    });
})();
