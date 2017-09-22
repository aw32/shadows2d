function Planar(){


this._layerList = [];

this._destroyLayers = [];

this._camera = new Camera();

this._clearColor = new Color(0.5, 0.5, 0.5, 1.0);

this._clear = true;

this._initiated = false;

//input stuff
this._mousePressed = false;
this._lastMouseCoord = new Float32Array(2);

}

Planar.prototype._planarProgram = null;

Planar.prototype.setClear = 
    function(clear){
        this._clear = clear;
    };

Planar.prototype.setClearColor = 
    function(clearColor){
        this._clearColor = clearColor;
    };

Planar.prototype.getCamera = 
    function(){
        return this._camera;
    };

Planar.prototype.init = 
    function(gl, width, height){
       
        //TODO: add program init
        if(Planar.prototype._planarProgram === null){
            Planar.prototype._planarProgram = new Program();
            var programReady = true;
            programReady = programReady & Planar.prototype._planarProgram.createProgram(gl);
            programReady = programReady & Planar.prototype._planarProgram.setVertexShader(gl, gl.res.getRessource('planar.vs'));
            programReady = programReady & Planar.prototype._planarProgram.setFragmentShader(gl, gl.res.getRessource('planar.fs'));
            programReady = programReady & Planar.prototype._planarProgram.compileProgram(gl);
            if(!programReady){
                console.log('creating shader failed.');
            }
        }

        this._camera.init(gl, Planar.prototype._planarProgram.getProgramId(), width, height);

        for(var layer in this._layerList){
            this._layerList[layer].init(gl, this._camera);
        }
    };

Planar.prototype.addPlanarLayer = 
    function(layer){
        this._layerList.push(layer);
    };

Planar.prototype.removePlanarLayer =
    function(layer){
        var index = this._layerList.indexOf(layer);
        this._layerList.splice(index, 1);
        this._destroyLayers.push(layer);
    };

Planar.prototype.showBoundingBox = 
    function(show){
        for(var layer in this._layerList){
            this._layerList[layer].showBoundingBoxes(show);
        }
    };

Planar.prototype.updateBuffer = 
    function(){
        for(var layer in this._layerList){
            this._layerList[layer].update();
        }
    };

Planar.prototype.display = 
    function(gl){

        while(this._destroyLayers.length > 0){
            this._destroyLayers.pop().dispose(gl);
        }
    
        if (this._clear){
            gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
       
        
 
        this._camera.update(true, false);

        gl.useProgram(Planar.prototype._planarProgram.getProgramId());
        this._camera.updateUniform(gl);
        gl.useProgram(null);
   
        
        var layer;
        for(var layerI in this._layerList){
            layer = this._layerList[layerI];
            if(!layer.isInitiated())
                layer.init(gl, this._camera);
            layer.display(gl, this._camera);
        }


    };

Planar.prototype.reshape = 
    function(gl, width, height){
        //console.log("Planar.reshape: "+width+" "+height);
        //console.trace();
        this._camera.reshape(gl, width, height);
        this._camera.update(false, true);
    };

Planar.prototype.dispose = 
    function(gl){
        for(var layer in this._layerList)
            this._layerList[layer].dispose(gl);
        while(this._destroyLayers.length > 0)
            this._destroyLayers.pop().dispose(gl);
    };

Planar.prototype.consumeEvent =
    function(e){
    
        if(e.type === "keyup") {
            if(e.key === "ArrowLeft" || e.key === "Left" || e.keyCode === 37){
                var pos = this._camera.getPosition();
                var dim = this._camera.getDimension();
                var keyMovementX = dim[1] / 6.0;
                this._camera.position(pos[0]-keyMovementX, pos[1], pos[2]);
            } else
            if(e.key === "ArrowRight" || e.key === "Right" || e.keyCode === 39){
                var pos = this._camera.getPosition();
                var dim = this._camera.getDimension();
                var keyMovementX = dim[1] / 6.0;
                this._camera.position(pos[0]+keyMovementX, pos[1], pos[2]);
            } else
            if(e.key === "ArrowUp" || e.key === "Up" || e.keyCode === 38){
                var pos = this._camera.getPosition();
                var dim = this._camera.getDimension();
                var keyMovementY = dim[3] / 6.0;
                this._camera.position(pos[0], pos[1]+keyMovementY, pos[2]);
            } else
            if(e.key === "ArrowDown" || e.key === "Down" || e.keyCode === 40){
                var pos = this._camera.getPosition();
                var dim = this._camera.getDimension();
                var keyMovementY = dim[3] / 6.0;
                this._camera.position(pos[0], pos[1]-keyMovementY, pos[2]);
            } else
            if(e.key === "PageUp" || e.keyCode === 33 || e.key === "+" || e.keyCode === 187) {
                var dim = this._camera.getDimension();
                var h = dim[1] / 2.0;
                var v = dim[3] / 2.0;
                if (h != 1 && v != 0)
                    this._camera.dimension(-h, h, -v, v);
            } else
            if(e.key === "PageDown" || e.keyCode === 34 || e.key === "-" || e.keyCode === 189){
                var dim = this._camera.getDimension();
                var h = dim[1] * 2.0;
                var v = dim[3] * 2.0;
                if (h != Number.POSITIVE_INFINITY && v != Number.POSITIVE_INFINITY)
                    this._camera.dimension(-h, h, -v, v);
            } else
            if(e.key === " " || e.keyCode === 32){
                this._camera.position(0,0,1);
                this._camera.dimension(10,10,10,10);
            }
        
            
        } else
        if(e.type === "mousedown"){
            this._mousePressed = true;
            this._lastMouseCoord[0] = e.clientX;
            this._lastMouseCoord[1] = e.clientY;
        } else
        if(e.type === "mouseup"){
            this._mousePressed = false;
        } else
        if(e.type === "mousemove"){
            if(this._mousePressed){
                var p = this._camera.getPosition();
                var dim = this._camera.getDimension();
                var sensibilityX = (dim[1] * 2.0) / this._camera._width;
                var sensibilityY = (dim[3] * 2.0) / this._camera._height;
                this._camera.position(p[0]-sensibilityX*(e.clientX - this._lastMouseCoord[0]),
                                    p[1]+sensibilityY*(e.clientY - this._lastMouseCoord[1]),p[2]);
                this._lastMouseCoord[0] = e.clientX;
                this._lastMouseCoord[1] = e.clientY;
            }
        }
        //console.log(e.type); 

        return false;
    };
