function SceneSelectionScene(){

BasicScene.call(this);

this._superEventQueue = null;

this._eventQueue = [];

this._touchTracker = new TouchTracker();

this._currentSceneEnum = null;

this._nextSceneEnum = null;

this._currentScene = null;

this._showMenu = true;

this._previousSceneAction = function(source){
    this.previousScene();
}.bind(this);

this._nextSceneAction = function(source){
    this.nextScene();
}.bind(this);

this._menuPlanar = null;

this._menuLayer = null;

this._menuView = null;

this._menuButtons = new Array(SceneSelectionScene.prototype.sceneNames.length);

this._ressourceList = [
        ["data", "planar.vs", "shader/planar.vs"],
        ["data", "planar.fs", "shader/planar.fs"],
        ["data", "bitmapText.vs", "shader/bitmapText.vs"],
        ["data", "bitmapText.fs", "shader/bitmapText.fs"],
        ["image", "ubuntuFont.png", "ubuntuFont.png"],
        ["data", "ubuntuDescr.json", "ubuntuDescr.json"]
    ];


}

SceneSelectionScene.prototype = new BasicScene();
SceneSelectionScene.prototype.constructor = SceneSelectionScene;

SceneSelectionScene.prototype.SCENE = {
    SHADOW_MAP : 0,
    SHADOW_MAP_2 : 1,
    SHADOW_VOLUME : 2,
    SHADOW_VOLUME_2 : 3,
    values : [0,1,2,3]
};

SceneSelectionScene.prototype.sceneNames = [
    "Shadow Map I", "Shadow Map II", "Shadow Volume I", "Shadow Volume II"   
];


