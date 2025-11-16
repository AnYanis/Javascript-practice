// paymentSummarycopy.js
// Purpose: Render the checkout order summary (items, shipping, tax, total) for the checkout copy flow.
// - Reads current cart from cartcopy.js
// - Calculates shipping using a quantity-based multiplier
// - Saves an order snapshot and totals to localStorage when placing the order
// - Redirects to orderscopy.html after successful placement
import { cart, saveToStorage } from '../../data/cartcopy.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';
import { addOrder } from '../../data/orders-copy.js';

export function renderPaymentSummary() {

  // Accumulators for totals (in cents)
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  let cartQuantity = 0;

  // Sum product subtotal and per-line shipping using the same rules used across checkout
  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    if (!product) {
      // Skip items that reference products no longer in the catalog
      return;
    }

    productPriceCents += product.priceCents * cartItem.quantity
    const option = getDeliveryOption(cartItem.deliveryOptionsId)

    // Shipping multiplier scales with quantity (see spec in project)
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

    const lineShipping = option ? Math.round(option.priceCents * multiplier) : 0;
    shippingPriceCents += lineShipping;
  });

  // Count total items (for the UI "Items (N)")
  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    if (!product) return;
    cartQuantity += cartItem.quantity;
  });

  // Final totals in cents
  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;

  const taxCents = totalBeforeTaxCents * 0.1;

  const totalCents = totalBeforeTaxCents + taxCents;

  // Render summary HTML in the checkout sidebar
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

        <button class="place-order-button button-primary js-place-order">
          Place your order
        </button>`
  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

  // Place order: POST cart to backend, save local snapshot (with totals), clear cart, redirect to Orders page
  document.querySelector('.js-place-order').addEventListener('click', async () => {
    try {
    const response = await fetch('https://supersimplebackend.dev/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cart: cart,
      })

    });
    const order = await response.json();
    // Save a local snapshot of the cart (including deliveryOptionsId) with the order
    const localOrder = { 
      ...order, 
      cart: cart.map(item => ({...item})),
      totals: {
        productPriceCents,
        shippingPriceCents,
        totalBeforeTaxCents,
        taxCents,
        totalCents
      }
    };
    addOrder(localOrder);
    // Clear cart after placing order
    cart.length = 0;
    saveToStorage();
    } catch (error) {
      console.log('Unexpected Error. Please try again later.');
    }
    window.location.href = 'orderscopy.html';
  });
}
