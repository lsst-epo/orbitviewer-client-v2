precision highp float;

uniform sampler2D computedPosition;
attribute vec2 simUV;

out float alive;
out vec3 vColor;
out float depth;

void main () {
    vec4 cP = texture(computedPosition, simUV);
    alive = cP.a;

    vColor = color;

    vec3 pos = cP.rgb;

    depth = smoothstep(
        2000.0,
        10000.0,
        distance(cameraPosition,pos)
    );

    gl_PointSize = mix(8.0, 2.0, depth);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}