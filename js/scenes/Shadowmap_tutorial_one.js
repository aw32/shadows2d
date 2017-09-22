function Shadowmap_tutorial_one(previousScene, nextScene){

BasicScene.call(this);

this._eventQueue;

this._currentSubscene;

this._nextSubscene;

this._currentSubscenePlot;

this._previousScene;

this._nextScene;

// scene elements

this._resolution = 10;

this._shadowMap;

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

Shadowmap_tutorial_one.prototype = new BasicScene();
Shadowmap_tutorial_one.prototype.constructor = Shadowmap_tutorial_one;

Shadowmap_tutorial_one.prototype.Subscene = {
    ONE : 0,
    TWO : 1,
    THREE : 2,
    FOUR : 3,
    FIVE : 4,
    SIX : 5,
    SEVEN : 6,
    EIGHT : 7,
    values : [0,1,2,3,4,5,6,7]
};

Shadowmap_tutorial_one.prototype.init =
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
                                        this._lightCamera.position(-5, 7);
                                        this._lightCamera.lookAt(-1.2, 0);
                                        this._lightCamera.perspective(50, 1, 1, 11);
                                        this._lightCamera.setCameraShape(Tools.lightShape, false);
                                        
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
                                        
                                this._scenePlanar.addPlanarLayer(this._objectLayer);
                                this._scenePlanar.addPlanarLayer(this._lightLayer);
                                this._scenePlanar.addPlanarLayer(this._cameraLayer);
                        
                        // gui panel
                                this._panelPlanar = new Planar();
                                this._panelLayer = new PlanarLayer("panel");
                                this._panelPlanar.addPlanarLayer(this._panelLayer);
                                this._panelPlanar.setClearColor(new Color(0.5, 0.6, 0.5, 1));
                        
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

Shadowmap_tutorial_one.prototype.previousSubscene =
    function(){
        var subscenes = Shadowmap_tutorial_one.prototype.Subscene.values;
                
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

Shadowmap_tutorial_one.prototype.nextSubscene =
    function(){
        var subscenes = Shadowmap_tutorial_one.prototype.Subscene.values;
                
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

Shadowmap_tutorial_one.prototype.changeSubscene =
    function(nextScene) {
        if (this._currentSubscenePlot != null) {
            this._currentSubscenePlot.destroy(this);
            this._currentSubscenePlot = null;
        }
        switch(nextScene) {
            case Shadowmap_tutorial_one.prototype.Subscene.ONE:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneOne();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.TWO:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneTwo();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.THREE:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneThree();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.FOUR:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneFour();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.FIVE:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneFive();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.SIX:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneSix();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.SEVEN:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneSeven();
            break;
            case Shadowmap_tutorial_one.prototype.Subscene.EIGHT:
                this._currentSubscenePlot = new Shadowmap_tutorial_one.prototype.SubsceneEight();
            break;
        }
        this._currentSubscene = nextScene;
        this._currentSubscenePlot.init(this);
        window.document.title = "ShadowMap - "+this._currentSubscenePlot.getTitle();
        this._nextSubscene = null;
    };

Shadowmap_tutorial_one.prototype.display = 
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

Shadowmap_tutorial_one.prototype.consumeEvent =
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

Shadowmap_tutorial_one.prototype.reshape =
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

Shadowmap_tutorial_one.prototype.destroy =
    function(gl) {
                if (this._currentSubscenePlot != null)
                        this._currentSubscenePlot.destroy(this);
                this._scenePlanar.dispose(gl);
                this._panelPlanar.dispose(gl);
        };

Shadowmap_tutorial_one.prototype.SubsceneOne =
    function(){
        this._labelText = "From the light's perspective only lit areas are visible, "
                                + "therefore shadowed areas are invisible. The occluding areas are "
                                + "nearer to the light source than the occluded areas.";
                
        this._soneLayer;
        this._lineOne;
        this._lineTwo;

        this.init = function(scene){
                        
                        this._soneLayer = new PlanarLayer();
                        
                        this._lineOne = new Line(scene._lightCamera.getPosition(), new Float32Array([-3.5,4]));
                        this._lineTwo = new Line(scene._lightCamera.getPosition(), new Float32Array([-2,0]));
                        
                        this._soneLayer.addObject(this._lineOne);
                        this._soneLayer.addObject(this._lineTwo);
                        
                        scene._scenePlanar.addPlanarLayer(this._soneLayer);
                        
                        scene._tutorialText.updateText(this._labelText);
                        
                        scene._usualCamera.showCamera(false);
                        scene._usualCamera.showCameraPoints(false);
                        scene._usualCamera.getFrustum().showFrustum(false);
                        scene._usualCamera.getRender().showRenderRays(false);
                        scene._usualCamera.update();
                        
                        scene._lightCamera.showCameraPoints(false);
                        scene._lightCamera.getRender().showRenderRays(false);
                        scene._lightCamera.getFrustum().showFrustum(false);
                        scene._lightCamera.update();
        };

        this.update = function(scene){};
        this.destroy = function(scene){
            scene._scenePlanar.removePlanarLayer(this._soneLayer);
            scene._tutorialText.updateText("");
        };
        this.getTitle = function(){ return "Slide 1";};

    };

Shadowmap_tutorial_one.prototype.SubsceneTwo =
    function(){
        this._labelText = "Rendering the scene from the position of the "
                + "light source without color creates only the depth buffer. "
                + "It holds a map of distances between light source and "
                + "occluders - the shadow map.";

        this._depthBuffer;

        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);
            scene._lightCamera.showCameraPoints(false);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.clear();
            scene._lightCamera.render(scene._sceneGround);
            scene._lightCamera.render(scene._sceneObject);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(false);
            scene._usualCamera.showCameraPoints(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.update();

            this._depthBuffer = new BufferBar(scene._resolution);
            this._depthBuffer.setDepthBuffer(scene._lightCamera.getRender());
            this._depthBuffer.size(new RelativeSize(0.1, 0.05, 0.3, 0.1));
            this._depthBuffer.update();

            scene._panelView.addChild(this._depthBuffer);
            scene._panelView.layout(); 
        };

        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._depthBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){return "Slide 2";};
    };

Shadowmap_tutorial_one.prototype.SubsceneThree =
    function(){
        this._labelText = "When rendering the scene from the position of the "
                + "actual camera, the visible fragments can be projected onto "
                + "the shadow map. Therefore, also the distance between the "
                + "fragment and the light source is computed.";
        this._sthreeLayer;
        this._linesOne
        this.init = function(scene){
            this._sthreeLayer = new PlanarLayer();
            var lightPos = scene._lightCamera.getPosition();
            var usualPos = scene._usualCamera.getPosition();
            this._linesOne = new Lines([
                    lightPos[0],lightPos[1], -2,0,
                    -2,0, usualPos[0], usualPos[1]
            ], new Color(1.0,1.0,1.0,1.0));
            this._sthreeLayer.addObject(this._linesOne);
            scene._scenePlanar.addPlanarLayer(this._sthreeLayer);

            scene._tutorialText.updateText(this._labelText);

            scene._lightCamera.showCamera(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);
            scene._lightCamera.getRender().showRenderRays(false);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);
            scene._usualCamera.update();
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._sthreeLayer);
        };
        this.getTitle = function(){return "Slide 3";};
    };

