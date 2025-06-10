import { ShaderChunk } from 'three';

import curl3D from '../../glsl/includes/curl3D.glsl';
import curl4D from '../../glsl/includes/curl4D.glsl';
import desaturate from '../../glsl/includes/desaturate.glsl';
import fbm3D from '../../glsl/includes/fbm3D.glsl';
import fbm4D from '../../glsl/includes/fbm4D.glsl';
import fresnel_pars_frag from '../../glsl/includes/fresnel/pars_frag.glsl';
import fresnel_pars_vert from '../../glsl/includes/fresnel/pars_vert.glsl';
import fresnel_vert from '../../glsl/includes/fresnel/vert.glsl';
import glow_frag_init from '../../glsl/includes/glow_frag_init.glsl';
import glow_pars_frag from '../../glsl/includes/glow_pars_frag.glsl';
import noise3D from '../../glsl/includes/noise3D.glsl';
import noise4D from '../../glsl/includes/noise4D.glsl';
import polar from '../../glsl/includes/polar.glsl';
import solar_compute from '../../glsl/includes/solar_compute.glsl';

export function initShaders() {
    ShaderChunk['curl3D'] = curl3D
    ShaderChunk['curl4D'] = curl4D
    ShaderChunk['desaturate'] = desaturate
    ShaderChunk['fbm3D'] = fbm3D
    ShaderChunk['fbm4D'] = fbm4D
    ShaderChunk['fresnel_pars_frag'] = fresnel_pars_frag
    ShaderChunk['fresnel_pars_vert'] = fresnel_pars_vert
    ShaderChunk['fresnel_vert'] = fresnel_vert
    ShaderChunk['glow_frag_init'] = glow_frag_init
    ShaderChunk['glow_pars_frag'] = glow_pars_frag
    ShaderChunk['noise3D'] = noise3D
    ShaderChunk['noise4D'] = noise4D
    ShaderChunk['polar'] = polar
    ShaderChunk['solar_compute'] = solar_compute
}