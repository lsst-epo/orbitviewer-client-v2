import ToggleGroup from "../components/ToggleGroup";
import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";

export class ObjectsFiltersPage extends DefaultPage {
    dom: HTMLElement;
    toggles: NodeListOf<Element>;
    closeButton: HTMLElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;

        this.toggles = dom.querySelectorAll('.objects_card .togglegroup');
        this.closeButton = dom.querySelector('.button_close');
    }

    create() {
        console.log('create');
		this.toggles.forEach(element => {
			const objectsToggle = new ToggleGroup(element as HTMLElement);
            objectsToggle.show();
		});

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});

        GLOBALS.viewer.fadeIn();
    }

    close() {
        
    }
}