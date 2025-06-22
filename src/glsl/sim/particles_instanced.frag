precision highp float;

in float alive;
in float depth;
// uniform sampler2D map;
// uniform sampler2D normalMap;
// uniform sampler2D alphaMap;
in vec3 vColor;
in vec3 vPosition;
in vec3 vNormal;
in float vFilter;
uniform float opacity;

#include <glow_pars_frag>

#include <desaturate>

const float factor = .5;
const float brightness = .4;

void main () {
    // if(alive < .1) discard;

    // d *= mix(.2, 1., 1.0-d);

    float d = (1.0 - depth) * opacity * vFilter;

    /* vec4 map = texture(map, uv);
    float alpha = texture(alphaMap, uv).r; */

    if(d < .001) discard;

    vec3 col = generic_desaturate(vColor, factor);

    #include <glow_frag_init>
    vec4 color = (vec4(col, d));

    color.rgb *= brightness;

    gl_FragColor = color;
    // oGlow = color * .5;
    oGlow = glowBlack;
}