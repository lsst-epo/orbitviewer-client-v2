import { getSolarItemsInfo, slugify } from './craft.js';

async function getSolarItems(lang) {
  const data = [];
  const src = await getSolarItemsInfo(lang);
  const slugs = [];

  for(const item of src.data.entries) {
    let slug = slugify(item.elementID);
    let i = 2;
    while(slugs.indexOf(slug) > -1) {
      slug = `${slugify(item.elementID)}-${i++}`;
    }
    slugs.push(slug);
    item.slug = slug;
    data.push(item);
  }

  return JSON.stringify(data);
}

async function data() {
  const data = {
    en: await getSolarItems(1),
    es: await getSolarItems(2)
  };

  // console.log(data);

  return data;
}

export default data();