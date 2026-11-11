<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| MOBILEMAX - Main Welcome Page
|--------------------------------------------------------------------------
*/

$scriptName = str_replace(
    '\\',
    '/',
    (string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php')
);

$basePath = rtrim(
    str_replace('\\', '/', dirname($scriptName)),
    '/'
);

if ($basePath === '.' || $basePath === '/') {
    $basePath = '';
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/config/database.php';

if (!isset($pdo) || !($pdo instanceof PDO)) {
    http_response_code(500);
    exit('تعذر الاتصال بقاعدة البيانات.');
}

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

/*
|--------------------------------------------------------------------------
| Store Settings
|--------------------------------------------------------------------------
*/

$settings = [];

try {
    $stmt = $pdo->query(
        'SELECT setting_key, setting_value FROM settings'
    );

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $settings[(string) $row['setting_key']] =
            (string) ($row['setting_value'] ?? '');
    }
} catch (Throwable $e) {
    error_log('MobileMax settings: ' . $e->getMessage());
}

$storeName = trim(
    (string) ($settings['store_name'] ?? 'MOBILEMAX')
);

$storeDescription = trim(
    (string) (
        $settings['store_description']
        ?? 'اسكرينات حماية وإكسسوارات المحمول'
    )
);

$seoTitle = trim(
    (string) ($settings['seo_title'] ?? '')
);

$seoDescription = trim(
    (string) ($settings['seo_description'] ?? '')
);

$maintenanceMode =
    (string) ($settings['maintenance_mode'] ?? '0') === '1';

$allowOrders =
    (string) ($settings['allow_orders'] ?? '1') === '1';

$storeName = $storeName !== '' ? $storeName : 'MOBILEMAX';

$storeDescription = $storeDescription !== ''
    ? $storeDescription
    : 'اسكرينات حماية وإكسسوارات المحمول';

$seoTitle = $seoTitle !== '' ? $seoTitle : $storeName;

$seoDescription = $seoDescription !== ''
    ? $seoDescription
    : $storeDescription;

/*
|--------------------------------------------------------------------------
| Contact Information
|--------------------------------------------------------------------------
*/

$contact = [
    'address1' => trim(
        (string) ($settings['store_address'] ?? '')
    ),

    'address2' => trim(
        (string) ($settings['store_address2'] ?? '')
    ),

    'phone1' => trim(
        (string) ($settings['store_phone'] ?? '')
    ),

    'phone2' => trim(
        (string) ($settings['store_phone2'] ?? '')
    ),

    'phone3' => trim(
        (string) ($settings['store_phone3'] ?? '')
    ),

    'whatsapp' => trim(
        (string) ($settings['store_whatsapp'] ?? '')
    ),

    'email' => trim(
        (string) ($settings['store_email'] ?? '')
    ),

    'facebook' => trim(
        (string) ($settings['facebook_url'] ?? '')
    ),

    'instagram' => trim(
        (string) ($settings['instagram_url'] ?? '')
    ),

    'telegram' => trim(
        (string) ($settings['telegram_url'] ?? '')
    ),

    'map1' => trim(
        (string) ($settings['store_map_url'] ?? '')
    ),

    'map2' => trim(
        (string) ($settings['store_map_url2'] ?? '')
    ),
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

if (!function_exists('h')) {
    function h(mixed $value): string
    {
        return htmlspecialchars(
            (string) $value,
            ENT_QUOTES | ENT_SUBSTITUTE,
            'UTF-8'
        );
    }
}

if (!function_exists('contactDigits')) {
    function contactDigits(string $number): string
    {
        return preg_replace('/\D+/', '', $number) ?? '';
    }
}

if (!function_exists('mmPublicUrl')) {
    function mmPublicUrl(string $basePath, string $path): string
    {
        return $basePath . '/' . ltrim($path, '/');
    }
}

/*
|--------------------------------------------------------------------------
| URL Validation
|--------------------------------------------------------------------------
*/

if (!function_exists('mmValidHttpUrl')) {
    function mmValidHttpUrl(string $url): bool
    {
        if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $scheme = strtolower(
            (string) parse_url($url, PHP_URL_SCHEME)
        );

        return in_array($scheme, ['http', 'https'], true);
    }
}

/*
|--------------------------------------------------------------------------
| Maintenance Mode
|--------------------------------------------------------------------------
*/

if ($maintenanceMode) {
    http_response_code(503);

    header('Retry-After: 3600');

    header(
        'Cache-Control: no-store, no-cache, must-revalidate'
    );

    ?>
    <?php

/*
|--------------------------------------------------------------------------
| MOBILEMAX - PWA URL CONFIGURATION
|--------------------------------------------------------------------------
*/

// مسار جذر التطبيق:
// الاستضافة: /
// XAMPP: /Mobilemax/

$pwaScope = rtrim($pwaScope, '/') . '/';

// ملفات PWA
$manifestUrl = $pwaScope . 'assets/js/manifest.json';

$serviceWorkerUrl = $pwaScope . 'service-worker.js';

$pwaJsUrl = $pwaScope . 'assets/js/pwa-install.js';

$pwaCssUrl = $pwaScope . 'assets/css/pwa-install.css';

// أيقونات التطبيق
$appleIconUrl = $pwaScope . 'assets/images/icons/icon-192.png';

?>
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">

    <head>
        <meta charset="UTF-8">

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
        >

        <meta name="robots" content="noindex, nofollow">

        <meta name="theme-color" content="#f5f7fb">

        <title>نعود قريبًا | <?= h($storeName) ?></title>

        <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
            rel="stylesheet"
        >

        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        >

        <link
    rel="manifest"
    href="<?= h($manifestUrl) ?>"
>

<meta name="theme-color" content="#2563eb">

<meta name="apple-mobile-web-app-capable" content="yes">

<meta name="apple-mobile-web-app-title" content="MOBILEMAX">

<link
    rel="apple-touch-icon"
    href="<?= h($appleIconUrl) ?>"
>
        <style>
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                padding: 24px;
                background: #f5f7fb;
                color: #172033;
                font-family: Cairo, sans-serif;
            }

            .maintenance-card {
                width: 100%;
                max-width: 520px;
                padding: 38px 26px;
                text-align: center;
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 24px;
                box-shadow: 0 20px 60px rgba(15, 23, 42, .07);
            }

            .maintenance-icon {
                width: 82px;
                height: 82px;
                display: grid;
                place-items: center;
                margin: 0 auto 22px;
                color: #3b82f6;
                background: #eff6ff;
                border-radius: 24px;
                font-size: 32px;
            }

            h1 {
                margin: 0 0 12px;
                font-size: 25px;
                font-weight: 800;
            }

            p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 2;
            }

            .brand {
                margin-top: 25px;
                color: #3b82f6;
                font-weight: 800;
            }
        </style>
    </head>

    <body>

        <main class="maintenance-card">

            <div class="maintenance-icon">
                <i class="fa-solid fa-screwdriver-wrench"></i>
            </div>

            <h1>نجهّز تجربة أفضل لك</h1>

            <p>
                متجر <?= h($storeName) ?> تحت الصيانة حاليًا.
                نعمل على تحسين الخدمة، ونرجو زيارتنا مرة أخرى قريبًا.
            </p>

            <div class="brand">
                <?= h($storeName) ?>
            </div>

        </main>

    </body>
    </html>
    <?php

    exit;
}

