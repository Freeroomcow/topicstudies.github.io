var adsManager;
var adsLoader;
var adDisplayContainer;
var adContainer = document.getElementById('adContainer');
var intervalTimer;
if ( isMobile() ) {
	var gameWidth = document.body.offsetWidth;
	var gameHeight = document.body.offsetHeight;
}
else {
	var gameWidth = adContainer.offsetWidth;
	var gameHeight = adContainer.offsetHeight;
}
var playGame;

function onWindowResize() {
  adContainerWidth = adContainer.offsetWidth,
  adContainerHeight = adContainer.offsetHeight,
  adsManager.resize(adContainerWidth, adContainerHeight, google.ima.ViewMode.NORMAL)
}

function removeAd() {
	if ( isMobile() ) {
	  $("#adContainer").hide();
	  $('#adContainer').html("");
	  playGame.removeEventListener("click", playAds), playGame.addEventListener("click", removeAdContainer);
	  window.removeEventListener('resize', onWindowResize);
	  removeAdContainer();
	}
	else {
      $("#playGame").length ? (playGame.removeEventListener("click", playAds), playGame.addEventListener("click", removeAdContainer), adsManager && adsManager.destroy()) : removeAdContainer()
	}
	if(adsManager){adsManager.destroy();}
}

function generateAdTagUrl() {
	var adTagUrl = "https://googleads.g.doubleclick.net/pagead/ads?";

	var adParams = { };
	adParams["client"] = "ca-games-pub-2304985967143948";
	adParams["ad_type"] = "video_image_text";
	adParams["description_url"] = encodeURIComponent(document.location);
	//adParams["adtest"] = "on";
	adParams["videoad_start_delay"] = "0";
	//adParams["hl"] = "fr";
	adParams["max_ad_duration"] = "15000";

	for (var adParam in adParams) {
		adTagUrl += adParam + "=" + adParams[adParam] + "&";
	}

	adTagUrl = adTagUrl.substring(0, adTagUrl.length - 1); //chop off last "&"
  //console.log('adTagUrl: ' + adTagUrl);
	return adTagUrl;
}

function init() {
  window.addEventListener('resize', onWindowResize);
  playGame = document.getElementById('playGame');
  playGame.addEventListener('click', playAds);
  setUpIMA();
}

function setUpIMA() {
  // Create the ad display container.
  //createAdDisplayContainer();
  if(!createAdDisplayContainer()){removeAd();return}
  // Create ads loader.
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  // Listen and respond to ads loaded and error events.
  adsLoader.addEventListener(
	  google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
	  onAdsManagerLoaded,
	  false);
  adsLoader.addEventListener(
	  google.ima.AdErrorEvent.Type.AD_ERROR,
	  onAdError,
	  false);

  // Request video ads.
  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = generateAdTagUrl();

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = gameWidth;
  adsRequest.linearAdSlotHeight = gameHeight;
  adsRequest.nonLinearAdSlotWidth = gameWidth;
  adsRequest.nonLinearAdSlotHeight = gameHeight;
  adsRequest.forceNonLinearFullSlot = true;

  adsLoader.requestAds(adsRequest);
}

function createAdDisplayContainer() {
  // We assume the adContainer is the DOM id of the element that will house
  // the ads.
	if(typeof google!=="undefined"){
		adDisplayContainer = new google.ima.AdDisplayContainer(adContainer);
		return true;
	}
	else{return false;}
}

function playAds() {
  if ( isMobile() ) {
	bodyFix();
	openFullscreen(Id("adContainer"));
	$("#adContainer").show();
  }
  else {
    $("#playAll").remove();
  }
  // Initialize the container. Must be done via a user action on mobile devices.
  adDisplayContainer.initialize();
  if (adsManager) {initAds();}
  else { setTimeout(function(){ initAds(); }, 1000); }
}

function initAds() {
  try {adsManager.init(gameWidth, gameHeight, google.ima.ViewMode.NORMAL); adsManager.start();}
  catch (adError) {
	removeAd(); 
	// console.log(adError);
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Get the ads manager.
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  // videoContent should be set to the content video element.
  adsManager = adsManagerLoadedEvent.getAdsManager(adContainer, adsRenderingSettings);

  // Add listeners to the required events.
  adsManager.addEventListener(
	  google.ima.AdErrorEvent.Type.AD_ERROR,
	  onAdError);
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
	  onContentPauseRequested);
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
	  onContentResumeRequested);
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
	  onAdEvent);

  // Listen to any additional events, if necessary.
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.LOADED,
	  onAdEvent);
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.STARTED,
	  onAdEvent);
  adsManager.addEventListener(
	  google.ima.AdEvent.Type.COMPLETE,
	  onAdEvent);
}

function onAdEvent(adEvent) {
  // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
  // don't have ad object associated.
  var ad = adEvent.getAd();
  switch (adEvent.type) {
	case google.ima.AdEvent.Type.LOADED:
	  // This is the first event sent for an ad - it is possible to
	  // determine whether the ad is a video ad or an overlay.
	  if (!ad.isLinear()) {
		// Position AdDisplayContainer correctly for overlay.
		// Use ad.width and ad.height.
		setTimeout(function(){removeAd()},6e3);
	  }
	  break;
	case google.ima.AdEvent.Type.STARTED:
	  // This event indicates the ad has started - the video player
	  // can adjust the UI, for example display a pause button and
	  // remaining time.
	  if (ad.isLinear()) {
		// For a linear ad, a timer can be started to poll for
		// the remaining time.
		intervalTimer = setInterval(
			function() {
			  var remainingTime = adsManager.getRemainingTime();
			},
			300); // every 300ms
	  }
	  break;
	case google.ima.AdEvent.Type.COMPLETE:
	  // This event indicates the ad has finished - the video player
	  // can perform appropriate UI actions, such as removing the timer for
	  // remaining time detection.
	  if (ad.isLinear()) {
		clearInterval(intervalTimer);
	  }
	  break;
  }
}

function onAdError(adErrorEvent) {
// Handle the error logging.
	removeAd();
}

function onContentPauseRequested() {
  // This function is where you should setup UI for showing ads (e.g.
  // display ad timer countdown, disable seeking etc.)
  // setupUIForAds();
}

function onContentResumeRequested() {
  // This function is where you should ensure that your UI is ready
  // to play content. It is the responsibility of the Publisher to
  // implement this function when necessary.
  // setupUIForContent();
  removeAd();
}


var cmpOk = "false";
try {
	__tcfapi('addEventListener', 2, function(tcData, success) {
		cmpOk = "true";
		if (success) {
			if (!tcData.gdprApplies) {
				//console.log("GDPR doesn't apply to user");
				init();
			} else {
				if (tcData.eventStatus === 'tcloaded') {
					//console.log("CMP is loaded");
					init();
				}
				else if (tcData.eventStatus === 'useractioncomplete') {
					//console.log("User has confirmed their choices");
					init();
				}
			}
		}
		else {
			//console.log("CMP error");
			init();
		}
	});
} catch (e) {
	cmpOk = "true";
	//console.log("no CMP");
	init();
}

setTimeout(function(){
	if (cmpOk=="false") {
		//console.log("CMP is not accessible" );
		init();
	}
}, 5000);