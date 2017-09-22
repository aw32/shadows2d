#version 120

uniform mat4 pmvMatrix;

attribute vec3 vertexPosition;
attribute vec2 uvPosition;

varying vec2 uvFragment;

void main(){
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
    uvFragment = uvPosition;
}