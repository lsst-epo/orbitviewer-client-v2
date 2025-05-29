in vec2 vUv;

uniform sampler2D scene;
uniform sampler2D glow;
uniform sampler2D glowBlurred;

void main() {
  vec4 color = texture2D(scene, vUv);

  color += texture2D(glow, vUv) * .8;
  color += texture2D(glowBlurred, vUv) * .75;

  gl_FragColor = color;
}