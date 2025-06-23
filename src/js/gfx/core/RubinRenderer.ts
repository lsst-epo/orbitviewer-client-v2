import { RTUtils } from "@fils/gfx";
import { BlurPass, BlurQuality, BlurSettings } from "@fils/vfx";
import { Camera, Mesh, MeshBasicMaterial, Scene, ShaderMaterial, SRGBColorSpace, WebGLRenderer, WebGLRenderTarget } from "three";

const SCREEN_MAT = new MeshBasicMaterial();

const GLOW:BlurSettings = {
  scale: .5,
  radius: 1,
  quality: 2,
  iterations: 4
}

import vertexShader from "../../../glsl/vfx/comp.vert";
import fragmentShader from "../../../glsl/vfx/comp.frag";
import { GLOBALS } from "../../core/Globals";
import { SimQuality } from "../solar/GPUSim";

export interface GFXTier {
  maxPixelRatio:number;
  maxSamples:number;
  blurScale:number;
  blurQuality:BlurQuality;
  blurIterations:number;
  glowEnabled:boolean;
  cloudsWidth:number;
}

export const QUALITY_TIERS:Record<SimQuality, GFXTier> = {
  low: {
    maxPixelRatio: 1.5,
    maxSamples: 1,
    glowEnabled: false,
    blurIterations: 2,
    blurQuality: 0,
    blurScale: .25,
    cloudsWidth: 512
  },
  medium: {
    maxPixelRatio: 1.5,
    maxSamples: 2,
    glowEnabled: true,
    blurIterations: 2,
    blurQuality: 0,
    blurScale: .25,
    cloudsWidth: 512
  },
  high: {
    maxPixelRatio: 2,
    maxSamples: 4,
    glowEnabled: true,
    blurIterations: 4,
    blurQuality: 2,
    blurScale: .5,
    cloudsWidth: 1024
  },
  ultra: {
    maxPixelRatio: 3,
    maxSamples: 4,
    glowEnabled: true,
    blurIterations: 4,
    blurQuality: 2,
    blurScale: 1,
    cloudsWidth: 2048
  }
}

const COMP = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    scene: { value: null },
    glow: { value: null },
    glowBlurred: { value: null },
    fire: { value: null },
    camPos: {value: null}
  }
})

export class RubinRenderer {
  sceneRT:WebGLRenderTarget;
  glowRT:WebGLRenderTarget;
  glowBlur:BlurPass;

  compRT:WebGLRenderTarget;

  sunScene:Scene = new Scene();

  sunRT:WebGLRenderTarget;
  sunBlur:BlurPass;

  glowEnabled:boolean = true;

  constructor(protected rnd:WebGLRenderer) {
    const w = rnd.domElement.width;
    const h = rnd.domElement.height;

    // console.log(w, h, window.innerWidth, window.innerHeight);

    const colorSpace = SRGBColorSpace;

    this.sceneRT = new WebGLRenderTarget(w, h, {
      samples: 4,
      count: 1,
      colorSpace: colorSpace
    });

    this.glowRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 1,
      colorSpace: colorSpace
    });

    this.glowBlur = new BlurPass(this.glowRT.texture, w, h, GLOW);
    this.glowBlur.target.texture.colorSpace = rnd.outputColorSpace;
    this.glowBlur.write.texture.colorSpace = rnd.outputColorSpace;

    this.sunRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 1,
      colorSpace: colorSpace
    });
    this.sunBlur = new BlurPass(this.sunRT.texture, w, h, {
      scale: .5,
      radius: 1,
      quality: 2,
      iterations: 4
    });

    this.compRT = new WebGLRenderTarget(w, h, {
      samples: 1,
      count: 1,
      colorSpace: colorSpace
    });

    // this.sceneRT.texture

    const rs = new ResizeObserver( entries => {
      // console.log(rnd.domElement.width, rnd.domElement.height);
      this.resizeTargets();
    });

    rs.observe(rnd.domElement);
  }

  resizeTargets() {
    const rnd = this.rnd;

    this.sceneRT.setSize(rnd.domElement.width, rnd.domElement.height);
    this.glowRT.setSize(rnd.domElement.width, rnd.domElement.height);
    this.glowBlur.setSize(rnd.domElement.width, rnd.domElement.height);
    this.sunRT.setSize(rnd.domElement.width, rnd.domElement.height);
    this.sunBlur.setSize(rnd.domElement.width, rnd.domElement.height);
    this.compRT.setSize(rnd.domElement.width, rnd.domElement.height);
  }

  setTier(tier:GFXTier) {
    this.sceneRT.samples = tier.maxSamples;
    this.glowEnabled = tier.glowEnabled;
    this.glowBlur.quality = tier.blurQuality;
    this.glowBlur.scale = tier.blurScale;
    this.glowBlur.iterations = tier.blurIterations;
    this.sunBlur.quality = tier.blurQuality;
    this.sunBlur.scale = tier.blurScale;
    this.sunBlur.iterations = tier.blurIterations;

    // resize RT (will take scale into account)
    this.resizeTargets();
  }

  render(scene:Scene, camera:Camera) {
    // 1. Render scene
    this.rnd.setRenderTarget(this.sceneRT);
    this.rnd.render(scene, camera);

    if(this.glowEnabled) {
      // 2. render glow
      this.rnd.setRenderTarget(this.glowRT);
      const bg = scene.background;
      scene.background = null;
      this.rnd.render(scene, camera);
      scene.background = bg;

      // 3. blur glow
      this.glowBlur.renderInternal(this.rnd);
    }

    // 4. render sun specific vfx
    this.sunScene.add(GLOBALS.sun);
    GLOBALS.sun.traverse(obj => {
      // if(!obj['isMesh']) return;
      const mesh = obj as Mesh;
      if(mesh.userData.isSun) mesh.material = mesh.userData.blockMaterial;
      if(mesh.userData.firePass) mesh.visible = true;
    })
    this.rnd.setRenderTarget(this.sunRT);
    this.rnd.render(this.sunScene, camera);
    this.sunBlur.renderInternal(this.rnd);
    GLOBALS.sun.traverse(obj => {
      // if(!obj['isMesh']) return;
      const mesh = obj as Mesh;
      if(mesh.userData.isSun) mesh.material = mesh.userData.defaultMaterial;
      if(mesh.userData.firePass) mesh.visible = false;
    })
    scene.add(GLOBALS.sun);

    // 5. composition
    COMP.uniforms.scene.value = this.sceneRT.texture;
    COMP.uniforms.glow.value = this.glowRT.textures[1];
    COMP.uniforms.glowBlurred.value = this.glowBlur.texture;
    COMP.uniforms.fire.value = this.sunBlur.texture;
    COMP.uniforms.camPos.value = camera.position;
    RTUtils.renderToRT(this.compRT, this.rnd, COMP);
    
    // release renderer
    this.rnd.setRenderTarget(null);

    // 6. Render to screen
    SCREEN_MAT.map = this.compRT.texture;
    RTUtils.renderToViewport(this.rnd, SCREEN_MAT);
  }
}