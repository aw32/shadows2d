function PlanarLayer(name){

this._name = name;

this._objects = [];

this._directDisplayObjects = [];

this._destroyObjects = [];

this._line_buffer = new Float32Array(128);
this._line_buffer_pos = 0;

this._point_buffer = new Float32Array(128);
this._point_buffer_pos = 0;

this._triangle_buffer = new Float32Array(128);
this._triangle_buffer_pos = 0;

this._posAttrib = -1;

this._colAttrib = -1;

this._line_vao = -1;

this._line_bo = -1;

this._point_vao = -1;

this._point_bo = -1;

this._triangle_vao = -1;

this._triangle_bo = -1;

this._needUpdate = false;

this._initiated = false;

}


PlanarLayer.prototype.addObject =
    function(obj){
        this._objects.push(obj);
        this._needUpdate = true;
    };

PlanarLayer.prototype.removeObject =
    function(obj){
        var index = this._objects.indexOf(obj);
        if(index != -1){
            this._objects.splice(index, 1);
            this._destroyObjects.push(obj);
            this._needUpdate = true;
        }
    };

PlanarLayer.prototype.isInitiated =
    function(){
        return this._initiated;
    };

PlanarLayer.prototype.updateRender =
    function(gl, camera){

        if (!this._needUpdate)
            return;

        //console.log("updateRender");
        
        this._line_buffer_pos = 0;
        this._point_buffer_pos = 0;
        this._triangle_buffer_pos = 0;

        this._directDisplayObjects = [];

        var obj;
        for (var objI in this._objects){
            obj = this._objects[objI];
            if(!obj.isInitiated())
                obj.init(gl, camera);

            if(obj.getDisplay()){
                if(obj.directDisplay()){
                    this._directDisplayObjects.push(obj);
                }
                if(obj.renderDisplay() || obj.needLayerUpdate()){
                    obj.render(this);
                }
            }
            obj._layerUpdated();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._line_bo);
        gl.bufferData(gl.ARRAY_BUFFER, this._line_buffer.subarray(0, this._line_buffer_pos), gl.DYNAMIC_DRAW);
        //console.log("line_buffer: "+CGMath._buffStr(this._line_buffer, 0, this._line_buffer_pos, 7));

        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._point_bo);
        gl.bufferData(gl.ARRAY_BUFFER, this._point_buffer.subarray(0, this._point_buffer_pos), gl.DYNAMIC_DRAW);
        //console.log("point_buffer: "+CGMath._buffStr(this._point_buffer, 0, this._point_buffer_pos, 7));

        gl.bindBuffer(gl.ARRAY_BUFFER, this._triangle_bo);
        gl.bufferData(gl.ARRAY_BUFFER, this._triangle_buffer.subarray(0, this._triangle_buffer_pos), gl.DYNAMIC_DRAW);
        //console.log("triangle_buffer: "+CGMath._buffStr(this._triangle_buffer, 0, this._triangle_buffer_pos, 7));

        this._needUpdate = false;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    };

PlanarLayer.prototype._enlargeBuffer =
    function(buffer, min){
        var newSize = buffer.length * 2;
        while(newSize < min)
            newSize = newSize * 2;
        var newBuffer = new Float32Array(newSize);
        newBuffer.set(buffer);
        return newBuffer;
    };

PlanarLayer.prototype._reduceBuffer =
    function(buffer, position){
        var newSize = buffer.length / 2;
        
        while(newSize/2 >= position)
            newSize = newSize / 2;
        if(newSize >= position){
            var newBuffer = new Float32Array(newSize);
            newBuffer.set(buffer.subarray(0,position));
        }
        return buffer;
    };

PlanarLayer.prototype.renderLines =
    function(points, length, color){
        if( (length/2) * 7 > this._line_buffer.length - this._line_buffer_pos )
            this._line_buffer = this._enlargeBuffer(this._line_buffer, this._line_buffer_pos + (length/2) * 7);
        for(var index=0; index<length; index = index +2){
            this._line_buffer.set([
                points[index], points[index+1], 0.0,
                color.r, color.g, color.b, color.a
            ], this._line_buffer_pos);

            this._line_buffer_pos = this._line_buffer_pos + 7;
        }
    };

PlanarLayer.prototype.renderPoints =
    function(points, length, color){
        if( (length/2) * 7 > this._point_buffer.length - this._point_buffer_pos )
            this._point_buffer = this._enlargeBuffer(this._point_buffer, this._point_buffer_pos + (length/2) * 7);
        for(var index=0; index<length; index = index +2){
            this._point_buffer.set([
                points[index], points[index+1], 0.0,
                color.r, color.g, color.b, color.a
            ], this._point_buffer_pos);
            this._point_buffer_pos = this._point_buffer_pos + 7;
        }
    };

