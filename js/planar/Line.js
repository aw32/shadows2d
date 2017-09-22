function Line(from, to){
    // call supertype constructor
    PlanarObject.call(this);

    this._from = from;
    
    this._to = to;

    this._lineColor = new Color(1.0, 1.0, 1.0, 1.0);

    this._width = 0.1;

    this._localPointBuffer = new Float32Array(4);

    this._needLocalUpdate = true;
}

Line.prototype = new PlanarObject();
Line.prototype.constructor = Line;

Line.prototype.setColor =
    function(color){
        this._lineColor = color;
        this._needLocalUpdate = true;
    };

Line.prototype.updateLine =
    function(from, to){
        this._from = from;
        this._to = to;
    };

Line.prototype.updateBoundingBox =
    function(){

        this._bbox._center = new Float32Array(2);
        this._bbox._center.set([
            this._from[0] + ((this._to[0] - this._from[0])/2),
            this._from[1] + ((this._to[1] - this._from[1])/2)
        ]);

        var cross = new Float32Array(3);
        CGMath.crossVec3(new Float32Array([ this._to[0]-this._from[0], this._to[1]-this._from[1], 0.0 ]),
            new Float32Array([ 0.0, 0.0, 1.0 ]), cross );

        var axis1 = new Float32Array(3);
        CGMath.normalizeVec3(cross, axis1);
        var axis2 = new Float32Array(3);
        CGMath.normalizeVec3(new Float32Array([ this._to[0]-this._from[0], this._to[1]-this._from[1], 0.0 ]), axis2);
        this._bbox._axes = new Axes(axis1[0], axis1[1], axis2[0], axis2[1]);
        this._bbox._extent_axis1 = this._width;

        this._bbox._extent_axis2 = CGMath.distVec3(
                [ this._from[0], this._from[1], 0.0 ],
                [ this._to[0], this._to[1], 0.0 ]
            ) / 2.0;

        //console.log("line bbox: "+this._bbox.toString());
    };

Line.prototype.display =
    function(gl, camera){
    };

Line.prototype.render =
    function(layer){
        if(this._needLocalUpdate){

            this.updateBoundingBox();

            if(this._transform){

                this._initialTranslate[0] = - this._bbox._center[0];
                this._initialTranslate[1] = - this._bbox._center[1];

                this._translate[0] = this._bbox._center[0];
                this._translate[1] = this._bbox._center[1];

                this._updateTransformMatrix();

                this._transformBoundingBox();

                var point = new Float32Array(4);

                point[0] = this._from[0];
                point[1] = this._from[1];
                point[3] = 1.0;
                var result = new Float32Array(4);
                CGMath.multMatVec4(this._transformMatrix, point, result);
                this._localPointBuffer[0] = result[0];
                this._localPointBuffer[1] = result[1];

                point[0] = this._to[0];
                point[1] = this._to[1];
                CGMath.multMatVec4(this._transformMatrix, point, result);
                this._localPointBuffer[2] = result[0];
                this._localPointBuffer[3] = result[1];


            } else {

                this._localPointBuffer[0] = this._from[0];
                this._localPointBuffer[1] = this._from[1];
                this._localPointBuffer[2] = this._to[0];
                this._localPointBuffer[3] = this._to[1];

            }
            this._needLocalUpdate = false;
        }

        layer.renderLines(this._localPointBuffer, 4, this._lineColor);

        if(this._dispBbox){
            layer.renderLines(this._bbox.getBoundingBoxLines(), 16, this._bboxColor);
        }

        this._needLayerUpdate = false;
    };

Line.prototype.dispose =
    function(gl){

    };




