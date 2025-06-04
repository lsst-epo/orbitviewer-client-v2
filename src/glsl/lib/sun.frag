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

  float ramp = fresnelTerm;
  color.rgb = mix(color2, color1, ramp);

  // if(falloff < .001) discard;

  float alpha = 0.1 * (1.0-fresnelTerm);
  color.a *= alpha;
  if(color.a < .001) discard;

  vec4 col = color;
  // col.rgb = color1;

  // big noise
  float N = fbm(vec4(toPolar(vUv), time * .1), 2);
  N = smoothstep(-.25, 1., N);

  // small noise
  float N2 = fbm(vec4(toPolar(vUv) * 1.5 * vec3(8.0, 4.0, 4.0), time * .5), 2);
  N2 = smoothstep(-1., 1., N2);

  N2 *= N;

  col += col * N2 * 2.1;
  col.a *= max(.15, N2);

  // col *= brightness;

  // gl_FragColor = glowBlack;
  gl_FragColor = vec4(col.rgb, 1.0);
  
  // oGlow = glowBlack;
  oGlow = getBloomColor(col.rgb * brightness);
  oGlow.a *= col.a * brightness;// * .1;
  // oGlow = col;
}