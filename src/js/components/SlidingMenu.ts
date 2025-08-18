interface MenuState {
 currentLevel: 1 | 2;
 language: 'english' | 'spanish';
 exploration: 'low' | 'medium' | 'high' | 'ultra';
}

const menuState: MenuState = {
 currentLevel: 1,
 language: 'english',
 exploration: 'low'
};

class SlidingMenu {
 private container: HTMLElement;
 private content: HTMLElement;
 
 constructor(selector: string) {
   this.container = document.querySelector(selector);
   this.content = this.container.querySelector('.nav_dropdown-content');
   this.init();
 }

 private init() {
   this.bindEvents();
 }

 private bindEvents() {
  const itemLanguages = document.querySelector('#menuitem-languages');
  itemLanguages.addEventListener('click', () => {
    this.showSubmenu('language');
  });

  const itemExploration = document.querySelector('#menuitem-exploration');
  itemExploration.addEventListener('click', () => {
    this.showSubmenu('exploration');
  });

  const backButtons = document.querySelectorAll('.button_back');
  backButtons.forEach((el)=> {
    el.addEventListener('click', (e) => {
      this.showLevel1();
    });
  });
}

 private showSubmenu(type: 'language' | 'exploration') {
   menuState.currentLevel = 2;
   
   this.container.querySelectorAll('.nav_dropdown_level-group').forEach(group => {
     group.setAttribute('aria-hidden', 'true');
   });
   
   const targetGroup = this.container.querySelector(`[data-menu="${type}"]`);
   targetGroup?.setAttribute('aria-hidden', 'false');
   
   this.animateHeight();
   this.content.classList.add('show-level-2');
 }

 private showLevel1() {
    menuState.currentLevel = 1;
    this.content.classList.remove('show-level-2');
    
    const level1Content = this.container.querySelector('.nav_dropdown_level-1 .listitem-content') as HTMLElement;
    const targetHeight = this.measureHeight(level1Content);
    this.content.style.height = `${targetHeight}px`;
  }

  private animateHeight() {
    const level2 = this.container.querySelector('.nav_dropdown_level-2') as HTMLElement;
    const activeGroup = level2.querySelector('.nav_dropdown_level-group[aria-hidden="false"]') as HTMLElement;
    
    if (activeGroup) {
      const targetHeight = this.measureHeight(activeGroup);
      this.content.style.height = `${targetHeight}px`;
    }
  }

 private measureHeight(element: HTMLElement): number {
  const wasHidden = this.container.style.display === 'none';
  
  if (wasHidden) {
    this.container.style.visibility = 'hidden';
    this.container.style.display = 'block';
  }
  
  const height = element.offsetHeight;
  
  if (wasHidden) {
    this.container.style.display = 'none';
    this.container.style.visibility = '';
  }
  
  return height;
}

}

export default SlidingMenu;