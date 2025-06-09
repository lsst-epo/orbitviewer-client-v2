class Layer {
    private visible: boolean;
    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.visible = this.element.getAttribute('aria-hidden') !== 'true';
    }

    open(): void {
        this.visible = true;
        this.element.setAttribute('aria-hidden', 'false');
    }

    close(): void {
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