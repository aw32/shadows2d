function Shadowmap_tutorial_two(){

BasicScene.call(this);

this._eventQueue;

this._touchTracker = new TouchTracker();

this._shadowMap;

this._resolution = 10;

this._bitDepth = 0;

this._bitDepthList = [0,1,2,4,8,16,24,32];

// scene elements

this._viewport;

this._sceneViewport;

this._scenePlanar;

this._lightLayer;

this._objectLayer;

this._cameraLayer;

this._lightCamera;

this._usualCamera;

this._sceneObject;

this._sceneGround;

// panel

this._panelViewport;

this._panelPlanar;

this._panelLayer;

this._panelView;

this._colorLabel;

this._colorBuffer;

this._shadowMapLabel;

this._shadowMapBuffer;

this._decisionLabel;

this._decisionBuffer;

this._frameLabel;

this._frameBuffer;

this._paramLabel;

this._biasLabel;

this._biasDecreaseButton;

this._biasValueLabel;

this._biasIncreaseButton;

this._resLabel;

this._resDecreaseButton;

this._resValueLabel;

this._resIncreaseButton;

this._depthLabel;

this._depthDecreaseButton;

this._depthValueLabel;

this._depthIncreaseButton;

}

Shadowmap_tutorial_two.prototype = new BasicScene();

Shadowmap_tutorial_two.prototype.constructor = Shadowmap_tutorial_two;


