import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import chokidar from 'chokidar';
import { buildCSS, buildJS } from './scripts/build/esbuild.mjs';
const isProduction = process.env.ELEVENTY_ENV === 'production';

import staticData from './data/staticData.js';

import { copyFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

if(!isProduction) {
	const build = () => {
		buildJS(isProduction);
		buildCSS(isProduction);
	}

	const ev = {
		file: null,
		when: 0
	}

	const watcher = chokidar.watch('src/').on('change', (file, eventType) => {
		if(file === ev.file && Date.now() - ev.when < 300) {
			console.log('ignoring dupliocated file change event...');
			return;
		}
		ev.file = file;
		ev.when = Date.now();

		if(file.indexOf('/locale-templates/') > -1) {
      console.log(`Updated Locale Template [${file}]`);
      for(const lang of staticData.languages) {
        const dest = resolve(file.replace('/locale-templates/', `/pages/locale/${lang}/`));
        copyFileSync(file, dest);
      }
      return;
    }

		if(file.indexOf('.scss') > -1) {
			console.log(`Updated CSS [${file}]`);
			buildCSS(isProduction);
		} else {
			console.log(`Updated Source [${file}]`);
			buildJS(isProduction);
		}
	});

	build();

	const onExit = () => {
		console.log('11ty exit');
		watcher.close().then(() => console.log('Chokidar watcher closed'));
	}

	process.on('beforeExit', onExit);
	
	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'SIGBREAK'
	].forEach(function(element, index, array) {
		process.on(element, onExit);
	});
}

export default function (eleventyConfig) {
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.setUseGitIgnore(false);
	// browser sync options
	eleventyConfig.setServerOptions({
		ghostMode: false,
		liveReload: true,
		watch: ["public/**/*"],
		onRequest: {
			"/foo/:name": function({ url, pattern, patternGroups }) {
				// patternGroups will include URLPattern matches e.g. /foo/zach => { name: "zach" }
				return {
					status: 200,
					headers: {
						"Content-Type": "text/html",
					},
					body: "Hello."
				};
			},
			"*.fil": function({url}) {
				const path = resolve(`./public${url.pathname}`);
				// console.log(path)
				return {
					headers: {
						"Content-Type": "application/json",
						"Content-Encoding": "gzip"
					},
					body: readFileSync(path)
				}
			}
		}
	});
	eleventyConfig.setWatchJavaScriptDependencies(false);
	eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
	eleventyConfig.addPassthroughCopy("bundle");

	eleventyConfig.addNunjucksFilter("toFixed", function(src) {
		return parseFloat(src).toFixed(2);
	});

	eleventyConfig.addNunjucksFilter("toMiles", function(src) {
		const dm = parseFloat(src) / 1.609;
		return dm.toFixed(2);
	});

	eleventyConfig.addNunjucksFilter("difficulty", function(src, copies, lang) {
		if(src < 3) return copies.easy[lang];
		if(src < 5) return copies.medium[lang];
		return copies.hard[lang];
	});

	eleventyConfig.addNunjucksFilter("stringify", function(src, copies, lang) {
		if(!src) return "";
		return JSON.stringify(src);
	});

	return {
		dir: {
			input: 'src/site/pages',
			data: '../../../data',
			includes: '../partials',
			layouts: '../templates',
			output: 'public'
		},
		templateFormats: ['html', 'njk', 'md', '11ty.js'],
		htmlTemplateEngine: 'njk',
	}
}