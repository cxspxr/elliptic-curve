const Big = require('big.js');

// SECG recommended for 256 bit EC (secp256k1)
const provenPrime = new Big("115792089237316195423570985008687907853269984665640564039457584007908834671663");
const N = new Big("115792089237316195423570985008687907852837564279074904382605163141518161494337");
const Aparam = new Big(0);
const Bparam = new Big(0);
const G = {
    x: new Big("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    y: new Big("32670510020758816978083085130507043184471273380659243275938904335757337482424")
};

// const privateKey = new Big("72759466100064397073952777052424474334519735946222029294952053344302920927294");

function modInverse(a, n) {
    var lm = new Big(1),
        hm = new Big(0);

    var low = a.mod(n),
        high = n;

    while( low.gt(new Big(1)) ) {
        let ratio = high.minus( high.mod(low) ).div(low);
        nm = hm.minus( lm.times(ratio) );
        let newHigh = high.minus( low.times(ratio) );

        hm = lm;
        lm = nm;
        high = low;
        low = newHigh;
    }

    return lm.mod(n);
}

function ECadd(a, b) {
    var lambda = b[1].minus(a[1])
        .times( modInverse(b[0].minus(a[0]), provenPrime) )
        .mod(provenPrime);
    var x = lambda.times(lambda)
        .minus(a[0])
        .minus(b[0])
        .mod(provenPrime);

    var y = lambda.times( a[0].minus(x) )
        .minus(a[1])
        .mod(provenPrime);

    return [x, y];
}

function ECdouble(a) {
    var lambda = (new Big(3))
        .times(a[0])
        .times(a[0])
        .plus(Aparam)
        .times( modInverse( (new Big(2)).times(a[1]), provenPrime ) )
        .mod(provenPrime);

    var x = lambda.times(lambda)
        .minus( (new Big(2)).times(a[0]) )
        .mod(provenPrime);

    var y = lambda.times( a[0].minus(x) )
        .minus(a[1])
        .mod(provenPrime);

    return [x, y];
}
