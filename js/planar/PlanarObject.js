function PlanarObject(){

this._bbox = new BoundingBox();

this._dispBbox = false;

this._bboxColor = new Color(1.0, 0.0, 0.0, 1.0);

this._initiated = false;

this._needLocalUpdate = true;

this._needLayerUpdate = true;

this._display = true;

this._directDisplay = false;

this._renderDisplay = true;

this._transform = false;

this._scale = 1.0;

this._rotation = 0;

this._translate = new Float32Array(3);

this._initialTranslate = new Float32Array(3);

this._transformMatrix = new Float32Array(16);

}

PlanarObject.prototype.translate =
    function(x, y){
        this._translate[0] = x;
        this._translate[1] = y;
        if(this._transform)
            this._needLocalUpdate = true;
    };

PlanarObject.prototype.rotate =
    function(angle){
        this._rotation = angle;
        if(this._transform)
            this._needLocalUpdate = true;
    };

PlanarObject.prototype.scale =
    function(scale){
        this._scale = scale;
        if(this._transform)
            this._needLocalUpdate = true;
    };

PlanarObject.prototype.setTransform =
    function(trans){
        if(this._transform != trans){
            this._transform = trans;
            this._needLocalUpdate = true;
        }
    };

PlanarObject.prototype.getTransform =
    function(){
        return this._transform;
    };

PlanarObject.prototype._updateTransformMatrix =
    function(){
        CGMath.identity4(this._transformMatrix);
        var temp = new Float32Array(16);
        var quat = new Quaternion();
        quat.axisAngle([0.0,0.0,1.0], this._rotation);
        var rMatrix = new Float32Array(16);
        quat.toMatrix4(rMatrix);
        var sMatrix = new Float32Array([
            this._scale, 0, 0, 0,
            0, this._scale, 0, 0,
            0, 0, this._scale, 0,
            0, 0, 0, 1
        ]);
        
        var itMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            this._initialTranslate[0], this._initialTranslate[1], this._initialTranslate[2], 1
        ]);
        var tMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            this._translate[0], this._translate[1], this._translate[2], 1
        ]);
        CGMath.multMat4(itMatrix, this._transformMatrix, temp);
        CGMath.multMat4(rMatrix, temp, this._transformMatrix);
        CGMath.multMat4(sMatrix, this._transformMatrix, temp);
        CGMath.multMat4(tMatrix, temp, this._transformMatrix);
    };

PlanarObject.prototype._transformBoundingBox =
    function(){
        var point = new Float32Array(4);
        var result = new Float32Array(4);
        
        var newAxes = new Axes();

        point[0] = this._bbox._axes._axis1_x;
        point[1] = this._bbox._axes._axis1_y;
        CGMath.multMatVec4(this._transformMatrix, point, result);
        newAxes._axis1_x = result[0] / this._scale;
        newAxes._axis1_y = result[1] / this._scale;
        
        point[0] = this._bbox._axes._axis2_x;
        point[1] = this._bbox._axes._axis2_y;
        CGMath.multMatVec4(this._transformMatrix, point, result);
        newAxes._axis2_x = result[0] / this._scale;
        newAxes._axis2_y = result[1] / this._scale;

        this._bbox._axes = newAxes;

        this._bbox._extent_axis1 = this._bbox._extent_axis1 * this._scale;
        this._bbox._extent_axis2 = this._bbox._extent_axis2 * this._scale;

        point[0] = this._bbox._center[0];
        point[1] = this._bbox._center[1];
        point[3] = 1;
        CGMath.multMatVec4(this._transformMatrix, point, result);
        this._bbox._center[0] = result[0];
        this._bbox._center[1] = result[1];
    };

PlanarObject.prototype.needLayerUpdate =
    function(){
        return this._needLayerUpdate;
    };

PlanarObject.prototype.getBoundingBox =
    function(){
        return this._bbox;
    };

PlanarObject.prototype.setDisplayBoundingBox =
    function(b){
        if(this._dispBbox != b){
            this._dispBbox = b;
            this._needLayerUpdate = true;
        }
    };

