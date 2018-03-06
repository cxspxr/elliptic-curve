const Big = require('big.js');
const provenPrime = (new Big(2)).pow(256)
    .minus(new Big(2).pow(32))
    .minus(new Big(2).pow(9))
    .minus(new Big(2).pow(8))
    .minus(new Big(2).pow(7))
    .minus(new Big(2).pow(6))
    .minus(new Big(2).pow(4))
    .minus(new Big(1));