/*
|--------------------------------------------------------------------------
| URLs
|--------------------------------------------------------------------------
*/

$logoUrl = mmPublicUrl(
    $basePath,
    'assets/images/logo123.png'
);

$cssUrl = mmPublicUrl(
    $basePath,
    'assets/css/style.css'
);

$presenceUrl = mmPublicUrl(
    $basePath,
    'ajax/customer-presence.php'
);

$manifestUrl = mmPublicUrl(
    $basePath,
    'assets/js/manifest.json'
);

$serviceWorkerUrl = mmPublicUrl(
    $basePath,
    'sw.js'
);

$pwaCssUrl = mmPublicUrl(
    $basePath,
    'assets/css/pwa-install.css'
);

$pwaJsUrl = mmPublicUrl(
    $basePath,
    'assets/js/pwa-install.js'
);

$appleIconUrl = mmPublicUrl(
    $basePath,
    'assets/images/icons/icon-192.png'
);

$pwaScope = ($basePath === '' ? '' : $basePath) . '/';

$storeUrl = mmPublicUrl(
    $basePath,
    'access.php?service=store'
);

$compatibilityUrl = mmPublicUrl(
    $basePath,
    'access.php?service=compatibility'
);

/*
|--------------------------------------------------------------------------
| Footer Social Links
|--------------------------------------------------------------------------
*/

