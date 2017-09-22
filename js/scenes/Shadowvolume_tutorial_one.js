function Shadowvolume_tutorial_one(previousScene, nextScene){

BasicScene.call(this);

this._eventQueue;

this._currentSubscene;

this._nextSubscene;

this._currentSubscenePlot;

this._previousScene;

this._nextScene;

// scene elements

this._resolution = 10;

this._shadowVolume;

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

//Panel

this._panelViewport;

this._panelPlanar;

this._panelLayer;

this._panelView;

this._previouseSubsceneButton;

this._nextSubsceneButton;

this._tutorialText;

this._previousSubsceneAction = function(source){
    this.previousSubscene();
}.bind(this);

this._nextSubsceneAction = function(source){
    this.nextSubscene();
}.bind(this);

this._previousScene = previousScene;

this._nextScene = nextScene;

}

Shadowvolume_tutorial_one.prototype = new BasicScene();
Shadowvolume_tutorial_one.prototype.constructor = Shadowvolume_tutorial_one;

Shadowvolume_tutorial_one.prototype.Subscene = {
    ONE : 0,
    TWO : 1,
    THREE : 2,
    FOUR : 3,
    FIVE : 4,
    SIX : 5,
    SEVEN : 6,
    EIGHT : 7,
    NINE : 8,
    TEN : 9,
    ELEVEN : 10,
    TWELVE : 11,
    THIRTEEN : 12,
    FOURTEEN : 13,
    FIVETEEN : 14,
    values : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]
};

Shadowvolume_tutorial_one.prototype.init =
    function(eventFifo, width, height, gl){
        this._eventQueue = eventFifo;

                // init all scene elements

                        // viewport
                                this._viewport = new Viewport();
                                this._sceneViewport = this._viewport.addViewportRegion(0, 0.3, 1, 0.7);
                                this._panelViewport = this._viewport.addViewportRegion(0, 0, 1, 0.3);
                                this._viewport.init(gl, width, height);

                        // scene
                                this._scenePlanar = new Planar();
                                this._lightLayer = new PlanarLayer("light");
                                this._objectLayer = new PlanarLayer("obj");
                                this._cameraLayer = new PlanarLayer("camera");

                                // light
                                        this._lightCamera = new SimCamera(this._resolution);
                                        this._lightCamera.addToLayer(this._lightLayer);
                                        this._lightCamera.position(-7, 5);
                                        this._lightCamera.lookAt(-1.2, 0);
                                        this._lightCamera.perspective(50, 1, 1, 11);
                                        this._lightCamera.setCameraShape(Tools.lightShape, false);
                                        this._lightCamera.update();

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
                        ]), new Color(1,165/255,0,1));
                    this._sceneGround.addToLayer(this._objectLayer);

                // usual camera 
                    this._usualCamera = new SimCamera(this._resolution);
                    this._usualCamera.addToLayer(this._cameraLayer);
                    this._usualCamera.position(-3, -2);
                    this._usualCamera.lookAt(6, 3);
                    this._usualCamera.perspective(50, 1, 1, 11);
                    this._usualCamera.update();

                this._volumeLayer = new PlanarLayer();
                this._shadowVolume = new SimShadowVolume(this._resolution);
                this._shadowVolume.addToLayer(this._volumeLayer);

                this._scenePlanar.addPlanarLayer(this._objectLayer);
                this._scenePlanar.addPlanarLayer(this._lightLayer);
                this._scenePlanar.addPlanarLayer(this._cameraLayer);
                this._scenePlanar.addPlanarLayer(this._volumeLayer);

            // gui panel
                this._panelPlanar = new Planar();
                this._panelLayer = new PlanarLayer();
                this._panelPlanar.addPlanarLayer(this._panelLayer);
                this._panelPlanar.setClearColor(new Color(0.5, 0.6, 0.5,1));

                this._panelView = new View(this._panelPlanar, this._panelLayer);

                    this._previousSubsceneButton = new GuiButton("<", new Color(0,0,0,1), this._previousSubsceneAction);
                    this._previousSubsceneButton.size(new RelativeSize(0.01, 0.55, 0.05, 0.4));
                    this._previousSubsceneButton.setMouseOverColor(new Color(1,1,1,1));

                    this._nextSubsceneButton = new GuiButton(">", new Color(0,0,0,1), this._nextSubsceneAction);
                    this._nextSubsceneButton.size(new RelativeSize(0.01, 0.05, 0.05, 0.4));
                    this._nextSubsceneButton.setMouseOverColor(new Color(1,1,1,1));

                    this._tutorialText = new Label("tutorial text", new Color(0,0,0,1));
                    this._tutorialText.size(new RelativeSize(0.1, 0.05, 0.9, 0.9));
                    this._tutorialText.setMaxRelativeLineHeight((1.0 / 5.0));

                this._panelView.addChild(this._previousSubsceneButton);
                this._panelView.addChild(this._nextSubsceneButton);
                this._panelView.addChild(this._tutorialText);

                this._panelView.layout();

            this._scenePlanar.init(gl,
                    this._viewport.getViewportRegionWidth(this._sceneViewport),
                    this._viewport.getViewportRegionHeight(this._sceneViewport));

            this._panelPlanar.init(gl,
                    this._viewport.getViewportRegionWidth(this._panelViewport),
                    this._viewport.getViewportRegionHeight(this._panelViewport));

            this._scenePlanar.getCamera().dimension(-7, -4, 7, 9);

            // init first scene
        this.nextSubscene();
    };

