export class Terminal {
    content:HTMLElement;

    constructor(public dom: HTMLElement) {
        this.content = dom.querySelector('.content');
    }

    log(message:string, className?:string) {
        const p = document.createElement('p');

        if(className) p.classList.add(className);
        
        p.innerHTML = message;
        this.content.appendChild(p);

        const rect = this.content.getBoundingClientRect();
        this.dom.scrollTop = rect.height;
    }
}