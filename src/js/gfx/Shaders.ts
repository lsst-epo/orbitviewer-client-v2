import { ShaderChunk } from 'three';

import solar_compute from '../../glsl/includes/solar_compute.glsl';

export function initShaders() {
    ShaderChunk['solar_compute'] = solar_compute
}