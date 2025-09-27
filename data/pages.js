import { getAbout, getPages } from './craft.js';

async function getLangData(lang) {
  const src = await getPages(lang);
  // console.log(src);
  const data = {};
  if(src.data) {
    for(const entry of src.data.pagesEntries) {
      if(entry.slug === 'about') {
        data.about = entry;
      }
      else if(entry.slug === 'how-to-use') {
        data.how_to_use = entry;
      } else if(entry.slug === 'landing') {
        data.landing = entry;
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

  // console.log(data.en.landing);

  return data;
}

export default data();