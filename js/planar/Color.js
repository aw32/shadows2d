function Color(red,green,blue,alpha){

this.r = red;
this.g = green;
this.b = blue;
this.a = alpha;


}

Color.prototype.hex = 
    function(){
        return '#'+red.toString(16)+green.toString(16)+blue.toString(16)+alpha.toString(16);
    };
