  // Set defaults for basic controls
  // -----------------------

  const isSafariEngine = (window.navigator.userAgent.toLowerCase().indexOf('safari') > -1);  // IOS may use different settings

  defaultSourceOptions = {
    src: "https://livetree.azureedge.net/filecoin/OpeningKeynoteWithFileCoinJuanBenetIntroducesLivetree.mp4", 
    type: "video/mp4",
    itemUrl: config_optionsDefaults.web3VideoItemProtocolEndpoint,
    drmUrl: config_optionsDefaults.web3VideoDRMTokenEndpoint,
    linkUrl: config_optionsDefaults.videojsCTAOverlayButtonLink,
    embed: true,
    embedUrlItem: config_optionsDefaults.web3VideoEmbedQueryStringItem,
    embedUrlSrc: config_optionsDefaults.web3VideoEmbedQueryStringSrc,
    useW3Endpoints: config_optionsDefaults.useWeb3ApiEndpoints,
    certificateUri: config_optionsDefaults.web3VideoDRMCertificateUri,
    autoplay: true,
    controls: true,
    defaultVolume: 0.85,
    height: 400,
    width: 600,
    controlBar: {
      fullscreenToggle: true,
      children: {
        playToggle: true,
        remainingTimeDisplay: true,
        timeDivider: true,
        currentTimeDisplay: true,
        subsCapsButton: true,
        durationDisplay: true,
        progressControl: true,
        volumePanel: {
          inline: false
        }
      }
    },
    chromecast: {},
    html5: {
      nativeTextTracks: false,
      vhs: {
        overrideNative: !isSafariEngine
      }
    },
    errorDisplay: true // todo temporary
  };  
  // -----------------------
  
  function getWeb3VideoProtocol(itemData) {

    // This defines the protocol data in the following structure, retreived from the endpoint provided in itemUrl
    // If no endpoint Url is specified, it is possible to build the prototocol locally or source elsewhere in code
    // Strucure is extended to support future enhancements
    //
    //    mediaId = Id,
    //    MediaElementId = // will give you a shortcut to the MediaElementId with the video of type 999
    //    CoverPic = MediaDefaultLiveTree.FileUrl,
    //    TrailerUrl = Trailer?.FileUrl,

    //     MediaElements = arrray[] of MediaElements 
          //{
          //    MediaElementId: int,  
          //    MediaType: int,
                //Advertising = 100,
                //TrailerMediaType = 600,
                //AmsVideo = 999,
                //Video = 888,
                //Poster = 111,
                //SecondPosters = 112,
                //Vtt = 555
          //    MIMEType: string,
          //    IsAudio: boolean,
          //    IsVideo: boolean,
          //    CdnHlsV3Url: string,
          //    CdnSmoothStreamingUrl: string,
          //    CdnPegDashV4Url: string,
          //    CdnHlsV4Url: string,
          //    LicenseSmoothStreamingWidevineUrl: string,
          //    LicenseSmoothStreamingPlayreadyUrl: string,
          //    LicensePegDashV4WidevineUrl: string,
          //    LicensePegDashV4PlayreadyUrl: string,
          //    LicenseHlsV3FairPlayBaseLicenseAcquisitionUrl: string,
          //    LicenseHlsV4FairPlayBaseLicenseAcquisitionUrl: string,
          //    CdnCommonEncryptionKid: string,
          //    CdnCommonEncryptionCbcsKid: string,
          //    GeoCheckApprovedCountriesCommaSeparatedIsoCodes: string,
          //    GeoCheckRejectedCountriesCommaSeparatedIsoCodes: string,
          //    IsPublic: boolean,
          //    FileExtension: string
          //};

    //    Price: number,
    //    ItemForm : string,

    //    SeedTotalRaisedToDate: number,
    //    SeedTargetTotalRaiseAmount: number,

    //    PublishRewardType: string,
    //    PublishRewardAmount:  number,
    //    PublishRewardPercentage: number,


    //    PublishTypeDesc: string,
    //    PublishType: string,
    //    PublishTypeDonationAmount: number,
    //    PublishTypeDonationQuantity: number,
    //    PublishTypeDonationReserveAmount: number,
    //    PublishTypeFixedPriceBuyPrice: number,
    //    PublishTypeFixedPriceQuantity: number,
    //    PublishTypeFreeQuantity: number,
    //    PublishTypeSubscriptionBuyPrice: number,
    //    PublishTypeSubscriptionPeriodType: string,
    //    PublishTypeSubscriptionPeriodTypeOtherFrequency: string,

    //    Title : string,
    //    SubTitle : string,
    //    IMDBId : string,
    //    Actors : string, [can be comma separated]
    //    Genres : string, [can be comma separated]
    //    Description : string,
    //    KeyWords : string, [can be comma separated]
    //    Category : string
    //

    return new Promise ((resolve, reject) => {
      // First check if endpoints are enabled
      if (this.config_optionsDefaults.useWeb3ApiEndpoints) {
        this.getDatabyUrl(itemData.itemUrl).then((data) => {
           data.text().then((res) => {
            var fulltext = res;
            if (this.isJson(fulltext)) {
              var itemdetails = JSON.parse(fulltext);
               if(itemdetails.errorCode == 0) {
                if (typeof itemdetails.returnVal != "undefined" ) {
                  //console.log("itemdetails: ", itemdetails);
                  this.itemName = itemdetails.returnVal.Title;
                  if (!itemdetails.returnVal.linkUrl) {
                    itemdetails.returnVal.linkUrl = itemData.linkUrl;
                  }
                  resolve(itemdetails.returnVal);
                } else {
                  reject("api error (no returnVal) from  " + itemData.itemUrl);
                }
              } else {
                if (typeof itemdetails.errorCode != 'undefined') {
                  reject("api error returned; " + itemdetails.errorCode + ": " + itemdetails.errorValues );
                } else {
                  if  (typeof itemdetails.Message != 'undefined') {
                     reject("api error message returned; " + itemdetails.Message + ": " + itemdetails.MessageDetail )
                  } else {
                     reject("api error (unknown); " + itemdetails); 
                  }
                }
              }
            } else {
              reject("api error (not json) returned by  " + itemData.itemUrl);
            }
          }).catch((err) => reject(err) )
        }).catch((err) => reject(err) );

      } else {
        // *** Add function to return protocol data from alternate source  **
        reject("no alternate to endpoints provided.");
      }
    });
  } 

  function getWeb3VideoDRMProtocol(itemUrl) {
    
    // This expects to return protocol in the following structure, retreived from the endpoint provided in itemUrl
    //
    // ClientIpAddress: string
    // TokenWidevine: string
    // TokenPlayReady: string
    // ErrorMessage: string (expecty null )
    // ErrorCode: int
    // UserDevice: string

    return new Promise ((resolve, reject) => {
      if (this.config_optionsDefaults.useWeb3ApiEndpoints) {
        this.getDatabyUrl(itemUrl).then((data) => {

          data.text().then((res) => {

            var fulltext = res;
            if (this.isJson(fulltext)) {
              var itemdetails = JSON.parse(fulltext).returnVal;
              resolve(itemdetails);
            } else {
               reject("api error (not json) returned by  " + itemUrl);
            }
          }).catch((err2) => reject(err2) )
        }).catch((err) => reject(err) );

      } else {
        // *** Add function to return DRM protocol data from alternate source  **
        reject("no alternate to endpoints provided.");
      }
    });
  } 

  function getSourceOptions (id) {
  	var queryParams = window.location.href;
  	var sourceOptions = {};
    var sourceOptionsHTML_Attributes = document.getElementById(id).attributes;
    if (typeof sourceOptionsHTML_Attributes.options != 'undefined') {
      var sourceOptionsHTML_Options = sourceOptionsHTML_Attributes.options.value;
    } 

    var sourceOptionsURL = getQueryParamOptions(queryParams);
    delete sourceOptionsHTML_Attributes.options


    // Config options should have been defined in earlier script
    if (typeof defaultSourceOptions != 'undefined') {
    	sourceOptions = defaultSourceOptions;
    }

    // Use any attributes provided to over-write defaults
    if (typeof sourceOptionsHTML_Attributes != 'undefined') {
    	mergeInto(sourceOptions, sourceOptionsHTML_Attributes);
    }

	// Add or over-write with any options provided
    if (typeof sourceOptionsHTML_Options != 'undefined') {
    	var obj = eval('(' + sourceOptionsHTML_Options + ')');
	    mergeOver(sourceOptions, obj);
    }

    if (exists(sourceOptionsURL)) {
      if (isJson(sourceOptionsURL)) {
      	mergeOver(sourceOptions, JSON.parse(sourceOptionsURL));
      } else {
      	console.log("Invalid URL query params. Ignoring: ", queryParams);
      }
    } else {
      // Assume no URL source options
    }

    return sourceOptions;
 
  };

  function addWeb3ProtocolItemDetails(web3SourceOptions) {

  	return new Promise ((resolve, reject) => {

	  	if(exists(web3SourceOptions.itemUrl)) {
	  		getWeb3VideoProtocol(web3SourceOptions).then( videoItemProtocolMediaElement => {
	  			// console.log("videoItemProtocolMediaElement: ", videoItemProtocolMediaElement);

	  			if(exists(videoItemProtocolMediaElement.Title)) {web3SourceOptions.title = videoItemProtocolMediaElement.Title};
	  			if(exists(videoItemProtocolMediaElement.CoverPic)) {web3SourceOptions.poster = videoItemProtocolMediaElement.CoverPic};
	  			if(typeof videoItemProtocolMediaElement.MediaElements != 'undefined') {

	  				// Get media element & subtitles from arrary returned
		  			var mediaElement = videoItemProtocolMediaElement.MediaElements.filter((x) => (x.MediaType==999)&&(x.MediaElementId==videoItemProtocolMediaElement.MediaElementId))[0];
            var subtitleElements = videoItemProtocolMediaElement.MediaElements.filter((x) => (x.MediaType==555));
            var subtitleElement = subtitleElements[0];
	    			if (typeof mediaElement != 'undefined') {
	    				// Update drmUrl with ElementId
	    				web3SourceOptions.drmUrl = web3SourceOptions.drmUrl.replace("[elementId]", videoItemProtocolMediaElement.MediaElementId);
	    				// console.log("web3SourceOptions.drmUrl: ", web3SourceOptions.drmUrl);
	    				// Set source to media element
	    				web3SourceOptions.sources = {
	    					src: isSafariEngine ? mediaElement.CdnHlsV4Url : mediaElement.CdnPegDashV4Url, // Different source required for IOS
	          				type: isSafariEngine ? 'application/x-mpegUrl' : 'application/dash+xml',       // Different type required for IOS
	          			  }
                web3SourceOptions.LicensePegDashV4PlayreadyUrl = mediaElement.LicensePegDashV4PlayreadyUrl;
                web3SourceOptions.LicensePegDashV4WidevineUrl = mediaElement.LicensePegDashV4WidevineUrl;
	         			web3SourceOptions.LicenseHlsV4FairPlayBaseLicenseAcquisitionUrl = mediaElement.LicenseHlsV4FairPlayBaseLicenseAcquisitionUrl.replace('skd:', 'https:'); 

                //Remove consumed items from options
                delete web3SourceOptions.itemUrl;
                delete web3SourceOptions.src;
                delete web3SourceOptions.type;

	         			resolve("endpoint"); 				
	    			} else {
	    				console.log("addWeb3ProtocolItemDetails: No media element found");
	    			}

            // Check if subtitles provided in videoItemProtocolMediaElement
            if (typeof subtitleElement != 'undefined') {
              if (typeof subtitleElement.FileUrl != "undefined") {
                if (isJson(subtitleElement.FileUrl)) {
                  var fileUrl = JSON.parse(subtitleElement.FileUrl);
                  var trackLang = Object.keys(fileUrl)[0];
                  web3SourceOptions.track = {
                    kind: "subtitles",
                    src: fileUrl[trackLang],
                    srclang: trackLang.substr(0,2).toLowerCase(),
                    label: trackLang,
                    defaut: true
                  };
                };
              };
            }

	  			} else {
	  				// Try simple usage
            setSimpleSource(web3SourceOptions);
	  				resolve("no-endpoint");
	  			}
	  		}).catch(err => {
	  			console.log("addWeb3ProtocolItemDetails error:", err)
          // Try simple usage
          setSimpleSource(web3SourceOptions);
          resolve("no-endpoint");
	  		})
	  	} else {
	  		// Try simple usage
        setSimpleSource(web3SourceOptions);
	  		resolve("no-endpoint");
	  	}
	})
  }

  function addWeb3ProtocolDrmDetails(web3SourceOptions) {

  	return new Promise ((resolve, reject) => {

	   	if(exists(web3SourceOptions.drmUrl)) {
	   		getWeb3VideoDRMProtocol(web3SourceOptions.drmUrl).then(DRMtokens => {
	   			if(typeof DRMtokens == "undefined") {
	              // Cannot play content as no DRM token found
                console.log("addWeb3ProtocolDrmDetails error(2), no DRM found at: ", web3SourceOptions.drmUrl);
                resolve("no-drm");
	            } else {
	            	// Set KeySystem
	           		web3SourceOptions.sources.keySystems = {
	            		'com.microsoft.playready': {
		              		url: web3SourceOptions.LicensePegDashV4PlayreadyUrl,
				            licenseHeaders: {
				              authorization: 'Bearer ' + DRMtokens.TokenPlayReady
				            }
			            },
			            'com.widevine.alpha': {
			                url: web3SourceOptions.LicensePegDashV4WidevineUrl,
			                licenseHeaders: {
			                  authorization: 'Bearer ' + DRMtokens.TokenWidevine
			                }
			            },
			            'com.apple.fps.1_0': {
			                licenseUri: web3SourceOptions.LicenseHlsV4FairPlayBaseLicenseAcquisitionUrl,
			                certificateUri: web3SourceOptions.certificateUri,
			                licenseHeaders: {
			                  authorization: 'Bearer ' + DRMtokens.TokenFairPlay
			                }
			            }		         
			          }
                //Remove consumed items from options
                delete web3SourceOptions.LicenseHlsV4FairPlayBaseLicenseAcquisitionUrl;
                delete web3SourceOptions.LicensePegDashV4WidevineUrl;
                delete web3SourceOptions.LicensePegDashV4PlayreadyUrl;
                delete web3SourceOptions.certificateUri;
                delete web3SourceOptions.drmUrl;
			          resolve("drm");
	            }
	   		}).catch(err => {
	 			  console.log("addWeb3ProtocolDrmDetails error(1):", err)
	  			reject(err);   			
	   		})
		  } else {
	  		// Assume non-drm usage
	  		resolve("non-drm");
	  	}

	  })

  }

  function setSimpleSource(web3SourceOptions) {
    // Try to promote src & type into sources
    web3SourceOptions.sources = {
      src: web3SourceOptions.src,
      type: web3SourceOptions.type
    }

    // Set embedUrl for simple source
    if (exists(web3SourceOptions.type)) {
      web3SourceOptions.embedUrl = getUrlRoot() + "?" + web3SourceOptions.embedUrlSrc.replace("[src]", web3SourceOptions.src).replace("[type]", web3SourceOptions.type);
    } else {
      web3SourceOptions.embedUrl = getUrlRoot() + "?" + web3SourceOptions.embedUrlSrc.replace("[src]", web3SourceOptions.src).replace("[type]", "");
    }

    //Remove consumed items from options
    delete web3SourceOptions.src;
    delete web3SourceOptions.type;
    delete web3SourceOptions.embedUrlSrc;
 
  }

  function getWeb3SourceOptions (id) {

  	return new Promise ((resolve, reject) => {
	  	var web3SourceOptions = getSourceOptions(id);

	  	// Check if an mediaId is specified
	  	if(exists(web3SourceOptions.mediaId)) {
	  			// Build itemUrl & drmUrl & linkUrl
  			web3SourceOptions.itemUrl = web3SourceOptions.itemUrl.replace("[mediaId]", web3SourceOptions.mediaId);
  			web3SourceOptions.drmUrl = web3SourceOptions.drmUrl.replace("[mediaId]", web3SourceOptions.mediaId);
        web3SourceOptions.linkUrl = web3SourceOptions.linkUrl.replace("[mediaId]", web3SourceOptions.mediaId);
        web3SourceOptions.embedUrlItem = web3SourceOptions.embedUrlItem.replace("[mediaId]", web3SourceOptions.mediaId);

        //Remove consumed items from options
        delete web3SourceOptions.mediaId;

	  	}

	   	// Check if a referId is specified
	  	if(exists(web3SourceOptions.referId)) {
	  			// Build itemUrl & drmUrl & linkUrl
  			web3SourceOptions.itemUrl = web3SourceOptions.itemUrl.replace("[referId]", web3SourceOptions.referId);
  			web3SourceOptions.drmUrl = web3SourceOptions.drmUrl.replace("[referId]", web3SourceOptions.referId);
  			web3SourceOptions.linkUrl = web3SourceOptions.linkUrl.replace("[referId]", web3SourceOptions.referId);
        web3SourceOptions.embedUrlItem = web3SourceOptions.embedUrlItem.replace("[referId]", web3SourceOptions.referId);

        //Remove consumed items from options
        delete web3SourceOptions.referId;
		}

    // Add current url root to embedUrl
    web3SourceOptions.embedUrl = getUrlRoot() + "?" + web3SourceOptions.embedUrlItem;

    //Remove consumed items from options
    delete web3SourceOptions.embedUrlItem;
	 	
	 	// Check if we now have an itemUrl from which to retreive web3 media data 
		//Get media data and add into web3SourceOptions)


		addWeb3ProtocolItemDetails(web3SourceOptions).then( res => {
			addWeb3ProtocolDrmDetails(web3SourceOptions).then (res2 => {
				resolve(web3SourceOptions);
			}).catch(err2 => {
				console.log("getWeb3SourceOptions error(2): ", err2);
				reject(err2);
			})
		}).catch(err1 => {
			console.log("getWeb3SourceOptions error(1): ", err1);
			reject(err1);
		});
	})
}
 
