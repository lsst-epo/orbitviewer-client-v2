
import { Toucher, type PanParams } from "../core/Toucher";

let _to;
type SnapType = 'none' | 'closest' | 'direction';
type ScrollPoint = 'start' | 'middle' | 'end';

export class ObjectsScroller {
  dom: HTMLElement;
  children: NodeListOf<HTMLElement>;
  nextButtons: HTMLElement[];
  prevButtons: HTMLElement[];

  snapType: SnapType = 'none';
  snaps: number[] = [];
  
  index: number = 0;
  paddingLeft: number = 0;
  bounding: number = 0;

  toucher: Toucher = new Toucher({ preventLeft: true, preventRight: true });
  
  toucherInit: number = 0;
  wheelInit: number = -1; // -1 means no wheel interaction yet

  _prev: () => void = this.prev.bind(this);
  _next: () => void = this.next.bind(this);

  _onPanStart: () => void = this.onPanStart.bind(this);
  _onPanMove: (e: PanParams) => void = this.onPanMove.bind(this);
  _onPanEnd: (e: PanParams) => void = this.onPanEnd.bind(this);

  _onResize: () => void = this.onResize.bind(this);
  _onWheel: (event: WheelEvent) => void = this.onWheel.bind(this);
  _onScroll: () => void = this.onScroll.bind(this);

  #scrollPoint: ScrollPoint = 'start';
  get scrollPoint() { return this.#scrollPoint }
  set scrollPoint(value: ScrollPoint) {
      if (value === this.#scrollPoint) return; // prevent unnecessary updates
      this.#scrollPoint = value;
      this.onScrollPointChange(value);
  }
  
  constructor(params: { dom: HTMLElement, snapType?: SnapType, nextButtons?: HTMLElement[], prevButtons?: HTMLElement[] }) {
    const { dom, snapType, nextButtons, prevButtons } = params;

    if (!dom) {
      throw new Error('ObjectsScroller requires a valid DOM element.');
    }

    this.dom = dom;
    this.snapType = snapType || this.snapType;
    this.children = this.dom.querySelectorAll('.objects-item');
    this.nextButtons = nextButtons || [];
    this.prevButtons = prevButtons || [];
  }

  init() {
    requestAnimationFrame(() => {
      this.setSize();
      this.onScrollPointChange(this.scrollPoint);
    });
    this.addEventListeners();
  }

  getCurrentIndex(): number {
    const { scrollLeft } = this.dom;
    const closest = this.snaps.reduce((prev, curr) =>
      Math.abs(curr - scrollLeft) < Math.abs(prev - scrollLeft) ? curr : prev
    );
    return this.snaps.indexOf(closest);
  }

  next() {
    this.index = this.getCurrentIndex();
    const snap = this.snaps[this.index + 1] || this.bounding;
    this.index = Math.min(this.index + 1, this.snaps.length - 1);
    this.dom.scrollTo({ left: snap, behavior: 'smooth' });
  }

  prev() {
    this.index = this.getCurrentIndex();
    const snap = this.snaps[this.index - 1] || 0;
    this.index = Math.max(0, this.index - 1);
    this.dom.scrollTo({ left: snap, behavior: 'smooth' });
  }

  snap(dir?: 'next' | 'prev') {
    if (this.snapType === 'closest') {
      this.snapToClosestChild();
    } else if (this.snapType === 'direction' && dir) {
        dir === 'next' ? this.next() : this.prev();
    }
  }

  snapToClosestChild() {
    const { scrollLeft } = this.dom;
    const closest = this.snaps.reduce((prev, curr) =>
      Math.abs(curr - scrollLeft) < Math.abs(prev - scrollLeft) ? curr : prev
    );
    this.index = this.snaps.indexOf(closest);
    const left = Math.min(closest, this.bounding);
    this.dom.scrollTo({ left, behavior: 'smooth' });
  }

  updateSnaps() {
    const { scrollLeft } = this.dom;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const rect = child.getBoundingClientRect();
      this.snaps[i] = Math.max(0, rect.left + scrollLeft - this.paddingLeft);
    }
  }

  setSize() {
    const styles = getComputedStyle(this.dom);
    this.paddingLeft = parseFloat(styles.paddingLeft);

    this.updateSnaps();
    
    this.bounding = this.dom.scrollWidth - window.innerWidth;
  }

  onResize() {
    clearTimeout(_to);
    _to = setTimeout(() => {
      this.setSize();
      this.snapToClosestChild();
    }, 100);
  }

  onWheel(event: WheelEvent) {
    const { deltaY, deltaX } = event;
    if (this.wheelInit === -1) this.wheelInit = this.dom.scrollLeft;
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      event.preventDefault();
      this.dom.scrollLeft += deltaY;
    }
    clearTimeout(_to);
    _to = setTimeout(() => {
      const dir = this.wheelInit - this.dom.scrollLeft;
      dir !== 0 && this.snap(dir < 0 ? 'next' : 'prev');
      this.wheelInit = -1; // Reset wheel interaction
    }, 250);
  }

  onScroll() {
    const { scrollLeft } = this.dom;
    this.scrollPoint = scrollLeft === 0 ? 'start' : (scrollLeft >= this.bounding ? 'end' : 'middle');
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
    this.toucherInit = this.dom.scrollLeft;
  }

  onPanMove(e: PanParams) {
    const { xDiff, yDiff } = e;
    if (Math.abs(xDiff) < Math.abs(yDiff)) return; // Ignore vertical pan
    this.dom.scrollLeft = this.toucherInit + xDiff;
  }

  onPanEnd(e: PanParams) {
    const { xDiff, yDiff } = e;
    if (Math.abs(xDiff) < Math.abs(yDiff) || Math.abs(xDiff) < 4) return; // Ignore vertical pan and small horizontal pans / "clicks"
    this.snap(xDiff > 0 ? 'next' : 'prev');
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
    this.dom.addEventListener('scroll', this._onScroll);
    this.dom.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('resize', this._onResize);
  }

  removeEventListeners() {
    this.toucher.destroy();
    this.nextButtons.forEach(button => button.removeEventListener('click', this._next));
    this.prevButtons.forEach(button => button.removeEventListener('click', this._prev));
    this.dom.removeEventListener('scroll', this._onScroll);
    this.dom.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('resize', this._onResize);
  }

  destroy() {
    this.removeEventListeners();
  }
}