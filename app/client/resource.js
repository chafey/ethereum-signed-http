import { ReactiveVar } from 'meteor/reactive-var';

var url = new ReactiveVar("");
var address = new ReactiveVar("");

function create(_url, _receipient) {
  return new Promise((resolve, reject) => {
    Meteor.call('create', _receipient, _url, function(err, resp) {
      if(err) {
        alert(err);
        return;
      }
      url.set(_url);
      address.set(resp);
      resolve();
    });
  });
}

function attach(_address) {
  console.log('address:', _address);
  return new Promise((resolve, reject) => {
    Meteor.call('attach', _address, function(err, resp) {
      if(err) {
        alert(err);
        return;
      }
      url.set(resp);
      address.set(_address);
      resolve();
    });
  });
}

export default {
  url: url,
  address: address,
  create: create,
  attach: attach
}
