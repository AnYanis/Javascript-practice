// amazon copy.js
// Purpose: Render the storefront product grid, wire up Add to Cart, and update the
// header cart quantity for the copy demo pages.
// Data flow:
//  - Loads products via loadProductsFetch() then calls renderProductsGrid().
//  - Uses cartcopy.js for cart state (addToCart, header quantity badge).
//  - Renders product cards with rating, price, quantity selector, and Add to Cart button.
import { products, loadProductsFetch } from '../data/products.js';
import { cart, addToCart } from '../data/cartcopy.js';
import { formatCurrency } from './utils/money.js';

// Load products from backend, then draw the grid
loadProductsFetch().then(renderProductsGrid);
function renderProductsGrid() {
  let productsHTML = '';

  // Build product card HTML for each product
  products.forEach((product) => {
    productsHTML += `
    <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${product.name}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars" src="${product.getStarsUrl()}">
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price">
         ${product.getPrice()}
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector-${product.id}">
            <option selected value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>
        ${product.extraInforHTML()}
        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" >
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>`;

  });

  // Inject the generated HTML into the grid container
  document.querySelector('.js-products-grid').innerHTML = productsHTML;

  // Track timeouts for the little "Added" badge so multiple clicks are handled cleanly
  let addedmessageTimeouts = {};

  // Update the cart quantity displayed in the header
  function updateCartQuantity() {
    let cartQuantity = 0;
    cart.forEach(item => {
      cartQuantity += item.quantity;
    });

    // Move this INSIDE the function
    document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
  }

  // Set initial header cart quantity on page load
  updateCartQuantity(); // Now call it



  // Wire up Add to Cart for each product card
  document.querySelectorAll('.js-add-to-cart').forEach(button => {
    button.addEventListener('click', () => {

      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);

      const quantity = Number(quantitySelector.value);

      addToCart(productId, quantity);
      updateCartQuantity();


      const addedmessage = document.querySelector(`.js-added-to-cart-${productId}`);

      addedmessage.classList.add('added-to-cart-visible');


      if (addedmessageTimeouts[productId]) {
        clearTimeout(addedmessageTimeouts[productId]);
      }


      addedmessageTimeouts[productId] = setTimeout(() => {
        addedmessage.classList.remove('added-to-cart-visible');
        delete addedmessageTimeouts[productId];
      }, 1820);

    });

  })
};

