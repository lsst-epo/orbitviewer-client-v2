precision highp float;
#include <solar_compute>

attribute float N;
attribute float a;
attribute float e;
attribute float i;
attribute float w;
attribute float M;
attribute float n;
attribute float Tp;
attribute float q;
attribute float type;

attribute float alive;

flat out OrbitElements els;
out float isActive;

void main() {
    els.N = N;
    els.a = a;
    els.e = e;
    els.i = i;
    els.w = w;
    els.M = M;
    els.n = n;
    els.Tp = Tp;
    els.q = q;
    els.type = int(type);

    isActive = alive;

    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}