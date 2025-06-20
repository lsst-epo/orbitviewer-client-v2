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

class SEngine {
    search(query:string) {
        const items = [];
        const q = query.toLowerCase();
        const data = LoadManager.data;
        const craftData = LoadManager.craftData;

        this.searchInArray(q, data.planets, items);
        this.searchInArray(q, data.dwarf_planets, items);
        this.searchInArray(q, SolarItemsSamples, items);
        this.searchInArray(q, data.sample, items);

        return items;
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
