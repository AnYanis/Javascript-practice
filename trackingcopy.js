import {
    calculateCartQuantity,
    addToCart
} from '../../data/cartcopy.js';
import { getProduct, loadProductsFetch } from "../../data/products.js";

import { getDeliveryOption, calculateDeliveryDate, calculateDeliveryEtaDate } from '../../data/deliveryOptions.js';
import { orders } from '../../data/orders-copy.js';



async function renderTrackingAll() {
    let trackingHTML = '';

    function updateCartQuantity() {
        const cartQuantity = calculateCartQuantity();
        const el = document.querySelector('.js-cart-quantity');
        if (el) {
            el.innerHTML = cartQuantity;
        }
    }

    // Determine which items to track: use latest order snapshot
    const latestOrder = (orders && orders.length) ? orders[0] : null;
    const items = latestOrder ? (latestOrder.cart || latestOrder.products || latestOrder.items || []) : [];
    const orderTime = latestOrder && latestOrder.orderTime ? new Date(latestOrder.orderTime) : new Date();

    // Use shared ETA calculation from deliveryOptions.js (skips weekends)

    function renderTracking() {
        items.forEach((item) => {
            const productId = item.productId || item.id || (item.product && item.product.id);
            const quantity = item.quantity || item.qty || 1;
            const product = getProduct(productId);
            if (!product) return;

            // Per-item delivery details
            const option = getDeliveryOption(item.deliveryOptionsId || (item.deliveryOption && item.deliveryOption.id) || '1');
            const perItemDateString = calculateDeliveryDate(option);
            const etaDate = calculateDeliveryEtaDate(option);
            const now = new Date();
            const totalMs = Math.max(1, etaDate.getTime() - orderTime.getTime());
            let progress = (now.getTime() - orderTime.getTime()) / totalMs;
            if (isNaN(progress)) progress = 0;
            progress = Math.max(0, Math.min(1, progress));
            const percent = Math.round(progress * 100);
            const stageIndex = percent >= 100 ? 2 : (percent < 33 ? 0 : 1);

            trackingHTML += `
    <div class="order-tracking">
      <a class="back-to-orders-link link-primary" href="orderscopy.html">
        View all orders
      </a>

      <div class="delivery-date">
        Arriving on: ${perItemDateString}
      </div>

      <div class="product-info" data-product-id="${product.id}">
        ${product.name}
      </div>

      <div class="product-info" data-quantity="${quantity}">
        Quantity: ${quantity}
      </div>

      <img class="product-image" src="${product.image}">

      <div class="progress-labels-container">
        <div class="progress-label ${stageIndex===0 ? 'current-status' : ''}">
          Preparing
        </div>
        <div class="progress-label ${stageIndex===1 ? 'current-status' : ''}">
          Shipped
        </div>
        <div class="progress-label ${stageIndex===2 ? 'current-status' : ''}">
          Delivered
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%"></div>
      </div>
    </div>`;
        });
    }


    await loadProductsFetch();
    renderTracking();
    document.querySelector('.js-tracking').innerHTML = trackingHTML;
    updateCartQuantity();
}

renderTrackingAll();
