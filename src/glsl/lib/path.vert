out vec2 vUv;
out float depth;

uniform float near;
uniform float far;

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 transformed = modelViewMatrix * vec4(pos, 1.0);

    depth = smoothstep(
        near,
        far,
        length(transformed.xyz)
    );

    gl_Position = projectionMatrix * transformed;
}