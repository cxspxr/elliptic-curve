const Big = require('big.js');

// SECG recommended for 256 bit EC (secp256k1)
const provenPrime = new Big("115792089237316195423570985008687907853269984665640564039457584007908834671663");
const N = new Big("115792089237316195423570985008687907852837564279074904382605163141518161494337");
const Aparam = new Big(0);
const Bparam = new Big(7);
const G = [
    new Big("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    new Big("32670510020758816978083085130507043184471273380659243275938904335757337482424")
];

const privateKey = new Big("7275946610006439707395277705242447433451973594622202929495205334430292092729");

Big.prototype.intDivide = function(b) {
    return this.minus( this.mod(b) ).div(b);
}

Big.prototype.to = function(base) {
    var converted = '',
        table = {
            "10": "a",
            "11": "b",
            "12": "c",
            "13": "d",
            "14": "e",
            "15": "f"
        };

    a = this;

    while( a.gte(new Big(1)) ) {
        let remainder = a.mod(new Big(base)).toFixed();
        if( +remainder > 9) {
            remainder = table[remainder];
        }

        converted = remainder + converted;
        a = a.intDivide(new Big(base));
    }

    return converted;
}

String.prototype.zfill = function(width) {
    return Array(this.length - width).fill(0).join('') + this;
}

Big.prototype.modInverse = function(n) {
    var a = this;

    var lm = new Big(1),
        hm = new Big(0);

    var low = a.mod(n),
        high = n;

    while( low.gt(new Big(1)) ) {
        let ratio = high.intDivide(low);
        nm = hm.minus( lm.times(ratio) );
        let newHigh = high.minus( low.times(ratio) );

        hm = lm;
        lm = nm;
        high = low;
        low = newHigh;
    }

    return lm.mod(n);
}

function ECAdd(a, b) {
    var lambda = b[1].minus(a[1])
        .times( b[0].minus(a[0].modInverse(provenPrime)) )
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

function ECDouble(a) {
    var lambda = (new Big(3))
        .times(a[0])
        .times(a[0])
        .plus(Aparam)
        .times( (new Big(2)).times(a[1].modInverse(provenPrime)) )
        .mod(provenPrime);

    var x = lambda.times(lambda)
        .minus( (new Big(2)).times(a[0]) )
        .mod(provenPrime);

    var y = lambda.times( a[0].minus(x) )
        .minus(a[1])
        .mod(provenPrime);

    return [x, y];
}

function ECMultiply(genPoint, privKey) {
    if( privKey.eq(new Big(0)) || privKey.gte(N) ) {
        throw new Error('Invalid Private Key');
        return;
    }

    var binaryPrivate = privKey.to(2),
        q = genPoint;

    var len = binaryPrivate.length;

    for(var i = 1; i <= len; i++ ) {
        q = ECDouble(q);
        if(binaryPrivate[i] == "1") {
            q = ECAdd(q, genPoint);
        }
    }

    return q;
}

function genCompressedPublicKey(privKey) {
    var publicKey = ECMultiply(G, privKey);

    if( publicKey[1].mod(2) == "1" )
        return "03" + publicKey[0].to(16).zfill(64);
    else
        return "02" + publicKey[0].to(16).zfill(64);
}

console.log(genCompressedPublicKey(privateKey));
