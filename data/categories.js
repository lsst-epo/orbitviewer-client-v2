import { getCategories } from './craft.js';

async function getCategoriesLang(lang) {
  const src = await getCategories(lang);
  if(!src.data) {
    console.log(src);
    return {}
  }

  return JSON.stringify(src.data.categories);
}

async function data() {
  const data = {
    en: await getCategoriesLang(1),
    es: await getCategoriesLang(2)
  };

  // console.log(data);

  return data;
}

export default data();