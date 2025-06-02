const vec4 glowBlack = vec4(vec3(0.0), 1.0);
layout(location = 1) out vec4 oGlow;

// const vec3 bloomWeights = vec3(0.2126, 0.7152, 0.0722);
const vec3 bloomWeights = vec3(0.6126, 0.8152, 0.6722);
// More saturated/punchy
// const vec3 bloomWeights = vec3(0.3, 0.6, 0.1);

vec4 getBloomColor(vec3 color) {
  float brightness = dot(color, bloomWeights);
  // Boost warm colors for fire/sunset effects
  brightness *= (1.0 + 0.3 * (color.r - color.b));
  brightness = pow(brightness, 1.5); // Makes brighter areas even brighter
  // brightness = smoothstep(0.8, 1.2, brightness); // Smooth falloff

  if(brightness > 1.0)
    return vec4(color, 1.0);
  else
    return glowBlack;
}