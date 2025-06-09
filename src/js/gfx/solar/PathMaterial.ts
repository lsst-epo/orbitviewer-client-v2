import { WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import pars_frag from "../../../glsl/lib/planet_pars.frag";

export class PathMaterial extends LineMaterial {
  constructor(params) {
    super(params);
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    let fs = parameters.fragmentShader;
    fs = fs.replace('#include <clipping_planes_pars_fragment>', pars_frag);
    fs = fs.replace('#include <premultiplied_alpha_fragment>', `#include <premultiplied_alpha_fragment>
      oGlow = glowBlack;
      `);

    parameters.fragmentShader = fs;
  }
}