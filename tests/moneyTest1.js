import { formatCurrency } from '../scripts/utils/money.js';

console.log('coverts cents into dollars')

if (formatCurrency(2095) ==='20.95') {
    console.log('Test passed');
} else {
    console.log('Test failed');
}


if(formatCurrency(2000.5) === '20.01') {
    console.log('Test passed');
} else {
    console.log('Test failed');
}