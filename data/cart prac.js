export let cart
try {
    cart = JSON.parse(localStorage.getItem('cart-prac')) || [];
} catch (error) {
    cart = []; // Reset cart if data is invalid
}


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


export function removeFromCart(productId) {
    cart = cart.filter((cartItem) => cartItem.productId !== productId);
    saveToStorage();

}

export function calculateCartQuantity() {
    let cartQuantity = 0;
    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
  
    return cartQuantity;
  }

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
export function saveToStorage() { // Add 'export'
    localStorage.setItem('cart-prac', JSON.stringify(cart));
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