Shadowmap_tutorial_two.prototype.init =
    function(eventFifo, width, height, gl) {

        this._eventQueue = eventFifo;

        // init all scene elements
                
                        // viewport
                                this._viewport = new Viewport();
                                this._sceneViewport = this._viewport.addViewportRegion(0, 0, 0.7, 1);
                                this._panelViewport = this._viewport.addViewportRegion(0.7, 0, 0.3, 1);
                                this._viewport.init(gl, width, height);
                                
                        // scene
                                this._scenePlanar = new Planar();
                                this._lightLayer = new PlanarLayer();
                                this._objectLayer = new PlanarLayer();
                                this._cameraLayer = new PlanarLayer();
                                
                        // light
                                this._lightCamera = new SimCamera(this._resolution);
                                this._lightCamera.addToLayer(this._lightLayer);
                                this._lightCamera.position(-5, 7);
                                this._lightCamera.lookAt(-1.2, 0);
                                this._lightCamera.perspective(50, 1, 1, 11);
                                this._lightCamera.setCameraShape(Tools.lightShape, false);
                                this._lightCamera.showCameraPoints(false);
                                this._lightCamera.getFrustum().showFrustum(true);
                                this._lightCamera.getFrustum().showOnlyNearPlane(true);
                                this._lightCamera.setEditable(true, true, true);
                                this._lightCamera.update();

                        // scene objects
                                this._sceneObject = new SimObject(new Float32Array([
                                                -4,3, -4,4,
                                                -4,4, -3,4,
                                                -3,4, -3,3,
                                                -3,3, -4,3
                                        ]), new Color(1,0,0,1));
                                this._sceneObject.addToLayer(this._objectLayer);
                                this._sceneGround = new SimObject(new Float32Array([
                                                -7,0, 7,0
                                        ]), new Color(1,165/255,0,1));
                                this._sceneGround.addToLayer(this._objectLayer);
                                
                        // usual camera 
                                this._usualCamera = new SimCamera(this._resolution);
                                this._usualCamera.addToLayer(this._cameraLayer);
                                this._usualCamera.position(5, 7);
                                this._usualCamera.lookAt(1.2, 0);
                                this._usualCamera.perspective(50, 1, 1, 11);
                                this._usualCamera.showCameraPoints(false);
                                this._usualCamera.getFrustum().showFrustum(true);
                                this._usualCamera.getFrustum().showOnlyNearPlane(false);
                                this._usualCamera.getRender().showRenderRays(false);
                                this._usualCamera.setEditable(true, true ,true);
                                this._usualCamera.update();

                        this._scenePlanar.addPlanarLayer(this._objectLayer);
                        this._scenePlanar.addPlanarLayer(this._lightLayer);
                        this._scenePlanar.addPlanarLayer(this._cameraLayer);
                        
                        this._shadowMap = new SimShadowMap(this._resolution);
                        
                        //this._scenePlanar.showBoundingBox(true);
                
                // gui panel
                        this._panelPlanar = new Planar();
                        this._panelLayer = new PlanarLayer();
                        this._panelPlanar.addPlanarLayer(this._panelLayer);
                        this._panelPlanar.setClearColor(new Color(0.5, 0.6, 0.5,1));
                        
                        this._panelView = new View(this._panelPlanar, this._panelLayer);

                                this._colorLabel = new Label("Color", new Color(0,0,0,1));
                                this._colorLabel.size(new RelativeSize(0.05, 0.95,  0.9, 0.05));
                                this._panelView.addChild(this._colorLabel);
                                
                                this._colorBuffer = new BufferBar(this._resolution);
                                this._colorBuffer.setColorBuffer(this._usualCamera.getRender());
                                this._colorBuffer.size(new RelativeSize(0.05, 0.9, 0.9, 0.05));
                                this._panelView.addChild(this._colorBuffer);
                        
                                
                                this._shadowMapLabel = new Label("Shadow map", new Color(0,0,0,1));
                                this._shadowMapLabel.size(new RelativeSize(0.05, 0.85, 0.9, 0.05));
                                this._panelView.addChild(this._shadowMapLabel);
                                
                                this._shadowMapBuffer = new BufferBar(this._resolution);
                                this._shadowMapBuffer.setDepthBuffer(this._lightCamera.getRender());
                                this._shadowMapBuffer.size(new RelativeSize(0.05, 0.8, 0.9, 0.05));
                                this._panelView.addChild(this._shadowMapBuffer);
                                
                                
                                this._decisionLabel = new Label("Shadow", new Color(0,0,0,1));
                                this._decisionLabel.size(new RelativeSize(0.05, 0.75, 0.9, 0.05));
                                this._panelView.addChild(this._decisionLabel);
                                
                                this._decisionBuffer = new BufferBar(this._resolution);
                                this._decisionBuffer.setShadowBitBuffer(BufferBar.prototype.TYPE.SHADOW_BIT_BUFFER, this._shadowMap);
                                this._decisionBuffer.size(new RelativeSize(0.05, 0.7, 0.9, 0.05));
                                this._panelView.addChild(this._decisionBuffer);

                                this._frameLabel = new Label("Final frame", new Color(0,0,0,1));
                                this._frameLabel.size(new RelativeSize(0.05, 0.65, 0.9, 0.05));
                                this._panelView.addChild(this._frameLabel);
                                
                                this._frameBuffer = new BufferBar(this._resolution);
                                this._frameBuffer.setShadowBitBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, this._shadowMap);
                                this._frameBuffer.size(new RelativeSize(0.05, 0.6, 0.9, 0.05));
                                this._panelView.addChild(this._frameBuffer);

                                this._paramLabel = new Label("Parameters:", new Color(0,0,0,1));
                                this._paramLabel.size(new RelativeSize(0.05, 0.5, 0.3, 0.05));
                                this._panelView.addChild(this._paramLabel);
                                
                                
                                this._biasLabel = new Label("Bias", new Color(0,0,0,1));
                                this._biasLabel.size(new RelativeSize(0.05, 0.45, 0.9, 0.05));
                                this._panelView.addChild(this._biasLabel);
                                
                                this._biasDecreaseButton = new GuiButton("<", new Color(0,0,0,1), function(source) {
                                                this.decreaseBias();
                                        }.bind(this));
                                this._biasDecreaseButton.size(new RelativeSize(0.35, 0.4, 0.1, 0.05));
                                this._biasDecreaseButton.setMouseOverColor(new Color(1,1,1,1));                                
                                this._panelView.addChild(this._biasDecreaseButton);
                                
                                this._biasValueLabel = new Label("-0.000", new Color(0,0,0,1));
                                this._biasValueLabel.size(new RelativeSize(0.45, 0.4, 0.4, 0.05));
                                this._panelView.addChild(this._biasValueLabel);
                        
                                this._biasIncreaseButton = new GuiButton(">", new Color(0,0,0,1), function(source) {
                                                this.increaseBias();
                                        }.bind(this));
                                this._biasIncreaseButton.size(new RelativeSize(0.85, 0.4, 0.1, 0.05));
                                this._biasIncreaseButton.setMouseOverColor(new Color(1,1,1,1));
                                this._panelView.addChild(this._biasIncreaseButton);

                                this._resLabel = new Label("Resolution", new Color(0,0,0,1));
                                this._resLabel.size(new RelativeSize(0.05, 0.35, 0.9, 0.05));
                                this._panelView.addChild(this._resLabel);
                                
                                this._resDecreaseButton = new GuiButton("<", new Color(0,0,0,1), function(source) {
                                                this.decreaseRes();
                                        }.bind(this));
                                this._resDecreaseButton.size(new RelativeSize(0.35, 0.3, 0.1, 0.05));
                                this._resDecreaseButton.setMouseOverColor(new Color(1,1,1,1));
                                this._panelView.addChild(this._resDecreaseButton);
                                
                                this._resValueLabel = new Label(this._resolution+"", new Color(0,0,0,1));
                                this._resValueLabel.size(new RelativeSize(0.45, 0.3, 0.4, 0.05));
                                this._panelView.addChild(this._resValueLabel);
                                
                                this._resIncreaseButton = new GuiButton(">", new Color(0,0,0,1), function(source) {
                                                this.increaseRes();
                                        }.bind(this));
                                this._resIncreaseButton.size(new RelativeSize(0.85, 0.3, 0.1, 0.05));
                                this._resIncreaseButton.setMouseOverColor(new Color(1,1,1,1));
                                this._panelView.addChild(this._resIncreaseButton);
                                
                                
                                this._depthLabel = new Label("Bit depth", new Color(0,0,0,1));
                                this._depthLabel.size(new RelativeSize(0.05, 0.25, 0.9, 0.05));
                                this._panelView.addChild(this._depthLabel);
                                
                                this._depthDecreaseButton = new GuiButton("<", new Color(0,0,0,1), function(source) {
                                                this.decreaseDepth();
                                        }.bind(this));
                                this._depthDecreaseButton.size(new RelativeSize(0.35, 0.2, 0.1, 0.05));
                                this._depthDecreaseButton.setMouseOverColor(new Color(1,1,1,1));
                                this._panelView.addChild(this._depthDecreaseButton);

                                this._depthValueLabel = new Label("Inf", new Color(0,0,0,1));
                                this._depthValueLabel.size(new RelativeSize(0.45, 0.2, 0.4, 0.05));
                                this._panelView.addChild(this._depthValueLabel);
                                
                                this._depthIncreaseButton = new GuiButton(">", new Color(0,0,0,1), function(source) {
                                                this.increaseDepth();
                                        }.bind(this));
                                this._depthIncreaseButton.size(new RelativeSize(0.85, 0.2, 0.1, 0.05));
                                this._depthIncreaseButton.setMouseOverColor(new Color(1,1,1,1));
                                this._panelView.addChild(this._depthIncreaseButton);

                        this._panelView.layout();
                        
                this._scenePlanar.init(gl, 
                                this._viewport.getViewportRegionWidth(this._sceneViewport), 
                                this._viewport.getViewportRegionHeight(this._sceneViewport));
                        
                this._panelPlanar.init(gl, 
                                this._viewport.getViewportRegionWidth(this._panelViewport), 
                                this._viewport.getViewportRegionHeight(this._panelViewport));
                        
                this._scenePlanar.getCamera().dimension(-7, -6, 7, 11);
                
                window.document.title = "ShadowMap - Interactive";
                
                this.changeBias(0);

    };

