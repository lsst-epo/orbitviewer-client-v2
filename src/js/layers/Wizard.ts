import gsap from "gsap";
import Layer from "./Layer";

let _to;

class Wizard extends Layer {
    dom: HTMLElement;

    active: HTMLElement;
    
    bg: HTMLElement;
    mask: HTMLElement;
    focus: HTMLElement;
    tooltip: HTMLElement;

    stepIndicator: HTMLElement;
    
    nextButton: HTMLElement;
    prevButton: HTMLElement;
    skipButton: HTMLElement;

    maxSteps: number = 4; // Total number of steps in the wizard

    #step: number = 1; // Current step, starts at 1
    get step() { return this.#step }
    set step(value: number) {
        if (value === this.#step) return; // prevent unnecessary updates
        this.#step = value;
        this.onStepChange();
    }

    _onResize: (e: Event) => void = this.onResize.bind(this);

    constructor(dom) {
        super(dom);

        this.dom = dom;

        this.bg = dom.querySelector('.wizard-bg');
        this.mask = dom.querySelector('.wizard-mask');
        this.focus = dom.querySelector('.wizard-focus');
        this.tooltip = dom.querySelector('.wizard_tooltip');

        this.stepIndicator = dom.querySelector('.heading .steps');
        
        this.nextButton = dom.querySelector('.button-next');
        this.prevButton = dom.querySelector('.button-previous');
        this.skipButton = dom.querySelector('.button-skip');

        const skipped = window.localStorage.getItem('wizardSkipped');
        !skipped && this.start();
    }

    start() {
        this.addEventListeners();
        setTimeout(() => {
            this.updateDom();
            this.open();
        }, 800); // Delay to allow DOM animations to complete
    }

    onStepChange() {
        gsap.to(this.bg, { opacity: 1 })
        gsap.to([this.focus, this.tooltip], {
            opacity: 0,
            onComplete: () => {
                this.updateDom();
                requestAnimationFrame(() => {
                    gsap.to(this.bg, { opacity: 0 });
                    gsap.to(this.focus, { opacity: 1 });
                    gsap.to(this.tooltip, { opacity: 1, delay: 0.2 })
                });
            }
        })
    }

    updateDom() {
        const step = this.step.toString();
        this.active = document.querySelector(
            `[data-wizard-step="${step}"]`
        );
        this.updateCSS();
        this.dom.setAttribute('aria-step', step);
        this.stepIndicator.textContent = `${step}/${this.maxSteps}`;
        
        this.dom.querySelectorAll('.description').forEach((el, i) => {
            i + 1 === this.step
                ? el.setAttribute('id', 'wizard-description')
                : el.removeAttribute('id');
        });
    }

    updateCSS() {  
        if (this.active) {
            const { dataset } = this.active;
            const offset = dataset.wizardOffset !== undefined;
            const offsetValue = offset ? 8 : 0;
            const bounding = this.active.getBoundingClientRect();
            const x = `${bounding.left - offsetValue}px`;
            const y = `${bounding.top - offsetValue}px`;
            const width = `${bounding.width + offsetValue * 2}px`;
            const height = `${bounding.height + offsetValue * 2}px`;
            this.dom.style.setProperty('--wizard-x', x);
            this.dom.style.setProperty('--wizard-y', y);
            this.dom.style.setProperty('--wizard-width', width);
            this.dom.style.setProperty('--wizard-height', height);
        }
    }

    onResize() {
        clearTimeout(_to);
        _to = setTimeout(() => {
            requestAnimationFrame(() => {
                this.updateCSS();
            });
        }, 100);
    }

    addEventListeners() {
        this.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.step === this.maxSteps ? this.skip() : this.step++;
        });

        this.prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.step > 1) this.step--;
        });

        this.skipButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.skip();
        });

        window.addEventListener('resize', this._onResize);
    }

    removeEventListeners() {
        window.removeEventListener('resize', this._onResize);
    }

    skip() {
        window.localStorage.setItem('wizardSkipped', 'true');
        this.removeEventListeners();
        this.close();
    }
}

export default Wizard;