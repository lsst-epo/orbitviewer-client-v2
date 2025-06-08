#include <noise4D>

vec4 snoiseVec4(vec4 x) {
  float s  = snoise(vec4(x));
  float s1 = snoise(vec4(x.y - 19.1, x.z + 33.4, x.w + 47.2, x.x + 67.8));
  float s2 = snoise(vec4(x.z + 74.2, x.w - 124.5, x.x + 99.4, x.y + 133.1));
  float s3 = snoise(vec4(x.w + 156.7, x.x - 89.3, x.y + 201.8, x.z + 245.6));
  return vec4(s, s1, s2, s3);
}

vec3 curlNoise4D(vec4 p) {
  const float e = 0.1;
  vec4 dx = vec4(e, 0.0, 0.0, 0.0);
  vec4 dy = vec4(0.0, e, 0.0, 0.0);
  vec4 dz = vec4(0.0, 0.0, e, 0.0);
  vec4 dw = vec4(0.0, 0.0, 0.0, e);

  vec4 p_x0 = snoiseVec4(p - dx);
  vec4 p_x1 = snoiseVec4(p + dx);
  vec4 p_y0 = snoiseVec4(p - dy);
  vec4 p_y1 = snoiseVec4(p + dy);
  vec4 p_z0 = snoiseVec4(p - dz);
  vec4 p_z1 = snoiseVec4(p + dz);
  vec4 p_w0 = snoiseVec4(p - dw);
  vec4 p_w1 = snoiseVec4(p + dw);

  // 4D curl components (selecting 3 most useful for 3D visualization)
  float x = (p_y1.z - p_y0.z - p_z1.y + p_z0.y) + 
            (p_w1.y - p_w0.y - p_y1.w + p_y0.w);
  float y = (p_z1.x - p_z0.x - p_x1.z + p_x0.z) + 
            (p_x1.w - p_x0.w - p_w1.x + p_w0.x);
  float z = (p_x1.y - p_x0.y - p_y1.x + p_y0.x) + 
            (p_z1.w - p_z0.w - p_w1.z + p_w0.z);

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

highp vec3 curlNoise4D_simple(vec4 p) {
  const float e = 0.1;
  vec4 dx = vec4(e, 0.0, 0.0, 0.0);
  vec4 dy = vec4(0.0, e, 0.0, 0.0);
  vec4 dz = vec4(0.0, 0.0, e, 0.0);

  vec4 p_x0 = snoiseVec4(p - dx);
  vec4 p_x1 = snoiseVec4(p + dx);
  vec4 p_y0 = snoiseVec4(p - dy);
  vec4 p_y1 = snoiseVec4(p + dy);
  vec4 p_z0 = snoiseVec4(p - dz);
  vec4 p_z1 = snoiseVec4(p + dz);

  // Just use first 3 components like 3D version
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}