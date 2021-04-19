  /* // External libraries for Ceramic
  const IPFS = require('ipfs');
  const dagJose = require('dag-jose');
  const multiformats = require('multiformats/basics'); // Need version multiformats@3.0.3
  const legacy = require('multiformats/legacy');
  const DID = require('dids');
  const KeyResolver = require('@ceramicnetwork/key-did-resolver'); // *** Undeclared dependency *** Need version @ceramicnetwork/key-did-resolver@0.2.0 at least
  const { Ed25519Provider } = require('key-did-provider-ed25519');
  */

  var volume;
  var web3UserSessionId = "";
  var title = "";
  var event_player = {};


  // Config supplied in videojs-web3-config.js

  pushWeb3VideoEvent = function(eventType, viewTime) {

    setWeb3UserSessionId();
    // Pushes video events to IPFs node ... to use a different mechanism, create a differnt function and globally replace pushIPFS in the code.
    // Note: this is a simplistic json object for test purposes for this example. It is expected that for production use a mode sophisticated
    // structure would be used. Ideally this would include functionality to chain saved event together for retrieval.
    console.log("push data: ", "{web3UserSessionId: " + web3UserSessionId + "," + eventType + ":" + Date() + ", title: '" + title +"', viewTime: " + viewTime + "}");
    
    const body = new FormData;
    body.append("file", "{web3UserSessionId: " + web3UserSessionId + "," + eventType + ": " + Date() + ", title: '" + title +"', viewTime: " + viewTime + "}");

    
    // Save to IPFS here
    fetch(config_optionsDefaults.IPFSNode, {
      method: 'post',
      body
    }).then(res => {
      res.text().then(fulltext => {
        console.log('ipfs post result: ', fulltext);
        // Add function to push IPFS data to filecoin here:
       })
    }
    ).catch(err => {
      console.log('ipfs post error: ', err);
    });
    // ----------------

    // Alternate save event can be inserted here


    // ----------------
  }

  subscribeWeb3OnPlayerEvents = function(id, itemName) {

    var event_player = videojs(id);   
    // console.log("Subscribing to player events: ", player);
    // Capture basic player events
    event_player.on('play', function() {pushWeb3VideoEvent('play', event_player.currentTime() )});     
    event_player.on('pause', function() {pushWeb3VideoEvent('pause', event_player.currentTime() )});     
    event_player.on('stop',  function() {pushWeb3VideoEvent('stop', event_player.currentTime())});     
    event_player.on('volumechange', function () {
      // Looks like stop comes through as a pause
      if (event_player.muted()){
        pushWeb3VideoEvent('muted', event_player.currentTime());            
      } else {
         if(Math.abs(volume - player.volume()) > 0.1 ) {
           pushWeb3VideoEvent('volumechange', event_player.currentTime());     
           volume = player.volume();
         }
      }
    });
    event_player.on('timeupdate', function () {
      if (Math.abs(event_player.currentTime()-viewTime) > 30) {
        pushWeb3VideoEvent('timeupdate', event_player.currentTime());     
      }
    });
  }

  makeSessionId = function(len) {
    // Creates a pseudo-random id of the given number of characters
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < len; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  setWeb3UserSessionId = function() {
    // This creates a userId against which to record video events. Depending on usage, a userId may be available from:
    // a) MetaMask or other injected web3 source
    // b) Filecoin wallet from a connected lotus node
    // c) Login detail from application
    // d) Using a seed supplied and converting to a DID (using Ceramic or other resolver)

    if (config_optionsDefaults.useCeramic) {
      // Enter details here to get session id as a DID using a specified seed with Ceramic DID resolver
     sessionId = initDID("get seed from external source");

    } else {

      // This creates an anonymous id against which to record activity. 
      // Note: if being used within a wider system, it may be possible to utilise an alternative login or other id here
      if (web3UserSessionId.length == 0) {
        sessionId = localStorage.getItem("web3UserSessionId");
        if (sessionId) {
          web3UserSessionId = sessionId;
        } else {
          sessionId = makeSessionId(32);
          localStorage.setItem("web3UserSessionId", sessionId);
          web3UserSessionId = sessionId;
        }
      }
    }
  }

  initDID =function (seed) {
    const provider = new Ed25519Provider(seed);
    //console.log(DID);
    const did = new DID.DID({ provider });
    const keyres = KeyResolver.default.getResolver();
    //console.log("keyres: ", keyres);
    //const keyafunc = await keyres.key;
    did.setResolver({ registry: keyres});
    did.authenticate() ;   
    console.log("Connected with : ", did.id); 
    return did;
  }

  

  // Function to initiaite IPFS instance if not using IPFS node passed in via config
  initIPFS = async function () {
    multiformats.multicodec.add(dagJose.default);
    const dagJoseFormat = legacy(multiformats, dagJose.default.name);
    //console.log("Starting IPFS.");
    const ipfs = await IPFS.create({ ipld: { formats: [dagJoseFormat] } });
    return ipfs    
  }

  // Function to add a signed object to IPFS instance
  addSignedObject = async function (payload, did, ipfs) {
    // sign the payload as dag-jose
    const { jws, linkedBlock } = await did.createDagJWS(payload);
    // put the JWS into the ipfs dag
    const jwsCid = await ipfs.dag.put(jws, { format: 'dag-jose', hashAlg: 'sha2-256' });
    // put the payload into the ipfs dag
    console.log("jws.link: ", jws.link);
    await ipfs.block.put(linkedBlock, { cid: jws.link });
    return jwsCid;
  }
