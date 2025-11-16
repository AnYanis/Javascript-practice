class Cart {
    cartItems;
    #localStorageKey;

    constructor(localStorageKey) {
        this.#localStorageKey = localStorageKey;
        this.#loadFromStorage();
        
    }
    #loadFromStorage() {
        try {
            this.cartItems = JSON.parse(localStorage.getItem(this.#localStorageKey)) || [];
        } catch (error) {
            this.cartItems = []; // Reset cart if data is invalid
        }
    }

    #saveToStorage() {
        localStorage.setItem(this.#localStorageKey, JSON.stringify(this.cartItems));
    };
    addToCart(productId, quantity) {

        let matchingitem;

        if (!Array.isArray(this.cartItems)) {
            this.cartItems = [];
        }

        if (typeof productId === 'undefined' || typeof quantity !== 'number' || quantity <= 0) {
            return;
        }

        this.cartItems.forEach(CartItem => {
            if (productId === CartItem.productId) {
                matchingitem = CartItem;

            }
        });

        if (matchingitem) {
            matchingitem.quantity += quantity;
        }
        else {
            this.cartItems.push({
                productId: productId,
                quantity: quantity,
                deliveryOptionsId: '1'
            });
        };
        this.#saveToStorage();
    };

    removeFromCart(productId) {
        this.cartItems = this.cartItems.filter((CartItem) => CartItem.productId !== productId);
        this.#saveToStorage();
    }

    calculateCartQuantity() {
        let cartQuantity = 0;
        this.cartItems.forEach((CartItem) => {
            cartQuantity += CartItem.quantity;
        });

        return cartQuantity;
    };

    updateQuantity(productId, newQuantity) {
        let matchingItem;

        this.cartItems.forEach((CartItem) => {
            if (productId === CartItem.productId) {
                matchingItem = CartItem;
            }
        });

        matchingItem.quantity = newQuantity;

        this.#saveToStorage();
    };

    updateDeliverOption(productId, deliveryOptionId) {
        let matchingItem;

        this.cartItems.forEach((CartItem) => {
            if (productId === CartItem.productId) {
                matchingItem = CartItem;
            }
        });

        if (!matchingItem) return;

        // Persist with the cart schema: deliveryOptionsId (string)
        matchingItem.deliveryOptionsId = String(deliveryOptionId);
        this.#saveToStorage();
    };
}

const cart = new Cart("cart-copy");

const businessCart = new Cart("cart-business");



console.log(cart);
console.log(businessCart);