Shadowmap_tutorial_two.prototype.decreaseBias =
    function(){
        this.changeBias(-0.001);
    };

Shadowmap_tutorial_two.prototype.increaseBias =
    function(){
        this.changeBias(0.001);
    };

Shadowmap_tutorial_two.prototype.changeBias =
    function(diff) {
        var bias = this._shadowMap.getBias() + diff;
        var text = Math.round(bias*1000)/1000;
        text = text.toString();
        var text_length = 5-text.length;
        for(var i=0; i<text_length; i++)
            text = "0"+text;
        this._shadowMap.setBias(bias);
        this._lightCamera.getRender().setRayBias(bias);
        this._biasValueLabel.updateText(text);
        this.updateRendering();
    };

Shadowmap_tutorial_two.prototype.decreaseRes =
    function(){
        this.changeResolution(-1);
    };

Shadowmap_tutorial_two.prototype.increaseRes =
    function(){
        this.changeResolution(1);
    };

Shadowmap_tutorial_two.prototype.changeResolution =
    function(diff){
        var newRes = this._lightCamera.getResolution() + diff;
        if (newRes == 0)
            return;
        this._lightCamera.changeResolution(newRes, this._lightLayer);
        this._shadowMapBuffer.changeResolution(newRes, this._panelLayer);
        //decisionBuffer.changeResolution(newRes, panelLayer);
        this._panelView.layout();
        this._resValueLabel.updateText(newRes+"");
        this.updateRendering();
    };

Shadowmap_tutorial_two.prototype.decreaseDepth =
    function(){
        this.changeDepth(-1);
    };

Shadowmap_tutorial_two.prototype.increaseDepth =
    function(){
        this.changeDepth(1);
    };

