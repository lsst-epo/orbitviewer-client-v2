import Layer from "./Layer";
import ToggleGroup from "../components/ToggleGroup";

class ObjectsFilters extends Layer {
    dom: HTMLElement;
    toggles: NodeListOf<Element>;
    closeButton: HTMLElement;
    
    constructor(dom) {
        super(dom);
        this.dom = dom;

        this.toggles = dom.querySelectorAll('.objects_card .togglegroup');
        this.closeButton = dom.querySelector('.button_close');

        this.start();
    }

    start() {
		this.toggles.forEach(element => {
			const objectsToggle = new ToggleGroup(element);
		});

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
    }
}

export default ObjectsFilters;