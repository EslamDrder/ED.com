/* ==========================================
   MOBILEMAX - PWA INSTALLATION
   Windows + Android + iOS
   Native PWA Installation
========================================== */

(() => {
    'use strict';

    /* ==========================================
       ELEMENTS
    ========================================== */

    const overlay = document.getElementById('installOverlay');
    const installButton = document.getElementById('installButton');
    const closeButton = document.getElementById('installClose');
    const continueButton = document.getElementById('continueButton');
    const iosInstall = document.getElementById('iosInstall');

    if (!overlay || !installButton) {
        console.warn(
            'MOBILEMAX: Installation modal elements not found.'
        );
        return;
    }

    /* ==========================================
       CONFIGURATION
    ========================================== */

    const config = window.MM_PWA || {};

    let deferredPrompt = null;
    let isInstalling = false;
    let isInstalled = false;

    const userAgent = navigator.userAgent;

    const isIOS =
        /iphone|ipad|ipod/i.test(userAgent) ||
        (
            navigator.platform === 'MacIntel' &&
            navigator.maxTouchPoints > 1
        );

    const isEdge = /Edg\//i.test(userAgent);

    const isChrome =
        /Chrome\//i.test(userAgent) &&
        !isEdge &&
        !/OPR\//i.test(userAgent);

    const isAndroid = /Android/i.test(userAgent);

    /* ==========================================
       INSTALLATION STATE
    ========================================== */

    function isStandalone() {
        return (
            window.matchMedia(
                '(display-mode: standalone)'
            ).matches ||

            window.matchMedia(
                '(display-mode: fullscreen)'
            ).matches ||

            window.matchMedia(
                '(display-mode: minimal-ui)'
            ).matches ||

            navigator.standalone === true
        );
    }

    /* ==========================================
       MESSAGES
    ========================================== */

    function showMessage(message, type = 'info') {

        let status = document.getElementById(
            'mmInstallMessage'
        );

        if (!status) {

            status = document.createElement('div');

            status.id = 'mmInstallMessage';

            status.style.cssText = `
                margin: 12px 0 0;
                padding: 12px;
                border-radius: 10px;
                font-size: 13px;
                line-height: 1.9;
                text-align: center;
                direction: rtl;
            `;

            installButton.insertAdjacentElement(
                'afterend',
                status
            );
        }

        if (type === 'success') {

            status.style.background = '#dcfce7';
            status.style.color = '#166534';

        } else if (type === 'error') {

            status.style.background = '#fee2e2';
            status.style.color = '#991b1b';

        } else {

            status.style.background = '#eff6ff';
            status.style.color = '#1d4ed8';

        }

        status.textContent = message;
        status.style.display = 'block';
    }

    function hideMessage() {

        const status = document.getElementById(
            'mmInstallMessage'
        );

        if (status) {
            status.style.display = 'none';
        }
    }

    /* ==========================================
       MODAL
    ========================================== */

    function openModal() {

        if (isStandalone() || isInstalled) {
            return;
        }

        overlay.classList.add(
            'mm-show',
            'mm-open'
        );

        overlay.setAttribute(
            'aria-hidden',
            'false'
        );

        overlay.style.setProperty(
            'display',
            'flex',
            'important'
        );

        document.body.classList.add(
            'mm-modal-lock'
        );

        if (isIOS && iosInstall) {

            iosInstall.hidden = false;
            installButton.style.display = 'none';

        } else {

            if (iosInstall) {
                iosInstall.hidden = true;
            }

            installButton.style.display = '';
        }
    }

    function closeModal() {

        overlay.classList.remove(
            'mm-show',
            'mm-open'
        );

        overlay.setAttribute(
            'aria-hidden',
            'true'
        );

        overlay.style.setProperty(
            'display',
            'none',
            'important'
        );

        document.body.classList.remove(
            'mm-modal-lock'
        );
    }

    /* ==========================================
       NATIVE INSTALL EVENT
    ========================================== */

    window.addEventListener(
        'beforeinstallprompt',
        (event) => {

            event.preventDefault();

            deferredPrompt = event;

            installButton.disabled = false;

            installButton.style.opacity = '1';

            hideMessage();

            console.log(
                'MOBILEMAX: Native installation is available.'
            );
        }
    );

    /* ==========================================
       INSTALL BUTTON
    ========================================== */

    installButton.addEventListener(
        'click',
        async () => {

            if (isInstalling || isInstalled) {
                return;
            }

            hideMessage();

            /* iOS INSTALLATION */

            if (isIOS) {

                showMessage(
                    'لتثبيت MOBILEMAX على iPhone: افتح الموقع باستخدام Safari، واضغط زر المشاركة، ثم اختر إضافة إلى الشاشة الرئيسية.'
                );

                return;
            }

            /* NATIVE INSTALLATION */

            if (deferredPrompt) {

                isInstalling = true;

                installButton.disabled = true;

                const promptEvent = deferredPrompt;

                try {

                    await promptEvent.prompt();

                    const result =
                        await promptEvent.userChoice;

                    console.log(
                        'MOBILEMAX installation result:',
                        result.outcome
                    );

                    if (result.outcome === 'accepted') {

                        showMessage(
                            'تم قبول طلب التثبيت. انتظر اكتمال تثبيت التطبيق.',
                            'success'
                        );

                    } else {

                        showMessage(
                            'لم يتم تثبيت التطبيق. يمكنك المحاولة مرة أخرى.'
                        );
                    }

                } catch (error) {

                    console.error(
                        'MOBILEMAX installation error:',
                        error
                    );

                    showMessage(
                        'حدث خطأ أثناء بدء التثبيت. حاول مرة أخرى.',
                        'error'
                    );

                } finally {

                    deferredPrompt = null;

                    isInstalling = false;

                    installButton.disabled = false;
                }

                return;
            }

            /* MICROSOFT EDGE */

            if (isEdge) {

                showMessage(
                    'لتثبيت MOBILEMAX: اضغط على قائمة Edge (⋯)، ثم Apps، ثم Install this site as an app، ثم وافق على التثبيت.'
                );

                return;
            }

            /* GOOGLE CHROME */

            if (isChrome) {

                showMessage(
                    'لتثبيت MOBILEMAX: افتح قائمة Chrome (⋮)، وابحث عن Install MOBILEMAX أو Install page as app، ثم اضغط تثبيت.'
                );

                return;
            }

            /* ANDROID OTHER BROWSERS */

            if (isAndroid) {

                showMessage(
                    'افتح قائمة المتصفح وابحث عن Install app أو Add to Home screen لتثبيت MOBILEMAX.'
                );

                return;
            }

            /* GENERAL FALLBACK */

            showMessage(
                'التثبيت المباشر غير متاح حاليًا. افتح الموقع من Microsoft Edge أو Google Chrome، واستخدم خيار تثبيت التطبيق من قائمة المتصفح.'
            );
        }
    );

    /* ==========================================
       SUCCESSFUL INSTALLATION
    ========================================== */

    window.addEventListener(
        'appinstalled',
        () => {

            isInstalled = true;

            deferredPrompt = null;

            console.log(
                'MOBILEMAX: Application installed successfully.'
            );

            closeModal();
        }
    );

    /* ==========================================
       MODAL CONTROLS
    ========================================== */

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeModal
        );
    }

    if (continueButton) {

        continueButton.addEventListener(
            'click',
            closeModal
        );
    }

    overlay.addEventListener(
        'click',
        (event) => {

            if (event.target === overlay) {
                closeModal();
            }
        }
    );

    /* ==========================================
       SERVICE WORKER REGISTRATION
    ========================================== */

    async function registerServiceWorker() {

        if (!('serviceWorker' in navigator)) {

            console.error(
                'MOBILEMAX: Service Worker is not supported.'
            );

            return;
        }

        if (!config.sw) {

            console.error(
                'MOBILEMAX: Service Worker URL is missing.'
            );

            return;
        }

        if (!window.isSecureContext) {

            console.error(
                'MOBILEMAX: HTTPS or localhost is required.'
            );

            return;
        }

        try {

            const swUrl = new URL(
                config.sw,
                window.location.href
            );

            const expectedScope = new URL(
                config.scope || './',
                window.location.href
            );

            const registration =
                await navigator.serviceWorker.register(
                    swUrl.href,
                    {
                        scope: expectedScope.pathname,
                        updateViaCache: 'none'
                    }
                );

            await navigator.serviceWorker.ready;

            const activeWorker =
                registration.active ||
                registration.waiting ||
                registration.installing;

            console.log(
                'MOBILEMAX: Service Worker registration successful.'
            );

            console.log(
                'MOBILEMAX: Worker URL:',
                swUrl.href
            );

            console.log(
                'MOBILEMAX: Registered scope:',
                registration.scope
            );

            console.log(
                'MOBILEMAX: Active worker:',
                !!registration.active
            );

            console.log(
                'MOBILEMAX: Current controller:',
                !!navigator.serviceWorker.controller
            );

            if (!activeWorker) {

                console.warn(
                    'MOBILEMAX: No active Service Worker found.'
                );
            }

        } catch (error) {

            console.error(
                'MOBILEMAX: Service Worker registration failed:',
                error
            );
        }
    }

    /* ==========================================
       INITIALIZATION
    ========================================== */

    if (isStandalone()) {

        closeModal();

        console.log(
            'MOBILEMAX: Running as installed application.'
        );

        return;
    }

    openModal();

    if (document.readyState === 'complete') {

        registerServiceWorker();

    } else {

        window.addEventListener(
            'load',
            registerServiceWorker,
            { once: true }
        );
    }

    console.log(
        'MOBILEMAX: PWA installation script initialized.'
    );

})();
