precision highp float;
// attribute float weight;
attribute vec3 iPos;
// out float vWeight;
out vec3 vPosition;

uniform highp float time;

#include <fresnel_pars_vert>

#include <curl4D>

void main() {
  // vWeight = weight;
  vPosition = iPos + position;

  #include <fresnel_vert>

  // float ramp = smoothstep(0., .1, weight);
  // float curlTime = fract(time * .01) * 24.0;

  vec3 pos = iPos + .2 * curlNoise4D_simple(vec4(vPosition * 2.0 + .06 * snoise(vec4(uv, time * .05, time * .06 + 1.56)), time * .05)) + position;
  vPosition = pos;

  // gl_PointSize = 32.0;

  vec4 transformed = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * transformed;
}