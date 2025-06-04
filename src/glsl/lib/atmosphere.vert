out vec2 vUv;

#include <fresnel_pars_vert>

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 transformed = modelViewMatrix * vec4(pos, 1.0);

    #include <fresnel_vert>

    gl_Position = projectionMatrix * transformed;
}