#version 100

uniform mat4 pmvMatrix;
uniform vec4 color;


attribute vec3 vertexPosition;
attribute vec2 uvPosition;


varying vec2 uvFragment;
varying vec4 fragColor;

void main(){
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
    uvFragment = uvPosition;
    fragColor = vec4(color);
}
