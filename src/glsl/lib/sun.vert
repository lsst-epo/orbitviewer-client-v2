out vec2 vUv;

#include <fresnel_pars_vert>

#ifdef HALO
#include <curl4D>
uniform float time;
#endif

void main() {
    vUv = uv;
    vec3 pos = position;

    #ifdef HALO
    vec3 offset = curlNoise4D_simple(vec4(pos * 8.6, time * .02));
    offset = smoothstep(vec3(-1.), vec3(1.), offset);
    pos += .1 * offset * normal;
    #endif

    vec4 transformed = modelViewMatrix * vec4(pos, 1.0);

    #include <fresnel_vert>

    gl_Position = projectionMatrix * transformed;
}