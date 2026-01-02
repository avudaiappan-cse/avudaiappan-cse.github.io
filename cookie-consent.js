/**
 * Cookie Consent Manager
 * GDPR-compliant cookie consent with Google Analytics 4
 */

(function() {
    'use strict';

    // Configuration - Your GA4 Measurement ID
    const GA4_MEASUREMENT_ID = 'G-WRNTQ9NTBL';

    const COOKIE_NAME = 'cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365;

    // Check if consent was already given
    function getConsent() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(COOKIE_NAME + '='));
        if (cookie) {
            try {
                return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Set consent cookie
    function setConsent(preferences) {
        const date = new Date();
        date.setTime(date.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(preferences))}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    }

    // Load Google Analytics
    function loadGA4() {
        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID, {
            anonymize_ip: true
        });
    }

    // Create and show the cookie banner
    function showBanner() {
        // Don't show if already consented
        if (getConsent() !== null) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                        <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="8" r="1" fill="currentColor"/>
                        <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="10" cy="14" r="1" fill="currentColor"/>
                        <circle cx="14" cy="16" r="1" fill="currentColor"/>
                    </svg>
                </div>
                <div class="cookie-banner-text">
                    <h3>We value your privacy</h3>
                    <p>We use cookies to enhance your experience, analyze site traffic via <strong>Google Analytics 4</strong>, and deliver personalized content. Your data helps us optimize the portfolio. You can manage your preferences or accept all below.</p>
                    <a href="cookie-policy.html" class="cookie-policy-link">View Cookie Policy <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
                <div class="cookie-banner-actions">
                    <button class="cookie-btn cookie-btn-outline" id="cookieCustomize">Customize</button>
                    <button class="cookie-btn cookie-btn-outline" id="cookieDecline">Decline</button>
                    <button class="cookie-btn cookie-btn-primary" id="cookieAcceptAll">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Accept All
                    </button>
                </div>
                <button class="cookie-banner-close" id="cookieClose" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookieAcceptAll').addEventListener('click', () => {
            setConsent({ essential: true, analytics: true, timestamp: new Date().toISOString() });
            loadGA4();
            hideBanner();
        });

        document.getElementById('cookieDecline').addEventListener('click', () => {
            setConsent({ essential: true, analytics: false, timestamp: new Date().toISOString() });
            hideBanner();
        });

        // Close button - just hide banner, don't save preference (will show again next visit)
        document.getElementById('cookieClose').addEventListener('click', () => {
            hideBanner();
        });

        document.getElementById('cookieCustomize').addEventListener('click', () => {
            showPreferencesModal();
        });

        // Animate in
        requestAnimationFrame(() => {
            banner.classList.add('cookie-banner-visible');
        });
    }

    // Hide the banner
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('cookie-banner-visible');
            setTimeout(() => banner.remove(), 300);
        }
    }

    // Show preferences modal
    function showPreferencesModal() {
        const existingModal = document.getElementById('cookie-preferences-modal');
        if (existingModal) existingModal.remove();

        const consent = getConsent() || { essential: true, analytics: false };

        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.innerHTML = `
            <div class="cookie-modal-backdrop"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <div class="cookie-modal-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.09 7.26L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.91 7.26L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <h2>Your Preferences</h2>
                    <button class="cookie-modal-close" id="closePreferencesModal" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                </div>
                
                <div class="cookie-modal-body">
                    <div class="cookie-preference-item">
                        <div class="cookie-preference-header">
                            <div class="cookie-preference-info">
                                <span class="cookie-preference-label">Essential</span>
                                <span class="cookie-preference-badge">required</span>
                            </div>
                            <label class="cookie-toggle cookie-toggle-disabled">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-preference-desc">These cookies are necessary for the website to function and cannot be switched off in our systems.</p>
                    </div>
                    
                    <div class="cookie-preference-item">
                        <div class="cookie-preference-header">
                            <div class="cookie-preference-info">
                                <span class="cookie-preference-label">Analytics (GA4)</span>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="analyticsToggle" ${consent.analytics ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-preference-desc">Allows us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
                    </div>
                </div>
                
                <div class="cookie-modal-footer">
                    <button class="cookie-btn cookie-btn-primary cookie-btn-full" id="acceptAllPreferences">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Accept All
                    </button>
                    <button class="cookie-btn cookie-btn-secondary cookie-btn-full" id="savePreferences">Save Preferences</button>
                    <button class="cookie-btn cookie-btn-ghost" id="declineOptional">Decline Optional Cookies</button>
                </div>
                
                <p class="cookie-modal-date">Last updated: January 2, 2026</p>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('cookie-modal-visible');
        });

        // Event listeners
        const closeModal = () => {
            modal.classList.remove('cookie-modal-visible');
            setTimeout(() => modal.remove(), 300);
        };

        document.getElementById('closePreferencesModal').addEventListener('click', closeModal);
        document.querySelector('.cookie-modal-backdrop').addEventListener('click', closeModal);

        document.getElementById('acceptAllPreferences').addEventListener('click', () => {
            setConsent({ essential: true, analytics: true, timestamp: new Date().toISOString() });
            loadGA4();
            closeModal();
            hideBanner();
        });

        document.getElementById('savePreferences').addEventListener('click', () => {
            const analytics = document.getElementById('analyticsToggle').checked;
            setConsent({ essential: true, analytics, timestamp: new Date().toISOString() });
            if (analytics) loadGA4();
            closeModal();
            hideBanner();
        });

        document.getElementById('declineOptional').addEventListener('click', () => {
            setConsent({ essential: true, analytics: false, timestamp: new Date().toISOString() });
            closeModal();
            hideBanner();
        });

        // ESC key to close
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // Initialize
    function init() {
        const consent = getConsent();
        
        if (consent === null) {
            // No consent yet, show banner
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showBanner);
            } else {
                showBanner();
            }
        } else if (consent.analytics) {
            // Already consented to analytics
            loadGA4();
        }
    }

    // Expose function to open preferences (for cookie policy page)
    window.openCookiePreferences = showPreferencesModal;

    // Start
    init();
})();
