// Based on: https://jsfiddle.net/8n36c47p/4/

in vec3 vNormalW;
in vec3 vPositionW;

uniform float fresnelWidth;
uniform float brightness;

float getFresnelTerm() {
  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
  float fresnelTerm = 1.0 - dot(vNormalW, viewDirectionW);

  return fresnelTerm;
}

float getFresnelHalo(in float fresnelTerm) {
  return smoothstep(1.-fresnelWidth, 1., fresnelTerm);
}

float getFalloff(in float fresnelTerm) {
  return smoothstep(1.-fresnelWidth*1.05, 1.-fresnelWidth, fresnelTerm);
}

float getRamp(in float fresnelHalo) {
  return smoothstep(-.3, .1, fresnelHalo);
}