$validFacebook = mmValidHttpUrl($contact['facebook']);

$validInstagram = mmValidHttpUrl($contact['instagram']);

$validTelegram = mmValidHttpUrl($contact['telegram']);

$hasSocialLinks =
    $validFacebook
    || $validInstagram
    || $validTelegram;

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    >

    <meta name="theme-color" content="#2563eb">

    <meta name="mobile-web-app-capable" content="yes">

    <meta name="apple-mobile-web-app-capable" content="yes">

    <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
    >

    <meta
        name="apple-mobile-web-app-title"
        content="<?= h($storeName) ?>"
    >

    <meta
        name="description"
        content="<?= h($seoDescription) ?>"
    >

    <meta name="robots" content="index, follow">

    <link
        rel="manifest"
        href="<?= h($manifestUrl) ?>"
    >

    <link
        rel="icon"
        type="image/png"
        href="<?= h($logoUrl) ?>"
    >

    <link
        rel="apple-touch-icon"
        href="<?= h($appleIconUrl) ?>"
    >

    <link
        rel="apple-touch-icon"
        sizes="192x192"
        href="<?= h($appleIconUrl) ?>"
    >

    <title><?= h($seoTitle) ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    >

    <link
        rel="stylesheet"
        href="<?= h($cssUrl) ?>"
    >

    <link
        rel="stylesheet"
        href="<?= h($pwaCssUrl) ?>"
    >

    <!-- Footer Styles -->

    <style>
        /* ==========================================
           MOBILEMAX - Unified Responsive Footer
        ========================================== */

        .mm-footer,
        .mm-footer * {
            box-sizing: border-box;
        }

        .mm-footer {
            background: #fff;
            color: #172033;
            border-top: 2px solid #2563eb;
            margin-top: 10px;
            font-family: inherit;
        }

        .mm-footer-inner {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 10px 12px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: start;
            gap: 12px;
            direction: rtl;
        }

        .mm-footer-contact {
            min-width: 0;
        }

        .mm-footer-section h3 {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0 0 6px;
            color: #172033;
            font-size: 13px;
            font-weight: 700;
            line-height: 1.5;
        }

        .mm-footer-section h3 > i {
            color: #2563eb;
        }

        .mm-footer-addresses,
        .mm-footer-phones,
        .mm-footer-contact-row {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 5px 12px;
            min-width: 0;
        }

        .mm-footer-addresses,
        .mm-footer-phones {
            margin-bottom: 5px;
        }

        .mm-footer-item {
            display: inline-flex;
            flex: 0 1 auto;
            align-items: center;
            gap: 5px;
            min-width: 0;
            max-width: 100%;
            color: #475569;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.65;
            text-decoration: none;
            overflow-wrap: anywhere;
            -webkit-tap-highlight-color: transparent;
        }

        .mm-footer-item > i {
            flex: 0 0 auto;
            color: #2563eb;
            font-size: 12px;
        }

        .mm-footer-item:hover {
            color: #2563eb;
        }

        .mm-footer-phone {
            white-space: nowrap;
        }

        .mm-footer-phone span,
        .mm-whatsapp span {
            direction: ltr;
            unicode-bidi: isolate;
        }

        .mm-footer-item.mm-whatsapp > i {
            color: #16a34a;
        }

        .mm-footer-email,
        .mm-footer-address {
            overflow-wrap: anywhere;
        }

        .mm-footer-social {
            min-width: 66px;
            justify-self: end;
        }

        .mm-social-links {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 6px;
        }

        .mm-social-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            flex: 0 0 30px;
            border: 1px solid #e5e7eb;
            border-radius: 7px;
            background: #f8fafc;
            color: #2563eb;
            text-decoration: none;
            transition: background .2s ease, color .2s ease;
        }

        .mm-social-links a:hover {
            background: #2563eb;
            border-color: #2563eb;
            color: #fff;
        }

        .mm-footer-bottom {
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 4px 10px;
            padding: 7px 12px;
            border-top: 1px solid #eef2f7;
            background: #f8fafc;
            color: #64748b;
            font-size: 11px;
            line-height: 1.6;
            text-align: center;
            direction: rtl;
        }

        .mm-footer-bottom span {
            min-width: 0;
            overflow-wrap: anywhere;
        }

        .mm-footer-inner > *,
        .mm-footer-section,
        .mm-footer-item {
            max-width: 100%;
        }

        .mm-footer-address-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
            min-width: 0;
            max-width: 100%;
        }

        .mm-footer-map-link {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-right: 17px;
            color: #2563eb;
            font-size: 11px;
            font-weight: 600;
            text-decoration: none;
            transition: color .2s ease;
        }

        .mm-footer-map-link:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }

        .mm-footer-map-link i {
            font-size: 11px;
        }

        @media (max-width: 360px) {
            .mm-footer-inner {
                padding: 8px;
                gap: 8px;
                grid-template-columns: minmax(0, 1fr) auto;
            }

            .mm-footer-addresses,
            .mm-footer-phones,
            .mm-footer-contact-row {
                gap: 4px 8px;
            }

            .mm-footer-item {
                font-size: 11px;
            }

            .mm-footer-section h3 {
                font-size: 12px;
            }

            .mm-footer-social {
                min-width: 58px;
            }

            .mm-social-links {
                gap: 4px;
            }

            .mm-social-links a {
                width: 27px;
                height: 27px;
                flex-basis: 27px;
            }

            .mm-footer-bottom {
                padding: 6px 8px;
                font-size: 10px;
                justify-content: center;
            }
        }
    </style>

