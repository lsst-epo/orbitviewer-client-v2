import gsap from "gsap";
import ToggleGroup from "../components/ToggleGroup";
import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";
import { ObjectsScroller } from "../components/ObjectsScroller";
import { SolarCategory } from "../core/solar/SolarSystem";
// import { FilterToggle } from "../components/FilterToggle";
import { UserFilters } from "../core/solar/SolarUtils";
import { CategoryCounters } from "../core/data/Categories";

const catSort:SolarCategory[] = [
    'planets-moons',
    'near-earth-objects',
    'asteroids',
    'comets',
    'centaurs',
    'trans-neptunian-objects',
    'interstellar-objects',
    'jupiter-trojans'
];

export class ObjectsFiltersPage extends DefaultPage {
    dom: HTMLElement;
    toggles: NodeListOf<Element>;
    closeButton: HTMLElement;
    section:HTMLElement;

    cards:NodeListOf<HTMLLIElement>;

    title:HTMLElement;
    subtitle:HTMLElement;
    controls:HTMLElement;

    scroller: ObjectsScroller;

    // inputs:FilterToggle[] = [];
    inputs:ToggleGroup[] = [];
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.toggles = dom.querySelectorAll('.objects_card .objects_card-foot');
        this.closeButton = dom.querySelector('.button_close');

        this.section = dom.querySelector('section');

        this.cards = this.section.querySelectorAll('li.objects-item');

        this.scroller = new ObjectsScroller({
            dom: this.section.querySelector('.objects-list'),
            nextButtons: [
                this.section.querySelector('.objects_controls-right'),
            ],
            prevButtons: [
                this.section.querySelector('.objects_controls-left'),
            ]
        });

        for(let i=0; i<this.cards.length;i ++) {
            gsap.set(this.cards[i], {
                translateY: '105%'
            });
        }

        this.title = dom.querySelector('h2.title');
        this.subtitle = dom.querySelector('h3.subtitle');

        gsap.set(this.title, {
            autoAlpha: 0,
            translateY: 100
        })

        gsap.set(this.subtitle, {
            autoAlpha: 0,
            translateY: 100
        })

        this.controls = dom.querySelector('.objects_controls');
        gsap.set(this.controls, {
            autoAlpha: 0,
            translateY: 100
        })
    }

    create() {
        console.log('create');
        const map = UserFilters.categories;

		this.toggles.forEach(element => {
            const toggleElement = element.querySelector('.togglegroup') as HTMLElement;
            const labelElements = element.querySelectorAll('.label') as NodeListOf<HTMLElement>;
            
            
			const objectsToggle = new ToggleGroup(toggleElement, (value:string, index:number) => {
                labelElements.forEach((label, i) => {
                    label.classList.toggle('active', i === index);
                })
                map[catSort[this.inputs.indexOf(objectsToggle)]] = index == 1;
                // console.log(map);
                GLOBALS.viewer.filtersUpdated();
            });

            objectsToggle.show();

            this.inputs.push(objectsToggle);

            // allow togglegroup to be set
            requestAnimationFrame(()=>{
                labelElements.forEach((label, index) => {
                    const inputs = element.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
                    const selectedIndex = Array.from(inputs).findIndex(input => input.checked);
                    label.classList.toggle('active', index === selectedIndex);
                
                    label.onclick = (e) => {
                        const target = e.target as HTMLElement;
                        const { dataset } = target;
                        const index = parseInt(dataset.index || '0', 10);
                        if (isNaN(index)) return;
                        objectsToggle.setIndex(index);
                    }
                })
            })
		});

        for(const key in CategoryCounters) {
            if(CategoryCounters[key] > 0) continue;
            const k = key as SolarCategory;
            // console.log(k);
            if(k === "near-earth-objects") {
                this.dom.querySelector('li#cat-near_earth_objects').remove();    
            } else if(k === "trans-neptunian-objects") {
                this.dom.querySelector('li#cat-trans_neptunian_objects').remove();    
            } else if(k === "interstellar-objects") {
                this.dom.querySelector('li#cat-interstellar_objects').remove();    
            } else if(k === "jupiter-trojans") {
                this.dom.querySelector('li#cat-trojans').remove();    
            } else {
                this.dom.querySelector(`li#cat-${k}`).remove();
            }
        }

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			// this.close();
            GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/`);
		});

        GLOBALS.viewer.fadeIn();

        this.scroller.init();

        this.updateInputValues();
    }

    updateInputValues() {
        const map = UserFilters.categories;
        for(const cat in map) {
            this.inputs[catSort.indexOf(cat as SolarCategory)].selectedIndex = map[cat] ? 1 : 0;
        }
    }

    update() {
        this.scroller.update();
    }

    transitionIn(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = true;

        gsap.to(this.section, {
            autoAlpha: 1,
            duration: 1,
            ease: 'cubic.out'
        });

        return new Promise<void>(gsapResolve => {
            gsapResolve();
            for(let i=0; i<this.cards.length;i ++) {
                gsap.to(this.cards[i], {
                    translateY: '0%',
                    ease: 'expo.inOut',
                    duration: 1.5,
                    delay: i * .1,
                    onComplete: () => {
                        /* if(i===this.cards.length-1) {
                            document.body.style.overflow = 'auto';
                        } */
                    }
                });
            }

            gsap.to(this.title, {
                autoAlpha: 1,
                translateY: 0,
                duration: 1.2,
                ease: 'cubic.inOut'
            })

            gsap.to(this.subtitle, {
                autoAlpha: 1,
                translateY: 0,
                duration: 1.2,
                delay: 0.1,
                ease: 'cubic.inOut'
            })

            gsap.to(this.controls, {
                autoAlpha: 1,
                translateY: 0,
                duration: 1.2,
                delay: 0.5,
                ease: 'cubic.inOut'
            })
        }).then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = false;
        return new Promise<void>(gsapResolve => {
            gsapResolve();
            gsap.to(this.section, {
                autoAlpha: 0,
                ease: 'cubic.out',
                duration: 1,
                delay: .7,
                onComplete: () => {
                    this.dom.remove();
                }
            });
            gsap.to(this.title, {
                autoAlpha: 0,
                translateY: -100,
                duration: 1.2,
                ease: 'cubic.inOut'
            })

            gsap.to(this.subtitle, {
                autoAlpha: 0,
                translateY: -100,
                duration: 1.2,
                delay: 0.1,
                ease: 'cubic.inOut'
            })

            gsap.to(this.controls, {
                autoAlpha: 0,
                translateY: -100,
                duration: 1.2,
                delay: 0.5,
                ease: 'cubic.inOut'
            })

            for(let i=0; i<this.cards.length;i ++) {
                gsap.to(this.cards[i], {
                    translateY: '110%',
                    ease: 'expo.inOut',
                    duration: 1,
                    delay: i * .1
                });
            }
        }).then(resolve);
    }

    dispose() {
        super.dispose();
        this.scroller.destroy();
    }
}