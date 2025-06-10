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
				const openValue = el.getAttribute('data-open');
				const wasActive = el.classList.contains('active');

				toolbarItem.forEach(item => {
					if (item !== el) {
						const itemOpenValue = item.getAttribute('data-open');
						const itemTarget = document.querySelector(`.${itemOpenValue}`);
						if (itemTarget) {
							itemTarget.setAttribute('aria-hidden', 'true');
						}
					}
				});

				toolbarItem.forEach(item => item.classList.remove('active'));

				if (!wasActive) {
					el.classList.add('active');
				}

				const target = document.querySelector(`.${openValue}`);
				if (target) {
					const isHidden = target.getAttribute('aria-hidden');
					target.setAttribute('aria-hidden', isHidden === "true" ? "false" : "true");
				}
			});
		});
    }
}

export default Toolbar;