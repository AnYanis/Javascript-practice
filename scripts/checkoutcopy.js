import { renderAllOrderSummary } from "./checkout/orderSummarycopy.js";
import { renderPaymentSummary } from "./checkout/paymentSummarycopy.js";
import { loadProductsFetch } from "../data/products.js";
import { loadCart } from "../data/cartcopy.js";


async function loadPage() {
    try {
        await loadProductsFetch();

        const value = await new Promise((resolve,reject) => {
            loadCart(() => {
               
               resolve();
            });
        });
    }
    catch (error) {
        console.log('Unexpected error. Please try again later.');
    }
    renderAllOrderSummary();
    renderPaymentSummary();
}

loadPage();

/*
 Promise.all([
     loadProductsFetch(),
     new Promise((resolve) => {
         loadCart(() => {
             resolve();
         });
     }),

 ]).then(() => {
     renderAllOrderSummary();
     renderPaymentSummary();
 });
*/

/*new Promise((resolve) => {
    loadProducts(() => {
        resolve();
    });
}).then(() => {
    return new Promise((resolve) => {
        loadCart(() => {
            resolve();
        });
    });
}).then(() => {
    renderAllOrderSummary();
    renderPaymentSummary();
})
*/


