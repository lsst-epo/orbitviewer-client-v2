import { getGlobals } from './craft.js';

async function data() {
  const data = {};

  const src = await getGlobals('1');
  // console.log(src.data.globalSets[0]);
  const info = src.data.globalSets[0];

  data.title = info.seoTitle;
  data.name = info.seoSiteName;
  data.description = info.seoDescription;

  // console.log(data);

  return data;
}

export default data();