</head>

<body>

<main class="welcome-page">

    <div class="welcome-background"></div>

    <section class="welcome-content">

        <!-- Brand -->

        <div class="brand-mark">

            <div class="brand-word">

                <span>MAX</span>

                <span class="brand-phone">
                    <i class="fa-solid fa-mobile-screen-button"></i>
                </span>

                <span>MOBILE</span>

            </div>

        </div>

        <!-- Welcome Text -->

        <div class="welcome-description">

            <h1>
                كل ما يحتاجه هاتفك
                <span>في مكان واحد</span>
            </h1>

            <p>
                اكتشف منتجاتنا، واختر ما يناسب هاتفك بسهولة.
            </p>

        </div>

        <!-- Main Actions -->

        <div class="welcome-actions">

            <button
                type="button"
                class="main-action"
                id="storeButton"
                data-url="<?= h($storeUrl) ?>"
            >

                <span class="action-icon">
                    <i class="fa-solid fa-store"></i>
                </span>

                <span class="action-text">

                    <strong>الموقع الإلكتروني</strong>

                    <small>
                        <?= $allowOrders
                            ? 'تصفح المنتجات واطلب الآن'
                            : 'تصفح المنتجات'
                        ?>
                    </small>

                </span>

                <i class="fa-solid fa-arrow-left action-arrow"></i>

            </button>

            <button
                type="button"
                class="secondary-action"
                id="compatibilityButton"
                data-url="<?= h($compatibilityUrl) ?>"
            >

                <span class="action-icon">
                    <i class="fa-solid fa-mobile-screen"></i>
                </span>

                <span class="action-text">

                    <strong>خدمة وفقها</strong>

                    <small>
                        اعرف الاسكرينة المناسبة لهاتفك
                    </small>

                </span>

                <i class="fa-solid fa-arrow-left action-arrow"></i>

            </button>

        </div>

        <!-- Footer -->

        <footer class="mm-footer">

            <div class="mm-footer-inner">

                <!-- Contact Information -->

                <div class="mm-footer-section mm-footer-contact">

                    <h3>
                        <i class="fa-solid fa-headset"></i>
                        تواصل معنا
                    </h3>

                    <!-- Addresses -->

                    <div class="mm-footer-addresses">

                        <?php

                        $addresses = [
                            [
                                'address' => $contact['address1'],
                                'map' => $contact['map1']
                            ],
                            [
                                'address' => $contact['address2'],
                                'map' => $contact['map2']
                            ]
                        ];

                        ?>

                        <?php foreach ($addresses as $item): ?>

                            <?php if ($item['address'] !== ''): ?>

                                <div class="mm-footer-address-group">

                                    <div class="mm-footer-item mm-footer-address">

                                        <i class="fa-solid fa-location-dot"></i>

                                        <span>
                                            <?= h($item['address']) ?>
                                        </span>

                                    </div>

                                    <?php if (mmValidHttpUrl($item['map'])): ?>

                                        <a
                                            href="<?= h($item['map']) ?>"
                                            class="mm-footer-map-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >

                                            <i class="fa-solid fa-map-location-dot"></i>

                                            عرض الموقع على الخريطة

                                        </a>

                                    <?php endif; ?>

                                </div>

                            <?php endif; ?>

                        <?php endforeach; ?>

                    </div>

                    <!-- Phone Numbers -->

                    <div class="mm-footer-phones">

                        <?php foreach (
                            [
                                $contact['phone1'],
                                $contact['phone2'],
                                $contact['phone3']
                            ] as $phone
                        ): ?>

                            <?php if (trim($phone) !== ''): ?>

                                <?php $phoneDigits = contactDigits($phone); ?>

                                <?php if ($phoneDigits !== ''): ?>

                                    <a
                                        class="mm-footer-item mm-footer-phone"
                                        href="tel:<?= h($phoneDigits) ?>"
                                        dir="ltr"
                                    >

                                        <i class="fa-solid fa-phone"></i>

                                        <span>
                                            <?= h($phone) ?>
                                        </span>

                                    </a>

                                <?php endif; ?>

                            <?php endif; ?>

                        <?php endforeach; ?>

                    </div>

                    <!-- WhatsApp and Email -->

                    <div class="mm-footer-contact-row">

                        <?php if ($contact['whatsapp'] !== ''): ?>

                            <?php

                            $waNumber = contactDigits(
                                $contact['whatsapp']
                            );

                            if (str_starts_with($waNumber, '0')) {
                                $waNumber = '20' . substr($waNumber, 1);
                            }

                            ?>

                            <?php if ($waNumber !== ''): ?>

                                <a
                                    class="mm-footer-item mm-whatsapp"
                                    href="https://wa.me/<?= h($waNumber) ?>"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    dir="ltr"
                                >

                                    <i class="fa-brands fa-whatsapp"></i>

                                    <span>
                                        <?= h($contact['whatsapp']) ?>
                                    </span>

                                </a>

                            <?php endif; ?>

                        <?php endif; ?>

                        <?php if ($contact['email'] !== ''): ?>

                            <a
                                class="mm-footer-item mm-footer-email"
                                href="mailto:<?= h($contact['email']) ?>"
                            >

                                <i class="fa-regular fa-envelope"></i>

                                <span>
                                    <?= h($contact['email']) ?>
                                </span>

                            </a>

                        <?php endif; ?>

                    </div>

                </div>

                <!-- Social Links -->

                <?php if ($hasSocialLinks): ?>

                    <div class="mm-footer-section mm-footer-social">

                        <h3>
                            <i class="fa-solid fa-share-nodes"></i>
                            تابعنا
                        </h3>

                        <div class="mm-social-links">

                            <?php if ($validFacebook): ?>

                                <a
                                    href="<?= h($contact['facebook']) ?>"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    title="Facebook"
                                >

                                    <i class="fa-brands fa-facebook-f"></i>

                                </a>

                            <?php endif; ?>

                            <?php if ($validInstagram): ?>

                                <a
                                    href="<?= h($contact['instagram']) ?>"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    title="Instagram"
                                >

                                    <i class="fa-brands fa-instagram"></i>

                                </a>

                            <?php endif; ?>

                            <?php if ($validTelegram): ?>

                                <a
                                    href="<?= h($contact['telegram']) ?>"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="قناة MOBILEMAX على تليجرام"
                                    title="Telegram"
                                >

                                    <i class="fa-brands fa-telegram"></i>

                                </a>

                            <?php endif; ?>

                        </div>

                    </div>

                <?php endif; ?>

            </div>

            <!-- Copyright -->

            <div class="mm-footer-bottom">

                <span>
                    © <?= date('Y') ?>
                    <?= h($storeName) ?>
                    — جميع الحقوق محفوظة
                </span>

                <span>
                    حماية هاتفك تبدأ من هنا
                </span>

            </div>

        </footer>

    </section>

