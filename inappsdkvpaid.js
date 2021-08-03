/* wearematterkind.com vpaid 							*/
/* All rights reserved to ANIVIEW LTD 2018 				*/
(function(window){ "use strict";
  var AVEvtMgr = function() {
    //Event Manager class. Used to subscribe and dispatch events to calling player/admanager
    var events = {};
    this.subscribe = function (callback, eventName, context) {

      if (!events[eventName])
        events[eventName] = [];
      events[eventName].push({callback: callback, context: context});
    };
    this.unsubscribe = function (callback, eventName) {
      if (events[eventName]) {
        for (var i = 0; i < events[eventName].length; i++) {
          if (events[eventName][i].callback === callback) {
            events[eventName].splice(i, 1);
            break;
          }
        }
      }
    };
    this.dispatch = function (eventName, param1, param2, param3) {
      if (events[eventName]) {
        for (var i = 0; i < events[eventName].length; i++) {
          if (events[eventName][i] && typeof events[eventName][i].callback === 'function') {
            try {
              events[eventName][i].callback.call(events[eventName][i].context, param1, param2, param3);
            } catch (exp) {
              ;
            }
          }
        }
      }
    };
  };

  var LinearAd = function(wnd, contentId) {
    var eventsManager = new AVEvtMgr();
    var slot;
    var videoSlot;
    var bidInfo;

    var adManager;

    function startAd() {
      videoSlot.src = bidInfo.srcUrls[0];
      var progress = 0;
      var duration = 0;
      var played = false;
      videoSlot.addEventListener("durationchange", function(){
        duration = this.duration;
        quartiles = [duration/4, duration/2, duration*3/4, duration];
        eventsManager.dispatch("AdDurationChange");
      });
      videoSlot.addEventListener("timeupdate", function(){
        progressCheck(0, bidInfo.video_one_quarter, "AdVideoFirstQuartile");
        progressCheck(1, bidInfo.video_one_half, "AdVideoMidpoint");
        progressCheck(2, bidInfo.video_three_quarter, "AdVideoThirdQuartile");
        progressCheck(3, bidInfo.video_complete, "AdVideoComplete");
        eventsManager.dispatch("AdRemainingTimeChange");
      });
      videoSlot.addEventListener("ended", function(){
        progressCheck(3, bidInfo.video_complete, "AdVideoComplete");
      });
      videoSlot.addEventListener("playing", function(){
        if(paused) {
          triggerEvent("AdPlaying", (played ? bidInfo.video_resume : []));
          paused = false;
        }
        if(!played) {
          played = true;
          firePixels(bidInfo.monitorUrl);
          firePixels(bidInfo.video_start);
          eventsManager.dispatch("AdImpression");
          eventsManager.dispatch("AdVideoStart");
        }
      });
      videoSlot.addEventListener("pause", function(){
        triggerEvent("AdPaused", bidInfo.video_pause);
      });
      videoSlot.play();
    }

    this.handshakeVersion = function(version) {
      return "2.0";
    };

    this.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      //We can run only one SDK API in parallel
      setTimeout(function(){
        eventsManager.dispatch("AdLoaded");
      });
    };

    this.startAd = function() {
      if(!top.eventDispatcher) {
        eventsManager.dispatch("AdError");
        return;
      }
      if(top.sdkCtx)
      var context = "CTX" + top.sdkCtx++;
      top.eventDispatcher.addListener(context, function(event, data){
        if(event === "AdLoaded") {
          top.SDKDelegate.startAd(contextId);
        } else {
          eventsManager.dispatch(event);
        }
      });
      top.SDKDelegate.initAd(context, 'GAM', creativeData.AdParameters);
    };

    this.getAdLinear = function() {
      return true;
    };
    this.stopAd = function(e, p) {
      try{
        videoSlot.pause();
        triggerEvent("AdStopped", []);
      } catch(exp) {}
    };
    this.getAdVolume = function() {
      try {
        return videoSlot.volume;
      } catch(exp){}
    };
    this.setAdVolume = function(val) {
      try {
        videoSlot.volume = val;
        videoSlot.muted = (val == 0);
        triggerEvent("AdVolumeChange", (val == 0 ? bidInfo.video_mute : bidInfo.video_unmute));

      } catch(exp){}
    };
    this.resizeAd = function(width, height, viewMode) {
    };
    this.pauseAd = function() {
      try {
        paused = true;
        videoSlot.pause();
      } catch(exp){}
    };
    this.resumeAd = function() {
      try {
        videoSlot.play();
      } catch(exp){}
    };
    this.expandAd = function() {
    };
    this.getAdExpanded = function(val) {
      return false;
    };
    this.getAdSkippableState = function(val) {
      return false;
    };
    this.collapseAd = function() {
    };
    this.skipAd = function() {
      try {
        videoSlot.pause();
        eventsManager.dispatch("AdSkipped");
      } catch(exp){}
    };
    this.getAdWidth = function() {
      try {
        if(videoSlot)
          return videoSlot.clientWidth;
      } catch(exp){}
    };
    this.getAdHeight = function() {
      try {
        if(videoSlot)
          return videoSlot.clientHeight;
      } catch(exp){}
    };
    this.getSkippableRemainingTime = function() {
      return -2;
    };
    this.getAdRemainingTime = function() {
      try {
        return videoSlot.duration - videoSlot.currentTime;
      } catch(exp){}
    };
    this.getAdDuration = function() {
      try {
        return videoSlot.duration;
      } catch(exp){}
    };
    this.getAdCompanions = function() {
      return "";
    };
    this.getIcons = function() {
      return '';
    };
    this.getAdIcons = function() {
      return '';
    };
    this.subscribe = function(callback, eventName, context) {
      eventsManager.subscribe(callback, eventName, context);
    };
    // Callbacks are removed based on the eventName
    this.unsubscribe = function(callback, eventName) {
      eventsManager.unsubscribe(callback, eventName);
    };
  };
  window.getVPAIDAd = function() {
    return new LinearAd();
  };

})(window);
