#version 100

precision highp float;
varying vec2 uvFragment;
varying vec4 fragColor;

uniform sampler2D textureThing;


void main(void)
{
	// Setting Each Pixel To Red
	
	 //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	 //gl_FragColor = fragment;
	 
	 //gl_FragColor = vec4(texture2D( textureThing, uvFragment ).rgb,1.0);
	 gl_FragColor = texture2D( textureThing, uvFragment ) * fragColor;
	 //if (gl_FragColor.a == 1.0)
	 //gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