</main>

<!-- =====================================================
     INSTALLATION MODAL
===================================================== -->

<div
    class="install-overlay"
    id="installOverlay"
    aria-hidden="true"
>

    <div
        class="install-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="installTitle"
    >

        <button
            type="button"
            class="install-close"
            id="installClose"
            aria-label="إغلاق"
        >

            <i class="fa-solid fa-xmark"></i>

        </button>

        <div class="install-logo">

            <img
                src="<?= h($logoUrl) ?>"
                alt="<?= h($storeName) ?>"
                class="install-logo-image"
            >

        </div>

        <div class="install-content">

            <span class="install-badge">
                تجربة أفضل
            </span>

            <h2 id="installTitle">

                حمّل تطبيق

                <strong><?= h($storeName) ?></strong>

                الآن

            </h2>

            <p>

                ثبّت <?= h($storeName) ?> على جهازك
                للوصول السريع إلى المنتجات والطلبات.

            </p>

        </div>

        <button
            type="button"
            class="install-button"
            id="installButton"
        >

            <i class="fa-solid fa-download"></i>

            <span>تثبيت التطبيق</span>

        </button>

        <button
            type="button"
            class="continue-button"
            id="continueButton"
        >

            المتابعة إلى الموقع

        </button>

        <div
            class="ios-install"
            id="iosInstall"
        >

            <div class="ios-title">

                <i class="fa-brands fa-apple"></i>

                <span>
                    لإضافة التطبيق على iPhone
                </span>

            </div>

            <p>

                اضغط مشاركة

                <i class="fa-solid fa-arrow-up-from-bracket"></i>

                ثم اختر

                <strong>
                    إضافة إلى الشاشة الرئيسية
                </strong>.

            </p>

            <p
                class="ios-note"
                id="iosBrowserNote"
                hidden
            >

                <i class="fa-solid fa-circle-info"></i>

                افتح الموقع من متصفح يدعم إضافة الموقع إلى الشاشة الرئيسية.

            </p>

        </div>

    </div>

