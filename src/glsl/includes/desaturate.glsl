// Source: https://www.shadertoy.com/view/lsdXDH

// Generic algorithm to desaturate images used in most game engines
vec3 generic_desaturate(vec3 color, float factor)
{
	vec3 lum = vec3(0.299, 0.587, 0.114);
	vec3 gray = vec3(dot(lum, color));
	return mix(color, gray, factor);
}