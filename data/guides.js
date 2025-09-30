import { getGuidedExperiences, slugify } from './craft.js';

function generateRandomDateString() {
  const randomDate = new Date(
    2020 + Math.random() * 5, // year 2020-2025
    Math.floor(Math.random() * 12), // month 0-11
    Math.floor(Math.random() * 28) + 1, // day 1-28
    Math.floor(Math.random() * 24), // hours
    Math.floor(Math.random() * 60), // minutes
    Math.floor(Math.random() * 60) // seconds
  );
  
  // Replace 'Z' with random timezone
  const offsetHours = Math.floor(Math.random() * 27) - 12;
  const offsetSign = offsetHours >= 0 ? '-' : '+';
  const offset = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, '0')}:00`;
  
  return randomDate.toISOString().slice(0, -1) + offset;
}

async function getLangData(lang) {
  const slugs = [];
  const src = await getGuidedExperiences(lang);
  // console.log(src);
  const data = [];
  if(src.data) {
    for(const entry of src.data.guidedExperiencesToursEntries) {
      // console.log(entry)
      for(let i=0;i<10; i++) {
      if(entry.duration === null || !entry.complexity === null || !entry.title) continue;
      let slug = slugify(entry.title);
      let i = 2;
      while(slugs.indexOf(slug) > -1) {
        slug = `${slugify(entry.title)}-${i++}`;
      }
      slugs.push(slug);
      const guide = {
        featured: Math.random() < .5,//entry.featuredTour,
        title: entry.title,
        date: generateRandomDateString(),//entry.postDate,
        tourPicker: entry.tourPicker,
        tourPreview: entry.tourPreview,
        duration: Math.round(2 + 10 * Math.random()),//entry.duration,
        complexity: Math.round(1 + 4 * Math.random()),//entry.complexity,
        slug,
        slides: []
      }

      for(const slide of entry.flexible) {
        // console.log(slide);
        if(!slide.slideTitle && !slide.subTitle && !slide.slideContent && !slide.slideText) continue;
        guide.slides.push(slide);
        // console.log(slide.closeUp)
      }

      if(guide.slides.length === 0) continue;

      // if(lang === 1) console.log(guide);

      data.push(guide);
      }
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