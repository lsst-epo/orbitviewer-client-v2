import gsap from "gsap";
import Layer from "./Layer";

let _to;

class Wizard extends Layer {
    dom: HTMLElement;

    #active: HTMLElement;
    get active() { return this.#active }
    set active(value: HTMLElement) {
        if (value === this.#active) return; // prevent unnecessary updates
        this.onActiveChange(this.#active, value);
        this.#active = value;
    }
    activeResizeObserver: ResizeObserver | null = null;
    
    bg: HTMLElement;
    mask: HTMLElement;
    focus: HTMLElement;
    tooltip: HTMLElement;

    stepIndicator: HTMLElement;
    
    nextButton: HTMLButtonElement;
    prevButton: HTMLButtonElement;
    skipButton: HTMLButtonElement;
    finishButton: HTMLButtonElement;

    maxSteps: number = 4; // Total number of steps in the wizard

    #step: number = 1; // Current step, starts at 1
    get step() { return this.#step }
    set step(value: number) {
        if (value === this.#step) return; // prevent unnecessary updates
        this.#step = value;
        this.onStepChange();
    }

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
        this.disableButton(this.prevButton); // Disable previous button on first step
        this.skipButton = dom.querySelector('.button-skip');
        this.finishButton = dom.querySelector('.button-finish');
        this.disableButton(this.finishButton);

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
        gsap.to(this.bg, { opacity: 1, duration: 0.3, ease: 'power1.out' })
        gsap.to([this.focus, this.tooltip], {
            opacity: 0,
            duration: 0.3,
            ease: 'power1.out',
            onComplete: () => {
                this.updateDom();
                requestAnimationFrame(() => {
                    gsap.to(this.bg, { opacity: 0 });
                    gsap.to(this.focus, { opacity: 1 });
                    gsap.to(this.tooltip, { opacity: 1 })
                });
            }
        })
    }

    updateDom() {
        const step = this.step.toString();
        this.active = document.querySelector(
            `[data-wizard-step="${step}"]`
        );
        this.updateCSSVariables();
        this.dom.setAttribute('aria-step', step);
        this.stepIndicator.textContent = `${step}/${this.maxSteps}`;

        if (this.step === 1) {
            this.disableButton(this.prevButton);
        } else {
            this.enableButton(this.prevButton);
        }

        if (this.step === this.maxSteps) {
            this.disableButton(this.nextButton);
            this.enableButton(this.finishButton);
        } else {
            this.enableButton(this.nextButton);
            this.disableButton(this.finishButton);
        }
        
        this.dom.querySelectorAll('.description').forEach((el, i) => {
            i + 1 === this.step
                ? el.setAttribute('id', 'wizard-description')
                : el.removeAttribute('id');
        });
    }

    updateCSSVariables() {  
        if (this.active) {
            const { dataset } = this.active;
            const offset = dataset.wizardOffset !== undefined;
            const offsetValue = offset ? 6 : 0;
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

    onActiveChange(oldActive: HTMLElement, newActive: HTMLElement) {
        if (oldActive) {
            this.activeResizeObserver.unobserve(oldActive);
        }
        if (newActive) {
            this.activeResizeObserver.observe(newActive);
            this.updateCSSVariables();
        }
    }

    disableButton(button: HTMLButtonElement) {
        button.tabIndex = -1; // Remove button from tab order
        button.setAttribute('disabled', 'true');
        button.classList.add('disabled');
    }

    enableButton(button: HTMLButtonElement) {
        button.tabIndex = 0; // Restore button to tab order
        button.removeAttribute('disabled');
        button.classList.remove('disabled');
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

        this.finishButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.skip();
        });

        this.activeResizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    this.updateCSSVariables();
                }
            }
        });

        if (this.active) {
            this.activeResizeObserver.observe(this.active);
        }
    }

    removeEventListeners() {
        if (this.activeResizeObserver) {
            if (this.active) this.activeResizeObserver.unobserve(this.active);
            this.activeResizeObserver.disconnect();
        }
    }

    skip() {
        window.localStorage.setItem('wizardSkipped', 'true');
        this.removeEventListeners();
        this.close();
    }
}

export default Wizard;