</div>

<!-- =====================================================
     CUSTOMER PRESENCE
===================================================== -->

<script>
(() => {

    'use strict';

    const pingUrl = <?= json_encode(
        $presenceUrl,
        JSON_UNESCAPED_SLASHES |
        JSON_HEX_TAG |
        JSON_HEX_AMP |
        JSON_HEX_APOS |
        JSON_HEX_QUOT
    ) ?>;

    async function updatePresence() {

        try {

            await fetch(pingUrl, {
                method: 'POST',
                credentials: 'same-origin',
                cache: 'no-store'
            });

        } catch (error) {

            console.debug(
                'Customer presence update unavailable.'
            );

        }

    }

    updatePresence();

    window.setInterval(updatePresence, 30000);

})();
</script>

<!-- =====================================================
     PWA CONFIGURATION
===================================================== -->

<script>
window.MM_PWA = <?= json_encode(
    [
        'sw' => $serviceWorkerUrl,
        'scope' => $pwaScope,
        'manifest' => $manifestUrl
    ],
    JSON_UNESCAPED_SLASHES |
    JSON_UNESCAPED_UNICODE |
    JSON_HEX_TAG |
    JSON_HEX_AMP |
    JSON_HEX_APOS |
    JSON_HEX_QUOT
) ?>;
</script>


<!-- =====================================================
     PAGE NAVIGATION
===================================================== -->

<script>

(() => {

    'use strict';

    const storeButton = document.getElementById('storeButton');

    const compatibilityButton = document.getElementById(
        'compatibilityButton'
    );

    function navigate(button) {

        if (!button) {
            return;
        }

        const url = button.dataset.url;

        if (url) {
            window.location.href = url;
        }

    }

    storeButton?.addEventListener('click', () => {
        navigate(storeButton);
    });

    compatibilityButton?.addEventListener('click', () => {
        navigate(compatibilityButton);
    });

})();

</script>

<!-- =====================================================
     PWA INSTALLATION SCRIPT
     Loaded ONCE only
===================================================== -->

<script
    src="<?= h($pwaJsUrl) ?>"
    defer
></script>

</body>
</html>
