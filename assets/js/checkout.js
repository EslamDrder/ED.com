"use strict";

document.addEventListener("DOMContentLoaded", () => {

const form =
    document.getElementById("checkoutForm");

const governorate =
    document.getElementById("governorate");

const shippingAmount =
    document.getElementById("shippingAmount");

const grandTotal =
    document.getElementById("grandTotal");

const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );


/*
|--------------------------------------------------------------------------
| Base Subtotal
|--------------------------------------------------------------------------
*/

let subtotal = 0;

const subtotalElement =
    document.querySelector(
        ".checkout-summary > div:first-child strong"
    );


if (subtotalElement) {

    subtotal =
        parseFloat(
            subtotalElement.textContent
                .replace(/[^\d.]/g, "")
        ) || 0;

}


/*
|--------------------------------------------------------------------------
| Format
|--------------------------------------------------------------------------
*/

function money(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(value);

}


/*
|--------------------------------------------------------------------------
| Shipping
|--------------------------------------------------------------------------
*/

function updateShipping() {

    const option =
        governorate?.options[
            governorate.selectedIndex
        ];


    if (
        !option ||
        !option.value
    ) {

        if (shippingAmount) {

            shippingAmount.textContent =
                "اختر المحافظة";

        }


        if (grandTotal) {

            grandTotal.textContent =
                money(subtotal) + " ج";

        }

        return;
    }


    const shipping =
        parseFloat(
            option.dataset.shipping
        ) || 0;


    const total =
        subtotal + shipping;


    if (shippingAmount) {

        shippingAmount.textContent =
            money(shipping) + " ج";

    }


    if (grandTotal) {

        grandTotal.textContent =
            money(total) + " ج";

    }

}


governorate?.addEventListener(
    "change",
    updateShipping
);


updateShipping();


/*
|--------------------------------------------------------------------------
| Payment Selection
|--------------------------------------------------------------------------
*/

const paymentOptions =
    document.querySelectorAll(
        ".payment-option"
    );


paymentOptions.forEach(option => {

    const input =
        option.querySelector(
            "input[type='radio']"
        );


    input?.addEventListener(
        "change",
        () => {

            paymentOptions.forEach(
                item => {
                    item.classList.remove(
                        "selected"
                    );
                }
            );


            if (input.checked) {
                option.classList.add(
                    "selected"
                );
            }

        }
    );

});


/*
|--------------------------------------------------------------------------
| Phone Formatting
|--------------------------------------------------------------------------
*/

const whatsapp =
    document.getElementById(
        "whatsapp"
    );


whatsapp?.addEventListener(
    "input",
    () => {

        whatsapp.value =
            whatsapp.value
                .replace(/\D/g, "")
                .slice(0, 11);

    }
);


/*
|--------------------------------------------------------------------------
| Submit Protection
|--------------------------------------------------------------------------
*/

form?.addEventListener(
    "submit",
    event => {

        if (!form.checkValidity()) {

            event.preventDefault();

            form.reportValidity();

            return;

        }


        if (placeOrderButton) {

            placeOrderButton.disabled =
                true;

            placeOrderButton.innerHTML = `
                <span>
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    جاري إنشاء الطلب...
                </span>
            `;

        }

    }
);

});
