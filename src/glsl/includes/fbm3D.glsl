#include <noise3D>

float fbm(vec3 seed, int octaves) {
    float total = 0.0, amplitude = 1.0;
    for (int i = 0; i < octaves; i++) {
        total += snoise(seed) * amplitude;
        seed += seed;
        amplitude *= 0.5;
    }
    return total;
}