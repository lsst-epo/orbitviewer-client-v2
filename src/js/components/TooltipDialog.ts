interface TooltipDialogOptions {
    dom: HTMLElement; 
    text: string; // Text to display in the tooltip
    alignment?: 'left' | 'center' | 'right'; // Alignment of the tooltip
    auto?: boolean
}

let _to;

class TooltipDialog {
    private id: string;
    dom: HTMLElement;
    dialog: HTMLElement;
    text: string;
    alignment: 'left' | 'center' | 'right';

    constructor(opt?: TooltipDialogOptions ) {
        this.id = new Date().getTime().toString(36)
        this.dom = opt?.dom || document.body;
        this.text = opt?.text || '';
        this.alignment = opt?.alignment || 'center';
        !!opt?.auto && this.create();
    }

    create() {
        clearTimeout(_to);
        this.dialog = document.createElement('div');
        this.dialog.id = `tooltip-dialog-${this.id}`;
        this.dialog.classList.add('tooltip-dialog');
        this.dialog.classList.add(`tooltip-dialog-${this.alignment}`);
        const { top, left, width } = this.dom.getBoundingClientRect();
        const { scrollTop, scrollLeft } = document.documentElement;
        const offsetY = 16;
        const offsetX = this.alignment === 'center' ? width / 2 : this.alignment === 'right' ? width : 0;
        this.dialog.style.top = `${top - offsetY + scrollTop}px`;
        this.dialog.style.left = `${left + offsetX + scrollLeft}px`;
        this.dialog.innerHTML = `<div class="tooltip-dialog-content">${this.text}</div>`;
        document.body.appendChild(this.dialog);
        requestAnimationFrame(() => {
            this.dialog.classList.add('visible');
        });
    }

    dispose() {
        this.dialog.classList.remove('visible');
        const animationDuration = parseFloat(getComputedStyle(this.dialog).transitionDuration || '0') * 1000; // Convert to milliseconds
        _to = setTimeout(() => {
            this.dialog.remove();
        }, animationDuration);
    }
}

export default TooltipDialog;