oGlow = glowBlack;

#include <premultiplied_alpha_fragment>

/* if(isPlanet) {
  float D = distance(vPosO.xyz, planetPosition);
  // float pD = smoothstep(fadeDistance * 1.1, fadeDistance * 1.5, D);

  float pD = smoothstep(5000.0, 10000.0, D);
  alpha *= pD;
} */

if(alpha < .01) discard;