#version 100


precision highp float;
varying vec4 fragment;

void main(void)
{
	// Setting Each Pixel To Red
	
    gl_FragColor = fragment;
	 
}
