#define PI 3.1415926538

// Uv range: [0, 1]
vec3 toPolar(in vec2 uv) {
  float theta = 2.0 * PI * uv.x + - PI / 2.0;
  float phi = PI * uv.y;

  vec3 n;
  n.x = cos(theta) * sin(phi);
  n.y = sin(theta) * sin(phi);
  n.z = cos(phi);

  //n = normalize(n);
  return n;
}
