import { getGuidedExperiences } from './craft.js';

async function getLangData(lang) {
  const src = await getGuidedExperiences(lang);
  // console.log(src);
  const data = [];
  if(src.data) {
    for(const entry of src.data.guidedExperiencesToursEntries) {
      // console.log(entry)
      if(entry.duration === null || !entry.complexity === null) continue;
      data.push(entry);
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