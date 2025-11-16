// orders-copy.js
// Purpose: Persist placed orders (snapshots) to localStorage under the key 'orders'.
// Schema: orders = [ order ], where order may include:
//   - id/orderId, orderTime (from backend)
//   - cart/items: [{ productId, quantity, deliveryOptionsId }]
//   - totals: { productPriceCents, shippingPriceCents, totalBeforeTaxCents, taxCents, totalCents }

export const orders = (JSON.parse(localStorage.getItem('orders-copy')) || []);

// Add a new order to the beginning of the list and persist
export function addOrder(order){
    orders.unshift(order);
    saveToStorage();
}

// Persist current orders to localStorage
function saveToStorage(){
    localStorage.setItem('orders-copy',JSON.stringify(orders));
}
