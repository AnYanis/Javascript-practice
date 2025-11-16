// deliveryOptions.js
// Purpose: Provide available delivery options, a helper to resolve one by id
// (with safe fallback), and a function to compute a formatted delivery date
// while skipping weekends.
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

// Schema: { id: string, deliveryDays: number, priceCents: number }
export const deliveryOptions = [{
    id:'1',
    deliveryDays:7,
    priceCents:0
},
{
    id:'2',
    deliveryDays:3,
    priceCents:499
},{
    id:'3',
    deliveryDays:1,
    priceCents:999
}




];


// Resolve a delivery option by id. Returns a safe fallback (id '1' or first)
// if the id is missing or unknown (helps with older localStorage entries).
export function getDeliveryOption(deliveryOptionId) {
    const selectedId = String(deliveryOptionId || '1');
    let deliveryOption = deliveryOptions.find((option) => option.id === selectedId);

    // Fallback if not found (handles old localStorage entries)
    if (!deliveryOption) {
        deliveryOption = deliveryOptions.find((o) => o.id === '1') || deliveryOptions[0];
    }

    return deliveryOption;
}

// Calculate and return a formatted delivery date string, skipping weekends.
// Example output: 'Thursday, October 23'
export function calculateDeliveryDate(deliveryOption) {
    const daysToAdd = Number(deliveryOption?.deliveryDays ?? 0);
    let date = dayjs();
    let remaining = isNaN(daysToAdd) ? 0 : daysToAdd;

    while (remaining > 0) {
        date = date.add(1, 'day');
        const day = date.day(); // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
            continue; // skip weekends (do not decrement remaining)
        }
        remaining -= 1;
    }

    return date.format('dddd, MMMM D');
}