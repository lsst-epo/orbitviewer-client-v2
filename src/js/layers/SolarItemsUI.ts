import { CategoryTypeMap } from "../core/data/Categories";
import { SolarDOMElement } from "../gfx/solar/SolarDomElement";
import { SolarElement } from "../gfx/solar/SolarElement";

let tid;

export class SolarItemUI {
  templates:NodeListOf<HTMLAnchorElement>;

  dom:HTMLElement;

  visible:boolean = false;

  elements:SolarDOMElement[] = [];

  landingMode:boolean = true;

  constructor() {
    const tdom = document.querySelector('.pointer-templates');
    this.templates = tdom.querySelectorAll('a.canvas_pointer');
    tdom.remove();

    this.dom = document.querySelector('.solar-items');
  }

  addItem(el:SolarElement, title:string) {
    const category = el.category;
    let id = CategoryTypeMap[category];

    // console.log(title, el.name);

    if(category === null || id === null) {
      id = 0;
    }

    for(const template of this.templates) {
      if(parseInt(template.getAttribute('data-id')) === id) {
        // console.log('Found template');
        const dom = template.cloneNode(true) as HTMLAnchorElement;
        // dom.href = `/object/?${el.name}`;
        // dom.href = `/object/`;
        dom.querySelector('.canvas_pointer-text').textContent = title || el.name;
        this.dom.appendChild(dom);
        const item = new SolarDOMElement(dom, el);
        this.elements.push(item);
        return;
      }
    }
  }

  removeItem(el:SolarElement) {
    this.elements.splice(this.elements.indexOf(el.domRef), 1);
    el.domRef.dom.remove();
  }

  show(sel:SolarElement=null) {
    this.dom.setAttribute('aria-hidden', 'false');
    clearTimeout(tid);
    this.visible = true;
    for(const el of this.elements) {
      el.enabled = el.ref !== sel;
    }
  }

  filter(ids:string[]) {
    for(const el of this.elements) {
      // console.log(ids.indexOf(el.ref.slug) > -1);
      el.enabled = ids.indexOf(el.ref.slug) > -1;
    }
  }

  hide() {
    this.dom.setAttribute('aria-hidden', 'true');
    clearTimeout(tid);
    tid = setTimeout(() => {
      this.visible = false;
    }, 2000);
  }

  update() {
    if(!this.visible) return;
    for(let i=0,len=this.elements.length; i<len; i++) {
      this.elements[i].update();
      if(this.landingMode) {
        this.elements[i].dom.style.opacity = `.4`;
      } 
    }
  }
}