// Low-level Library functions
// -----------------------------------
   function isJson (teststr) {
    // Basic test for json format
    if(teststr) {
      try {
        JSON.parse(teststr);
      } catch (e) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  function mergeOver (objA, objB) {
  	// Use shallow merge for now
  	// TODO: Extend to deep merge

  	for (key in objB) {
  		if (objB.hasOwnProperty(key)) {
    		if (typeof objB[key] != 'undefined') {
    			objA[key] = objB[key];
    		}
    	}
	}

  }
  
  function mergeInto (objA, objB) {
  	// Use shallow merge for now
  	// TODO: Extend to deep merge
    var obj;

  	for (key in objA) {
  		if (objA.hasOwnProperty(key)) {
    		switch (typeof objB[key]) {
          case 'undefined':
            break;
          case 'object':
            obj = objB[key].value;
            if (obj == "") {
              obj = true;
            };
            objA[key] = obj
            break;
          case 'string':
            obj = objB[key];
            if (obj == "") {
              obj = true;
            };
            objA[key] = obj
            break;
          default:
            obj = objB[key];
            objA[key] = obj;
            break;
        }
      }  
    }
	}

  function exists (obj) {
  	if(typeof obj != 'undefined') {
  		if(obj.length) {
  			return true;
  		}
  	}
  	return false
  }

  function getDatabyUrl(Url) {
  	// Note: returns a promise
    return fetch(Url, {method: 'get', mode: "cors"})
  }

  function getQueryParamOptions (qp) {
    // Parses query parameters and returns a formatted json string in the form "{....}"
    // Query parameters can be passed as either ?mediaId=NNNNN&referId=aaaaaa
    // ... or as ?options={...}
    var Url = qp.split("%20").join("").split(" ").join("").split("%22").join('"').split("%27").join("'").split("%7B").join("?").replace("='", "=").replace('="', '=').replace("mediaId", "mediaId").replace("referid", "referId");
    if(Url.substring(Url.length-1)=="'"||Url.substring(Url.length-1)=='"') {
     Url = Url.substring(0,Url.length - 1);
    }
    Url = Url.split("'").join('"');
    var optPos = Url.indexOf("?options=");
    if (optPos >= 0) {
      return Url.substring(optPos+9);
    } else {
      optPos = Url.indexOf("?");
      if(optPos >=0) {
        Url = '{"' + Url.substring(optPos+1).split('=').join('": "').split('&').join('", "') + '"}';
        return(Url);
      } 
      return "";
    }
  }

  function getUrlRoot() {
    var queryParams = window.location.href;
    var optPos = queryParams.indexOf("?")
    if (optPos >= 0) {
      queryParams = queryParams.substring(0, optPos);
    }
    return queryParams;
  }

// -----------------------------------