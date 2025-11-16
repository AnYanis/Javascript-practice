import {
    cart,
    removeFromCart,
    calculateCartQuantity,
    updateQuantity, updateDeliverOption
} from '../../data/cart prac.js';
import { products, getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import { deliveryOptions, getDeliveryOption, calculateDeliveryDate } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummaryprac.js';



export function renderAllOrderSummary() {
    function updateCheckoutQuantity() {
        const totalQuantity = calculateCartQuantity();
        const el = document.querySelector('.js-checkout-quantity');
        if (el) {
            el.innerHTML = `${totalQuantity} item${totalQuantity !== 1 ? 's' : ''}`;
        }
    }

    function updateCartQuantity() {
        const cartQuantity = calculateCartQuantity();
        const el = document.querySelector('.js-cart-quantity');
        if (el) {
            el.innerHTML = cartQuantity;
        }
    }


    function rendercart() {
        let cartSummaryHTML = '';

        cart.forEach((cartItem) => {
            const productId = cartItem.productId;
            const matchingProduct = getProduct(productId);

            const deliveryOption = getDeliveryOption(cartItem.deliveryOptionsId);

            const dateString = calculateDeliveryDate(deliveryOption);
            cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>
        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}">
          <div class="cart-item-details">
            <div class="product-name">${matchingProduct.name}</div>
            <div class="product-price">$${formatCurrency(matchingProduct.priceCents)}</div>
            <div class="product-quantity">
              <span class="quantity-display">
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span type="number" class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}" min="1" max="100" value="${cartItem.quantity}" inputmode="numeric" pattern="[0-9]*">
                Update
              </span>
              <input class="quantity-input js-quantity-input-${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">Save</span>
            
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    `;
        });

        function deliveryOptionsHTML(matchingProduct, cartItem) {

            let html = '<div class="delivery-options">\n' +
                '  <div class="delivery-options-title">Choose a delivery option:</div>\n';

            deliveryOptions.forEach((deliveryOption) => {
                const dateString = calculateDeliveryDate(deliveryOption);
                const priceString = deliveryOption.priceCents === 0 ? 'FREE SHIPPING' : `$${formatCurrency(deliveryOption.priceCents)} - SHIPPING`;
                const isChecked = deliveryOption.id === cartItem.deliveryOptionsId;

                html += `
        <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
          <input type="radio" ${isChecked ? 'checked' : ''} class="delivery-option-input" name="delivery-option-${matchingProduct.id}" value="${deliveryOption.id}">
          <div>
            <div class="delivery-option-date">${dateString}</div>
            <div class="delivery-option-price">${priceString}</div>
          </div>
        </div>
      `;
            });

            html += '</div>';
            return html;
        }

        document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;


        document.querySelectorAll('.js-delete-link').forEach((link) => {
            link.addEventListener('click', () => {
                const productId = link.dataset.productId;
                if (!productId) return;
                removeFromCart(productId);
                const container = document.querySelector(`.js-cart-item-container-${productId}`);
                if (container) container.remove();


                renderPaymentSummary();
                updateCheckoutQuantity();
                updateCartQuantity();
            });
        });
        document.querySelectorAll('.js-update-link').forEach((link) => {
            link.addEventListener('click', () => {
                const productId = link.dataset.productId;
                if (!productId) return;

                const container = document.querySelector(`.js-cart-item-container-${productId}`);
                if (container) {
                    container.classList.add('is-editing-quantity');
                    const input = document.querySelector(`.js-quantity-input-${productId}`);
                    if (input) input.focus();
                }
                renderPaymentSummary();
            });
        });

        document.querySelectorAll('.quantity-input').forEach((input) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const productId = input.classList
                        .value
                        .match(/js-quantity-input-(\S+)/)?.[1];
                    if (!productId) return;

                    const saveButton = document.querySelector(`.js-save-link[data-product-id="${productId}"]`);
                    if (saveButton) saveButton.click();
                }
                renderPaymentSummary();
            });
        });

        document.querySelectorAll('.js-save-link').forEach((link) => {
            link.addEventListener('click', () => {
                const productId = link.dataset.productId;
                if (!productId) return;

                const quantityInput = document.querySelector(`.js-quantity-input-${productId}`);
                const value = quantityInput ? quantityInput.value.trim() : '';
                const newQuantity = Number(value);

                // Validation: require at least 1, less than 100
                if (
                    !/^\d+$/.test(quantityInput.value.trim()) || // not only digits
                    newQuantity < 1 ||
                    newQuantity >= 100
                ) {
                    alert('Please enter a valid number between 1 and 100');
                    quantityInput.value = cart.find(item => item.productId === productId)?.quantity || 1;
                    return;
                }

                // updateQuantity is imported from cartcopy.js
                updateQuantity(productId, newQuantity);

                const container = document.querySelector(`.js-cart-item-container-${productId}`);
                if (container) container.classList.remove('is-editing-quantity');

                const quantityLabel = document.querySelector(`.js-quantity-label-${productId}`);
                if (quantityLabel) quantityLabel.innerHTML = newQuantity;

                renderPaymentSummary();
                updateCheckoutQuantity();
                updateCartQuantity();
            });
        });



    };



    // Delegate clicks for dynamically rendered delivery options
    const orderSummaryEl = document.querySelector('.js-order-summary');
    if (orderSummaryEl) {
        orderSummaryEl.addEventListener('click', (event) => {
            const el = event.target.closest('.js-delivery-option');
            if (!el) return;
            const productId = el.dataset.productId;
            const deliveryOptionId = el.dataset.deliveryOptionId;

            if (!productId || !deliveryOptionId) return;

            updateDeliverOption(productId, deliveryOptionId);
            rendercart();
            renderPaymentSummary();

            updateCheckoutQuantity();
            updateCartQuantity();
        });
    }





    rendercart();
    updateCheckoutQuantity();
    updateCartQuantity();
}