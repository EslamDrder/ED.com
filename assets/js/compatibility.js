document.addEventListener('DOMContentLoaded', () => {

    'use strict';


    /* =========================================================
       ELEMENTS
    ========================================================== */

    const brandSelect = document.getElementById('brandSelect');
    const modelSelect = document.getElementById('modelSelect');

    const selectorLoading =
        document.getElementById('selectorLoading');

    const resultsSection =
        document.getElementById('resultsSection');

    const resultsEmpty =
        document.getElementById('resultsEmpty');

    const productsGrid =
        document.getElementById('productsGrid');

    const resultsCount =
        document.getElementById('resultsCount');

    const selectedPhone =
        document.getElementById('selectedPhone');

    const selectedPhoneName =
        document.getElementById('selectedPhoneName');

    const currentStep =
        document.getElementById('currentStep');

    const cartBadge =
        document.getElementById('cartBadge');


    const ajaxUrl =
        window.MOBILEMAX?.compatibility?.ajaxUrl
        || 'ajax/compatibility.php';


    /* =========================================================
       UTILITIES
    ========================================================== */

    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    function setLoading(state) {

        if (!selectorLoading) {
            return;
        }

        selectorLoading.hidden = !state;

    }


    function resetResults() {

        resultsCount.textContent = '0';

        productsGrid.innerHTML = '';

        selectedPhone.hidden = true;

        selectedPhoneName.textContent = '—';

        resultsEmpty.hidden = false;

        resultsEmpty.innerHTML = `
            <div class="empty-icon">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>

            <h3>
                اختر موديل هاتفك
            </h3>

            <p>
                بعد اختيار الموديل ستظهر هنا الاسكرينات
                المتوافقة معه.
            </p>
        `;

    }


    /* =========================================================
       LOAD MODELS
    ========================================================== */

    async function loadModels(brandId) {

        modelSelect.innerHTML = `
            <option value="">
                جاري تحميل الموديلات...
            </option>
        `;

        modelSelect.disabled = true;

        currentStep.textContent = '1';

        resetResults();

        if (!brandId) {

            modelSelect.innerHTML = `
                <option value="">
                    اختر شركة الهاتف أولاً
                </option>
            `;

            return;
        }


        setLoading(true);

        try {

            const url =
                `${ajaxUrl}?action=models&brand_id=${encodeURIComponent(brandId)}`;

            const response =
                await fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

            if (!response.ok) {
                throw new Error('HTTP error');
            }

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message || 'تعذر تحميل الموديلات.'
                );
            }


            modelSelect.innerHTML = `
                <option value="">
                    اختر موديل الهاتف
                </option>
            `;


            if (!Array.isArray(data.models) || !data.models.length) {

                modelSelect.innerHTML = `
                    <option value="">
                        لا توجد موديلات متاحة
                    </option>
                `;

                return;
            }


            data.models.forEach(model => {

                const option =
                    document.createElement('option');

                option.value =
                    model.phone_model_id;

                option.textContent =
                    model.model_name;

                modelSelect.appendChild(option);

            });


            modelSelect.disabled = false;

        } catch (error) {

            console.error(error);

            modelSelect.innerHTML = `
                <option value="">
                    حدث خطأ أثناء التحميل
                </option>
            `;

        } finally {

            setLoading(false);

        }

    }


    /* =========================================================
       LOAD PRODUCTS
    ========================================================== */

    async function loadProducts(phoneModelId) {

        if (!phoneModelId) {

            resetResults();

            currentStep.textContent = '1';

            return;
        }


        currentStep.textContent = '2';

        setLoading(true);

        resultsEmpty.hidden = false;

        resultsEmpty.innerHTML = `
            <div class="empty-icon loading-icon">
                <span class="loading-spinner"></span>
            </div>

            <h3>
                جاري البحث...
            </h3>

            <p>
                بنبحث عن الاسكرينات المتوافقة مع هاتفك.
            </p>
        `;

        productsGrid.innerHTML = '';

        try {

            const url =
                `${ajaxUrl}?action=products&phone_model_id=${encodeURIComponent(phoneModelId)}`;

            const response =
                await fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

            if (!response.ok) {
                throw new Error('HTTP error');
            }

            const data =
                await response.json();

            if (!data.success) {
                throw new Error(
                    data.message || 'تعذر تحميل النتائج.'
                );
            }


            /* Selected phone */

            selectedPhone.hidden = false;

            selectedPhoneName.textContent =
                `${data.phone.brand_name} ${data.phone.model_name}`;


            /* Count */

            resultsCount.textContent =
                Number(data.count || 0).toLocaleString('ar-EG');


            /* Products */

            renderProducts(data.products || []);


        } catch (error) {

            console.error(error);

            productsGrid.innerHTML = '';

            resultsEmpty.hidden = false;

            resultsEmpty.innerHTML = `
                <div class="empty-icon error-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    حدث خطأ
                </h3>

                <p>
                    تعذر تحميل الاسكرينات المتوافقة حالياً.
                    حاول مرة أخرى.
                </p>
            `;

        } finally {

            setLoading(false);

        }

    }


    /* =========================================================
       RENDER PRODUCTS
    ========================================================== */

    function renderProducts(products) {

        productsGrid.innerHTML = '';


        if (!products.length) {

            resultsEmpty.hidden = false;

            resultsEmpty.innerHTML = `
                <div class="empty-icon">
                    <i class="fa-solid fa-shield-slash"></i>
                </div>

                <h3>
                    لا توجد اسكرينات مسجلة
                </h3>

                <p>
                    لا توجد حالياً اسكرينات حماية مسجلة
                    لهذا الموديل.
                </p>
            `;

            return;
        }


        resultsEmpty.hidden = true;


        products.forEach((product, index) => {

            const card =
                createProductCard(product, index);

            productsGrid.appendChild(card);

        });

    }


    /* =========================================================
       PRODUCT CARD
    ========================================================== */

    function createProductCard(product, index) {

        const article =
            document.createElement('article');

        article.className =
            'compatibility-product';

        article.style.setProperty(
            '--card-delay',
            `${Math.min(index * 60, 500)}ms`
        );


        const image =
            product.image_path
            || 'assets/default-product.png';


        const metaItems = [];


        if (product.material) {

            metaItems.push(`
                <span>
                    <i class="fa-solid fa-layer-group"></i>
                    ${escapeHtml(product.material)}
                </span>
            `);

        }


        if (product.thickness) {

            metaItems.push(`
                <span>
                    <i class="fa-solid fa-ruler-vertical"></i>
                    ${escapeHtml(product.thickness)}
                </span>
            `);

        }


        if (product.hardness) {

            metaItems.push(`
                <span>
                    <i class="fa-solid fa-shield-halved"></i>
                    ${escapeHtml(product.hardness)}
                </span>
            `);

        }


        if (product.finish) {

            metaItems.push(`
                <span>
                    <i class="fa-solid fa-sparkles"></i>
                    ${escapeHtml(product.finish)}
                </span>
            `);

        }


        article.innerHTML = `

            <div class="product-image">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(product.product_name)}"
                    loading="lazy"
                    onerror="this.src='assets/default-product.png'"
                >

                <span class="compatibility-badge">

                    <i class="fa-solid fa-circle-check"></i>

                    متوافقة

                </span>

            </div>


            <div class="product-content">

                <div class="product-top">

                    <span class="product-label">

                        <i class="fa-solid fa-shield-halved"></i>

                        اسكرينة حماية

                    </span>

                </div>


                <h3 class="product-title">

                    ${escapeHtml(product.product_name)}

                </h3>


                ${
                    product.short_description
                    ? `
                        <p class="product-description">
                            ${escapeHtml(product.short_description)}
                        </p>
                    `
                    : ''
                }


                ${
                    metaItems.length
                    ? `
                        <div class="product-meta">
                            ${metaItems.join('')}
                        </div>
                    `
                    : ''
                }


                ${
                    product.catalog_name
                    ? `
                        <div class="product-type">

                            <i class="fa-solid fa-tag"></i>

                            <span>
                                ${escapeHtml(product.catalog_name)}
                            </span>

                        </div>
                    `
                    : ''
                }


                <div class="knowledge-only">

                    <i class="fa-solid fa-circle-info"></i>

                    <span>
                        معلومة توافق فقط — المنتج غير متاح للشراء من هذه الصفحة
                    </span>

                </div>

            </div>

        `;


        return article;

    }


    /* =========================================================
       CART BADGE
    ========================================================== */

    async function updateCartBadge() {

        try {

            const response =
                await fetch('cart_action.php', {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',

                        'X-Requested-With':
                            'XMLHttpRequest'
                    },

                    body: JSON.stringify({
                        action: 'get'
                    })
                });


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            if (
                data &&
                data.success &&
                cartBadge &&
                typeof data.cart_count !== 'undefined'
            ) {

                cartBadge.textContent =
                    Number(data.cart_count).toLocaleString('ar-EG');

            }

        } catch (error) {

            /*
             * Cart badge is optional.
             * Compatibility page should continue working
             * even if cart endpoint is unavailable.
             */

            console.debug(
                'Cart badge unavailable:',
                error
            );

        }

    }


    /* =========================================================
       EVENTS
    ========================================================== */

    brandSelect.addEventListener(
        'change',
        () => {

            loadModels(
                brandSelect.value
            );

        }
    );


    modelSelect.addEventListener(
        'change',
        () => {

            loadProducts(
                modelSelect.value
            );

        }
    );


    /* =========================================================
       INITIAL STATE
    ========================================================== */

    resetResults();

    updateCartBadge();

});