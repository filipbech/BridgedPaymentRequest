import * as Comlink from "/node_modules/comlinkjs/comlink.js";

// THIS FILE SHOULD INLINED ON BRIDGE.HTML (on PSP server)

class MyPaymentRequest {

    addEventListener(name, cb) {
        //TODO: also handle the shippingoptionschange event
        this.instance.addEventListener(name, e => {
            e.updateWith(new Promise(res => {               
                cb({
                    target: {
                        //TODO: mock all of this out
                        shippingAddress: {
                            country: e.target.shippingAddress.country
                        }
                    },
                    type: 'shippingaddresschange',
                    updateWith: Comlink.proxyValue((data) => {
                        res(data);
                    })
                });
            }));
        });
    }

    async show(fn) {
        const response = await this.instance.show();

        let token = '';

        await new Promise(res => {
            //this is to simulate the request to the auth-server
            token = 'jhlkahdfjdsakfæsfjksdjflæ';
            res();
        },500);

        /* 
        * example PSP: Quickpay
            await fetch('https://payment.quickpay.net/card', {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                body: serialize({
                    merchant_id: #####,
                    agreement_id: #####,
                    card: {
                        number: response.details.cardNumber,
                        expiration: response.details.expiryMonth + response.details.expiryYear,
                        cvc: response.details.cardSecurityCode
                    }
                })
            }).then(res=> res.json())
            .then(res=> {
                token = res.pull_url
            });
        */

        fn({ 
            //todo: mock all of this
            details: {
                token,
                billingAddress: {
                    country: response.details.billingAddress.country
                }
            },
            payerName: response.payerName,
            complete: Comlink.proxyValue(status => {
                //this closes the payment-dialog UI with the appropriate animation
                response.complete(status)
            })
        });
    }

    constructor(...options) {
        this.instance = new PaymentRequest(...options); 
    }
}



Comlink.expose(MyPaymentRequest, self.parent);


/*
* this is just for the quickpay example to work

    function serialize(obj, prefix) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                    serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }

*/