Shadowvolume_tutorial_one.prototype.previousSubscene =
    function(){
        var subscenes = Shadowvolume_tutorial_one.prototype.Subscene.values;

        if (this._currentSubscene == null)
            this._nextSubscene = subscenes[0];
        else {
            var current = -1;
            var previous;

            for(var i=0; i<subscenes.length; i++)
                if (subscenes[i] == this._currentSubscene) {
                    current = i;
                    break;
                }

            previous = current -1;

            if (previous<0){
                previous = current;
                //previousScene.performAction(this);
            }
            else
                this._nextSubscene = subscenes[previous];
        }
    };

Shadowvolume_tutorial_one.prototype.nextSubscene =
    function(){
        var subscenes = Shadowvolume_tutorial_one.prototype.Subscene.values;

        if (this._currentSubscene == null)
            this._nextSubscene = subscenes[0];
        else {
            var current = -1;
            var next;

            for(var i=0; i<subscenes.length; i++)
                if (subscenes[i] == this._currentSubscene) {
                    current = i;
                    break;
                }

            next = current +1;

            if (next>=subscenes.length){
                next = current;
                //nextScene.performAction(this);
            }
            else
                this._nextSubscene = subscenes[next];
        }

    };


Shadowvolume_tutorial_one.prototype.changeSubscene =
    function(nextScene) {
        if (this._currentSubscenePlot != null) {
            this._currentSubscenePlot.destroy(this);
            this._currentSubscenePlot = null;
        }
        switch(nextScene) {
            case Shadowvolume_tutorial_one.prototype.Subscene.ONE:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneOne();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.TWO:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneTwo();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.THREE:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneThree();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.FOUR:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneFour();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.FIVE:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneFive();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.SIX:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneSix();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.SEVEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneSeven();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.EIGHT:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneEight();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.NINE:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneNine();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.TEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneTen();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.ELEVEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneEleven();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.TWELVE:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneTwelve();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.THIRTEEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneThirteen();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.FOURTEEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneFourteen();
            break;
            case Shadowvolume_tutorial_one.prototype.Subscene.FIVETEEN:
                this._currentSubscenePlot = new Shadowvolume_tutorial_one.prototype.SubsceneFiveteen();
            break;
        }
        this._currentSubscene = nextScene;
        this._currentSubscenePlot.init(this);
        window.document.title = "ShadowVolume - "+this._currentSubscenePlot.getTitle();
        this._nextSubscene = null;
    };

