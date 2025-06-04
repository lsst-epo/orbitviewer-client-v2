
vec4 worldPos = modelMatrix * vec4(position, 1.0);
vec4 worldN = modelMatrix * vec4(normal, 0.0);

vPositionW = worldPos.xyz;
vNormalW = worldN.xyz;