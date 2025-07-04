#include <glow_frag_init>

#ifdef USE_MAP

	vec4 sampledDiffuseColor = texture2D( map, vMapUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );

	#endif

  #ifdef EARTH
    vec4 nightColor = texture2D( nightMap, vMapUv ) * 1.9;
    vec2 cUV = vMapUv;
    // cUV.x = mod(cUV.x + time *.01, 1.0);
    // cUV.y = mod(cUV.y + time *.001, 1.0);
    // vec2 uv1 = vec2(fract(cUV.x + time * 0.00001), cUV.y);
    // vec2 uv2 = vec2(fract(cUV.x + time * 0.00001 + 1.0), cUV.y);

    // vec4 color1 = texture2D(cloudsMap, uv1);
    // vec4 color2 = texture2D(cloudsMap, uv2);

    // Blend near the seam
    // float blend = smoothstep(0.95, 1.0, cUV.x) + smoothstep(0.0, 0.05, cUV.x);
    
    vec4 cloudsColor = texture2D(cloudsMap, cUV);//mix(color1, color2, blend);
    vec3 eL = normalize(vec3(0., 0.0001, 0.0) - vPositionW);
    // vec3 ee = normalize(cameraPosition);
    float eIntensity = min(max(dot(vNormalW,eL), 0.0), 1.0);
    sampledDiffuseColor = mix(nightColor, sampledDiffuseColor, eIntensity);
    
    /* oGlow = getBloomColor(
      mix(nightColor, glowBlack, eIntensity).rgb,
      2
    ); */
    
    sampledDiffuseColor += cloudsColor * .53;
  #endif

	diffuseColor *= sampledDiffuseColor;

#endif