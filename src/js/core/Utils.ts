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
    const url = isV2 ? `${STATIC_URL}mpcorbs-${weight}-v2.json` : `${STATIC_URL}mpcorbs-${weight}.json`;
    const response = await fetch(url);
    return await response.json();
}

export const SolarItems = JSON.parse('[{"title":"Comet S0000FtXa","elementID":"S0000FtXa","text":null,"elementDiameter":12,"slug":"comet-s0000ftxa","elementCategory":[{"slug":"comets"}],"elementPreview":[{"url":"https://storage.googleapis.com/rubin-obs-api_assets_general/_500xAUTO_crop_center-center_95_none/AuxTel-Feb.jpeg"}],"viewInSkyviewerLink":null},{"title":"TNO SS0000UHa","elementID":"SS0000UHa","text":null,"elementDiameter":0,"slug":"tno-ss0000uha","elementCategory":[{"slug":"trans-neptunian-objects"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Centaur SR00000Ja","elementID":"SR00000Ja","text":null,"elementDiameter":0,"slug":"centaur-sr00000ja","elementCategory":[{"slug":"centaurs"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Haumea","elementID":"haumea","text":null,"elementDiameter":0,"slug":"haumea","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Ceres","elementID":"ceres","text":null,"elementDiameter":0,"slug":"ceres","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Makemake","elementID":"makemake","text":null,"elementDiameter":0,"slug":"makemake","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Eris","elementID":"eris","text":null,"elementDiameter":0,"slug":"eris","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Asteroid S1019DUga","elementID":"S1019DUga","text":null,"elementDiameter":0,"slug":"asteroid-s1019duga","elementCategory":[{"slug":"asteroids"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Asteroid S1019DRsa","elementID":"S1019DRsa","text":null,"elementDiameter":0,"slug":"asteroid-s1019drsa","elementCategory":[{"slug":"asteroids"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Pluto","elementID":"pluto","text":null,"elementDiameter":50,"slug":"pluto","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Neptune","elementID":"neptune","text":null,"elementDiameter":12742,"slug":"neptune","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Jupiter","elementID":"jupiter","text":null,"elementDiameter":12742,"slug":"jupiter","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Saturn","elementID":"saturn","text":null,"elementDiameter":12742,"slug":"saturn","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Mars","elementID":"mars","text":null,"elementDiameter":12742,"slug":"mars","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Earth","elementID":"earth","text":null,"elementDiameter":12742,"slug":"earth","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Venus","elementID":"venus","text":null,"elementDiameter":12742,"slug":"venus","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Uranus","elementID":"uranus","text":null,"elementDiameter":12742,"slug":"uranus","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[],"viewInSkyviewerLink":null},{"title":"Mercury","elementID":"mercury","text":"<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. </p>\\n<p>Rem ullam, cum dolorum nobis unde adipisci nostrum veritatis earum? Sequi, molestias nostrum! Quisquam, deleniti quis similique saepe facere numquam quae quaerat.</p>","elementDiameter":12742,"slug":"mercury","elementCategory":[{"slug":"planets-moons"}],"elementPreview":[{"url":"https://storage.googleapis.com/rubin-obs-api_assets_general/_500xAUTO_crop_center-center_95_none/02-Cerro-Pachon-mountain-top-–-V4.jpg"}],"viewInSkyviewerLink":"https://www.google.com/"}]');
