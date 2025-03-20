precision highp float;
#include <solar_compute>

uniform float d;

flat in OrbitElements els;
in float isActive;

void main() {
    vec3 pos;
    if(isActive == 0.0) {
        pos = vec3(1000000.0);
    } else {
        pos = computePosition(els, d);
    }

    gl_FragColor = vec4(pos, 1.0);
    // gl_FragColor = vec4(vec3(1.0), 1.0);
}