import { ShaderChunk } from 'three';

import fbm3D from '../../glsl/includes/fbm3D.glsl';
import fbm4D from '../../glsl/includes/fbm4D.glsl';
import noise3D from '../../glsl/includes/noise3D.glsl';
import noise4D from '../../glsl/includes/noise4D.glsl';
import solar_compute from '../../glsl/includes/solar_compute.glsl';

export function initShaders() {
    ShaderChunk['fbm3D'] = fbm3D
    ShaderChunk['fbm4D'] = fbm4D
    ShaderChunk['noise3D'] = noise3D
    ShaderChunk['noise4D'] = noise4D
    ShaderChunk['solar_compute'] = solar_compute
}