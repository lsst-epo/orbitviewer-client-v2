in vec2 vUv;
uniform float time;

uniform sampler2D map;

#include <polar>
#include <fbm4D>

void main () {
  vec2 cUV = vUv;
  float c = texture2D(map, cUV).r;

  vec3 p = toPolar(vUv);
  float n = fbm(vec4(p * vec3(8.0, 4.0, 4.0), time * .08), 6);

  n = smoothstep(-.9, 1., n);

  n *= c;

  gl_FragColor = vec4(vec3(n), 1.0);
}