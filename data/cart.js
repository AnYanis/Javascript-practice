

export let cart;

try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (error) {
    
    cart = []; // Reset cart if data is invalid
}


export function addToCart(productId, quantity) {
    let matchingitem;

    cart.forEach((cartItem) => {
        if (productId === cartItem.productId) {
            matchingitem = cartItem;
        }
    });


    if (matchingitem) {
        matchingitem.quantity += quantity;

    } else {

        cart.push({
            productId: productId,
            quantity: quantity

        });
    }
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

export function removeFromCart(productId) {
    cart = cart.filter((cartItem) => cartItem.productId !== productId);
    saveToStorage();
   
}


export function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}