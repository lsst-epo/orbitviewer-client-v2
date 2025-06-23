const vec4 glowBlack = vec4(vec3(0.0), 1.0);
uniform bool isGlow;
uniform bool hasGlow;
// layout(location = 1) out vec4 oGlow;

const vec3 bloomWeightsStandard = vec3(0.2126, 0.7152, 0.0722);
const vec3 bloomWeightsBrighter = vec3(0.6126, 0.8152, 0.6722);
const vec3 bloomWeightsWider = vec3(0.8126, 0.9152, 0.8722);

const vec3 bloomWeights[3] = vec3[](bloomWeightsStandard, bloomWeightsBrighter, bloomWeightsWider);
// More saturated/punchy
// const vec3 bloomWeights = vec3(0.3, 0.6, 0.1);

vec4 getBloomColor(vec3 color, int weights) {
  float brightness = dot(color, bloomWeights[weights]);
  
  // Boost warm colors for fire/sunset effects
  brightness *= (1.0 + 0.3 * (color.r - color.b));
  brightness = pow(brightness, 1.5); // Makes brighter areas even brighter
  // brightness = smoothstep(0.8, 1.2, brightness); // Smooth falloff

  // Use step function to eliminate branching
  return mix(glowBlack, vec4(color, 1.0), step(1.0, brightness));
}

vec4 getBloomColor(vec3 color) {
  return getBloomColor(color, 0);
}