import Layer from "./Layer";

class Search extends Layer {
    dom: HTMLElement;
    closeButton: HTMLElement;
    
    constructor(dom) {
        super(dom, {
            openClass: 'search--open',
            closeClass: 'search--close',
            closingClasses: ['out'],
            animationDuration: 500
        });
        
        this.dom = dom;

        this.closeButton = dom.querySelector('.button_close');

        this.start();
    }

    start() {
        // Close Button
		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
        
    }
}

export default Search;