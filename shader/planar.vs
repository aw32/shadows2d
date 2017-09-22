#version 100

uniform mat4 pmvMatrix;

attribute vec3 vertexPosition;

attribute vec4 vertexColor;

varying vec4 fragment;

void main()
{

    gl_PointSize = 5.0;
	// Transforming The Vertex
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
    fragment = vertexColor;
}