Shadowmap_tutorial_one.prototype.SubsceneFour =
    function(){
        this._labelText = "This distance can be compared to the value "
                + "stored in the shadow map, to determine if the fragment "
                + "is lit or occluded. Depending on this binary result "
                + "the fragment is rendered being in shadow or being lit.";
        this._sfourLayer;
        this._linesOne;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            this._sfourLayer = new PlanarLayer();
            var lightPos = scene._lightCamera.getPosition();
            var usualPos = scene._usualCamera.getPosition();
            this._linesOne = new Lines([
                    lightPos[0],lightPos[1], -2,0,
                    -2,0, usualPos[0], usualPos[1]
            ], new Color(1.0,1.0,1.0,1.0));
            this._sfourLayer.addObject(this._linesOne);
            scene._scenePlanar.addPlanarLayer(this._sfourLayer);

            //lightCamera.getRender().showOnlySingleRenderRay(2);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.showCamera(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);
            scene._lightCamera.update();

            scene._usualCamera.showCamera(true);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);
            scene._usualCamera.update();
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._sfourLayer);
        };
        this.getTitle = function(){return "Slide 4";};
    };

Shadowmap_tutorial_one.prototype.SubsceneFive =
    function(){
        this._labelText = "";
        this._shadowMap;
        this._colorBuffer;
        this._shadowMapBuffer;
        this._shadowDecision;
        this._finalBuffer;

        this._colorLabel;
        this._shadowMapLabel;
        this._shadowDecisionLabel;
        this._finalLabel;
        this.init = function(scene){
            this._shadowMap = new SimShadowMap(scene._resolution);
            this._shadowMap.setBias(0.0);

            this._colorLabel = new Label("Usual Color:", new Color(0,0,0,1));
            this._colorLabel.size(new RelativeSize(0.1, 0.75, 0.3, 0.2));

            this._colorBuffer = new BufferBar(scene._resolution)
            this._colorBuffer.setColorBuffer(scene._usualCamera.getRender());
            this._colorBuffer.size(new RelativeSize(0.1, 0.55, 0.3, 0.2));

            this._shadowMapLabel = new Label("Shadow Map:", new Color(0,0,0,1));
            this._shadowMapLabel.size(new RelativeSize(0.1, 0.25, 0.3, 0.2));

            this._shadowMapBuffer = new BufferBar(scene._resolution);
            this._shadowMapBuffer.setDepthBuffer(scene._lightCamera.getRender());
            this._shadowMapBuffer.size(new RelativeSize(0.1, 0.05, 0.3, 0.2));

            this._shadowDecisionLabel = new Label("Shadow Result:", new Color(0,0,0,1));
            this._shadowDecisionLabel.size(new RelativeSize(0.5, 0.75, 0.3, 0.2));

            this._shadowDecision = new BufferBar(scene._resolution);
            this._shadowDecision.setShadowBitBuffer(BufferBar.prototype.TYPE.SHADOW_BIT_BUFFER, this._shadowMap);
            this._shadowDecision.size(new RelativeSize(0.5, 0.55, 0.3, 0.2));

            this._finalLabel = new Label("Final Frame:", new Color(0,0,0,1));
            this._finalLabel.size(new RelativeSize(0.5, 0.25, 0.3, 0.2));

            this._finalBuffer = new BufferBar(scene._resolution);
            this._finalBuffer.setShadowBitBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, this._shadowMap);
            this._finalBuffer.size(new RelativeSize(0.5, 0.05, 0.3, 0.2));

            scene._lightCamera.showCamera(true);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);


            scene._usualCamera.showCamera(true);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);


            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.update();

            scene._lightCamera.clear();
            scene._lightCamera.render(scene._sceneGround);
            scene._lightCamera.render(scene._sceneObject);
            scene._lightCamera.update();

            this._shadowMap.renderFinalImage(scene._lightCamera, scene._usualCamera);

            this._colorBuffer.update();
            this._shadowMapBuffer.update();
            this._shadowDecision.update();
            this._finalBuffer.update();

            scene._panelView.addChild(this._colorBuffer);
            scene._panelView.addChild(this._shadowMapBuffer);
            scene._panelView.addChild(this._shadowDecision);
            scene._panelView.addChild(this._finalBuffer);

            scene._panelView.addChild(this._colorLabel);
            scene._panelView.addChild(this._shadowMapLabel);
            scene._panelView.addChild(this._shadowDecisionLabel);
            scene._panelView.addChild(this._finalLabel);

            scene._panelView.layout();
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._panelView.removeChild(this._colorBuffer);
            scene._panelView.removeChild(this._shadowMapBuffer);
            scene._panelView.removeChild(this._shadowDecision);
            scene._panelView.removeChild(this._finalBuffer);

            scene._panelView.removeChild(this._colorLabel);
            scene._panelView.removeChild(this._shadowMapLabel);
            scene._panelView.removeChild(this._shadowDecisionLabel);
            scene._panelView.removeChild(this._finalLabel);

            scene._panelView.layout();
        };
        this.getTitle = function(){return "Slide 5";};
    };

