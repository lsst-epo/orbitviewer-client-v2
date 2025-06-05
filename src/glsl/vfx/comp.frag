in vec2 vUv;

uniform sampler2D scene;
uniform sampler2D glow;
uniform sampler2D glowBlurred;
uniform sampler2D fire;

uniform vec3 camPos;

void main() {
  vec4 color = texture2D(scene, vUv);

  color += texture2D(glow, vUv) * .5;
  color += texture2D(glowBlurred, vUv) * .75;

  float d = 1.0 - smoothstep(5., 100.0, length(camPos));

  if (d > 0.001) {
    vec4 fire = texture2D(fire, vUv);
    fire.rgb *= 8.0 * d;
    fire.a *= d;
    fire.a = max(.1, fire.a);
    color += fire;
  }

  gl_FragColor = color;
}