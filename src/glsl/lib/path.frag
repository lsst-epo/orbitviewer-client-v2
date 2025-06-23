uniform vec3 color;
in float depth;

#include <glow_pars_frag>

void main () {
  vec4 col = vec4(
    color,
    1.0
  );

  float d = (1.0 - depth);
  if(d < .001) discard;


  // color.a *= .8;
  gl_FragColor = col * d;
  // oGlow = vec4(0.0);
}