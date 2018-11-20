# BridgedPaymentRequest

The goal of this POC is to enable the paymentRequest api for merchants, without ever getting access to creditcard-info, but just a token instead. This should be implemented by PaymentServiceProviders that already has the required PCI-certifications. 

The API should be indifferent to the developer, except that she (or he) needs to new-up BridgetPaymentRequest instead of regular PaymentRequest.

To try it out, run a server and point your browser to the client.html file.

This is work-in-progress and just playing around - jump in if you'd like!
