in vec2 vUv;

uniform vec3 color1;
uniform vec3 color2;

uniform highp float time;

#include <fresnel_pars_frag>

#include <glow_pars_frag>

#include <polar>
#include <fbm4D>
// #include <curl4D>

void main() {
  vec4 color = vec4(color2, 1.0);

  float fresnelTerm = getFresnelTerm();
  float falloff = smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
  fresnelTerm = getFresnelHalo(fresnelTerm);

  #ifdef HALO
    if(fresnelTerm < .001) discard;
  #endif

  // if(falloff < .001) discard;

  float alpha = 0.1 * (1.0-fresnelTerm);
  #ifdef HALO
  alpha *= fresnelTerm * 16.0;
  #endif
  color.a *= alpha;
  if(color.a < .001) discard;

  vec4 col = color;
  // col.rgb = color1;

  vec3 p = toPolar(vUv);

  // p += .09 * curlNoise4D_simple(vec4(p, time * .01));
  float time2 = mod( time, 100000.00 );
  p += .09 * fbm(vec4(p, time2 * .01), 3);

  // big noise
  // float N = snoise(vec4(p, time * .024));
  float N = fbm(vec4(p, time2 * .014), 1);
  N = smoothstep(-.0, 1., N);

  // small noise
  float N2 = fbm(vec4(p * 3.7 * vec3(8.0, 4.0, 4.0 + N * .1), time2 * .02), 3);
  N2 = smoothstep(-.35, 1., N2);

  float N3 = N2 + N;

  col += col * N3 * 3.4;
  // col.a *= max(.75, N3);

  // float br = brightness * 1.5;

  float ramp = fresnelTerm ;//* .5 + fresnelTerm * N2;
  col.rgb = mix(color1, col.rgb, 1.0-ramp);
  // col.a += 1.0 - ramp;

  // col *= br;

  // gl_FragColor = glowBlack;
  if(isGlow) {
    gl_FragColor = getBloomColor(col.rgb * brightness, 2);
    gl_FragColor.a *= col.a;// * .1;
  } else {
    #ifdef HALO
    gl_FragColor = vec4(col.rgb * .5, col.a);
    #else
    gl_FragColor = vec4(col.rgb * .5, 1.0);
    #endif
  }
}