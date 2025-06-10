class Layer {
    private visible: boolean;
    private element: HTMLElement;
    private openClass?: string;
    private closeClass?: string;
    private animationDuration: number;

    constructor(element: HTMLElement, options?: {
        openClass?: string;
        closeClass?: string;
        animationDuration?: number;
    }) {
        this.element = element;
        this.visible = this.element.getAttribute('aria-hidden') !== 'true';
        this.openClass = options?.openClass;
        this.closeClass = options?.closeClass;
        this.animationDuration = options?.animationDuration || 300;
    }

    async open(): Promise<void> {
        this.visible = true;
        this.element.setAttribute('aria-hidden', 'false');
        
        if (this.openClass) {
            if (this.closeClass) {
                this.element.classList.remove(this.closeClass);
            }
            this.element.classList.add(this.openClass);
            
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
        }
    }

    async close(): Promise<void> {
        if (this.closeClass) {
            if (this.openClass) {
                this.element.classList.remove(this.openClass);
            }
            this.element.classList.add(this.closeClass);
            
            await new Promise(resolve => setTimeout(resolve, this.animationDuration));
        }

        this.visible = false;

        const focusedElement = this.element.querySelector(':focus') as HTMLElement;
        if (focusedElement) {
            focusedElement.blur();
        }

        this.element.setAttribute('aria-hidden', 'true');
    }

    toggle(): void {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    }

    isVisible(): boolean {
        return this.visible;
    }
}

export default Layer;