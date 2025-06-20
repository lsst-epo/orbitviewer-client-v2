
import { GLOBALS } from "../core/Globals";
import { Toucher, type PanParams } from "../core/Toucher";

let _to;
type ScrollPoint = 'start' | 'middle' | 'end';

export class ObjectsScroller {
  dom: HTMLElement;
  children: NodeListOf<HTMLElement>;
  
  nextButtons: HTMLElement[];
  prevButtons: HTMLElement[];

  snaps: number[] = [];
  
  index: number = 0;
  bounding: number = 0;
  offset: number = 0;
  target: number = 0;
  current: number = 0;

  toucher: Toucher = new Toucher({ prevent: true });
  
  toucherInit: number = 0;
  wheelInit: number = -1; // -1 means no wheel interaction yet

  domResizeObserver: ResizeObserver;

  _prev: () => void = this.prev.bind(this);
  _next: () => void = this.next.bind(this);

  _onPanStart: () => void = this.onPanStart.bind(this);
  _onPanMove: (e: PanParams) => void = this.onPanMove.bind(this);
  _onPanEnd: (e: PanParams) => void = this.onPanEnd.bind(this);
  
  _onFocus: (e: FocusEvent) => void = this.onFocus.bind(this);

  _onWheel: (event: WheelEvent) => void = this.onWheel.bind(this);

  #active: boolean = false;
  get active() { return this.#active }
  set active(value: boolean) {
    if (value === this.#active) return; // prevent unnecessary updates
    this.#active = value;
    this.onActiveChange();
  }

  #scrollPoint: ScrollPoint = 'start';
  get scrollPoint() { return this.#scrollPoint }
  set scrollPoint(value: ScrollPoint) {
      if (value === this.#scrollPoint) return; // prevent unnecessary updates
      this.#scrollPoint = value;
      this.onScrollPointChange(value);
  }
  
  constructor(params: { dom: HTMLElement, nextButtons?: HTMLElement[], prevButtons?: HTMLElement[] }) {
    const { dom, nextButtons, prevButtons } = params;

    if (!dom) {
      throw new Error('ObjectsScroller requires a valid DOM element.');
    }

    this.dom = dom;
    this.children = this.dom.querySelectorAll('.objects-item');
    this.nextButtons = nextButtons || [];
    this.prevButtons = prevButtons || [];


  }

  init() {
    this.domResizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) this.setSize();
      }
    });
    this.domResizeObserver.observe(this.dom);

    this.setSize();
    this.onScrollPointChange(this.scrollPoint);
  }

  getCurrentIndex(): number {
    const ref = this.current
    const closest = this.snaps.reduce((prev, curr) =>
      Math.abs(curr - ref) < Math.abs(prev - ref) ? curr : prev
    );
    return this.snaps.indexOf(closest);
  }

  next() {
    this.index = this.getCurrentIndex();
    const snap = Math.min(this.snaps[this.index + 1] || this.bounding, this.bounding);
    this.target = snap;
  }

  prev() {
    this.index = this.getCurrentIndex();
    const snap = Math.max(this.snaps[this.index - 1] || 0, 0);
    this.target = snap;
  }

  updateSnaps() {
    const ref = this.current;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const rect = child.getBoundingClientRect();
      this.snaps[i] = Math.max(0, rect.left + ref - this.offset);
    }
  }

  setSize() {
    const styles = getComputedStyle(this.dom);
    this.offset = parseFloat(styles.paddingLeft);
    this.updateSnaps();
    const lastSnap = this.snaps[this.snaps.length - 1];
    const lastChild = this.children[this.children.length - 1];
    this.bounding = lastSnap + lastChild.offsetWidth + this.offset * 2 - window.innerWidth;
    this.target = this.current = this.clampTarget(this.current);
    const isMobile = GLOBALS.getViewport().includes('small');
    this.active = !isMobile; // Disable on mobile by default
  }

  update() {
    if (!this.active) return; // Skip updates if not active
    this.current += (this.target - this.current) * 0.1; // Smooth scrolling effect
    if (Math.abs(this.current - this.target) < 0.1) {
      this.current = this.target; // Snap to target if close enough
    }
    this.dom.style.transform = `translateX(${-this.current}px)`;
    this.scrollPoint = this.current < 100 ? 'start' : (this.current >= this.bounding - 100 ? 'end' : 'middle');
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const { deltaY, deltaX } = e;
    const delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
    this.target = this.clampTarget(this.target + delta);
  }

  clampTarget(value) {
    if (value < 0) return 0;
    if (value > this.bounding) return this.bounding;
    return value;
  }

  onScrollPointChange(value: ScrollPoint) {
    if (value === 'start') {
      this.prevButtons.forEach(button => {
        button.ariaDisabled = 'true';
        button.tabIndex = -1;
        button.classList.add('disabled')
      });
    } else if (value === 'end') {
      this.nextButtons.forEach(button => {
        button.ariaDisabled = 'true';
        button.tabIndex = -1;
        button.classList.add('disabled')
      });
    } else if (value === 'middle') {
      [
        ...this.prevButtons,
        ...this.nextButtons
      ].forEach(button => {
        button.ariaDisabled = 'false';
        button.tabIndex = 0;
        button.classList.remove('disabled')
      });
    }
  }

  onPanStart() {
    this.target = this.toucherInit = this.current;
  }

  onPanMove(e: PanParams) {
    const { xDiff, yDiff } = e;
    if (Math.abs(xDiff) < Math.abs(yDiff)) return; // Ignore vertical pan
    this.target = this.clampTarget(this.toucherInit + xDiff);
  }

  onPanEnd(e: PanParams) {}

  onFocus(e: FocusEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const { left } = target.getBoundingClientRect();
    const request = this.clampTarget(this.current + left - window.innerWidth * 0.5);
    if (Math.abs(this.target - request) < 100) return; // No significant change
    this.target = request;
  }

  reset() {
    this.target = this.current = 0;
    this.dom.style.transform = 'none';
  }

  onActiveChange() {
    console.log('Active state changed:', this.active);
    if (this.active) this.addEventListeners();
    else {
      this.reset();
      this.removeEventListeners();
    }
  }

  addEventListeners() {
    this.toucher.init({
      el: this.dom,
      onPanStart: this._onPanStart,
      onPanMove: this._onPanMove,
      onPanEnd: this._onPanEnd,
    })
    this.nextButtons.forEach(button => button.addEventListener('click', this._next));
    this.prevButtons.forEach(button => button.addEventListener('click', this._prev));
    window.addEventListener('wheel', this._onWheel, { passive: false });
    const inputs = this.dom.querySelectorAll('input');
    inputs.forEach(input=> input.addEventListener('focus', this._onFocus));
  }

  removeEventListeners() {
    this.toucher.destroy();
    this.nextButtons.forEach(button => button.removeEventListener('click', this._next));
    this.prevButtons.forEach(button => button.removeEventListener('click', this._prev));
    window.removeEventListener('wheel', this._onWheel);
    const inputs = this.dom.querySelectorAll('input');
    inputs.forEach(input=> input.removeEventListener('focus', this._onFocus));
  }

  destroy() {
    this.removeEventListeners();
    this.domResizeObserver && this.domResizeObserver.unobserve(this.dom);
    this.domResizeObserver.disconnect();
  }
}