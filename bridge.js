import * as Comlink from "/node_modules/comlinkjs/comlink.js";

// THIS FILE SHOULD INLINED ON BRIDGE.HTML (on PSP server)

const shippingAddressToObject = obj => {
    const {
        addressLine, city, country, dependentLocality, languageCode, organization, phone, postalCode, recipient, region, sortingCode
    } = obj;
    return {
        addressLine, city, country, dependentLocality, languageCode, organization, phone, postalCode, recipient, region, sortingCode
    };
}

class MyPaymentRequest {
    addEventListener(name, cb) {
        this.instance.addEventListener(name, e => {
            const shippingAddress = shippingAddressToObject(e.target.shippingAddress);
            e.updateWith(new Promise(res => {               
                cb({
                    target: {
                        shippingOption: e.target.shippingOption,
                        id: e.target.id,
                        shippingAddress
                    },
                    type: name,
                    updateWith: Comlink.proxyValue((data) => {
                        res(data);
                    })
                });
            }));
        });
    }

    async show(fn) {
        const response = await this.instance.show();

        const {
            methodName,payerEmail,payerName,payerPhone,requestId,shippingOption
        } = response;

        const paymentResponse = {
            methodName,payerEmail,payerName,payerPhone,requestId,shippingOption,
            shippingAddress: shippingAddressToObject(response.shippingAddress),
            details: {
                token: '',
                billingAddress: Object.assign({},response.details.billingAddress)
            }
        };

        await new Promise(res => {
            //this is to simulate the request to the auth-server
            paymentResponse.details.token = 'jhlkahdfjdsakfæsfjksdjflæ';
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
                paymentResponse.details.token = res.pull_url
            });
        */

        fn(Object.assign(paymentResponse,{             
            complete: Comlink.proxyValue(status => {
                //this closes the payment-dialog UI with the appropriate animation
                response.complete(status)
            })
        }));
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
