import { cart, removeFromCart, calculateCartQuantity, updateQuantity } from "../data/cart.js";
import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";

function updateCheckoutQuantity() {
  let totalQuantity = calculateCartQuantity();
  const el = document.querySelector('.js-checkout-quantity');
  if (el) {
    el.innerHTML = `${totalQuantity} item${totalQuantity !== 1 ? 's' : ''}`;
  }

};


function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  const el = document.querySelector('.js-cart-quantity');
  if (el) {
    el.innerHTML = cartQuantity;
  }
}

function renderCart() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    let matchingProduct;

    products.forEach((product) => {
      if (product.id === productId) {
        matchingProduct = product;
      }
    });
    if (!matchingProduct) {
      console.error(`No product found for productId: ${productId}`);
      return;
    }

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: Tuesday, June 21
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
          <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">
          Save</span>
           
          <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          
        </div>
        <div class="delivery-options">
          <div class="delivery-options-title">Choose a delivery option:</div>
          <div class="delivery-option">
            <input type="radio" checked class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
            <div>
              <div class="delivery-option-date">Tuesday, June 21</div>
              <div class="delivery-option-price">FREE Shipping</div>
            </div>
          </div>
          <div class="delivery-option">
            <input type="radio" class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
            <div>
              <div class="delivery-option-date">Wednesday, June 15</div>
              <div class="delivery-option-price">$4.99 - Shipping</div>
            </div>
          </div>
          <div class="delivery-option">
            <input type="radio" class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
            <div>
              <div class="delivery-option-date">Monday, June 13</div>
              <div class="delivery-option-price">$9.99 - Shipping</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  // Attach event listeners AFTER the HTML is rendered

  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      if (!productId) return;
      removeFromCart(productId);

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      if (container) container.remove();

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

      updateQuantity(productId, newQuantity);

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      if (container) container.classList.remove('is-editing-quantity');

      const quantityLabel = document.querySelector(`.js-quantity-label-${productId}`);
      if (quantityLabel) quantityLabel.innerHTML = newQuantity;

      updateCheckoutQuantity();
      updateCartQuantity();
    })


  })




};

// Initial render
renderCart();
updateCheckoutQuantity();
updateCartQuantity();