Shadowvolume_tutorial_one.prototype.display =
    function(gl) {

        while(this._eventQueue.length>0)
            this.consumeEvent(this._eventQueue.splice(0,1)[0]);


        if (this._nextSubscene != null)
            this.changeSubscene(this._nextSubscene);

        if (this._currentSubscenePlot != null)
            this._currentSubscenePlot.update(this);

        // update graphics
        this._scenePlanar.updateBuffer(gl);
        this._panelPlanar.updateBuffer(gl);



        this._viewport.changeViewport(gl, this._sceneViewport);

        this._scenePlanar.display(gl);

        this._viewport.changeViewport(gl, this._panelViewport);

        this._panelPlanar.display(gl);

        this._viewport.resetViewport(gl);
    };

Shadowvolume_tutorial_one.prototype.consumeEvent =
    function(e) {

                if (Tools.isMouseEvent(e)){
                        mEvent = e;

                        var relativePosition;
                        // pass events to views

                        relativePosition = RelativeSize.prototype.createRelativePositionFromViewport(mEvent.clientX, this._height - mEvent.clientY, this._viewport.getViewportRegion(this._panelViewport));

                //System.out.println("get event");

                this._panelView.consumeMouseEvent(mEvent, relativePosition);

                if (!mEvent.consumed) {

                        relativePosition = RelativeSize.prototype.createRelativePositionFromViewport(mEvent.clientX, mEvent.clientY, this._viewport.getViewportRegion(this._sceneViewport));
                        //scenePlanar.getCamera().consumeEvent(e);
                }
                }
                //else scenePlanar.getCamera().consumeEvent(e);

                return false;
    };

Shadowvolume_tutorial_one.prototype.reshape =
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

Shadowvolume_tutorial_one.prototype.destroy =
    function(gl) {
                if (this._currentSubscenePlot != null)
                        this._currentSubscenePlot.destroy(this);
                this._scenePlanar.dispose(gl);
                this._panelPlanar.dispose(gl);
        };

