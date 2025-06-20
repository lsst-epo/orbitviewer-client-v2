import gsap from "gsap";

export default class AboutCarousel {
    dom: Element;
    label: string;
    counter: number = 50000;
    counterEl: HTMLElement;
    buttonEls: NodeListOf<HTMLButtonElement>;
    ratios: string[] = [];
    imageEls: NodeListOf<HTMLImageElement>;
    maskEl: HTMLDivElement;
    
    currentIndex: number = 0;
    
    timer: any;

    intersectionObserver: IntersectionObserver | null = null;

    #active: boolean = false;
    get active() { return this.#active; }
    set active(value: boolean) {
        if (value === this.#active) return; // prevent unnecessary updates
        this.#active = value;
        this.onActiveChange();
    }

    #index: number = 0;
    get index() { return this.#index; }
    set index(value: number) {
        if (value === this.#index) return; // prevent unnecessary updates
        this.#index = value;
        this.onIndexChange();
    }

    _next: () => void = this.next.bind(this);
    
    constructor(dom: Element) {
        this.dom = dom;
        console.log('AboutCarousel initialized with DOM:', this.dom);
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.active = entry.isIntersecting;
            });
        })
        this.intersectionObserver.observe(this.dom);
    }

     start() {
        this.counterEl = this.dom.querySelector('.count') as HTMLElement;
        const { label } = this.counterEl.dataset;
        this.label = label || '{value}';
        this.buttonEls = this.dom.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        this.imageEls = this.dom.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        this.maskEl = this.dom.querySelector('.mask') as HTMLDivElement;
        this.buttonEls.forEach((button, index) => {
            const { ratio } = button.dataset;
            if (ratio) this.ratios.push(`ratio-${ratio}`);
            button.addEventListener('click', (e: MouseEvent) => {
                this.index = index;
            });
        });
        this.startTimer();
    }

    startTimer() {
        if (this.timer) {
            this.timer.kill();
        }
        this.timer = gsap.delayedCall(3, this._next);
    }

    onActiveChange() {
        console.log('AboutCarousel active state changed:', this.active);
        this.active ? this.start() : this.pause();
    }

    onIndexChange() {
        console.log('AboutCarousel index changed:', this.index);

        this.buttonEls.forEach((button, index) => {
            button.setAttribute('aria-selected', index === this.index ? 'true' : 'false');
        });

        const { dataset } = this.buttonEls[this.index];
        const { ratio, objects } = dataset;
        
        if (objects) {
            gsap.killTweensOf(this, 'counter');
            gsap.to(this, {
                counter: parseFloat(objects),
                duration: .3,
                onUpdate: () => {
                    this.counterEl.innerHTML = this.label.replace(
                        '{value}',
                        Math.round(this.counter).toLocaleString('en-US')
                    );
                }
            })
        }

        if (ratio) {
            this.maskEl.classList.remove(...this.ratios);
            this.maskEl.classList.add(`ratio-${ratio}`);
        }

        this.startTimer();
    }

    next() {
        this.index = (this.index + 1) % this.buttonEls.length;
    }

    pause() {
        console.log('AboutCarousel paused');
        this.timer?.kill();
    }

    dispose() {
        this.pause();
        this.intersectionObserver?.disconnect();
        this.intersectionObserver = null;

        console.log('AboutCarousel disposed');
    }
}