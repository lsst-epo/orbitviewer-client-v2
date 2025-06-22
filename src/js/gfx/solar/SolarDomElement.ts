import { MathUtils } from "@fils/math";
import { Vector3 } from "three";
import { GLOBALS } from "../../core/Globals";
import { SolarElement } from "./SolarElement";
import { FAR, uiColliders } from "../OrbitViewer";
import { rectsIntersect } from "./Solar3DElement";
import { debugCan } from "../../core/App";

const tmp:Vector3 = new Vector3();

export class SolarDOMElement {
  label:HTMLElement;
  hovered:boolean = false;

  rect:DOMRect;
  rectDOM:HTMLSpanElement;

  constructor(public dom:HTMLElement, public ref:SolarElement) {
    this.label = dom.querySelector('.canvas_pointer-text');
    dom.setAttribute('aria-label', ref.name);

    this.rectDOM = dom.querySelector('span.canvas_pointer-label');

    ref.domRef = this;

    debugCan?.addItem(this);

    dom.onmouseover = () => {
      ref.focus();
      this.hovered = true;
    }

    dom.onmouseout = () => {
      ref.blur();
      this.hovered = false;
    }

    dom.onclick = () => {
      dom.blur();
      // this.enabled = false;
      GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/solar-items/${ref.slug}/`);
      const sel = GLOBALS.viewer.getSolarElementBySlug(ref.slug);
      GLOBALS.viewer.followSolarElement(sel, !sel.isPlanet || GLOBALS.objectToggle.selectedIndex===0);
    }

    // dom.style.setProperty('--depth', '.5');
  }

  set enabled(value:boolean) {
    if(value) this.dom.classList.remove('disabled');
    else this.dom.classList.add('disabled');
  }

  set hidden(value:boolean) {
    this.dom.setAttribute('aria-hidden', value ? 'true' : 'false');
  }

  update() {
    if(!this.ref.enabled) return this.hidden = true;
    GLOBALS.viewer.controls.getNormalizedScreenCoords(this.ref, tmp);
    if(tmp.z < 0) return this.hidden = true;
    this.hidden = false;
    const x = tmp.x * window.innerWidth;
    const y = tmp.y * window.innerHeight;
    this.dom.style.transform = `translateX(${x}px) translateY(${y}px)`;
    // this.dom.style.left = `${tmp.x*100}%`;
    // this.dom.style.top = `${tmp.y*100}%`;

    const depth = this.hovered ? 0 : MathUtils.smoothstep(5000, 100000, tmp.z);

    const zIndex = this.hovered ? FAR : Math.round(FAR - tmp.z);
    this.dom.style.zIndex = `${zIndex}`;

    let rect = null;
    let behind = false;

    if(!this.hovered) {
      for(const el of uiColliders) {
        if(el.isCollider()) {
          if(el.distanceToCamara < this.ref.distanceToCamara) {
            if(el.rect.width < 20 && el.rect.height < 20) break;
            if(rect == null) {
              rect = this.rectDOM.getBoundingClientRect();
              this.rect = rect;
            }
            if(rectsIntersect(el.rect, rect)) {
              behind = true;
              break;
            }
          }
        }
      }
    }

    if(behind) {
      // console.log('INTERSECT');
      this.dom.classList.add('behind');
    } else {
      this.dom.classList.remove('behind');
    }
    
    // if(depth > .5 && !this.hovered) this.label.classList.add('disabled');
    // else this.label.classList.remove('disabled');
    this.label.style.opacity = `${1-depth}`;
    // console.log(tmp.z);
    // this.dom.style.setProperty('--depth', `${depth}`);
  }
}