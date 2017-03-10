import resource from './resource.js';

Template.createResource.events({
  'click #create'(e, instance) {
    //console.log(e,instance);
    e.preventDefault();
    var url = $('#url').val();
    resource.create(url);
  },
  'click #attach'(e, instance) {
    console.log('attach');
    //console.log(e,instance);
    e.preventDefault();
    var address = $('#address').val();
    resource.attach(address);
  }
});

Template.createResource.helpers({
  address() {
    return resource.address.get();
  },
  url() {
    if(resource.url.get().length > 0) {
      return resource.url.get();
    }
    return "/resource/1";
  }
});
