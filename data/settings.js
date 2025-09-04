import { getGlobals } from './craft.js';

async function getGlobalsLang(lang) {
  const data = {};

  const src = await getGlobals(lang);
  const info = src.data.globalSets[0];

  data.title = info.seoTitle;
  data.name = info.seoSiteName;
  data.description = info.seoDescription;

  return data;
}

async function data() {
  const data = {
    en: await getGlobalsLang(1),
    es: await getGlobalsLang(2)
  };

  // console.log(data);

  return data;
}

export default data();