Shadowmap_tutorial_one.prototype.SubsceneSix =
    function(){
        this._labelText = "When rendering the final image, errors in the "
                + "shadow decision stand out. The depth comparison results "
                + "in shadow where lit area should be - \"self-shadowing\".";
        this._shadowMap;
        this._finalBuffer;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            this._shadowMap = new SimShadowMap(scene._resolution);
            this._shadowMap.setBias(0.0);

            this._finalBuffer = new BufferBar(scene._resolution);
            this._finalBuffer.setShadowBitBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, this._shadowMap);
            this._finalBuffer.size(new RelativeSize(0.1, 0.05, 0.3, 0.15));

            scene._lightCamera.showCamera(true);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);


            scene._usualCamera.showCamera(true);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(true);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);


            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.update();

            scene._lightCamera.clear();
            scene._lightCamera.render(scene._sceneGround);
            scene._lightCamera.render(scene._sceneObject);
            scene._lightCamera.update();

            this._shadowMap.renderFinalImage(scene._lightCamera, scene._usualCamera);

            this._finalBuffer.update();

            scene._panelView.addChild(this._finalBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._panelView.removeChild(this._finalBuffer);
            scene._panelView.layout();
        };
        this.getTitle = function(){return "Slide 6";};
    };

Shadowmap_tutorial_one.prototype.SubsceneSeven =
    function(){
        this._labelText = "Reason for this are low depth precision and "
                + "the mapping of an area on one depth value. The comparison "
                + "is correct, as the fragment lies farther away than the sampled "
                + "distance. Solution for the former is increasing the precision.";
        this._shadowMap;
        this._ssevenLayer;
        this._linesOne;
        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            this._shadowMap = new SimShadowMap(scene._resolution);
            this._shadowMap.setBias(0.0);

            scene._lightCamera.showCamera(true);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);


            scene._usualCamera.showCamera(true);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);


            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.update();

            scene._lightCamera.clear();
            scene._lightCamera.render(scene._sceneGround);
            scene._lightCamera.render(scene._sceneObject);
            scene._lightCamera.update();

            this._shadowMap.renderFinalImage(scene._lightCamera, scene._usualCamera);

            var cam_pos = scene._usualCamera.getPosition();

            var points = [];//new float[resolution][2];
            for(var i=0; i<scene._resolution; i++)
                points[i] = scene._usualCamera.getRender().unprojectFragment(i);

            this._ssevenLayer = new PlanarLayer();
            this._linesOne = new Lines([
                    //light_pos[0], light_pos[1],  points[0][0], points[0][1],
                    points[0][0], points[0][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[1][0], points[1][1],
                    points[1][0], points[1][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[2][0], points[2][1],
                    points[2][0], points[2][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[3][0], points[3][1],
                    points[3][0], points[3][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[4][0], points[4][1],
                    points[4][0], points[4][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[5][0], points[5][1],
                    points[5][0], points[5][1],  cam_pos[0], cam_pos[1],
                    //light_pos[0], light_pos[1],  points[6][0], points[6][1],
                    points[6][0], points[6][1],  cam_pos[0], cam_pos[1],
                ], new Color(1,1,1,1));

            this._ssevenLayer.addObject(this._linesOne);
            scene._scenePlanar.addPlanarLayer(this._ssevenLayer);

            scene._scenePlanar.getCamera().dimension(-1, -0.5, 6, 2);
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._ssevenLayer);
            scene._scenePlanar.getCamera().dimension(-7, -4, 7, 9);
        };
        this.getTitle = function(){return "Slide 7";};
    };

Shadowmap_tutorial_one.prototype.SubsceneEight =
    function(){
        this._labelText = "To solve the geometric problem, a bias is added "
                + "to the shadow map values. This bias may be constant or "
                + "dependent on the light's angle.";

        this._shadowMap;

        this._ssevenLayer;
        this._linesOne;
        this._biasLabel;
        this._biasDecrease;
        this._biasIncrease;
        this._biasValue;

        this._frameBuffer;

        this._biasDecreaseAction = function(subscene, scene, source){
                var bias = scene._lightCamera.getRender().getRayBias() - 0.001;

                var text = Math.round(bias*1000)/1000;
                text = text.toString();
                var text_length = 5-text.length;
                for(var i=0; i<text_length; i++)
                    text = "0"+text;

                subscene._shadowMap.setBias(bias);
                scene._lightCamera.getRender().setRayBias(bias);
                subscene._biasValue.updateText(text);
                //lightCamera.getRender().update();
                scene._lightCamera.update();
                subscene._shadowMap.setBias(bias);
                subscene.updateFrame(scene);
        };
        this._biasIncreaseAction = function(subscene, scene, source){
                var bias = scene._lightCamera.getRender().getRayBias() + 0.001;
                
                var text = Math.round(bias*1000)/1000;
                text = text.toString();
                var text_length = 5-text.length;
                for(var i=0; i<text_length; i++)
                    text = "0"+text;
                
                subscene._shadowMap.setBias(bias);
                scene._lightCamera.getRender().setRayBias(bias);
                subscene._biasValue.updateText(text);
                //lightCamera.getRender().update();
                scene._lightCamera.update();
                subscene._shadowMap.setBias(bias);
                subscene.updateFrame(scene);
        };

        this.updateFrame = function(scene){
            this._shadowMap.renderFinalImage(scene._lightCamera, scene._usualCamera);
            this._frameBuffer.update();
        };

        this.init = function(scene){
            scene._tutorialText.updateText(this._labelText);

            this._biasLabel = new Label("Bias: ", new Color(0,0,0,1));
            this._biasLabel.size(new RelativeSize(0.1, 0.05, 0.2, 0.2));
            this._biasDecrease = new GuiButton("<", new Color(0,0,0,1), this._biasDecreaseAction.bind(this,this,scene));
            this._biasDecrease.size(new RelativeSize(0.3, 0.05, 0.05, 0.2));
            this._biasDecrease.setMouseOverColor(new Color(1,1,1,1));
            this._biasValue = new Label(" 0.000", new Color(0,0,0,1));
            this._biasValue.size(new RelativeSize(0.35, 0.05, 0.15, 0.2));
            this._biasIncrease = new GuiButton(">", new Color(0,0,0,1), this._biasIncreaseAction.bind(this,this,scene));
            this._biasIncrease.size(new RelativeSize(0.5, 0.05, 0.05, 0.2));
            this._biasIncrease.setMouseOverColor(new Color(1,1,1,1));

            scene._panelView.addChild(this._biasLabel);
            scene._panelView.addChild(this._biasDecrease);
            scene._panelView.addChild(this._biasValue);
            scene._panelView.addChild(this._biasIncrease);

            this._shadowMap = new SimShadowMap(scene._resolution);
            this._shadowMap.setBias(0.0);

            scene._lightCamera.showCamera(true);
            scene._lightCamera.getRender().showRenderRays(true);
            scene._lightCamera.getFrustum().showFrustum(true);
            scene._lightCamera.getFrustum().showOnlyNearPlane(true);


            scene._usualCamera.showCamera(true);
            scene._usualCamera.getRender().showRenderRays(false);
            scene._usualCamera.getFrustum().showFrustum(false);
            scene._usualCamera.getFrustum().showOnlyNearPlane(false);


            scene._usualCamera.clear();
            scene._usualCamera.render(scene._sceneGround);
            scene._usualCamera.render(scene._sceneObject);
            scene._usualCamera.update();

            scene._lightCamera.clear();
            scene._lightCamera.render(scene._sceneGround);
            scene._lightCamera.render(scene._sceneObject);
            scene._lightCamera.update();

            this._shadowMap.renderFinalImage(scene._lightCamera, scene._usualCamera);

            var cam_pos = scene._usualCamera.getPosition();

            var points = [];
            for(var i=0; i<scene._resolution; i++)
                points[i] = scene._usualCamera.getRender().unprojectFragment(i);
            var linePoints = [];
            for (var i=0; i<scene._resolution; i++) {
                linePoints[i*4] = cam_pos[0];
                linePoints[i*4+1] = cam_pos[1];
                linePoints[i*4+2] = points[i][0];
                linePoints[i*4+3] = points[i][1];
            }
            this._ssevenLayer = new PlanarLayer();


            this._linesOne = new Lines(linePoints,
                 new Color(1,1,1,1));

            this._ssevenLayer.addObject(this._linesOne);
            scene._scenePlanar.addPlanarLayer(this._ssevenLayer);

            //scenePlanar.getCamera().changeDimension(-1, -0.5f, 6, 2);
            scene._scenePlanar.getCamera().dimension(-7, -2, 7, 3);

            this._frameBuffer = new BufferBar(scene._resolution);
            this._frameBuffer.setShadowBitBuffer(BufferBar.prototype.TYPE.FRAME_BUFFER, this._shadowMap);
            this._frameBuffer.size(new RelativeSize(0.65, 0.05, 0.3, 0.2));
            this._frameBuffer.update();

            scene._panelView.addChild(this._frameBuffer);
            scene._panelView.layout();
        };
        this.update = function(scene){
        };
        this.destroy = function(scene){
            scene._tutorialText.updateText("");
            scene._scenePlanar.removePlanarLayer(this._ssevenLayer);
            scene._scenePlanar.getCamera().dimension(-7, -4, 7, 9);

            scene._panelView.removeChild(this._biasLabel);
            scene._panelView.removeChild(this._biasDecrease);
            scene._panelView.removeChild(this._biasValue);
            scene._panelView.removeChild(this._biasIncrease);
            scene._panelView.removeChild(this._frameBuffer);

            scene._panelView.layout();

            scene._lightCamera.getRender().setRayBias(0.0);
            //lightCamera.getRender().update();
            scene._lightCamera.update();
        };
        this.getTitle = function(){return "Slide 8";};
    };

//Shadowmap_tutorial_one.prototype.
//Shadowmap_tutorial_one.prototype.
