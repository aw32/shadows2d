#version 120


varying vec2 uvFragment;

uniform sampler2D textureThing;

void main(void)
{
	// Setting Each Pixel To Red
	
	 //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	 //gl_FragColor = fragment;
	 
	 //gl_FragColor = vec4(texture2D( textureThing, uvFragment ).rgb,1.0);
	 gl_FragColor = texture2D( textureThing, uvFragment );
}