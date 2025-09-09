/**
 * 1. Load dataset, solar items & planets
 * 2. Search algorithm:
 *    - Search on solar items
 *    - Search on local data
 *    - After a small timeout of inactivity while searching -> search on database
 * 3. Results must be viewable as orbits
 * To-Do: Add guides to search group
 *
 * Search will be performed using we workers most likely hooked to events that show results as they come.
 */

import { SolarItemsSamples } from "../../gfx/OrbitViewer";
import { OrbitDataElements } from "../solar/SolarUtils";
import { LoadManager } from "./LoadManager";

const query = {
    prompt: '',
    items: []
}

const SearchWorker = new Worker('/assets/js/search.js');

const items = [];
const put_items = (arr) => {
    for(const item of arr) {
        if(items.indexOf(item) === -1) items.push(item);
    }
}

class SEngine {
    searchCallback:Function = null;

    search(query:string, useWorker:boolean=false) {
        if(!useWorker) {
            const items = [];
            const q = query.toLowerCase();
            const data = LoadManager.data;

            this.searchInArray(q, data.planets, items);
            this.searchInArray(q, data.dwarf_planets, items);
            this.searchInArray(q, SolarItemsSamples, items);
            this.searchInArray(q, data.sample, items);

            return items;
        } else {
            const q = query.toLowerCase();
            const data = LoadManager.data;

            SearchWorker.postMessage({
                query: q,
                items: [data.planets, data.dwarf_planets, SolarItemsSamples, data.sample]
            })
        }
    }

    searchWorker(query:string) {
        return new Promise((resolve, reject) => {
          const worker = SearchWorker;

          const q = query.toLowerCase();
          const data = LoadManager.data;

          if(!items.length) {
              put_items(data.planets);
              put_items(data.dwarf_planets);
              put_items(SolarItemsSamples);
              put_items(data.sample);
          }

          worker.postMessage({
                query: q,
                items
            });

          worker.onmessage = (e) => {
            resolve(e.data);
            worker.terminate();
          };

          worker.onerror = (error) => {
            reject(error);
            worker.terminate();
          };
        });
    }

    private searchInArray(prompt:string, arr:OrbitDataElements[], found:OrbitDataElements[]) {
        for (let i = 0, len = arr.length; i < len; i++) {
            const item = arr[i];
            if (found.indexOf(item) > -1) continue;
            if (!item.fulldesignation) continue;
            const fd = item.fulldesignation.toLowerCase();
            if (fd.indexOf(prompt) > -1) found.push(item);
        }
    }
}

export const SearchEngine = new SEngine();

SearchWorker.addEventListener('message', (e) => {
    // console.log(e.data.imageURL)
    if(!SearchEngine.searchCallback) return;
    SearchEngine.searchCallback(e.data.results);
});