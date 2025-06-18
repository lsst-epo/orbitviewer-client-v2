import gsap from "gsap";
import ToggleGroup from "../components/ToggleGroup";
import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";
import { ObjectsScroller } from "../components/ObjectsScroller";

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
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.toggles = dom.querySelectorAll('.objects_card .togglegroup');
        this.closeButton = dom.querySelector('.button_close');

        this.section = dom.querySelector('section');

        this.cards = this.section.querySelectorAll('li.objects-item');

        this.scroller = new ObjectsScroller({
            dom: this.section.querySelector('.objects-list'),
            snapType: 'direction',
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
		this.toggles.forEach(element => {
			const objectsToggle = new ToggleGroup(element as HTMLElement);
            objectsToggle.show();
		});

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});

        GLOBALS.viewer.fadeIn();

        this.scroller.init();
    }

    transitionIn(resolve: any): Promise<void> {
        gsap.set(this.dom, {
            autoAlpha: 1
        });

        gsap.to(this.section, {
            autoAlpha: 1,
            duration: 1,
            ease: 'cubic.out'
        });

        return new Promise<void>(gsapResolve => {
            for(let i=0; i<this.cards.length;i ++) {
                gsap.to(this.cards[i], {
                    translateY: '0%',
                    ease: 'expo.inOut',
                    duration: 1.5,
                    delay: i * .1,
                    onComplete: () => {
                        if(i===this.cards.length-1) {
                            gsapResolve();
                            document.body.style.overflow = 'auto';
                        }
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
        document.body.style.overflow = 'hidden';
        return new Promise<void>(gsapResolve => {
            gsap.to(this.section, {
                autoAlpha: 0,
                ease: 'cubic.out',
                duration: 1,
                delay: .7,
                onComplete: () => {
                    gsapResolve();
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
                    delay: i * .1,
                    onComplete: () => {
                        if(i===this.cards.length-1) {
                            gsapResolve();
                            document.body.style.overflow = 'auto';
                        }
                    }
                });
            }
        }).then(resolve);
    }

    close() {
        this.scroller.destroy();
    }
}