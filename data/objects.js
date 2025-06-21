import {readFileSync } from 'fs';
import { excerpt, getCategories, getSolarItemsInfo, slugify } from './craft.js';

const planetIds = [];

async function data() {
  const data = [];

  const cat = await getCategories('1');
  const categories = cat.data.categories;
  // console.log(categories);

  const solarItems = await getSolarItemsInfo('1');
  // console.log(solarItems.data.entries);
  const items = solarItems.data.entries;

  const planets = JSON.parse(readFileSync("./src/assets/data/planet_elems.json", "utf-8"));
  // console.log(planets);
  for(const p of planets) {
    // init empty planet
    planetIds.push(p.id);
  }

  // attach data
  for(const i of items) {
    const id = i.elementID;
    const cat = i.elementCategory && i.elementCategory.length ? i.elementCategory[0].slug : "";
    const item = {
      slug: slugify(id),
      id,
      og: planetIds.indexOf(id) > -1 ? `${id}.webp` : 'default.webp',
      title: i.title,
      description: i.text ? excerpt(i.text) : "",
      text: i.text || "",
      category: {
        slug: '',
        title: ''
      }
    }

    if(i.elementID === 'Sol') item.og = 'sun.webp'

    // if(cat === '') continue;

    for(const c of categories) {
      if(c.slug === cat) {
        item.category.slug = c.slug;
        item.category.title = c.title;
      }
    }
    data.push(item);
  }

  // console.log(data);

  return data;
}

export default data();