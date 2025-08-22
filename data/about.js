import { getAbout } from './craft.js';

async function getLangData(lang) {
  const src = await getAbout(lang);
  return src.data.aboutEntries[0];
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