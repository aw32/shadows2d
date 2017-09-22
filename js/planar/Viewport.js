function Viewport(){

this._regions = [];

this._width = 0;

this._height = 0;

}

Viewport.prototype.addViewportRegion =
    function(x,y,width,height){
        this._regions.push(new ViewportRegion(x,y,width,height));
        return this._regions.length-1;
    };

Viewport.prototype.updateViewportRegion =
    function(region,x,y,width,height){
        var reg = this._regions[region];
        reg._r_x = x;
        reg._r_y = y;
        reg._r_width = width;
        reg._r_height = height;
        reg.reshape(this._width, this._height);
    };

Viewport.prototype.getViewportRegionHeight =
    function(region){
        return this._regions[region].height;
    };

Viewport.prototype.getViewportRegionWidth =
    function(region){
        return this._regions[region].width;
    };

Viewport.prototype.getViewportRegion =
    function(region){
        return this._regions[region];
    };

Viewport.prototype.init =
    function(gl, width, height){
        this._width = width;
        this._height = height;
        for(var i in this._regions)
            this._regions[i].reshape(width,height);
    };

Viewport.prototype.deactivateViewports =
    function(gl){
        gl.glViewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

Viewport.prototype.changeViewport =
    function(gl, viewport){
        var region = this._regions[viewport];
        gl.viewport(region.x,region.y,region.width,region.height);
        gl.scissor(region.x,region.y,region.width,region.height);
    };

Viewport.prototype.resetViewport =
    function(gl){
        gl.viewport(0,0,this._width,this._height);
        gl.scissor(0,0,this._width,this._height);
    };

Viewport.prototype.reshape =
    function(gl,width,height){
        this._width = width;
        this._height = height;
        for(var i in this._regions)
            this._regions[i].reshape(width,height);
    };

function ViewportRegion(x,y,width,height){

this.r_x = x;

this.r_y = y;

this.r_width = width;

this.r_height = height;

this.x = 0;

this.y = 0;

this.width = 0;

this.height = 0;

}

ViewportRegion.prototype.reshape =
    function(width, height){
        this.x = this.r_x * width;
        this.y = this.r_y * height;
        this.width = this.r_width * width;
        this.height = this.r_height * height;
    };
