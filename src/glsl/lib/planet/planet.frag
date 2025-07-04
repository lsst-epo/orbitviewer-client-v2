#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#include <glow_pars_frag>

#ifdef EARTH
  in vec3 vNormalW;
  in vec3 vPositionW;
  uniform float time;
  uniform sampler2D nightMap;
  uniform sampler2D cloudsMap;
#endif

void main() {
	if(isGlow && !hasGlow) {
    gl_FragColor = glowBlack;
  } else {
    if(isGlow) {
      #ifdef USE_MAP
        #ifdef EARTH
          vec4 nightColor = texture2D( nightMap, vMapUv ) * 1.9;
          
          vec3 eL = normalize(vec3(0., 0.0001, 0.0) - vPositionW);
          // vec3 ee = normalize(cameraPosition);
          float eIntensity = min(max(dot(vNormalW,eL), 0.0), 1.0);

          gl_FragColor = getBloomColor(
            mix(nightColor, glowBlack, eIntensity).rgb,
            2
          );
        #endif

      #endif
    } else {
      vec4 diffuseColor = vec4( diffuse, opacity );
      #include <clipping_planes_fragment>
      ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
      vec3 totalEmissiveRadiance = emissive;
      #include <logdepthbuf_fragment>

      #ifdef USE_MAP

        vec4 sampledDiffuseColor = texture2D( map, vMapUv );

        #ifdef DECODE_VIDEO_TEXTURE

          // use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

          sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );

        #endif

        #ifdef EARTH
          vec4 nightColor = texture2D( nightMap, vMapUv ) * 1.9;
          vec2 cUV = vMapUv;

          vec4 cloudsColor = texture2D(cloudsMap, cUV);//mix(color1, color2, blend);
          vec3 eL = normalize(vec3(0., 0.0001, 0.0) - vPositionW);
          // vec3 ee = normalize(cameraPosition);
          float eIntensity = min(max(dot(vNormalW,eL), 0.0), 1.0);

          sampledDiffuseColor = mix(nightColor, sampledDiffuseColor, eIntensity);
          sampledDiffuseColor += cloudsColor * .53;
        #endif


        diffuseColor *= sampledDiffuseColor;

      #endif

      #include <color_fragment>
      #include <alphamap_fragment>
      #include <alphatest_fragment>
      #include <alphahash_fragment>
      #include <roughnessmap_fragment>
      #include <metalnessmap_fragment>
      #include <normal_fragment_begin>
      #include <normal_fragment_maps>
      #include <clearcoat_normal_fragment_begin>
      #include <clearcoat_normal_fragment_maps>
      #include <emissivemap_fragment>
      #include <lights_physical_fragment>
      #include <lights_fragment_begin>
      #include <lights_fragment_maps>
      #include <lights_fragment_end>
      #include <aomap_fragment>
      vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
      vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
      #include <transmission_fragment>
      vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
      #ifdef USE_SHEEN
        float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
        outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
      #endif
      #ifdef USE_CLEARCOAT
        float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
        vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
        outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
      #endif
      #include <opaque_fragment>
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
      #include <premultiplied_alpha_fragment>
      #include <dithering_fragment>
    }
  }
}