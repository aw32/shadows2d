<a href="https://aw32.github.io/shadows2d/"><h1>WebGL 2D Simulation of Shadow Mapping and Shadow Volumes</h1></a>

There are four scenes available from the main menu.
Press ESC to show the main menu after starting a scene.

## Shadow Map I / Shadow Volume I
These scenes contain introductory slides about the Shadow Mapping and Shadow Volumes.
![](https://github.com/aw32/shadows2d/blob/master/screenshots/s1.png)
![](https://github.com/aw32/shadows2d/blob/master/screenshots/s3.png)

## Shadow Map II
This scene contains a 2D simulation of a 3D scene drawn as a cross section.
Objects in the scene:
* light source
* camera
* shadow receiver (ground)
* shadow caster (cube)
On the right side there are several bars and controls located:
* Color: The camera's frame buffer filled with the pixel's original color values.
* Shadow map: The depth values contained in the shadow map as rendered from the position of the light source.
* Shadow: The shadow decision for every pixel in the camera's frame buffer.
* Final frame: The camera's frame buffer with added shadows.
* Bias: Offset for the distance comparison used for the shadow decision.
* Resolution: Shadow map resolution.
* Bit depth: Shadow map bit depth.

![](https://github.com/aw32/shadows2d/blob/master/screenshots/s2.png)

## Shadow Volume II
This scene contains a 2D simulation of a 3D scene drawn as a cross section.
Objects in the scene:
* light source
* camera
* shadow receiver (ground)
* 2 shadow caster (diamond, line)
On the right side there are several bars and controls located:
* Color: The camera's frame buffer filled with the pixel's original color values.
* Stencil: Values for the stencil buffer for shadow volume rendering.
  * Green: Effect of rendering the green volume planes on the stencil buffer.
  * Blue: Effect of rendering the blue planes on the stencil buffer.
  * Black: Final stencil buffer state.
* Final frame: The camera's frame buffer with added shadows.
* Method (z-pass/z-fail): Shadow volume render method.

![](https://github.com/aw32/shadows2d/blob/master/screenshots/s4.png)

## Controls
* [+]/[-]: Zoom in/ out
* Cursor keys: Pan scene
* Camera/ light source
  * Click the object to select it.
  * Drag the red dot on the object to change the object position.
  * Drag the red dot in front of the object to change the camera angle/ light direction.
  * Click on the object to deselect it.
