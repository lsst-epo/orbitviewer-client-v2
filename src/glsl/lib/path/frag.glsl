#include <color_fragment>

// oGlow = glowBlack;

/* if(isPlanet) {
  float D = distance(vPosO.xyz, planetPosition);
  // float pD = smoothstep(fadeDistance * 1.1, fadeDistance * 1.5, D);

  float pD = smoothstep(5000.0, 10000.0, D);
  alpha *= pD;
} */

if(alpha < .001) discard;

diffuseColor.rgb = generic_desaturate(diffuseColor.rgb, max(1.0 - opacity, .2));