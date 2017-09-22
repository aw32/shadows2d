function Shadowvolume_tutorial_two(){

BasicScene.call(this);

this._eventQueue;

this._resolution = 10;

this._shadowVolume;

this._zpassMethod = true;

this._infiniteBoundary = 0.84;

this._viewport;

this._sceneViewport;

this._scenePlanar;

this._lightLayer;

this._objectLayer;

this._cameraLayer;

this._volumeLayer;

this._lightCamera;

this._usualCamera;

this._sceneObject;

this._sceneObject2;

this._sceneGround;

this._panelViewport;

this._panelPlanar;

this._panelLayer;

this._panelView;

this._colorLabel;

this._colorBuffer;

this._stencilLabel;

this._stencilFrontBuffer;

this._stencilBackBuffer;

this._stencilBuffer;

this._frameLabel;

this._frameBuffer;

this._methodLabel;

this._methodButton;

}

Shadowvolume_tutorial_two.prototype = new BasicScene();

Shadowvolume_tutorial_two.prototype.constructor = Shadowvolume_tutorial_two;

Shadowvolume_tutorial_two.prototype._switchMethodAction = function(scene, source){
        scene.switchMethod();
    };

Shadowvolume_tutorial_two.prototype.init =
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
                    this._lightCamera.position(-7, 5);
                    this._lightCamera.lookAt(-1.2, 0);
                    this._lightCamera.perspective(50, 1, 1, 11);
                    this._lightCamera.setCameraShape(Tools.lightShape, false);
                    this._lightCamera.setEditable(true, true, false);
                    this._lightCamera.update();
                    this._lightCamera.showCameraPoints(false);
                    this._lightCamera.getRender().showRenderRays(false);
                    this._lightCamera.getFrustum().showFrustum(false);

                // scene objects
                    this._sceneObject = new SimObject(new Float32Array([
                            -2,5,     -2.2,4,
                            -2.2,4,  -2,3,
                            -2,3,      -1.8,4,
                            -1.8,4,  -2,5
                        ]), new Color(1,0,0,1));
                    this._sceneObject.addToLayer(this._objectLayer);
                    this._sceneObject2 = new SimObject(new Float32Array([
                            -1,4, 1,6
                    ]), new Color(0,1,1,1));
                    this._sceneObject2.addToLayer(this._objectLayer);
                    this._sceneGround = new SimObject(new Float32Array([
                            5,-2, 4,8
                        ]), new Color(1.0, 165.0/255.0, 0.0, 1));
                    this._sceneGround.addToLayer(this._objectLayer);

                // usual camera 
                    this._usualCamera = new SimCamera(this._resolution);
                    this._usualCamera.addToLayer(this._cameraLayer);
                    this._usualCamera.position(-3, -2);
                    this._usualCamera.lookAt(6, 3);
                    this._usualCamera.perspective(50, 1, 1, 11);
                    this._usualCamera.update();
                    this._usualCamera.showCameraPoints(false);
                    this._usualCamera.getRender().showRenderRays(false);
                    this._usualCamera.getFrustum().showFrustum(true);
                    this._usualCamera.setEditable(true, true, true);
                    this._usualCamera.setInfiniteBoundary(this._infiniteBoundary);

                this._volumeLayer = new PlanarLayer();
                this._shadowVolume = new SimShadowVolume(this._resolution);
                this._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));

                this._shadowVolume.addToLayer(this._volumeLayer);
                this._shadowVolume.showShadowVolume(true,  true,  false, false);


                this._scenePlanar.addPlanarLayer(this._objectLayer);
                this._scenePlanar.addPlanarLayer(this._lightLayer);
                this._scenePlanar.addPlanarLayer(this._cameraLayer);
                this._scenePlanar.addPlanarLayer(this._volumeLayer);

                // gui panel
                this._panelPlanar = new Planar();
                this._panelLayer = new PlanarLayer();
                this._panelPlanar.addPlanarLayer(this._panelLayer);
                this._panelPlanar.setClearColor(new Color(0.5, 0.6, 0.5, 1));

                this._panelView = new View(this._panelPlanar, this._panelLayer);

                    this._colorLabel = new Label("Color", new Color(0,0,0,1));
                    this._colorLabel.size(new RelativeSize(0.05, 0.95,  0.9, 0.05));
                    this._panelView.addChild(this._colorLabel);

                    this._colorBuffer = new BufferBar(this._resolution);
                    this._colorBuffer.setColorBuffer(this._usualCamera.getRender());
                    this._colorBuffer.size(new RelativeSize(0.05, 0.9, 0.9, 0.05));
                    this._panelView.addChild(this._colorBuffer);

                    this._stencilLabel = new Label("Stencil", new Color(0,0,0,1));
                    this._stencilLabel.size(new RelativeSize(0.05, 0.85, 0.9, 0.05));
                    this._panelView.addChild(this._stencilLabel);

                    this._stencilFrontBuffer = new BufferBar(this._resolution);
                    this._stencilFrontBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, this._shadowVolume);
                    this._stencilFrontBuffer.size(new RelativeSize(0.05, 0.8, 0.9, 0.05));
                    this._stencilFrontBuffer.setBorderColor(new Color(0,1,0,1));
                    this._panelView.addChild(this._stencilFrontBuffer);

                    this._stencilBackBuffer = new BufferBar(this._resolution);
                    this._stencilBackBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, this._shadowVolume);
                    this._stencilBackBuffer.size(new RelativeSize(0.05, 0.73, 0.9, 0.05));
                    this._stencilBackBuffer.setBorderColor(new Color(0,0,1,1));
                    this._panelView.addChild(this._stencilBackBuffer);

                    this._stencilBuffer = new BufferBar(this._resolution);
                    this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, this._shadowVolume);
                    this._stencilBuffer.size(new RelativeSize(0.05, 0.66, 0.9, 0.05));
                    this._panelView.addChild(this._stencilBuffer);

                    this._frameLabel = new Label("Final frame", new Color(0,0,0,1));
                    this._frameLabel.size(new RelativeSize(0.05, 0.6, 0.9, 0.05));
                    this._panelView.addChild(this._frameLabel);

                    this._frameBuffer = new BufferBar(this._resolution);
                    this._frameBuffer.setStencilBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, this._shadowVolume);
                    this._frameBuffer.size(new RelativeSize(0.05, 0.55, 0.9, 0.05));
                    this._panelView.addChild(this._frameBuffer);

                    this._methodLabel = new Label("Method", new Color(0,0,0,1));
                    this._methodLabel.size(new RelativeSize(0.05, 0.45, 0.9, 0.05));
                    this._panelView.addChild(this._methodLabel);

                    this._methodButton = new GuiButton("z-pass", new Color(0,0,0,1), this._switchMethodAction.bind(this,this));
                    this._methodButton.size(new RelativeSize(0.5, 0.4, 0.45, 0.05));
                    this._methodButton.setMouseOverColor(new Color(1,1,1,1));
                    this._panelView.addChild(this._methodButton);

                this._panelView.layout();

            this._scenePlanar.init(gl,
                    this._viewport.getViewportRegionWidth(this._sceneViewport),
                    this._viewport.getViewportRegionHeight(this._sceneViewport));

            this._panelPlanar.init(gl,
                    this._viewport.getViewportRegionWidth(this._panelViewport),
                    this._viewport.getViewportRegionHeight(this._panelViewport));

            this._scenePlanar.getCamera().dimension(-7, -6, 7, 11);

            window.document.title = "ShadowVolume - Interactive";

            this.updateRendering();
    };