Shadowvolume_tutorial_one.prototype.SubsceneOne =
    function(){
        this._labelText = "When light illuminates an occluder, a shadow volume "
                + "is created. Areas inside this volume lie in shadow.";
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(false);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            //obj[1] = sceneObject2;
            scene._sceneObject2.showObject(false);

            scene._shadowVolume.setShadowVolumeColor(new Color(1,1,1,1), new Color(1,1,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
        };
        this.getTitle = function(){ return "Slide 1";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneTwo =
    function(){
        this._labelText = "When rendering such a scene, the line of sight may have "
                + "to pass the shadow volume before it hits a solid area. If the "
                + "line ends inside the volume, then the visible area lies in shadow, "
                + "else it is lit.";
        this._stwoLayer;
        this._lines;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            //obj[1] = sceneObject2;
            scene._sceneObject2.showObject(false);

            scene._shadowVolume.setShadowVolumeColor(new Color(1,1,1,1), new Color(1,1,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);

            this._stwoLayer = new PlanarLayer();
            var cam_pos = scene._usualCamera.getPosition();
            this._lines = new Lines(new Float32Array([
                    cam_pos[0], cam_pos[1],  4.1, 7,
                    cam_pos[0], cam_pos[1],  4.5, 3
                ]), new Color(1,1,1,1));
            this._stwoLayer.addObject(this._lines);
            scene._scenePlanar.addPlanarLayer(this._stwoLayer);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._stwoLayer);
        };
        this.getTitle = function(){ return "Slide 2";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneThree =
    function(){
        this._labelText = "To track the line's state, the "
                + "intersection with front facing and back "
                + "facing planes of the shadow volume may "
                + "be counted. This can be done by drawing "
                + "the planes and use the stencil buffer.";
        this._stwoLayer;
        this._lines;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);

            this._stwoLayer = new PlanarLayer();
            var cam_pos = scene._usualCamera.getPosition();
            this._lines = new Lines(new Float32Array([
                    cam_pos[0], cam_pos[1],  4.1, 7,
                    cam_pos[0], cam_pos[1],  4.5, 3
                ]), new Color(1,1,1,1));
            this._stwoLayer.addObject(this._lines);
            scene._scenePlanar.addPlanarLayer(this._stwoLayer);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._stwoLayer);
        };
        this.getTitle = function(){ return "Slide 3";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneFour =
    function(){
        this._labelText = "First a shadow volume must be "
                + "constructed, by extruding the object's "
                + "edges in the light's direction. This can "
                + "be optimized by using only silhouette and "
                + "boundary edges. ";
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
        };
        this.getTitle = function(){ return "Slide 4";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneFive =
    function(){
        this._labelText = "Boundary edges are only part of "
                + "one plane. Silhouette edges are part of "
                + "several planes, whose normals do not all "
                + "point in the light's direction. Also the "
                + "face direction of the extruded edges is important.";

        this._sfiveLayer;
        this._lines;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);

            this._sfiveLayer = new PlanarLayer();
            //float[] cam_pos = usualCamera.getPosition();
            this._lines = new Lines(new Float32Array([
                    -2.1,4.5,  -3.1,4.7,
                    -2.1,3.5,  -3.1,3.3,
                    -1.9,3.5,  -0.9,3.3,
                    -1.9,4.5,  -0.9,4.7
                ]), new Color(1,1,1,1));
            this._sfiveLayer.addObject(this._lines);
            scene._scenePlanar.addPlanarLayer(this._sfiveLayer);

        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._sfiveLayer);
        };
        this.getTitle = function(){ return "Slide 5";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneSix =
    function(){
        this._labelText = "First the solid scene is rendered with "
                + "ambient color and depth buffer. For the next passes color and "
                + "depth buffer is deactivated, but depth testing "
                + "is still activated. Additionally the stencil "
                + "buffer will be used.";
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(false, false, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._shadowVolume.showShadowVolume(true, true, false, false);
        };
        this.getTitle = function(){ return "Slide 6";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneSeven =
    function(){
        this._labelText = "Now the front facing shadow volume planes are "
                + "rendered. If the depth test passes, therefore if the rendered "
                + "fragment is in front of the solid area, the stencil buffer value "
                + "will be increased.";

        this._stencilBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, false, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, false);


            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.05, 0.5, 0.15));
            this._stencilBuffer.update();

            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){ return "Slide 7";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneEight =
    function(){
        this._labelText = "Next the back facing planes are rendered, "
                + "but this time if the depth test passes, the stencil "
                + "buffer value is decreased.";

        this._stencilBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(false, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, false, true);

            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1,0.05, 0.5, 0.15));
            this._stencilBuffer.update();

            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.layout();

        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){ return "Slide 8";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneNine =
    function(){
        this._labelText = "Afterwards the stencil buffer value "
                + "indicates if the fragment lies in shadow.";

        this._colorBuffer;
        this._stencilBuffer;
        this._frameBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);

            this._colorBuffer = new BufferBar(scene._resolution);
            this._colorBuffer.setColorBuffer(scene._usualCamera.getRender());
            this._colorBuffer.size(new RelativeSize(0.1, 0.35, 0.5, 0.15));
            this._colorBuffer.update();

            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.2, 0.5, 0.15));
            this._stencilBuffer.update();

            this._frameBuffer = new BufferBar(scene._resolution);
            this._frameBuffer.setStencilBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, scene._shadowVolume);
            this._frameBuffer.size(new RelativeSize(0.1,0.05, 0.5, 0.15));
            this._frameBuffer.update();

            scene._panelView.addChild(this._colorBuffer);
            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.addChild(this._frameBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._colorBuffer);
            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.removeChild(this._frameBuffer);
            scene._panelView.layout();

        };
        this.getTitle = function(){ return "Slide 9";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneTen =
    function(){
        this._labelText = "Unfortunately this 'z-pass' method "
                + "has problems with rendering from inside shadow "
                + "volumes and intersection of near plane "
                + "and volume faces.";

        this._stencilBuffer;
        this._frameBuffer;

        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._usualCamera.position(0,2);
            scene._usualCamera.lookAt(1, 2);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);
            scene._usualCamera.update();

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(1,1,1,1), new Color(1,1,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, false);
            scene._shadowVolume.updateZPass(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zpass(scene._usualCamera, true, true);


            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.2, 0.5, 0.15));
            this._stencilBuffer.update();

            this._frameBuffer = new BufferBar(scene._resolution);
            this._frameBuffer.setStencilBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, scene._shadowVolume);
            this._frameBuffer.size(new RelativeSize(0.1, 0.05, 0.5, 0.15));
            this._frameBuffer.update();


            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.addChild(this._frameBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.removeChild(this._frameBuffer);
            scene._panelView.layout();
            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.update();
        };
        this.getTitle = function(){ return "Slide 10";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneEleven =
    function(){
        this._labelText = "Solution: the camera's projection is extended "
                + "into infinity. Also all extruded points are "
                + "'projected' onto the far plane by setting the "
                + "homogenous component w to 0. (The displayed "
                + "far plane approximates infinity.)";
        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);
            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._usualCamera.setInfiniteBoundary(0.84);
            scene._usualCamera.infinitePerspective(50, 1, 1);
            scene._usualCamera.position(-7,1);
            scene._usualCamera.lookAt(4, 4);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            var objects = [];
            objects[0] = scene._sceneObject;
            objects[1] = scene._sceneObject2;


            scene._shadowVolume.updateZFail(scene._usualCamera, scene._lightCamera, objects);
            scene._shadowVolume.zfail(scene._usualCamera, scene._lightCamera, true, true);
            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));
            scene._shadowVolume.showShadowVolume(true, true, false, true);

        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.perspective(50, 1, 1, 11);
            scene._usualCamera.update();
        };
        this.getTitle = function(){ return "Slide 11";};
    };


