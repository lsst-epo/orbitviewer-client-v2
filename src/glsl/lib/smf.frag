// in float vWeight;
in vec3 vPosition;

uniform vec3 color1;
uniform vec3 color2;

uniform float time;

#include <fresnel_pars_frag>

// #include <glow_pars_frag>

// #include <fbm4D>

void main () {
  // float ramp = smoothstep(0., .05, vWeight);
  // vec4 color = vec4(mix(color2, color1, ramp), .35);

  float fresnelTerm = getFresnelTerm();
  // float falloff = smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
  fresnelTerm = getFresnelHalo(fresnelTerm);

  vec4 color = vec4(
    color2 * brightness,
    1.0
  );
  // color.a *= .8;

  // float n = fbm(vec4(vPosition, time * .05), 3);
  // n = smoothstep(-1., 1., n);

  // color += n * .25;

  gl_FragColor = color;
  // oGlow = color * 1.75;
}