PlanarLayer.prototype.renderTriangles =
    function(points, length, color){
        if( (length/2) * 7 > this._triangle_buffer.length - this._triangle_buffer_pos )
            this._triangle_buffer = this._enlargeBuffer(this._triangle_buffer, this._triangle_buffer_pos + (length/2) * 7);
        for(var index=0; index<length; index = index +2){
            this._triangle_buffer.set([
                points[index], points[index+1], 0.0,
                color.r, color.g, color.b, color.a
            ], this._triangle_buffer_pos);
            this._triangle_buffer_pos = this._triangle_buffer_pos + 7;
        }
    };

PlanarLayer.prototype.init =
    function(gl, camera){
        this._posAttrib = gl.getAttribLocation(Planar.prototype._planarProgram.getProgramId(), 'vertexPosition');
        this._colAttrib = gl.getAttribLocation(Planar.prototype._planarProgram.getProgramId(), 'vertexColor');

        this._line_bo = gl.createBuffer();
        this._point_bo = gl.createBuffer();
        this._triangle_bo = gl.createBuffer();

        this.updateRender(gl, camera);

        for(var obj in this._directDisplayObjects)
            this._directDisplayObjects[obj].init(gl, camera);

        this._initiated = true;
    };

PlanarLayer.prototype.display =
    function(gl, camera){
        
        while(this._destroyObjects.length > 0)
            this._destroyObjects.pop().dispose(gl);

        this.updateRender(gl, camera);

        gl.useProgram(Planar.prototype._planarProgram.getProgramId());

        if(this._triangle_buffer_pos > 0){
            gl.bindBuffer(gl.ARRAY_BUFFER, this._triangle_bo);
            gl.vertexAttribPointer(this._posAttrib, 3, gl.FLOAT, gl.FALSE, 7 * 4, 0);
            gl.enableVertexAttribArray(this._posAttrib);
            gl.vertexAttribPointer(this._colAttrib, 4, gl.FLOAT, gl.FALSE, 7 * 4, 3 * 4);
            gl.enableVertexAttribArray(this._colAttrib);
            gl.drawArrays(gl.TRIANGLES, 0, this._triangle_buffer_pos / 7);
        }

        if(this._line_buffer_pos > 0){
            gl.bindBuffer(gl.ARRAY_BUFFER, this._line_bo);
            gl.vertexAttribPointer(this._posAttrib, 3, gl.FLOAT, gl.FALSE, 7 * 4, 0);
            gl.enableVertexAttribArray(this._posAttrib);
            gl.vertexAttribPointer(this._colAttrib, 4, gl.FLOAT, gl.FALSE, 7 * 4, 3 * 4);
            gl.enableVertexAttribArray(this._colAttrib);
            gl.drawArrays(gl.LINES, 0, this._line_buffer_pos / 7);
        }

        if(this._point_buffer_pos > 0){
//            gl.pointSize(5.0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._point_bo);
            gl.vertexAttribPointer(this._posAttrib, 3, gl.FLOAT, gl.FALSE, 7 * 4, 0);
            gl.enableVertexAttribArray(this._posAttrib);
            gl.vertexAttribPointer(this._colAttrib, 4, gl.FLOAT, gl.FALSE, 7 * 4, 3 * 4);
            gl.enableVertexAttribArray(this._colAttrib);
            gl.drawArrays(gl.POINTS, 0, this._point_buffer_pos / 7);
        }

        gl.disableVertexAttribArray(this._posAttrib);
        gl.disableVertexAttribArray(this._colAttrib);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.useProgram(null);

        for(var obj in this._directDisplayObjects)
            this._directDisplayObjects[obj].display(gl, camera);
    };

PlanarLayer.prototype.update =
    function(){
        var update = false;
        for(var obj in this._objects){
            update = this._objects[obj].changed();
            if(update)
                break;
        }
        this._needUpdate = this._needUpdate || update;
    };

PlanarLayer.prototype.pointCollision =
    function(x, y){
        var result = [];

        for(var i=0; i<this._objects.length; i++)
            if(this._objects[i].collide(x, y))
                result.push(this._objects.collide);

        return result;
    };

PlanarLayer.prototype.showBoundingBoxes =
    function(show) {
        for(var i=0; i<this._objects.length; i++)
            this._objects[i].setDisplayBoundingBox(show);
    };

PlanarLayer.prototype.dispose =
    function(gl){
        for(var obj in this._objects)
            this._objects[obj].dispose(gl);
        for(var obj in this._destroyObjects)
            this._destroyObjects[obj].dispose(gl);
        delete this._line_buffer;
        delete this._point_buffer;
        delete this._triangle_buffer;
        gl.deleteBuffer(this._line_bo);
        this._line_bo = -1;
        gl.deleteBuffer(this._point_bo);
        this._point_bo = -1;
        gl.deleteBuffer(this._triangle_bo);
        this._triangle_bo = -1;
    };
 