PlanarObject.prototype.getDisplayBoundingBox =
    function(){
        return this._dispBbox;
    };

PlanarObject.prototype.getDisplay =
    function(){
        return this._display;
    };

PlanarObject.prototype.setDisplay =
    function(display){
        if(this._display != display){
            this._display = display;
            this._needLayerUpdate = true;
        }
    };

PlanarObject.prototype.directDisplay =
    function(){
        return this._directDisplay;
    };

PlanarObject.prototype.renderDisplay =
    function(){
        return this._renderDisplay;
    };

PlanarObject.prototype.collide =
    function(x, y){
        return this._bbox.collide(x, y);
    };

PlanarObject.prototype.changed =
    function(){
        return this._needLayerUpdate || (this._display && this._renderDisplay && this._needLocalUpdate);
    };

PlanarObject.prototype.isInitiated =
    function(){
        return this._initiated;
    };

PlanarObject.prototype._layerUpdated =
    function(){
        return this._needLayerUpdate = false;
    };

PlanarObject.prototype.render =
    function(layer){
        if(this._dispBbox){
            layer.renderLines(this._bbox.getBoundingBoxLines(), 1.0, this._bboxColor);
        }
        this._needLayerUpdate = false;
    };

PlanarObject.prototype.init =
    function(gl, camera){
        this._initiated = true;
    };

PlanarObject.prototype.display =
    function(gl, camera){
    };

PlanarObject.prototype.dispose =
    function(gl){
    };



function BoundingBox(){

this._center = new Float32Array(2);

this._axes = new Axes(1,0,0,1);

this._extent_axis1 = 0;

this._extent_axis2 = 0;

this._id = BoundingBox.prototype.id++;

}

BoundingBox.prototype.id = 0;

BoundingBox.prototype.getBoundingBoxLines =
    function(){
        var points = new Float32Array(16);
        points.set([
            this._center[0] + this._axes._axis1_x * this._extent_axis1 + this._axes._axis2_x * this._extent_axis2,
            this._center[1] + this._axes._axis1_y * this._extent_axis1 + this._axes._axis2_y * this._extent_axis2,
            this._center[0] - this._axes._axis1_x * this._extent_axis1 + this._axes._axis2_x * this._extent_axis2,
            this._center[1] - this._axes._axis1_y * this._extent_axis1 + this._axes._axis2_y * this._extent_axis2,

            this._center[0] - this._axes._axis1_x * this._extent_axis1 + this._axes._axis2_x * this._extent_axis2,
            this._center[1] - this._axes._axis1_y * this._extent_axis1 + this._axes._axis2_y * this._extent_axis2,
            this._center[0] - this._axes._axis1_x * this._extent_axis1 - this._axes._axis2_x * this._extent_axis2,
            this._center[1] - this._axes._axis1_y * this._extent_axis1 - this._axes._axis2_y * this._extent_axis2,



            this._center[0] - this._axes._axis1_x * this._extent_axis1 - this._axes._axis2_x * this._extent_axis2,
            this._center[1] - this._axes._axis1_y * this._extent_axis1 - this._axes._axis2_y * this._extent_axis2,
            this._center[0] + this._axes._axis1_x * this._extent_axis1 - this._axes._axis2_x * this._extent_axis2,
            this._center[1] + this._axes._axis1_y * this._extent_axis1 - this._axes._axis2_y * this._extent_axis2,
 
            this._center[0] + this._axes._axis1_x * this._extent_axis1 - this._axes._axis2_x * this._extent_axis2,
            this._center[1] + this._axes._axis1_y * this._extent_axis1 - this._axes._axis2_y * this._extent_axis2,
            this._center[0] + this._axes._axis1_x * this._extent_axis1 + this._axes._axis2_x * this._extent_axis2,
            this._center[1] + this._axes._axis1_y * this._extent_axis1 + this._axes._axis2_y * this._extent_axis2,
        ]);
        return points;
    };

