import eutil from 'ethereumjs-util';
import web3 from './web3.js';
import resource from './resource.js';

var validOwners = [web3.eth.accounts[0]];

function HttpError(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}

function getSigFromHeaders(headers) {
  var r = headers["x-secp256k1-r"];
  var s = headers["x-secp256k1-s"];
  var v = headers["x-secp256k1-v"];

  var sig = {
    r : Buffer.from(r, 'hex'),
    s : Buffer.from(s, 'hex'),
    v : parseInt(v)
  };
  return sig;
}

function getMessageHexBuffer(request) {
  var contractAddress = request.headers['x-contractaddress'];
  var msSinceEpoch = request.headers["x-timestamp"];
  var message = contractAddress + msSinceEpoch;
  var msgHex = web3.sha3(message);
  var msgHexBuffer = eutil.toBuffer(msgHex);
  return msgHexBuffer;
}

function getSignerAddress(request, contractAddress)
{
  var sig = getSigFromHeaders(request.headers);
  var msgHexBuffer = getMessageHexBuffer(request);
  var pubKey = eutil.ecrecover(msgHexBuffer, sig.v, sig.r, sig.s);
  var signerAddress = eutil.bufferToHex(eutil.publicToAddress(pubKey));
  return signerAddress;
}

function getContractInstance(request) {
  var contractAddress = request.headers['x-contractaddress'];
  console.log('contractAddress:', contractAddress);
  var instance = resource.contract.at(contractAddress);
  console.log('owner:', instance.owner());
  console.log('recipient:', instance.recipient());
  console.log('url:', instance.url());
  return instance;
}

function checkTimeStamp(request) {
  var msSinceEpoch = request.headers["x-timestamp"];
  var now = new Date().getTime();
  var delta = Math.abs(now - parseInt(msSinceEpoch));
  var thirtyMinutesInMS = 30 * 60 * 1000;
  if(delta > thirtyMinutesInMS) {
    console.log('timestamp is older than 30 minutes');
    console.log('timestamp:', msSinceEpoch);
    console.log('now:', now);
    console.log('delta:', delta);
    throw new HttpError('invalid timestamp', 403);
  }
}

function checkOwner(request, instance) {

  if(!validOwners.includes(instance.owner())) {
    console.log("owner is unknown!");
    console.log('owner:', instance.owner());
    throw new HttpError('invalid owner', 403);
  }
}

function checkRecipient(request, instance) {
  var signerAddress = getSignerAddress(request);
  if(instance.recipient() !== signerAddress) {
    console.log("signer's address does not match receipient!");
    console.log('recipient:', instance.recipient());
    console.log('signer:', signerAddress);
    throw new HttpError('invalid signer', 403);// forbidden
  }
}

function checkUrl(request, instance) {
  /*


    // check resource part
    if(studyShare.url() !== rootUrl + req.url) {
      console.log("URL does not match");
      console.log(studyShare.url() + '|');
      console.log(req.url + '|');
      res.writeHead(404);
      res.end("");
      return;
    }
  */
}

function getStatusCodeFromError(error) {
  if(typeof error.name !== 'undefined' && error.name === 'BigNumber Error') {
    return 401;  // unauthorized
  }
  if(error.statusCode !== 'undefined') {
    return parseInt(error.statusCode);
  }
  return 500;
}

function getMessageFromError(error) {
  if(typeof error.name !== 'undefined' && error.name === 'BigNumber Error') {
    return "contract does not exist";
  }
  if(error.message !== 'undefined') {
    return error.message;
  }
  return "";
}

function sendError(response, error) {
  console.log(error);
  var statusCode = getStatusCodeFromError(error);
  var message = getMessageFromError(error);
  response.writeHead(statusCode);
  response.end(message);
}

function sendResource(request, response) {
  console.log("access authorized!")
  response.writeHead(200);
  response.end("The Medical Record!");
}

function logRequest(request) {
  console.log('handling http request:', request.url);
  //console.log('req:', request);
  //console.log('url:', request.url);
  //console.log('headers:', request.headers);
}

WebApp.connectHandlers.use("/resource", function(request, response, next) {
  try {
    logRequest(request);
    checkTimeStamp(request);
    var instance = getContractInstance(request);
    checkOwner(request, instance);
    checkRecipient(request, instance);
    checkUrl(request, instance);
    sendResource(request, response);
  } catch(error) {
    sendError(response, error);
  }
});
