import Layer from "./Layer";

class Toolbar extends Layer {
    orbitviewer: any;
    dom: any;
    startButtons: any;

    constructor(dom, orbitviewer) {
        super(dom, {
            openClass: 'toolbar--open',
            closeClass: 'toolbar--close',
            animationDuration: 500
        });
        
		this.dom = dom;
        this.orbitviewer = orbitviewer;

        this.start();
    }

    start() {
        const toolbarItem = document.querySelectorAll('.toolbar-link');
		toolbarItem.forEach(el => {
			el.addEventListener('click', (event) => {
				event.preventDefault();
				const dataOpen = el.getAttribute('data-open');

				if(dataOpen === 'objects') {
					const link = el.getAttribute('href');
					if (link) {
						window.location.href = link;
					}
				} else {
					this.orbitviewer.toggleLayer(dataOpen);
				}
			});
		});
    }

    updateActiveStates(openLayers: Set<string>) {
        const toolbarLinks = document.querySelectorAll('.toolbar-link');
        toolbarLinks.forEach(link => {
            const dataOpen = link.getAttribute('data-open');
            if (dataOpen && dataOpen !== 'objects') {
                if (openLayers.has(dataOpen)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }
}

export default Toolbar;