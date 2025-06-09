import staticData from '../../data/staticData.js';
const src = "./src/site/locale-templates/";
const dst = "./src/site/pages/locale/";

import * as fs from 'fs';
const files = fs.readdirSync(src);

console.log(`[fil] Cleaning up languages tmp...`);
try {
    fs.rmdirSync(dst);
} catch(e) {}

console.log(`[fil] Installing languages templates...`);

try {
    fs.mkdirSync(dst);
} catch(e) {}

for (const lang of staticData.languages) {
    fs.rmSync(`${dst}${lang}`, { recursive: true, force: true });
    fs.mkdirSync(`${dst}${lang}`);
    console.log(`[fil] Generating [${lang}]...`);

    for (const file of files) {
        console.log(`[fil] Copying ${file}...`);
        fs.copyFileSync(src + file, `${dst}${lang}/${file}`);
    }

    console.log(`[fil] Generating JSON for [${lang}]...`);
    fs.writeFileSync(`${dst}${lang}/${lang}.json`, `{"lang": "${lang}", "locale": "${staticData.locale[lang]}"}`);
}
