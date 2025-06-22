in vec2 vUv;

uniform vec3 color1;
uniform vec3 color2;

uniform float time;

#include <fresnel_pars_frag>

#include <glow_pars_frag>

#include <polar>
#include <fbm4D>

void main() {
  vec4 color = vec4(color1, 1.0);

  float fresnelTerm = getFresnelTerm();
  float falloff = smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
  fresnelTerm = getFresnelHalo(fresnelTerm);

  float ramp = getRamp(fresnelTerm);
  
  color.rgb = mix(color2, color1, ramp);

  if(falloff < .001) discard;

  float alpha = falloff * 0.1 * (1.0-fresnelTerm);
  color.a *= alpha;
  if(color.a < .001) discard;

  vec4 col = color;
  col *= brightness;

  gl_FragColor = col;
  oGlow = col;

}