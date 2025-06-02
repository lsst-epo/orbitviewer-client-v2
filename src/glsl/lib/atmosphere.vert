out vec2 vUv;
out vec3 vNormalW;
out vec3 vPositionW;

void main() {
    vUv = uv;
    vec3 pos = position;

    vec4 transformed = modelViewMatrix * vec4(pos, 1.0);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 worldN = modelMatrix * vec4(normal, 0.0);

    vPositionW = worldPos.xyz;
    vNormalW = worldN.xyz;

    gl_Position = projectionMatrix * transformed;
}