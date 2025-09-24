import { getAbout, getPages } from './craft.js';

async function getLangData(lang) {
  const src = await getPages(lang);
  // console.log(src);
  const data = {};
  if(src.data) {
    for(const entry of src.data.pagesEntries) {
      if(parseInt(entry.id) === 2305) {
        data.about = entry;
      }
      else if(parseInt(entry.id) === 2307) {
        data.how_to_use = entry;
      } else if(parseInt(entry.id) === 2325) {
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

  console.log(data.en);

  return data;
}

export default data();