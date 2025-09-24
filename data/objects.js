import {readFileSync } from 'fs';
import { excerpt, getCategories, getSolarItemsInfo, slugify } from './craft.js';

const planetIds = [];

async function getSolarItems(lang) {
  const data = [];
  const src = await getSolarItemsInfo(lang);
  const slugs = [];

  const cat = await getCategories(lang);
  const categories = cat.data.categories;

  if(!src.data) {
    console.log(src);
    return [];
  }

  for(const item of src.data.entries) {
    // console.log(item.elementID);
    const id = item.elementID;
    if(!id) continue;
    let slug = slugify(id);
    let i = 2;
    while(slugs.indexOf(slug) > -1) {
      slug = `${slugify(id)}-${i++}`;
    }
    slugs.push(slug);
    item.slug = slug;

    const cat = item.elementCategory && item.elementCategory.length ? item.elementCategory[0].slug : "";
    item.og = planetIds.indexOf(id) > -1 ? `${id}.webp` : 'default.webp';
    if(id === 'Sol') item.og = 'sun.webp';

    // console.log(item.textBody);

    item.description = item.textBody ? excerpt(item.textBody.plainText) : ""
    item.text = item.textBody ? item.textBody.html : "";
    // item.text = item.text || "";
    item.id = id;

    item.category = {};
    for(const c of categories) {
      if(c.slug === cat) {
        item.category.slug = c.slug;
        item.category.title = c.title;
      }
    }
    
    data.push(item);
  }

  return data;
}

async function data() {
  const data = {};

  const planets = JSON.parse(readFileSync("./src/assets/data/planet_elems.json", "utf-8"));
  // console.log(planets);
  for(const p of planets) {
    // init empty planet
    planetIds.push(p.id);
  }

  const en = await getSolarItems(1);
  const es = await getSolarItems(2);

  data.en = {
    string: JSON.stringify(en),
    data: en
  }

  data.es = {
    string: JSON.stringify(es),
    data: es
  }

  // console.log(data.en);

  return data;
}

export default data();