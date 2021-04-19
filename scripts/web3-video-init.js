  getWeb3SourceOptions("web3-video").then( web3Options => {
  	//console.log("web3Options: ", web3Options);
  	initPlayer("web3-video", web3Options);  
  }).catch(err => {
  	console.log("web3-video-init error: ", err);
  })
