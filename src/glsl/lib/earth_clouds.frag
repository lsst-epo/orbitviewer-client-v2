in vec2 vUv;
uniform float time;

uniform sampler2D map;

#include <polar>
#include <fbm4D>

void main () {
  vec2 cUV = vUv;
  // float c = texture2D(map, cUV).r;

  vec3 p = toPolar(vUv);
  float n1 = snoise(vec4(p, time * .0001));
  n1 = smoothstep(0. , 1., n1);
  // vec3 scale = mix(vec3(2.0, 1.0, 2.0), vec3(8.0, 4.0, 4.0), n1);
  float scale = mix(2.0, 4.0, n1);
  float n = fbm(vec4(p * scale, time * .001), 6);

  n = smoothstep(0., 1., n);

  // n += c * .1;

  gl_FragColor = vec4(vec3(n), 1.0);
}