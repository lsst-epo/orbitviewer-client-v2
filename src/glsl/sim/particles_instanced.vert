precision highp float;

uniform sampler2D computedPosition;
attribute vec2 simUV;
attribute float filterValue;

out float alive;
out vec3 vColor;
out float depth;
out vec3 vNormal;
out vec3 vPosition;
out float vFilter;

uniform float near;
uniform float far;

mat4 scale(vec3 s) {
  return mat4(
    s.x, 0.0, 0.0, 0.0,
    0.0, s.y, 0.0, 0.0,
    0.0, 0.0, s.z, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

const float size = 1.5;

void main () {
    vec4 cP = texture(computedPosition, simUV);
    alive = cP.a;

    vColor = instanceColor;
    vFilter = filterValue;

    vNormal = normalize(mat3(modelMatrix) * normal);

    // vec3 pos = cP.rgb;

    // Read position from simulation texture
    vec3 instancePosition = cP.xyz;

    // Create translation matrix from position
    mat4 translationMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      instancePosition.x, instancePosition.y, instancePosition.z, 1.0
    );

    vPosition = (translationMatrix * vec4(position, 1.0)).xyz;

    float distanceToCamera = length(instancePosition - cameraPosition);
    float sD = smoothstep(100.0, 2000.0, distanceToCamera);

    float iScale = mix(.1, 2., sD);

    mat4 scaleMatrix = scale(vec3(iScale * size));

    vec3 pos = position;
    vec4 transformed = translationMatrix * scaleMatrix * vec4(pos, 1.0);

    depth = smoothstep(
        near,
        far,
        distance(cameraPosition, transformed.xyz)
    );

    // gl_PointSize = mix(8.0, 2.0, depth);
    gl_Position = projectionMatrix * modelViewMatrix * transformed;
}