Shadowvolume_tutorial_one.prototype.SubsceneTwelve =
    function(){
        this._labelText = "The volume is capped by "
                + "adding objects' front facing faces and "
                + "extruded back facing faces. The special "
                + "projection and extrusion make sure to "
                + "enclose all the normal objects without "
                + "intersection of far plane and shadow volume.";

        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);
            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._usualCamera.setInfiniteBoundary(0.84);
            scene._usualCamera.infinitePerspective(50, 1, 1);
            scene._usualCamera.position(-7,1);
            scene._usualCamera.lookAt(4, 4);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.update();

            var objects = [];
            objects[0] = scene._sceneObject;
            objects[1] = scene._sceneObject2;

            scene._shadowVolume.updateZFail(scene._usualCamera, scene._lightCamera, objects);
            scene._shadowVolume.zfail(scene._usualCamera, scene._lightCamera, true, true);
            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));
            scene._shadowVolume.showShadowVolume(true, true, true, true);
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.perspective(50, 1, 1, 11);
            scene._usualCamera.update();
        };
        this.getTitle = function(){ return "Slide 12";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneThirteen =
    function(){
        this._labelText = "Finally, when rendering the "
                + "volumes' front faces, the stencil value "
                + "is decreased, if fragments fail the depth test. "
                + "The test passes, if the new depth is nearer than "
                + "the stored one.";

        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);

        this._stencilBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._usualCamera.setInfiniteBoundary(0.84);
            scene._usualCamera.infinitePerspective(50, 1, 1);
            scene._usualCamera.position(-7,1);
            scene._usualCamera.lookAt(4, 4);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);
            scene._usualCamera.render(scene._sceneGround);

            scene._usualCamera.update();

            var objects = [];
            objects[0] = scene._sceneObject;
            objects[1] = scene._sceneObject2;

            scene._shadowVolume.updateZFail(scene._usualCamera, scene._lightCamera, objects);
            scene._shadowVolume.zfail(scene._usualCamera, scene._lightCamera, true, false);
            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));
            scene._shadowVolume.showShadowVolume(true, false, true, false);

            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.05, 0.5, 0.15));
            this._stencilBuffer.update();

            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.layout();

        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");

            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.perspective(50, 1, 1, 11);
            scene._usualCamera.update();

            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){ return "Slide 13";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneFourteen =
    function(){
        this._labelText = "Respectively, the stencil value "
                + "is increased, if back faces' fragments fail "
                + "the depth test.";

        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);

        this._stencilBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._usualCamera.setInfiniteBoundary(0.84);
            scene._usualCamera.infinitePerspective(50, 1, 1);
            scene._usualCamera.position(-7,1);
            scene._usualCamera.lookAt(4, 4);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.update();

            var objects = [];
            objects[0] = scene._sceneObject;
            objects[1] = scene._sceneObject2;

            scene._shadowVolume.updateZFail(scene._usualCamera, scene._lightCamera, objects);
            scene._shadowVolume.zfail(scene._usualCamera, scene._lightCamera, false, true);
            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));
            scene._shadowVolume.showShadowVolume(false, true, false, true);

            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.05, 0.5, 0.15));
            this._stencilBuffer.update();

            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.layout();

        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.perspective(50, 1, 1, 11);
            scene._usualCamera.update();

            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){ return "Slide 14";};
    };

