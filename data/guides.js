import { getGuidedExperiences, slugify } from './craft.js';

async function getLangData(lang) {
  const slugs = [];
  const src = await getGuidedExperiences(lang);
  // console.log(src);
  const data = [];
  if(src.data) {
    for(const entry of src.data.guidedExperiencesToursEntries) {
      // console.log(entry)
      if(entry.duration === null || !entry.complexity === null) continue;
      let slug = slugify(entry.title);
      let i = 2;
      while(slugs.indexOf(slug) > -1) {
        slug = `${slugify(id)}-${i++}`;
      }
      const guide = {
        title: entry.title,
        tourPicker: entry.tourPicker,
        tourPreview: entry.tourPreview,
        duration: entry.duration,
        complexity: entry.complexity,
        slug,
        slides: []
      }

      for(const slide of entry.flexible) {
        // console.log(slide);
        if(!slide.slideTitle && !slide.subTitle && !slide.slideContent && !slide.slideText) continue;
        guide.slides.push(slide);
      }

      if(guide.slides.length === 0) continue;

      // if(lang === 1) console.log(guide);

      data.push(guide);
    }
  }
  return data;
}

async function data() {
  const data = {
    en: await getLangData(1),
    es: await getLangData(2),
  };

  // console.log(data.en);

  return data;
}

export default data();