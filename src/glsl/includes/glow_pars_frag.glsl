const vec4 glowBlack = vec4(vec3(0.0), 1.0);
layout(location = 1) out vec4 oGlow;

vec4 getBloomColor(vec3 color) {
  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  if(brightness > 1.0)
    return vec4(color, 1.0);
  else
    return glowBlack;
}