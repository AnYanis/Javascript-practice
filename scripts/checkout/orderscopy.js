// orderscopy.js
// Purpose: Render the latest placed order on the Orders page (copy version).
// Data flow:
//   - Reads the most recent order from localStorage via data/orders-copy.js
//   - Loads products (loadProductsFetch) so getProduct() can resolve details
//   - Recomputes totals using the same rules as checkout OR uses saved totals in the order
//   - Renders Buy Again buttons (add back to cart-copy) and optional Cancel item (with confirm)
// Notes:
//   - Cart-count in header is still driven by cart-copy (reflects what you plan to buy next)
//   - Orders are immutable snapshots; cancel updates the stored snapshot locally
//   - Uses formatCurrency to display dollars from cents values

import {
  calculateCartQuantity,
  addToCart
} from '../../data/cartcopy.js';
import { getProduct, loadProductsFetch } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import { getDeliveryOption, calculateDeliveryDate } from '../../data/deliveryOptions.js';
import { orders } from '../../data/orders-copy.js';

// Entry point for Orders page rendering
async function rederOrdersAll() {
  let ordersHTML = '';

  // Update the header cart badge in the top-right of the page
  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();
    const el = document.querySelector('.js-cart-quantity');
    if (el) {
      el.innerHTML = cartQuantity;
    }
  }

  // Build HTML for the latest order and compute totals
  function rederOrders() {
    let itemsHTML = '';

    const latestOrder = (orders && orders.length) ? orders[0] : null;
    const items = latestOrder ? (latestOrder.cart || latestOrder.products || latestOrder.items || []) : [];

    // Totals matching Checkout
    let productPriceCents = 0;
    let shippingPriceCents = 0;
    let totalQuantity = 0;

    // Iterate over items in the order, computing totals and building HTML
    items.forEach((item) => {
      const productId = item.productId || item.id || (item.product && item.product.id);
      const quantity = item.quantity || item.qty || 1;
      const product = getProduct(productId);
      if (!product) return;

      // Per-item delivery details
      const option = getDeliveryOption(item.deliveryOptionsId || (item.deliveryOption && item.deliveryOption.id) || '1');
      const perItemDateString = calculateDeliveryDate(option);

      // Accumulate product subtotal
      productPriceCents += (product.priceCents || 0) * quantity;
      totalQuantity += quantity;

      // Same shipping multiplier rules as checkout
      let multiplier;
      if (quantity === 1) {
        multiplier = 1;
      } else if (quantity <= 3) {
        multiplier = 1.5;
      } else if (quantity <= 5) {
        multiplier = 2;
      } else if (quantity <= 10) {
        multiplier = 2.75;
      } else if (quantity <= 20) {
        multiplier = 3;
      } else if (quantity <= 30) {
        multiplier = 3.25;
      } else if (quantity <= 40) {
        multiplier = 3.5;
      } else if (quantity <= 50) {
        multiplier = 4;
      } else {
        multiplier = 5;
      }
      const lineShipping = option ? Math.round((option.priceCents || 0) * multiplier) : 0;
      shippingPriceCents += lineShipping;

      // Build HTML for this item
      itemsHTML += `
            <div class="product-image-container">
              <img src="${product.image}">
            </div>

            <div class="product-details">
              <div class="product-name">
                ${product.name}
              </div>
              <div class="product-delivery-date">
                Arriving on: ${perItemDateString}
              </div>
              <div class="product-quantity">
                Quantity: ${quantity}
              </div>
              <button class="buy-again-button button-primary js-buy-again" data-product-id="${product.id}" data-quantity="${quantity}">
                <img class="buy-again-icon" src="images/icons/buy-again.png">
                <span class="buy-again-message">Buy it again</span>
              </button>
            </div>

            <div class="product-actions">
              <a href="trackingcopy.html">
                <button class="track-package-button button-secondary js-track-package">
                  Track package
                </button>
              </a>
              <button class="remove-button button-secondary js-remove-item" data-product-id="${product.id}" style="margin-left: 8px;" title="Cancel this item from the order">
                Cancel item
              </button>
            </div>`;
    });

    // Compute final totals (with tax) and use saved totals if available
    let totalBeforeTaxCents = productPriceCents + shippingPriceCents;
    let taxCents = totalBeforeTaxCents * 0.1; // match checkout (no premature rounding)
    let totalCents = totalBeforeTaxCents + taxCents;

    // If checkout saved exact totals with the order, prefer those for perfect parity
    if (latestOrder && latestOrder.totals) {
      const t = latestOrder.totals;
      productPriceCents = t.productPriceCents ?? productPriceCents;
      shippingPriceCents = t.shippingPriceCents ?? shippingPriceCents;
      totalBeforeTaxCents = t.totalBeforeTaxCents ?? (productPriceCents + shippingPriceCents);
      taxCents = t.taxCents ?? (totalBeforeTaxCents * 0.1);
      totalCents = t.totalCents ?? (totalBeforeTaxCents + taxCents);
    }

    // Build the final orders HTML
    ordersHTML = `
      <div class="main">
        <div class="page-title">Your Orders</div>

        <div class="orders-grid">
          <div class="order-container">
            
            <div class="order-header">
              <div class="order-header-left-section">
                <div class="order-date">
                  <div class="order-header-label">Order Placed:</div>
                  <div>${latestOrder && latestOrder.orderTime ? new Date(latestOrder.orderTime).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                </div>
                <div class="order-total">
                  <div class="order-header-label">Total:</div>
                  <div>$${formatCurrency(totalCents)}</div>
                </div>
              </div>

              <div class="order-header-right-section">
                <div class="order-header-label">Order ID:</div>
                <div>${latestOrder && (latestOrder.id || latestOrder.orderId) ? (latestOrder.id || latestOrder.orderId) : '—'}</div>
              </div>
            </div>

            <div class="order-details-grid">
              ${itemsHTML}
            </div>
          </div>
        </div>
      </div>`;
  }

  // Build the orders HTML and attach interactions
  await loadProductsFetch();
  rederOrders();
  document.querySelector('.js-orders').innerHTML = ordersHTML;

  // Wire up Buy Again buttons: add back to cart-copy without redirecting
  document.querySelectorAll('.js-buy-again').forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id');
      const qtyAttr = btn.getAttribute('data-quantity');
      const quantity = Math.max(1, parseInt(qtyAttr || '1', 10));
      if (productId) {
        addToCart(productId, quantity);
      }
      // Update header cart count (no navigation)
      updateCartQuantity();
    });
  });

  // Wire up Cancel (Remove) buttons: confirm, update latest order snapshot, recompute totals, re-render
  document.querySelectorAll('.js-remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id');
      if (!productId) return;
      const ok = window.confirm('Are you sure you want to cancel this item from your order?');
      if (!ok) return;
      const latestOrder = (orders && orders.length) ? orders[0] : null;
      if (!latestOrder) return;
      const items = latestOrder.cart || latestOrder.products || latestOrder.items || [];
      const filtered = items.filter((it) => {
        const id = it.productId || it.id || (it.product && it.product.id);
        return String(id) !== String(productId);
      });
      // Persist back to localStorage
      if (latestOrder.cart) latestOrder.cart = filtered;
      else if (latestOrder.products) latestOrder.products = filtered;
      else if (latestOrder.items) latestOrder.items = filtered;
      // Force totals recompute next render
      if (latestOrder.totals) delete latestOrder.totals;
      try {
        localStorage.setItem('orders-copy', JSON.stringify(orders));
      } catch (e) { /* ignore */ }
      // Re-render page
      rederOrdersAll();
    });
  });

  updateCartQuantity();
}

rederOrdersAll();
