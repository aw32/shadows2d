function View(planar,layer){

this._camera = planar.getCamera();

this._planar = planar;

this._layer = layer;

this._childrenList = [];

}


View.prototype.addChild =
    function(object){
        this._childrenList.push(object);
        object.addToLayer(this._layer);
    };

View.prototype.removeChild =
    function(object){
        var i = this._childrenList.indexOf(object);
        if(i > -1)
            this._childrenList.splice(i, 1);
        object.removeFromLayer(this._layer);
    };

View.prototype.getChildren =
    function(){
        return this._childrenList;
    };

View.prototype.layout =
    function(){
        var coordSize = this._camera.getCoordinateSize();
        //console.log("layout-coordSize: "+coordSize.toString());
        var obj;
        for(var i=0; i<this._childrenList.length; i++) {
            obj = this._childrenList[i];
            var size = obj.getSize();
            //console.log("layout-size: "+size);
            // calculate relative object sizes to coordinates and sizes in world space
            obj.layout(coordSize._x  + coordSize._width * size._x, coordSize._y + coordSize._height * size._y, coordSize._width * size._width, coordSize._height * size._height);
        }
    };

View.prototype.layoutChild =
    function(obj){
        var coordSize = this._camera.getCoordinateSize();
        //console.log("layoutChild: "+coordSize.toString());
        var size = obj.getSize();
        // calculate relative object sizes to coordinates and sizes in world space
        obj.layout(coordSize._x  + coordSize._width * size._x, coordSize._y + coordSize._height * size._y, coordSize._width * size._width, coordSize._height * size._height);
    };

View.prototype.consumeEvent =
    function(event) {  
                
        // check attachment, if some object claims focus
        return true;
    };

View.prototype.consumeMouseEvent =
    function(event, relativePosition) {
                
        //float[] coordinatePosition = camera.getPointDirection(event);
    
        for(var i=0; i<this._childrenList.length; i++) {
            //if ( childrenList.get(i) instanceof EventConsumer )
            if (typeof this._childrenList[i].consumeMouseEvent == 'function')
                this._childrenList[i].consumeMouseEvent(event, relativePosition);
        }
    
        return false;
    };

View.prototype.consumeKeyEvent =
    function(event){
        return false;
    };

View.prototype.consumeTouchEvent =
    function(event, relativePosition){
        for(var i=0; i<this._childrenList.length; i++) {
            //if ( childrenList.get(i) instanceof EventConsumer )
            if (typeof this._childrenList[i].consumeTouchEvent == 'function')
                this._childrenList[i].consumeTouchEvent(event, relativePosition);
        }

        return false;
    };