Shadowvolume_tutorial_two.prototype.switchMethod = function(){

        if (this._zpassMethod) {
            this._methodButton.setText("z-fail");
            this._zpassMethod = false;
            this._shadowVolume.showShadowVolume(true,  true,  true, true);
            this._usualCamera.infinitePerspective(50, 1, 1);
        } else {
            this._methodButton.setText("z-pass");
            this._zpassMethod = true;
            this._shadowVolume.showShadowVolume(true,  true,  false, false);
            this._usualCamera.perspective(50, 1, 1, 11);
        }
        this.updateRendering();
   };

Shadowvolume_tutorial_two.prototype.updateRendering = function() {
        this._usualCamera.clear();
        this._usualCamera.render(this._sceneGround);
        this._usualCamera.render(this._sceneObject);
        this._usualCamera.render(this._sceneObject2);
        this._usualCamera.update();

        this._colorBuffer.update();

        var obj = [];
        obj[0] = this._sceneObject;
        obj[1] = this._sceneObject2;
        //sceneObject2.showObject(true);

        if (this._zpassMethod) {

            this._shadowVolume.updateZPass(this._usualCamera, this._lightCamera, obj);

            this._shadowVolume.zpass(this._usualCamera, true, false);
            this._stencilFrontBuffer.update();
            this._shadowVolume.zpass(this._usualCamera, false, true);
            this._stencilBackBuffer.update();
            this._shadowVolume.zpass(this._usualCamera, true, true);
            this._stencilBuffer.update();
        } else {
            this._shadowVolume.updateZFail(this._usualCamera, this._lightCamera, obj);

            this._shadowVolume.zfail(this._usualCamera, this._lightCamera, true, false);
            this._stencilFrontBuffer.update();
            this._shadowVolume.zfail(this._usualCamera, this._lightCamera, false, true);
            this._stencilBackBuffer.update();
            this._shadowVolume.zfail(this._usualCamera, this._lightCamera, true, true);
            this._stencilBuffer.update();
        }
        this._frameBuffer.update();
    };

Shadowvolume_tutorial_two.prototype.display = function(gl) {

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

Shadowvolume_tutorial_two.prototype.consumeEvent = function(e) {

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
            this._scenePlanar.consumeEvent(e);

        return false;
    };

Shadowvolume_tutorial_two.prototype.reshape = function(gl, width, height) {

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

Shadowvolume_tutorial_two.prototype.destroy = function(gl) {
        this._scenePlanar.dispose(gl);
        this._panelPlanar.dispose(gl);
    };



