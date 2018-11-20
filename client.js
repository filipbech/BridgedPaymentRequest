import * as Comlink from "/node_modules/comlinkjs/comlink.js";

//THIS FILE SHOULD BE A LIBRARY - hosted by PSP

let _paymentRequest;

let _connectionEstablished = false;

export const establishConnection = async () => {
    const ifr = document.createElement('iframe');
    ifr.style.width = '0px';
    ifr.style.height = '0px';
    ifr.style.opacity = '0';
    ifr.style.position = 'absolute';
    ifr.style.pointerEvents = 'none';
    ifr.style.zIndex = '-999';
    ifr.src = 'bridge.html'; //this should be PSP domain
    document.body.appendChild(ifr);
    await new Promise(resolve => ifr.onload = resolve);
    _paymentRequest = await Comlink.proxy(ifr.contentWindow);
    _connectionEstablished = true;
    return true;
} 

export class BridgedPaymentRequest {
    async addEventListener(name, cb) {
        while (!this.instance) {
            await new Promise(res => setTimeout(res, 100));
        }
        this.instance.addEventListener(name, Comlink.proxyValue(event => {
            Object.assign(this, event.target);
            event.target = this;
            cb(event);
        }));
    }

    async show() {
        return new Promise(async res => {
            while(!this.instance) {
                await new Promise(res => setTimeout(res, 100));
            }
            this.instance.show(Comlink.proxyValue(response => {
                this.shippingOption = response.shippingOption;
                this.requestId = response.requestId;
                this.shippingAddress = response.shippingAddress;
                res(response);
            }));
        });
    }

    async init(options) {
        if (!_connectionEstablished) {
            await establishConnection();
        }
        this.instance = await new _paymentRequest(...options);
    }

    constructor(...options) {
        this.init(options);
    }
}