import './accessResource.html';
import { HTTP } from 'meteor/http'
import eutil from 'ethereumjs-util';
import resource from './resource.js';
import { ReactiveVar } from 'meteor/reactive-var';

var resourceValue = new ReactiveVar("");

function hexSigToRSV(hexSig) {
  var sgn = hexSig;
  var r = eutil.toBuffer(sgn.slice(0,66));
  //console.log('r', r);
  var s = eutil.toBuffer('0x' + sgn.slice(66,130));
  //console.log('s', s);
  var v = eutil.bufferToInt(eutil.toBuffer('0x' + sgn.slice(130,132)));
  return {
    r: r,
    s: s,
    v: v
  };
}

function doGet(contractAddress, url) {

  var msSinceEpoch = new Date().getTime();

  var message = contractAddress + msSinceEpoch;
  var msgHex = web3.sha3(contractAddress + msSinceEpoch);

  web3.eth.sign(web3.eth.accounts[0], msgHex, function(err, result) {
    if(err) {
      console.log('error signing:', err);
      return;
    }

    var sig = hexSigToRSV(result);

    //console.log(result);
    HTTP.call('GET', url, {
      headers: {
        "x-secp256k1-r" : sig.r.toString('hex'),
        "x-secp256k1-s" : sig.s.toString('hex'),
        "x-secp256k1-v" : sig.v,
        "x-timestamp" : msSinceEpoch,
        "x-contractaddress" : contractAddress
      }
    }, function(err, resp) {
      if(err) {
        resourceValue.set(err);
        return;
      }
      //console.log(resp);
      resourceValue.set(resp.content);
    });
  });
}

Template.accessResource.events({
  'click button'(e, instance) {
    e.preventDefault();
    var url = resource.url.get();
    var contractAddress = resource.address.get();
    doGet(contractAddress, url);
  }
});

Template.accessResource.helpers({
  resource() {
    return resourceValue.get();
  },
  url() {
    return resource.url.get();
  }
});
