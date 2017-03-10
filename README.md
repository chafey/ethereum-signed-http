# ethereum-signed-http
Repository showing how to make ethereum account signed http requests from a Dapp
to a node.js server using a smart contract

Pre-requisites
--------------

1) Setup a private ethereum network from here: https://github.com/chafey/ethereum-private-network

2) [Metamask](https://metamask.io/) with supported browser (Chrome is what I use)

3) Meteor

How to run
----------

1) Make sure your ethereum private test network is running.  

2) Create an ethereum account in metamask

3) Make sure metamask is connected to the localhost 8545 network.  

Start the meteor application:

> cd app

> meteor

Open your web browser to localhost:3000

How to use
----------

1) Press "Create" to create a Resource smart contract instance for the
   URL or "attach" if you have the address of a previously created
   Resource smart contract

2) Press "Get" to access the resource.  It takes a few seconds to mine
   newly created Resource smart contracts - if you press get before it is
   mined you will get an error


What is happening
-----------------

The Resource smart contract specifies the URL to a resource, who owns the
resource and the recipient account that can access the resource.  When the
recipient wants to access the resource, it makes a HTTP GET to the URL
and signs the request using its ethereum account.  The http server validates
the HTTP request by verifiying the signature and checking the Resource
smart contract.
