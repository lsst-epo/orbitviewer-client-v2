precision highp float;

in float alive;
in float depth;
// uniform sampler2D map;
// uniform sampler2D normalMap;
// uniform sampler2D alphaMap;
in vec3 vColor;
uniform float opacity;

#include <glow_pars_frag>

#include <colorspace_pars_fragment>

void main () {
    if(alive < .1) discard;

    vec2 uv = gl_PointCoord.xy;
    vec2 st = vec2(-1.0) + 2.0 * uv;
    float d = 1.0 - distance(vec2(0.), st);

    d = smoothstep(0.25, 1.0, d);

    // d *= mix(.2, 1., 1.0-d);

    d *= opacity * (1.0 - depth);

    /* vec4 map = texture(map, uv);
    float alpha = texture(alphaMap, uv).r; */

    if(d < .001) discard;

    #include <glow_frag_init>
    vec4 color = sRGBTransferOETF(vec4(vColor, d));

    gl_FragColor = color;
    // gGlow = vec4(color * .5, d);
}