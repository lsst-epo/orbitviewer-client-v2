import { BufferGeometry, Camera, Group, Object3D, Scene, Vector3, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";
import { LineMaterial, LineMaterialParameters } from "three/examples/jsm/lines/LineMaterial.js";

import pars_frag from "../../../glsl/lib/path/pars_frag.glsl";
import pars_vert from "../../../glsl/lib/path/pars_vert.glsl";

import vert from "../../../glsl/lib/path/vert.glsl";
import frag from "../../../glsl/lib/path/frag.glsl";

export interface PathMaterialParameters {
  isPlanet?:boolean;
  fadeDistance?:number;
  planetPosition?:Vector3;
}

export class PathMaterial extends LineMaterial {
  ref:WebGLProgramParametersWithUniforms;
  protected isPlanet:boolean = false;
  protected fadeDistance:number;
  protected planetPosition:Vector3;

  constructor(params:LineMaterialParameters, pathOpts:PathMaterialParameters={}) {
    super(params);

    if(pathOpts.isPlanet) {
      this.isPlanet = true;
      this.planetPosition = pathOpts.planetPosition;
      this.fadeDistance = pathOpts.fadeDistance
    }
  }

  setPathOptions(pathOpts:PathMaterialParameters={}) {
    if(pathOpts.isPlanet) {
      this.isPlanet = true;
      this.planetPosition = pathOpts.planetPosition;
      this.fadeDistance = pathOpts.fadeDistance
    }
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    let vs = parameters.vertexShader;
    // console.log(vs);
    vs = vs.replace('#include <clipping_planes_pars_vertex>', pars_vert);
    vs = vs.replace('#include <clipping_planes_vertex>', vert);

    let fs = parameters.fragmentShader;
    fs = fs.replace('#include <clipping_planes_pars_fragment>', pars_frag);
    fs = fs.replace('#include <premultiplied_alpha_fragment>', frag);

    parameters.fragmentShader = fs;
    parameters.vertexShader = vs;
    // console.log(fs);

    if(this.isPlanet) {
      parameters.uniforms.isPlanet = {
        value: this.isPlanet
      };
      parameters.uniforms.planetPosition = {
        value: this.planetPosition
      }
      parameters.uniforms.fadeDistance = {
        value: this.fadeDistance
      }
    }

    this.ref = parameters;
  }

  /* onBeforeRender(renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, object: Object3D, group: Group): void {
    if(this.isPlanet && this.ref) {
      console.log(this.ref.uniforms.planetPosition.value);
    }
  } */
}