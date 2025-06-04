in vec2 vUv;

uniform vec3 color1;
uniform vec3 color2;

uniform float time;

#include <fresnel_pars_frag>

#include <glow_pars_frag>

#include <polar>
#include <fbm4D>

void main() {
  vec4 color = vec4(color2, 1.0);

  float fresnelTerm = getFresnelTerm();
  float falloff = smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
  fresnelTerm = getFresnelHalo(fresnelTerm);

  // if(falloff < .001) discard;

  float alpha = 0.1 * (1.0-fresnelTerm);
  color.a *= alpha;
  if(color.a < .001) discard;

  vec4 col = color;
  // col.rgb = color1;

  vec3 p = toPolar(vUv);

  // big noise
  float N = snoise(vec4(p, time * .024));
  // float N = fbm(vec4(p, time * .024), 1);
  N = smoothstep(-.5, 1., N);

  // small noise
  float N2 = fbm(vec4(p * 1.7 * vec3(8.0, 4.0, 4.0 + N * .1), time * .2), 3);
  N2 = smoothstep(-.25, 1., N2);

  float N3 = N2 * N;

  col += col * N3 * 2.1;
  col.a *= max(.15, N3);

  float br = brightness * 1.5;

  float ramp = fresnelTerm * .5 + fresnelTerm * N2;
  col.rgb = mix(color1, col.rgb, 1.0-ramp);
  // col.a += 1.0 - ramp;

  // col *= br;

  // gl_FragColor = glowBlack;
  gl_FragColor = vec4(col.rgb * .8, 1.0);
  
  // oGlow = glowBlack;
  oGlow = getBloomColor(col.rgb);
  oGlow.a *= col.a;// * .1;
  // oGlow = col;
}