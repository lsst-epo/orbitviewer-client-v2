out vec2 vUv;
out float depth;

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 transformed = modelViewMatrix * vec4(pos, 1.0);

    depth = smoothstep(
        5000.0,
        25000.0,
        length(transformed.xyz)
    );

    gl_Position = projectionMatrix * transformed;
}