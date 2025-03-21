precision highp float;

in float alive;
in float depth;
// uniform sampler2D map;
// uniform sampler2D normalMap;
// uniform sampler2D alphaMap;
in vec3 vColor;
in vec3 vPosition;
in vec3 vNormal;
uniform float opacity;

// layout(location = 1) out vec4 gGlow;

void main () {
    // if(alive < .1) discard;

    // d *= mix(.2, 1., 1.0-d);

    float d = (1.0 - depth);

    /* vec4 map = texture(map, uv);
    float alpha = texture(alphaMap, uv).r; */

    if(d < .001) discard;

    vec3 color = vColor;
    
    // color = vNormal;

    gl_FragColor = vec4(color, d);
    // gGlow = vec4(color * .5, d);
}