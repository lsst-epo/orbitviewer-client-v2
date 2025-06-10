import { CategoryTypeMap } from "../core/data/Categories";
import { SolarDOMElement } from "../gfx/solar/SolarDomElement";
import { SolarElement } from "../gfx/solar/SolarElement";

export class SolarItemUI {
  templates:NodeListOf<HTMLAnchorElement>;

  dom:HTMLElement;

  visible:boolean = false;

  elements:SolarDOMElement[] = [];

  constructor() {
    const tdom = document.querySelector('.pointer-templates');
    this.templates = tdom.querySelectorAll('a.canvas_pointer');
    tdom.remove();

    this.dom = document.querySelector('.solar-items');
  }

  addItem(el:SolarElement) {
    const category = el.category;
    const id = CategoryTypeMap[category];
    console.log(category, id);

    for(const template of this.templates) {
      if(parseInt(template.getAttribute('data-id')) === id) {
        console.log('Found template');
        const dom = template.cloneNode(true) as HTMLAnchorElement;
        dom.href = `/object/?${el.name}`;
        // dom.href = `/object/`;
        dom.querySelector('.canvas_pointer-text').textContent = el.name;
        this.dom.appendChild(dom);
        const item = new SolarDOMElement(dom, el);
        this.elements.push(item);
        return;
      }
    }
  }

  show() {
    this.dom.setAttribute('aria-hidden', 'false');
    this.visible = true;
  }

  hide() {
    this.dom.setAttribute('aria-hidden', 'true');
    this.visible = false;
  }

  update() {
    if(!this.visible) return;
    for(let i=0,len=this.elements.length; i<len; i++) {
      this.elements[i].update();
    }
  }
}