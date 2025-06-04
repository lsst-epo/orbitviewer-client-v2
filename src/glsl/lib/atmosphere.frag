in vec2 vUv;
in vec3 vNormalW;
in vec3 vPositionW;

uniform vec3 color1;
uniform vec3 color2;
uniform float fresnelWidth;
uniform float time;
uniform float brightness;

#include <glow_pars_frag>

#include <polar>
#include <fbm4D>

void main() {
  // Source: https://jsfiddle.net/8n36c47p/4/

  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
  float fresnelTerm = 1.0 - dot(vNormalW, viewDirectionW);
  // fresnelTerm = clamp(fresnelTerm, 0., 1.);
  // float alphaRamp = 1.0 - smoothstep(1.-fresnelWidth*1.5, 1., fresnelTerm);
  float falloff = smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
  fresnelTerm = smoothstep(1.-fresnelWidth, 1., fresnelTerm);
  // vec3 fresCol = vec3( fresnelColor * fresnelTerm) * .5;

  float ramp = smoothstep(-.3, .1, fresnelTerm);
  vec3 fresCol = mix(color1, color2, 1.0-ramp);
  // fresCol = vec3(alphaRamp);

  if(falloff < .001) discard;

  float alpha = falloff * 0.1 * (1.0-fresnelTerm);
  if(alpha < .001) discard;

  vec4 col = vec4(fresCol, alpha);

  // noide
  // float N = fbm(vec4(toPolar(vUv) * 16.0, time * .025), 6);
  // N = smoothstep(-1., 1., N);

  // col += col * N * 2.1;
  // col.a *= max(.75, N);

  col *= brightness;

  gl_FragColor = vec4(0.);
  oGlow = col;

}