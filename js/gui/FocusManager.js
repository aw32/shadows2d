FocusManager = {};

FocusManager._focusedObject = null;

FocusManager.setFocus =
    function(focusedObject){
        if(this._focusedObject != null)
            this._focusedObject.blur();
        this._focusedObject = focusedObject;
    };

FocusManager.getFocusObject =
    function(){
        return this._focusedObject;
    };

FocusManager.blur =
    function(){
        if(this._focusedObject != null){
            this._focusedObject.blur();
            this._focusedObject = null;
        }
    };
