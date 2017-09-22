function BufferBar(resolution){

this._resolution = resolution;

this._type = null;

this._shadowMap = null;

this._shadowVolume = null;

this._render = null;

this._size = null;

this._borderColor = new Color(0,0,0,1);

this._rectList = [];

this._textList = [];

this._borderList = [];

}

BufferBar.prototype.setDepthBuffer =
    function(render){
        this._render = render;
        this._type = BufferBar.prototype.TYPE.DEPTH_BUFFER;
        this._load();
    };

BufferBar.prototype.setColorBuffer =
    function(render){
        this._render = render;
        this._type = BufferBar.prototype.TYPE.COLOR_BUFFER;
        this._load();
    };

BufferBar.prototype.setShadowBitBuffer =
    function(type,shadowmap){
        this._shadowMap = shadowmap;
        this._type = type;
        this._load();
    };

/*
BufferBar.prototype.setFrameBuffer =
    function(){
        this._
        this._type = BufferBar.prototype.TYPE.FRAME_;
        this._load();
    };
*/

BufferBar.prototype.setStencilBuffer =
    function(type,stencil){
        this._shadowVolume = stencil;
        this._type = type;
        this._load();
    };

BufferBar.prototype._load =
    function(){
        if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
            this._textList = [];
        else
            this._rectList = [];
        this._borderList = [];
        for(var i=0; i<this._resolution; i++){
            if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
                this._textList.push(new Label("", new Color(0,0,0,1)));
            else
                this._rectList.push( new Rect(0,0,0,0));
            this._borderList.push(new LineStrip(new Float32Array(0), this._borderColor));
        }
    };

BufferBar.prototype.changeResolution =
    function(newRes, layer) {
        this.removeFromLayer(layer);
        if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
            this._textList = [];
        else
            this._rectList = [];
        this._borderList = [];;
        this._resolution = newRes;
        for(var i=0; i<this._resolution; i++){
            if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
                this._textList.push(new Label("", new Color(0,0,0,1)));
            else
                this._rectList.push( new Rect(0,0,0,0));
            this._borderList.push(new LineStrip(new Float32Array(0), this._borderColor));
        }
        this.addToLayer(layer);
    };

BufferBar.prototype.setBorderColor =
    function(color) {
        this._borderColor = color;
        for (var i=0; i<this._borderList.length; i++)
            this._borderList[i].updateColor(this._borderColor);
    };

BufferBar.prototype.layout =
    function(x, y, width, height) {
        //console.log("BufferBar.layout: "+x+","+y+","+width+","+height);
        //console.trace();
        var rectWidth = width/this._resolution;
        for(var i=0; i<this._resolution; i++) {
            if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
                this._textList[i].layout(x + rectWidth*i, y, rectWidth, height);
            else
                this._rectList[i].set(x + rectWidth*i, y, rectWidth, height);
            this._borderList[i].updateLines(new Float32Array([
                                        x + rectWidth*i, y,
                                        x + rectWidth*i + rectWidth, y,
                                        x + rectWidth*i + rectWidth, y + height,
                                        x + rectWidth*i, y + height,
                                        x + rectWidth*i, y
            ]));
        }
    };

BufferBar.prototype.update =
    function(){
        switch(this._type){
            case BufferBar.prototype.TYPE.COLOR_BUFFER:
                    var colorBuffer = this._render.getColorBuffer();
                    for(var i=0; i<this._resolution; i++) {
                        if (colorBuffer[i]==null)
                            this._rectList[i].setColor(new Color(0,0,0,0));
                        else
                            this._rectList[i].setColor(colorBuffer[i]);
                    }
                break;
            case BufferBar.prototype.TYPE.DEPTH_BUFFER:
                    var depthBuffer = this._render.getDepthBuffer();
                    var v;
                    for(var i=0; i<this._resolution; i++) {
                        v = (depthBuffer[i]+1.0)/(2.0);
                                        
                        this._rectList[i].setColor(new Color(v,v,v,1));
                    }
                break;
            case BufferBar.prototype.TYPE.SHADOW_BIT_BUFFER:
                    var shadowBits = this._shadowMap.getShadowBits();
                    for(var i=0; i<this._resolution; i++) {
                        if (shadowBits[i] === true)
                            this._rectList[i].setColor(new Color(0.5,0.5,0.5,1));
                        else
                            this._rectList[i].setColor(new Color(1,1,1,1));
                    }
                break;
            case BufferBar.prototype.TYPE.FRAME_BUFFER:
                    var frameBuffer;
                    if (this._shadowMap != null)
                        frameBuffer = this._shadowMap.getFrameBufferColors();
                    else
                        frameBuffer = this._shadowVolume.getFrameBuffer();
                    for(var i=0; i<this._resolution; i++) {
                        if (frameBuffer[i]!=null)
                            this._rectList[i].setColor(frameBuffer[i]);
                        else
                            this._rectList[i].setColor(new Color(0,0,0,0));
                    }
                break;
            case BufferBar.prototype.TYPE.STENCIL_BUFFER:
                    var stencilBuffer = this._shadowVolume.getStencilBuffer();
                    for(var i=0; i<this._resolution; i++) {
                        this._textList[i].updateText(stencilBuffer[i].toString());
                    }
                break;
        }
    };

BufferBar.prototype.size =
    function(size){
        this._size = size;
    };

BufferBar.prototype.getSize =
    function(){
        return this._size;
    };

BufferBar.prototype.addToLayer =
    function(layer) {
        for(var i=0; i<this._resolution; i++) {
            if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
                this._textList[i].addToLayer(layer);
            else
                layer.addObject(this._rectList[i]);
            layer.addObject(this._borderList[i]);
        }
    };

BufferBar.prototype.removeFromLayer =
    function(layer) {
        for(var i=0; i<this._resolution; i++) {
            if (this._type == BufferBar.prototype.TYPE.STENCIL_BUFFER)
                this._textList[i].removeFromLayer(layer);
            else
                layer.removeObject(this._rectList[i]);
            layer.removeObject(this._borderList[i]);
        }
    };

BufferBar.prototype.consumeEvent =
    function(event) {
        return true;
    };

BufferBar.prototype.consumeMouseEvent =
    function(event, relativePosition) {
        return false;
    };

BufferBar.prototype.consumeKeyEvent =
    function(event) {
        return false;
    };

BufferBar.prototype.TYPE = {
    DEPTH_BUFFER : 0,
    COLOR_BUFFER : 1,
    SHADOW_BIT_BUFFER : 2,
    FRAME_BUFFER : 3,
    STENCIL_BUFFER : 4
};
