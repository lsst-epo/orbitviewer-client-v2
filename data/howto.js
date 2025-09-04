import { getHowToUse } from './craft.js';

async function getLangData(lang) {
  const src = await getHowToUse(lang);
  return src.data ? src.data.howToUseEntry : {};
}

async function data() {
  const data = {
    en: await getLangData(1),
    es: await getLangData(2),
  };

  // console.log(data.en.howToUseSection[0]);

  return data;
}

export default data();