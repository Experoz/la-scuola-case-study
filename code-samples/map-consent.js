'use strict';

(function () {
    const STORAGE_KEY = 'laScuolaConsentV1';
    const STORAGE_VERSION = 1;

    const map = document.querySelector('[data-map-frame]');
    const placeholder = document.querySelector('[data-map-placeholder]');
    const loadButton = document.querySelector('[data-map-load]');

    let externalContentConsent = readConsent();

    function isWithinSixMonths(savedAt) {
        const expiryDate = new Date(savedAt);
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        return Date.now() <= expiryDate.getTime();
    }

    function readConsent() {
        try {
            const rawValue = localStorage.getItem(STORAGE_KEY);
            if (!rawValue) return null;

            const saved = JSON.parse(rawValue);
            const isValid = saved.version === STORAGE_VERSION &&
                typeof saved.externalContent === 'boolean' &&
                Number.isFinite(saved.savedAt) &&
                isWithinSixMonths(saved.savedAt);

            if (!isValid) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return saved.externalContent;
        } catch (error) {
            return null;
        }
    }

    function storeConsent(value) {
        externalContentConsent = value;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                version: STORAGE_VERSION,
                externalContent: value,
                savedAt: Date.now()
            }));
        } catch (error) {
            // If storage is unavailable, consent applies only to the current session.
        }
    }

    function loadMap() {
        if (!map || !placeholder) return;
        const mapSrc = map.dataset.src;
        if (!mapSrc) return;
        if (map.getAttribute('src') !== mapSrc) map.setAttribute('src', mapSrc);
        map.hidden = false;
        placeholder.hidden = true;
    }

    function blockMap() {
        if (!map || !placeholder) return;
        map.removeAttribute('src');
        map.hidden = true;
        placeholder.hidden = false;
    }

    function applyConsent() {
        if (externalContentConsent === true) loadMap();
        else blockMap();
    }

    function chooseConsent(value) {
        storeConsent(value);
        applyConsent();
    }

    loadButton?.addEventListener('click', () => chooseConsent(true));

    applyConsent();
})();
