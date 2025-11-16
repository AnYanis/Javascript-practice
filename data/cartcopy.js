// cartcopy.js
// Purpose: Manage the checkout-copy cart state. Persists to localStorage under the key 'cart-copy'.
// Schema: cart = [{ productId: string, quantity: number, deliveryOptionsId: string }]

export let cart
try {
  cart = JSON.parse(localStorage.getItem('cart-copy')) || [];
} catch (error) {
  cart = []; // Reset cart if data is invalid
}

// Add a product to the cart (or increase quantity if it already exists)
export function addToCart(productId, quantity) {

  let matchingitem;

  cart.forEach(item => {
    if (productId === item.productId) {
      matchingitem = item;

    }
  });

  if (matchingitem) {
    matchingitem.quantity += quantity;
  }
  else {
    cart.push({
      productId: productId,
      quantity: quantity,
      deliveryOptionsId: '1'
    });
  };
  saveToStorage();
}


// Remove a product from the cart entirely
export function removeFromCart(productId) {
  cart = cart.filter((cartItem) => cartItem.productId !== productId);
  saveToStorage();

}

// Calculate total quantity of all items in the cart
export function calculateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });

  return cartQuantity;
}

// Update quantity for a specific product
export function updateQuantity(productId, newQuantity) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  matchingItem.quantity = newQuantity;

  saveToStorage();
}
// Persist the cart to localStorage
export function saveToStorage() { // Add 'export'
  localStorage.setItem('cart-copy', JSON.stringify(cart));
}

// Update the selected delivery option for a product in the cart
export function updateDeliverOption(productId, deliveryOptionId) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.productId) {
      matchingItem = cartItem;
    }
  });

  if (!matchingItem) return;

  // Persist with the cart schema: deliveryOptionsId (string)
  matchingItem.deliveryOptionsId = String(deliveryOptionId);
  saveToStorage();
}


// Demo function (optional): loads a sample cart from a remote API and calls a callback.
export function loadCart(fun) {
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', () => {
    console.log(xhr.response);
    if (typeof fun === 'function') {
      fun();
    }
  });
  xhr.open('GET', 'https://supersimplebackend.dev/cart');

  xhr.send();
}

