import { MathUtils } from "@fils/math";
import { CLOCK_SETTINGS, GLOBALS } from "./Globals";
import { UserFilters } from "./solar/SolarUtils";

export function downloadJSON(data, filename, minify = false) {
    // Convert the JavaScript object to a JSON string
    // For minified JSON, use null, 0 or omit the parameters entirely
    // For pretty-printed JSON, use null, 2
    const jsonString = minify
      ? JSON.stringify(data)
      : JSON.stringify(data, null, 2);

    // Create a Blob object with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'data.json';

    // Append to the document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the blob URL
    URL.revokeObjectURL(url);
}

// export const STATIC_URL = "https://clients.fil.studio/rubin/tests/data/001/assets/data/";
// export const STATIC_URL = "./assets/data/";
export const STATIC_URL = "https://storage.googleapis.com/orbitviewer-data/";

export async function getSolarStaticData(weight:string, isV2:boolean=false) {
    const url = isV2 ? `${STATIC_URL}mpc_orbits-${weight}-v7.json` : `${STATIC_URL}mpcorbs-${weight}.json`;
    const response = await fetch(url);
    return await response.json();
}

// export const SolarItems = JSON.parse('[{"title":"Comet S0000FtXa","elementID":"S0000FtXa","text":null,"elementDiameter":12,"slug":"comet-s0000ftxa","elementCategory":[{"slug":"comets"}],"elementPreview":[{"url":"https://storage.googleapis.com/rubin-obs-api_assets_general/_500xAUTO_crop_center-center_95_none/AuxTel-Feb.jpeg"}],"viewInSkyviewerLink":null},{"title":"TNO SS0000UHa","elementID":"SS0000UHa","text":null,"elementDiameter":0,"slug":"tno-ss0000uha","elementCategory":[{"slug":"trans-neptunian-objects"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Centaur SR00000Ja","elementID":"SR00000Ja","text":null,"elementDiameter":0,"slug":"centaur-sr00000ja","elementCategory":[{"slug":"centaurs"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Haumea","elementID":"haumea","text":null,"elementDiameter":0,"slug":"haumea","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Ceres","elementID":"ceres","text":null,"elementDiameter":0,"slug":"ceres","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Makemake","elementID":"makemake","text":null,"elementDiameter":0,"slug":"makemake","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Eris","elementID":"eris","text":null,"elementDiameter":0,"slug":"eris","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Asteroid S1019DUga","elementID":"S1019DUga","text":null,"elementDiameter":0,"slug":"asteroid-s1019duga","elementCategory":[{"slug":"asteroids"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Asteroid S1019DRsa","elementID":"S1019DRsa","text":null,"elementDiameter":0,"slug":"asteroid-s1019drsa","elementCategory":[{"slug":"asteroids"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Pluto","elementID":"pluto","text":null,"elementDiameter":50,"slug":"pluto","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Neptune","elementID":"neptune","text":null,"elementDiameter":12742,"slug":"neptune","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Jupiter","elementID":"jupiter","text":null,"elementDiameter":12742,"slug":"jupiter","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Saturn","elementID":"saturn","text":null,"elementDiameter":12742,"slug":"saturn","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Mars","elementID":"mars","text":null,"elementDiameter":12742,"slug":"mars","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Earth","elementID":"earth","text":null,"elementDiameter":12742,"slug":"earth","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Venus","elementID":"venus","text":null,"elementDiameter":12742,"slug":"venus","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Uranus","elementID":"uranus","text":null,"elementDiameter":12742,"slug":"uranus","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Mercury","elementID":"mercury","text":"<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. </p>\\n<p>Rem ullam, cum dolorum nobis unde adipisci nostrum veritatis earum? Sequi, molestias nostrum! Quisquam, deleniti quis similique saepe facere numquam quae quaerat.</p>","elementDiameter":12742,"slug":"mercury","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[{"url":"https://storage.googleapis.com/rubin-obs-api_assets_general/_500xAUTO_crop_center-center_95_none/02-Cerro-Pachon-mountain-top-–-V4.jpg"}],"viewInSkyviewerLink":"https://www.google.com/"}]');


export function generateShareableURL() {
  const baseURL = "http://localhost:8080";
  const n = document.querySelector("[nomad-wrapper]").querySelector('div');//.childNodes[0] as HTMLElement;
  const template = n.getAttribute("nomad-template");
  console.log(template);

  let url = `${baseURL}/${GLOBALS.lang}/`;

  const params = [];

  // embed params
  if(!GLOBALS.solarClock.live) {
    // embed a date
    const date = GLOBALS.solarClock.currentDate;
    params.push(`d=${date.toISOString().slice(0, 19).replaceAll(':', '-')}`);
    params.push(`ts=${GLOBALS.solarClock.hoursPerSec}`);
  }

  if(template === "orbitviewerpage") {
    // console.log('HOLA QUE PASSA');
    const cam = GLOBALS.viewer.controls;
    // console.log('is custom camera', cam.isCustomCamera());
    if(cam.isCustomCamera()) {
      const pos = cam.camera.position;
      const quat = cam.camera.quaternion;
      params.push(`cp=${pos.x}_${pos.y}_${pos.z}`);
      params.push(`cq=${quat.x}_${quat.y}_${quat.z}_${quat.w}`);
    }

    // filters
    params.push(`db=${UserFilters.discoveredBy}`);
    const cats = [];
    for(const key in UserFilters.categories) {
      if(UserFilters.categories[key] === false) {
        cats.push(key);
      }
    }
    // console.log(cats);
    if(cats.length) {
      params.push(`ntypes=${cats.join('+')}`);
    }

  } else if(template === 'object') {
    url += `object/`;
    const pr = GLOBALS.urlParams();
    for(const p of pr) {
      if(p.key === 'id') params.push(`id=${p.value}`);
    }
  } else {
    url += `${template}/`;
  }

  if(params.length) url += `?${params.join('&')}`;

  return url;
}

export function parseURL() {
  const params = GLOBALS.urlParams();

  let cp = null, cq = null;
  let clockChanged = false;

  for(const p of params) {
    if(p.key === 'db') {
      const i = parseInt(p.value);
      if(i >=0 && i<=2) UserFilters.discoveredBy = i as 0|1|2;
    }
    if(p.key === 'ntypes') {
      const cats = p.value.split('+');
      for(const cat of cats) {
        UserFilters.categories[cat] = false;
      }
    }
    if(p.key === 'cp') {
      cp = p.value;
    }
    if(p.key === 'cq') {
      cq = p.value;
    }

    if(p.key == 'd') {
      // date
      console.log(p.value);
      const parts = p.value.split('T');
      const date = new Date(`${parts[0]}T${parts[1].replaceAll('-', ':')}`);
      GLOBALS.solarClock.setDate(date);
      clockChanged = true;
    }
    if(p.key === 'ts') {
      const speed = parseFloat(p.value);
      // console.log(speed);
      setTimeout(() => {
        CLOCK_SETTINGS.speed = speed;
        clockChanged = true;
        GLOBALS.solarClock.resume();
        GLOBALS.timeCtrls.timemachineSlider.value = MathUtils.smoothstep(-CLOCK_SETTINGS.maxSpeed, CLOCK_SETTINGS.maxSpeed, speed);
      }, 1000);
      // GLOBALS.solarClock.hoursPerSec = speed;
      // GLOBALS.solarClock.start();
    }
  }

  // console.log(UserFilters);

  GLOBALS.viewer.filtersUpdated();

  if(cp != null && cq != null) {
    // console.log(cp);
    // console.log(cq);
    GLOBALS.viewer.controls.animateCameraFromURLParams(cp, cq);
  }
}