Shadowvolume_tutorial_one.prototype.SubsceneFiveteen =
    function(){
        this._labelText = "The 'z-fail' method leads to an equivalent "
                + "outcome as z-pass, while counting the faces 'from behind'. "
                + "";

        this._colorBuffer;
        this._stencilBuffer;
        this._frameBuffer;

        this._cameraPosOld = new Float32Array(2);
        this._cameraLookatOld = new Float32Array(2);
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            var cameraPos = scene._usualCamera.getPosition();
            this._cameraPosOld[0] = cameraPos[0];
            this._cameraPosOld[1] = cameraPos[1];
            var cameraLookat = scene._usualCamera.getLookat();
            this._cameraLookatOld[0] = cameraLookat[0];
            this._cameraLookatOld[1] = cameraLookat[1];

            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.getFrustum().showFrustum(false);
            scene._lightCamera.update();

            scene._usualCamera.setInfiniteBoundary(0.84);
            scene._usualCamera.infinitePerspective(50, 1, 1);
            scene._usualCamera.position(-7,1);
            scene._usualCamera.lookAt(4, 4);
            scene._usualCamera.showCamera(true);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.update();

            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.render(scene._sceneObject2);

            var obj = [];
            obj[0] = scene._sceneObject;
            obj[1] = scene._sceneObject2;
            scene._sceneObject2.showObject(true);

            scene._shadowVolume.updateZFail(scene._usualCamera, scene._lightCamera, obj);
            scene._shadowVolume.zfail(scene._usualCamera, scene._lightCamera, true, true);
            scene._shadowVolume.setShadowVolumeColor(new Color(0,1,0,1), new Color(0,0,1,1), new Color(0,1,0,1), new Color(0,0,1,1));
            scene._shadowVolume.showShadowVolume(true, true, true, true);

            this._colorBuffer = new BufferBar(scene._resolution);
            this._colorBuffer.setColorBuffer(scene._usualCamera.getRender());
            this._colorBuffer.size(new RelativeSize(0.1, 0.35, 0.5, 0.15));
            this._colorBuffer.update();

            this._stencilBuffer = new BufferBar(scene._resolution);
            this._stencilBuffer.setStencilBuffer(BufferBar.prototype.TYPE.STENCIL_BUFFER, scene._shadowVolume);
            this._stencilBuffer.size(new RelativeSize(0.1, 0.2, 0.5, 0.15));
            this._stencilBuffer.update();

            this._frameBuffer = new BufferBar(scene._resolution);
            this._frameBuffer.setStencilBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, scene._shadowVolume);
            this._frameBuffer.size(new RelativeSize(0.1, 0.05, 0.5, 0.15));
            this._frameBuffer.update();

            scene._panelView.addChild(this._colorBuffer);
            scene._panelView.addChild(this._stencilBuffer);
            scene._panelView.addChild(this._frameBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){};
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._usualCamera.position(this._cameraPosOld[0], this._cameraPosOld[1]);
            scene._usualCamera.lookAt(this._cameraLookatOld[0], this._cameraLookatOld[1]);
            scene._usualCamera.perspective(50, 1, 1, 11);
            scene._usualCamera.update();
            scene._panelView.removeChild(this._colorBuffer);
            scene._panelView.removeChild(this._stencilBuffer);
            scene._panelView.removeChild(this._frameBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){ return "Slide 15";};
    };
