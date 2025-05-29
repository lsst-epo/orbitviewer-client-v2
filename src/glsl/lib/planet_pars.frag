#include <clipping_planes_pars_fragment>

#include <glow_pars_frag>

#ifdef EARTH
  in vec3 vNormalW;
  in vec3 vPositionW;
  uniform float time;
  uniform sampler2D nightMap;
  uniform sampler2D cloudsMap;
#endif