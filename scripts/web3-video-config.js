//-------------------------------------------------------------------------------------
// Set useWeb3ApiEndpoints to *false* if supplying Media data via an alternate function - to be specified in getWeb3VideoProtocol function in web3-video-sources
//private web3BaseApiUrl = "https://fairweb.livetree.com/api/Web3Extensions/";

web3BaseApiUrl = "https://fairweb.livetree.com/api/Web3Extensions/";
config_optionsDefaults = { ///add below items into this object
  useWeb3ApiEndpoints : true,
  useCeramic: false,
  web3VideoItemProtocolEndpoint : web3BaseApiUrl + "GetItemDetailsById?itemId=[mediaId]&branchReferrerUserName=[referId]",
  web3VideoDRMTokenEndpoint : web3BaseApiUrl + "GetDRMToken?mediaElementId=[elementId]&itemId=[mediaId]",
  web3VideoDRMCertificateUri : "https://www.livetree.com/fairplay.msbs",
  web3VideoItemProtocolStatsEndpoint : web3BaseApiUrl + "SaveStats",
  web3VideoDRMQueryString : "?mediaElementId=[elementId]&mediaId=[mediaId]",
  web3VideoEmbedQueryStringItem : "?mediaId=[mediaId]&referId=[referId]",
  web3VideoEmbedQueryStringSrc : "?src=[src]&type=[type]",
  videojsCTAOverlayButtonLink:  "https://www.livetree.com?branchReferrerUserName=[referId]",
  IPFSNode:  "https://ipfs.infura.io:5001/api/v0/add" }
//-------------------------------------------------------------------------------------
  
  