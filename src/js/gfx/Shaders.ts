import { ShaderChunk } from 'three';

import fbm3D from '../../glsl/includes/fbm3D.glsl';
import fbm4D from '../../glsl/includes/fbm4D.glsl';
import glow_frag_init from '../../glsl/includes/glow_frag_init.glsl';
import glow_pars_frag from '../../glsl/includes/glow_pars_frag.glsl';
import noise3D from '../../glsl/includes/noise3D.glsl';
import noise4D from '../../glsl/includes/noise4D.glsl';
import polar from '../../glsl/includes/polar.glsl';
import solar_compute from '../../glsl/includes/solar_compute.glsl';

export function initShaders() {
    ShaderChunk['fbm3D'] = fbm3D
    ShaderChunk['fbm4D'] = fbm4D
    ShaderChunk['glow_frag_init'] = glow_frag_init
    ShaderChunk['glow_pars_frag'] = glow_pars_frag
    ShaderChunk['noise3D'] = noise3D
    ShaderChunk['noise4D'] = noise4D
    ShaderChunk['polar'] = polar
    ShaderChunk['solar_compute'] = solar_compute
}