BoundingBox.prototype.collide1 =
    function(x, y){
        //console.log("collide: "+x+","+y+","+this.toString()+",");
        var quat = new Quaternion();
        var crossV = new Float32Array(3);
        var ax1 = [this._axes._axis1_x, this._axes._axis1_y, 0.0];
        var ax2 = [0.0,1.0,0.0];
        //var ax2 = [this._axes._axis2_x, this._axes._axis2_y, 0.0];
        CGMath.crossVec3(ax1,ax2, crossV);
        var ax1_len = Math.sqrt(this._axes._axis1_x*this._axes._axis1_x + this._axes._axis1_y*this._axes._axis1_y);
        var angle2 = CGMath.dotVec3(ax1,[0.0,1.0,0.0]);
        angle2 = angle2 /ax1_len;
        angle2 = Math.asin(angle2);
        var angle = CGMath.dotVec3(ax1,ax2);
        quat.axisAngle(crossV, angle);
        var f = new Float32Array([
            x - this._center[0],
            y - this._center[1],
            0
        ]);
        
        var foo = f[0]+","+f[1]+",";
        quat.rotateVector(f, f);
        foo += f[0]+","+f[1];
        console.log(foo);
        //console.log("check f rotated: "+f[0]+","+f[1]+","+f[2]);

var bar =         Tools.rotateDirection(f,angle2);
        f  = bar;
        if(Math.abs(f[0]) <= this._extent_axis1 && Math.abs(f[1]) <= this._extent_axis2)
            return true;
        return false; 
    };

BoundingBox.prototype.collide =
    function(x,y){
//        dot angle in radians!!
  //      axisAngle method expects angle as degree!
        var quat = new Quaternion();
        //var crossV = new Float32Array(3);
        //var ax1 = [this._axes._axis2_x, this._axes._axis2_y, 0.0];
        //var ax2 = [0.0,1.0,0.0];
        //CGMath.crossVec3(ax1,ax2, crossV);
        var crossV = [0.0,0.0,1.0];
//        var angle = CGMath.dotVec3(ax1,ax2);
        //var angle = CGMath.angleVec3([this._axes._axis1_x,this._axes._axis1_y,0],[1.0,0.0,0.0]);
        var angle = CGMath.angleVec3([1.0,0.0,0.0],[this._axes._axis1_x,this._axes._axis1_y,0]);
        var dot = this._axes._axis1_x;
        angle = Math.acos(dot);
        if (this._axes._axis1_y<0)
                angle = 360 - CGMath.toDegrees(angle);
            else
                angle = CGMath.toDegrees(angle);
        //console.log("angle: "+angle);
        quat.axisAngle(crossV, -angle);
        //console.log("collide "+(-angle));
        var f = new Float32Array([
            x - this._center[0], 
            y - this._center[1],
            0
        ]);
        var foo = CGMath.angleVec3(f,[1,0,0]);
        //console.log(this._id+" a: "+foo);
        quat.rotateVector(f, f);
        if(Math.abs(f[0]) <= this._extent_axis1 && Math.abs(f[1]) <= this._extent_axis2)
            return true;
        return false;

    };
BoundingBox.prototype.doStuff =
    function(){
        
    };

BoundingBox.prototype.toString =
    function(){
        return "{center: "+this._center[0]+","+this._center[1]+";axis1: "+this._axes._axis1_x+","+this._axes._axis1_y+";axis2: "+this._axes._axis2_x+","+this._axes._axis2_y+";extent1: "+this._extent_axis1+";extent2: "+this._extent_axis2+"}";
    };

function Axes(x1, y1, x2, y2){

this._axis1_x = x1;
this._axis1_y = y1;
this._axis2_x = x2;
this._axis2_y = y2;

}

Axes.prototype.set =
    function(x1, y1, x2, y2){
        this._axis1_x = x1;
        this._axis1_y = y1;
        this._axis2_x = x2;
        this._axis2_y = y2;
    };
