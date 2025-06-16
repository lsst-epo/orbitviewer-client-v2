#include <clipping_planes_vertex>

if(isPlanet) {
  vec4 oPos = inverse(projectionMatrix) * clip;
  vPosO = oPos.xyz;
  // float D = distance(oPos.xyz, planetPosition);
  // vDistance = smoothstep(fadeDistance * 1.1, fadeDistance * 1.5, D);
  // vDistance = smoothstep(500.0, 2000.0, D);
} else {
  vDistance = 1.0;
}