Shadowmap_tutorial_two.prototype.changeDepth =
    function(diff){
        var newDepth = this._bitDepth + diff;
        if (newDepth < 0 || newDepth>this._bitDepthList.length-1)
            return;
        this._bitDepth = newDepth;
        this._depthValueLabel.updateText( this._bitDepth==0 ? "inf" : this._bitDepthList[this._bitDepth].toString());
        this.updateRendering();
    };

Shadowmap_tutorial_two.prototype.updateRendering =
    function(){
        this._usualCamera.clear();
        this._usualCamera.render(this._sceneGround);
        this._usualCamera.render(this._sceneObject);
        this._usualCamera.update();
                
        this._lightCamera.clear();
        this._lightCamera.render(this._sceneGround);
        this._lightCamera.render(this._sceneObject);
        if (this._bitDepth>0)
            this._lightCamera.getRender().limitDepthBufferPrecision(this._bitDepthList[this._bitDepth]);
        
        this._lightCamera.update();
                
        this._shadowMap.renderFinalImage(this._lightCamera, this._usualCamera);
                
        this._colorBuffer.update();
        this._shadowMapBuffer.update();
        this._decisionBuffer.update();
        this._frameBuffer.update();
    };

Shadowmap_tutorial_two.prototype.display =
    function(gl) {
                
        while(this._eventQueue.length>0)
            this.consumeEvent(this._eventQueue.splice(0,1)[0]);
                
        // update graphics
        this._scenePlanar.updateBuffer(gl);
        this._panelPlanar.updateBuffer(gl);
                
        this._viewport.changeViewport(gl, this._sceneViewport);
                
        this._scenePlanar.display(gl);
                
        this._viewport.changeViewport(gl, this._panelViewport);
                
        this._panelPlanar.display(gl);
                
        this._viewport.resetViewport(gl);
    };

Shadowmap_tutorial_two.prototype.consumeEvent =
    function(e) {
                
        if (Tools.isMouseEvent(e)){
            var mEvent = e;
                        
            var relativePosition;
            // pass events to views
                
            relativePosition = RelativeSize.prototype.createRelativePositionFromViewport(mEvent.clientX, this._height - mEvent.clientY, this._viewport.getViewportRegion(this._panelViewport));
                
            if (relativePosition[0]>=0 && relativePosition[0]<=1)
                this._panelView.consumeMouseEvent(mEvent, relativePosition);
                
            if (!mEvent.consumed) {
                        
                relativePosition = RelativeSize.prototype.createRelativePositionFromViewport(mEvent.clientX, mEvent.clientY, this._viewport.getViewportRegion(this._sceneViewport));

                if (relativePosition[0]>=0 && relativePosition[0]<=1) {
                                
                    var pos = this._scenePlanar.getCamera().getPointDirection(mEvent);
                                
                    this._lightCamera.consumeMouseEvent(mEvent, pos);
                                
                    if (!mEvent.consumed)
                        this._usualCamera.consumeMouseEvent(mEvent, pos);
                                
                    if (mEvent.consumed)
                        this.updateRendering();
                                
                    if (!mEvent.consumed)
                        this._scenePlanar.consumeEvent(e);
                }
            }
        } else
        if (Tools.isTouchEvent(e)){
            var tevents = this._touchTracker.processEvent(e);
            for(var i=0; i<tevents.length; i++){
                var tevent = tevents[i];
                var relativePosition;
                if(tevent.type === "touchclick"){
                    var foo;
                } else 
                if(tevent.type === "touchzoom" || tevent.type === "touchmove") {
                    relativePosition = RelativeSize.prototype.createRelativePositionFromViewport(tevent.pageX, tevent.pageY, this._viewport.getViewportRegion(this._sceneViewport));
                    if(relativePosition[0]>=0 && relativePosition[0]<=1) {
                        
                    }
                }
            }
        } else
        this._scenePlanar.consumeEvent(e);
                        
        return false;
    };

Shadowmap_tutorial_two.prototype.reshape =
    function(gl, width, height) {
        BasicScene.prototype.reshape.call(this, gl, width, height);
       
 
        this._viewport.reshape(gl, width, height);

        this._scenePlanar.reshape(gl, 
                                this._viewport.getViewportRegionWidth(this._sceneViewport), 
                                this._viewport.getViewportRegionHeight(this._sceneViewport));
        
        this._panelPlanar.reshape(gl, 
                                this._viewport.getViewportRegionWidth(this._panelViewport), 
                                this._viewport.getViewportRegionHeight(this._panelViewport));
        
        this._panelView.layout();
    };

Shadowmap_tutorial_two.prototype.destroy =
    function(gl) {
        this._scenePlanar.dispose(gl);
        this._panelPlanar.dispose(gl);
    };