SceneSelectionScene.prototype.init =
    function(eventFifo, width, height, gl){
        this._superEventQueue = eventFifo;
                
        this._menuPlanar = new Planar();
        this._menuLayer = new PlanarLayer();
        this._menuView = new View(this._menuPlanar, this._menuLayer);
        for(var i=0; i<SceneSelectionScene.prototype.sceneNames.length; i++) {
                        
            var nextScene = SceneSelectionScene.prototype.SCENE.values[i];
                      
            this._menuButtons[i] = new GuiButton(SceneSelectionScene.prototype.sceneNames[i], new Color(0,0,0,1),  function (nextScene, source){
                    this.chooseNextScene(nextScene);
                }.bind(this,nextScene));
            this._menuButtons[i].size(new RelativeSize(0.05, 1-( 0.15*(i+1)), 0.9, 0.1));
            this._menuButtons[i].setMouseOverColor(new Color(0.15, 0.0, 0.5,1));
            this._menuView.addChild(this._menuButtons[i]);
        }
                
        this._menuView.layout();
        
        this._menuPlanar.addPlanarLayer(this._menuLayer);
                
        this._menuPlanar.init(gl, width, height);
                
        gl.enable(gl.SCISSOR_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
       
 
        window.document.title = "Shadow Tutorial Selection";
    };

SceneSelectionScene.prototype.previousScene = 
    function(){
        var scenes = SceneSelectionScene.prototypeSCENE.values;

        if (this._currentSceneEnum == null)
            this._nextSceneEnum = scenes[0];
        else {
            var current = -1;
            var previous;
        
            for(var i=0; i<scenes.length; i++)
                if (scenes[i] == this._currentSceneEnum) {
                    current = i;
                    break;
                }

            previous = current -1;
                        
            if (previous<0){
                previous = current;
            }
            else
                this._nextSceneEnum = scenes[previous];
        }
    };

SceneSelectionScene.prototype.nextScene =
    function(){
        var scenes = SceneSelectionScene.prototype.SCENE.values;
                
        if (this._currentSceneEnum == null)
            this._nextSceneEnum = scenes[0];
        else {
            var current = -1;
            var next;
                        
            for(var i=0; i<scenes.length; i++)
                if (scenes[i] == this._currentSceneEnum) {
                    current = i;
                    break;
                }

            next = current +1;
                        
            if (next>=scenes.length){
                next = current;
            }
            else
                this._nextSceneEnum = scenes[next];
        }
    };

SceneSelectionScene.prototype.changeScene  =
    function(gl, nextScene){
        if (this._currentScene != null) {
            this._currentScene.destroy(gl);
            this._currentScene = null;
        }
        switch(nextScene) {
            case SceneSelectionScene.prototype.SCENE.SHADOW_MAP:
                this._currentScene = new Shadowmap_tutorial_one(this._previousSceneAction, this._nextSceneAction);
            break;
            case SceneSelectionScene.prototype.SCENE.SHADOW_MAP_2:
                this._currentScene = new Shadowmap_tutorial_two();
            break;
            case SceneSelectionScene.prototype.SCENE.SHADOW_VOLUME:
                this._currentScene = new Shadowvolume_tutorial_one(this._previousSceneAction, this._nextSceneAction);
            break;
            case SceneSelectionScene.prototype.SCENE.SHADOW_VOLUME_2:
                this._currentScene = new Shadowvolume_tutorial_two();
            break;
        }
        this._currentSceneEnum = nextScene;
        this._currentScene.init(this._eventQueue, this._width, this._height, gl);
        this._currentScene.reshape(gl, this._width, this._height);
    };

SceneSelectionScene.prototype.chooseNextScene =
    function(nextScene) {
        this._nextSceneEnum = nextScene;
    };

SceneSelectionScene.prototype.display =
    function(gl) {
                
        while(this._superEventQueue.length>0)
            this.consumeEvent(this._superEventQueue.splice(0,1)[0]);
       
        //console.log("draw");         
                
        if (this._nextSceneEnum != null) {
            this._showMenu = false;
            this.changeScene(gl, this._nextSceneEnum);
            this._nextSceneEnum = null;
        }
                
        if (this._showMenu) {
            
            gl.scissor(0, 0, this._width, this._height);
                        
            // display menu if activated
            this._menuPlanar.updateBuffer();
                        
            //console.log("showing Menu "+this._width+","+this._height);

            this._menuPlanar.display(gl);
        } else {
            // display current scene else
                        
            if (this._currentScene != null)
                this._currentScene.display(gl);
        }
    };

SceneSelectionScene.prototype.destroy =
    function(gl) {
        if (this._currentScene != null) {
            this._currentScene.destroy(gl);
            this._currentScene = null;
        }
        this._menuPlanar.dispose(drawable);  
    };

SceneSelectionScene.prototype.reshape =
    function(gl, width, height) {
        BasicScene.prototype.reshape.call(this, gl, width, height); 
        this._menuPlanar.reshape(gl,
                width, 
                height);
                
        this._menuView.layout();
        
        if (this._currentScene != null) {
                this._currentScene.reshape(gl, width, height);
        }
    };

SceneSelectionScene.prototype.consumeEvent =
    function(e) {
        
        var tevents = (Tools.isTouchEvent(e)?this._touchTracker.processEventSilent(e):[]);
        var temp = e.type+" ";
        for(var i=0; i<tevents.length;i++)
            temp += tevents[i].type+" ";
        console.log(temp);
       
        if ( Tools.isKeyEvent(e) && this._currentSceneEnum != null) {
            var kEvent = e;
            if ( ( kEvent.key === "Esc" || kEvent.key === "Escape" || kEvent.keyCode === 27 ) && kEvent.type === "keyup") {
                this._showMenu = !this._showMenu;
                kEvent.consumed = true;
            }
        } else
        if (Tools.isKeyEvent(e) && this._currentSceneEnum != null) {
            for(var i=0; i<tevents.length; i++) {  
                var tevent = tevents[i];
                if(tevent.type === "touchtwoclick") {
                    this._showMenu = !this._showMenu;
                    e.consumed = true;
                    e.preventDefault();
                }
            }
        }
                
        if (this._showMenu) {
                        
            if ( Tools.isMouseEvent(e)) {
                var mEvent = e;

                var relativePosition;
                                
                relativePosition = RelativeSize.prototype.createRelativePosition(mEvent.clientX, this._height-mEvent.clientY, 0,0,this._width,this._height);
                                
                this._menuView.consumeMouseEvent(mEvent, relativePosition);
            } else
            if ( Tools.isTouchEvent(e) ) {
                for(var i=0; i<tevents.length; i++) {
                    var tevent = tevents[i];
                    if(tevent.type === "touchclick"){
                        var relativePosition = RelativeSize.prototype.createRelativePosition(tevent.pageX, this._height-tevent.pageY, 0,0,this._width,this._height);
                        this._menuView.consumeTouchEvent(tevent, relativePosition);
                    } 
                }
            }
        }
                
        if (!e.isConsumed)
            this._eventQueue.push(e);
                
        return false;
    };




