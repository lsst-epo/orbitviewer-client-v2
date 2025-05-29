import { MathUtils } from "@fils/math";
import { Color, ColorRepresentation, MeshStandardMaterial, MeshStandardMaterialParameters, Texture, WebGLProgramParametersWithUniforms, WebGLRenderer } from "three";

import p_pars_vert from '../../../glsl/lib/planet_pars.vert';
import p_vert from '../../../glsl/lib/vert.glsl';
import p_pars_frag from '../../../glsl/lib/planet_pars.frag';
import p_map_frag from '../../../glsl/lib/earth_map.frag';
import { solarClock } from "../../core/App";

export type PlanetMaterialParameters = {
    // fresnelColor?:ColorRepresentation;
    // fresnelWidth?:number;
    // sunIntensity?:number;
    // selected?:boolean;
    nightMap?:Texture;
    cloudsMap?:Texture
}

export class PlanetMaterial extends MeshStandardMaterial {
    shaderRef:WebGLProgramParametersWithUniforms = null;
    // fresnel:Color;
    // fresnelWidth:number;
    // sunIntensity:number;
    // selected:boolean;
    private earth:boolean;
    nightMap:Texture;
    cloudsMap:Texture;

    constructor(opts:MeshStandardMaterialParameters=null, opts2:PlanetMaterialParameters={}, isEarth:boolean=false) {
        super(opts);
        // this.fresnel = new Color(opts2.fresnelColor || 0xffffff);
        // this.fresnelWidth = opts2.fresnelWidth || .02;
        // this.sunIntensity = opts2.sunIntensity || 1;
        // this.selected = opts2.selected != undefined ? opts2.selected : false;

        this.earth = isEarth;

        // this.wireframe = true;

        if(!this.defines) {
            this.defines = {};
        }

        this.defines['FRESNEL_SELECTED'] = '';

        if(isEarth) {
            this.defines['EARTH'] = '';
            this.nightMap = opts2.nightMap;
            this.cloudsMap = opts2.cloudsMap;
        }
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
      let vs = parameters.vertexShader;
      let fs = parameters.fragmentShader;

      vs = vs.replace("#include <clipping_planes_pars_vertex>", p_pars_vert);
      vs = vs.replace("#include <fog_vertex>", p_vert);
        
      fs = fs.replace("#include <clipping_planes_pars_fragment>", p_pars_frag);
      fs = fs.replace("#include <map_fragment>", p_map_frag);
      // fs = fs.replace("#include <envmap_fragment>", p_fresnel_frag);
      // fs = fs.replace("#include <output_fragment>", p_output_frag);

      /* parameters.uniforms['fresnelColor'] = {
        value: new Color(this.fresnel)
      }

      parameters.uniforms['sunIntensity'] = {
        value: this.sunIntensity
      }

      parameters.uniforms['fresnelWidth'] = {
        value: this.fresnelWidth
      }

      parameters.uniforms['selected'] = {
        value: this.selected ? 1 : 0
      } */

      if(this.earth) {
        parameters.uniforms['nightMap'] = {
          value: this.nightMap
        }
        parameters.uniforms['time'] = {
          value: 0
        }
        parameters.uniforms['cloudsMap'] = {
          value: this.cloudsMap
        }
      }

      parameters.vertexShader = vs;
      parameters.fragmentShader = fs;
      this.shaderRef = parameters;
    }

    update() {
      if(!this.shaderRef) return;
      const u = this.shaderRef.uniforms;
      // u.fresnelWidth.value = this.fresnelWidth;
      // u.sunIntensity.value = this.sunIntensity;
      // u.fresnelColor.value.copy(this.fresnel);
      // u.selected.value = MathUtils.lerp(u.selected.value, this.selected ? 1 : 0, .06);
      if(this.earth) u.time.value = solarClock.time;
      // console.log(solarClock.time);
    }
}