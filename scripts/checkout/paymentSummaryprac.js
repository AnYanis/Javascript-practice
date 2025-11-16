import { cart } from '../../data/cart prac.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';



export function renderPaymentSummary() {

    let cartQuantity = 0;
    let productPriceCents = 0;
    let shippingPriceCents = 0;


    cart.forEach((cartItem) => {
        const product = getProduct(cartItem.productId);

        productPriceCents += product.priceCents * cartItem.quantity;
        const option = getDeliveryOption(cartItem.deliveryOptionsId);

        let multiplier;
        if (cartItem.quantity === 1) {
            multiplier = 1;
        } else if (cartItem.quantity <= 3) {
            multiplier = 1.5;
        } else if (cartItem.quantity <= 5) {
            multiplier = 2;
        } else if (cartItem.quantity <= 10) {
            multiplier = 2.75; // cap
        } else if (cartItem.quantity <= 20) {
            multiplier = 3;
        } else if (cartItem.quantity <= 30) {
            multiplier = 3.25;
        } else if (cartItem.quantity <= 40) {
            multiplier = 3.5;
        } else if (cartItem.quantity <= 50) {
            multiplier = 4;
        } else {
            multiplier = 5;
        }

        const lineShipping = Math.round(option.priceCents * multiplier);
        shippingPriceCents += lineShipping;
    });

    cart.forEach((cartItem) => {
        cartQuantity += cartItem.quantity;
    });
    const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
    const taxCents = totalBeforeTaxCents * 0.1;

    const totalCents = totalBeforeTaxCents + taxCents;

    const paymentSummaryHTML = `<div class="payment-summary-title">
          Order Summary
        </div>

        <div class="payment-summary-row">
          <div>Items (${cartQuantity}):</div>
          <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
        </div>

        <div class="payment-summary-row">
          <div>Shipping &amp; handling:</div>
          <div class="payment-summary-money">$${formatCurrency(shippingPriceCents)}</div>
        </div>

        <div class="payment-summary-row subtotal-row">
          <div>Total before tax:</div>
          <div class="payment-summary-money">$${formatCurrency(totalBeforeTaxCents)}</div>
        </div>

        <div class="payment-summary-row">
          <div>Estimated tax (10%):</div>
          <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
        </div>

        <div class="payment-summary-row total-row">
          <div>Order total:</div>
          <div class="payment-summary-money">$${formatCurrency(totalCents)}</div>
        </div>

        <button class="place-order-button button-primary">
          Place your order
        </button>`
    document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;


}