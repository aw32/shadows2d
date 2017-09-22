function TouchTracker(){

this._touchList = [];

}


TouchTracker.prototype.processEvent = 
    function(e){
        return this._processEvent(e, true);
    };

TouchTracker.prototype.processEventSilent = 
    function(e){
        return this._processEvent(e, false);
    };


TouchTracker.prototype._processEvent =
    function(e, preventDefault){
        var touches = e.changedTouches;
        var events = [];
        // cancel further event processing
        if(preventDefault)
            e.preventDefault();
            if(e.type === "touchstart") {
                for(var i=0; i < touches.length; i++)
                    this._touchList.push(this.copyTouch(touches[i], "touchstart"));
            } else
            if(e.type === "touchend") {
                if(this._touchList.length === 1 && touches.length === 1) {
                    var oldTouch = this._touchList[0];
                    // create "click" event
                    if(oldTouch.type === "touchstart")
                        events.push({pageX : touches[0].pageX, pageY : touches[0].pageY, type : "touchclick", _consumed : false});
                    this._touchList.splice(0, 1);
                } else
                if(this._touchList.length === 2 && touches.length === 2) {
                    var oldTouchOne = this._touchList[0];
                    var oldTouchTwo = this._touchList[1];
                    // create "click" event
                    if(oldTouchOne.type === "touchstart" && oldTouchTwo.type === "touchstart")
                        events.push({pageX : [touches[0].pageX,touches[1].pageX], pageY : [touches[0].pageY,touches[1].pageY], 
                                     type : "touchtwoclick", _consumed : false});
                    this._touchList.splice(0, 2);
                } else
                for(var i=0; i < touches.length; i++) { // remove touches
                    var index = this.touchIndex(touches[i]);
                    if(index !== -1)
                        this._touchList.splice(index, 1);
                }
            } else
            if(e.type === "touchcancel" || e.type === "touchleave") {
                for(var i=0; i < touches.length; i++) { // remove touches
                    var index = this.touchIndex(touches[i]);
                    if(index !== -1)
                        this._touchList.splice(index, 1);
                }
            } else
            if(e.type === "touchmove") {
                if(this._touchList.length === 2) {
                    var zoomEvent = this.isZoomEvent(touches);
                    if(zoomEvent !== null)
                        events.push(zoomEvent);
                } else
                if(this._touchList.length === 1 && touches.length === 1){
                    var oldIx = this.touchIndex(touches[0]);
                    if(oldIx !== -1) {
                        var oldTouch = this._touchList[oldIx];
                        var moveEvent = {type : "touchmove", pageX : touches[0].pageX-oldTouch.pageX,
                                         pageY : touches[0].pageY - oldTouch.pageY, _consumed : false};
                        events.push(moveEvent);
                    }
                }
                for(var i=0; i < touches.length; i++) { // update touches
                    var index = this.touchIndex(touches[i]);
                    if(index !== -1)
                        this._touchList.splice(index, 1, this.copyTouch(touches[i], "touchmove"));
                }
            }
        return events;
    };

TouchTracker.prototype.isZoomEvent =
    function(touches){
        if(touches.length === 1 && this._touchList.length === 2)
            return this._isZoomEvent1(touches);
        if(touches.length === 2 && this._touchList.length === 2)
            return this._isZoomEvent2(touches);
        return null;
    };

TouchTracker.prototype._isZoomEvent2 = 
    function(touches){
        var touchOne = touches[0];
        var touchTwo = touches[1];
        var oldTouchOneIx = this.touchIndex(touchOne);
        if(oldTouchOneIx === -1)
            return null;
        var oldTouchOne = this._touchList[oldTouchOneIx];
        var oldTouchTwoIx = this.touchIndex(touchTwo);
        if(oldTouchTwoIx === -1)
            return null;
        var oldTouchTwo = this._touchList[oldTouchTwoIx];
        var diffOne = [touchOne.pageX - oldTouchOne.pageX, 
                       touchOne.pageY - oldTouchOne.pageY];
        var diffTwo = [touchTwo.pageX - oldTouchTwo.pageX, 
                       touchTwo.pageY - oldTouchTwo.pageY];
        var diffOneNorm = [];
        var diffTwoNorm = [];
        CGMath.normalizeVec2(diffOne, diffOneNorm);
        CGMath.normalizeVec2(diffTwo, diffTwoNorm);
        var dot = CGMath.dotVec2(diffOneNorm, diffTwoNorm);
        if(dot >= -1.1 && dot <= -0.9) {
            var lenOne = CGMath.normVec2(diffOne)
            var lenTwo = CGMath.normVec2(diffTwo);
            var distance = CGMath.distVec2([oldTouchOne.pageX, oldTouchOne.pageY],
                                           [oldTouchTwo.pageX, oldTouchTwo.pageY]);
            return {type : "touchzoom", factor : ((lenOne+lenTwo)/distance), _consumed : false};
        }
        return null;
    };

TouchTracker.prototype._isZoomEvent1 =
    function(touches){
        var touchOne = touches[0];
        var oldTouchOneIx = this.touchIndex(touchOne);
        if(oldTouchOneIx === -1)
            return null;
        var oldTouchOne = this._touchList[oldTouchOneIx];
        var oldTouchTwoIx = (oldTouchOneIx === 0? 1 : 0);
        var oldTouchTwo = this._touchList[oldTouchTwoIx];
        var diffOne = [touchOne.pageX - oldTouchOne.pageX, 
                       touchOne.pageY - oldTouchOne.pageY];
        var diffTwo = [oldTouchTwo.pageX - oldTouchOne.pageX, 
                       oldTouchTwo.pageY - oldTouchOne.pageY];
        var diffOneNorm = [];
        var diffTwoNorm = [];
        CGMath.normalizeVec2(diffOne, diffOneNorm);
        CGMath.normalizeVec2(diffTwo, diffTwoNorm);
        var dot = CGMath.dotVec2(diffOneNorm, diffTwoNorm);
        if(dot >= -1.1 && dot <= -0.9) {
            var lenOne = CGMath.normVec2(diffOne);
            var distance = CGMath.normVec2(diffTwo);
            return {type : "touchzoom", factor : ((lenOne)/distance), _consumed : false};
        }
        return null;
    };

TouchTracker.prototype.touchIndex = 
    function(touch){
        for(var i=0; i < this._touchList.length; i++ ) {
            if(touch.identifier === this._touchList[i].identifier)
                return i;
        }
        return -1;
    };

TouchTracker.prototype.copyTouch = 
    function(touch, lastType){
        return {identifier : touch.identifier, pageX : touch.pageX, pageY : touch.pageY, type : lastType};
    };
