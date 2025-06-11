import { GLOBALS, IS_DEV_MODE } from "../Globals";

const LOCAL_TOKEN = "LdTQ3Q1QUtzPec_TNIAmmolWYUaevo3o";
const PROD_TOKEN = "Ma3vUfBJiY3XXmjerRcBQo5PpE3A0jxU";

const isLocalhost = false;//IS_DEV_MODE;
const url = isLocalhost ? 'http://localhost:8000' : 'https://orbitviewer-api-dot-skyviewer.uw.r.appspot.com';
// const url = isLocalhost ? 'http://localhost:8000' : 'https://hasura-688095955960.us-central1.run.app/v1/graphql';

function getLang():string {
  return GLOBALS.lang === 'en' ? '1' : '2';
}

export async function getQuery(query = null) {

	if(query === null){
		throw new Error();
 	}

  // content array
  let content = [];

	try {
		// initiate fetch
		const queryFetch = await fetch(`${url}/api`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${isLocalhost ? LOCAL_TOKEN : PROD_TOKEN}`,
			},
			body: JSON.stringify({
				query,
			}),
		});

		// store the JSON response when promise resolves
		content = await queryFetch.json();

	} catch (error) {
		throw new Error(error);
	}
  
  return content;
}

// --- To-Dos ------------------------
/*
  - siteId: (1 En, 2 ES)
 */
// -----------------------------------

export async function getCategories() {
  /* const query = `{
  categories(group: "objectTypes", siteId: "${getLang()}") {
    ... on objectTypes_Category {
      title
      objectTypeCode
      mainColor
    }
  }
}`; */

  const query = `{
    categories(group: "objectTypes", siteId: "${getLang()}") {
      ... on objectTypes_Category {
        title
        mainColor
        objectTypeCode
      }
    }
  }`;
  
  const content = await getQuery(query)

  return content;
}

// --- Comments: -----------------
/*
  - Structure needs to be updated
*/
// -------------------------------
export async function getAbout() {
  const query = `{
  entries(section: "about", siteId: "${getLang()}") {
    ... on about_about_Entry {
      text
    }
  }
}`;

  return await getQuery(query);
}

// --- Comments: -----------------
/*
  - This needs to happen on site build
  - But is it worth it?
  - Can this SEO info be static?
*/
// -------------------------------
export async function getGlobals() {
  const query = `{
  globalSets(siteId: "${getLang()}") {
    ... on defaultSEO_GlobalSet {
      seoSiteName
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
    }
    ... on mainMenu_GlobalSet {
      helpUrl
      howToUseUrl
    }
  }
}`
  return await getQuery(query);
}

// --- Comments: -----------------
/*
  - I don't understand what this was for
  - Is it still relevant?
  - Looks like was intending to cover specific SEO fields for the customize orbits screen which we no longer have.
*/
// -------------------------------
export async function getCustomizedOrbits() {
  const query = `{
  entries(section: "customizeOrbits", siteId: "${getLang()}") {
    ... on customizeOrbits_customizeOrbits_Entry {
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
      customizeOrbitsTitle
      customizeOrbitsDescription
    }
  }
}`;

return await getQuery(query);
}

// --- Comments: -----------------
/*
  - Looks like was intending to cover specific SEO fields for Guided experiences page
  - All this SEO things are like the global one. They need to be either generated at build or be static
*/
// -------------------------------
export async function getGuidedExperiences() {
  const query = `{
  entries(section: "guidedExperiences", siteId: "${getLang()}") {
    ... on guidedExperiences_guidedExperiences_Entry {
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
      title
      slug
    }
  }
}`;

  return await getQuery(query);
}

export async function getGuidedExperiencesTours() {
  const query = `{
  entries(section: "guidedExperiencesTours", siteId: "${getLang()}") {
    ... on guidedExperiencesTours_default_Entry {
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
      id
      title
      slug
      tourPicker {
        title
        slug
      }
      complexity
      flexible {
        ... on flexible_introSlide_BlockType {
          typeHandle
          slideTitle
          subTitle
          slideContent
          thumbnail
        }
        ... on flexible_defaultSlide_BlockType {
          typeHandle
          slideTitle
          subTitle
          slideContent
        }
        ... on flexible_funFactSlide_BlockType {
          typeHandle
          slideContent
        }
      }
    }
  }
}`;

  return await getQuery(query);  
}

// --- Comments: -----------------
/*
  - We need to update the structure
  - Fetching all those things dynamically makes things a bit awkward for many reasons including SEO
  - Isn't the build site pipeline an option?
*/
// -------------------------------

export async function getLanding() {
  const query = `{
  entries(section: "landing", siteId: "${getLang()}") {
    ... on landing_landing_Entry {
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
      landingCenterTitle
      landingVersion
    }
  }
}`;

  return await getQuery(query);
}


// --- Comments: -----------------
/*
  - We can get rid of this I think
*/
// -------------------------------
export async function getOrbitViewer() {
  const query = `{
  entries(section: "orbitViewer", siteId: "${getLang()}") {
    ... on orbitViewer_orbitViewer_Entry {
      seoTitle
      seoDescription
      seoImage {
        url(quality: 90)
      }
    }
  }
}`;

  return await getQuery(query);
}


// --- Comments: -----------------
/*
  - Provides content associated to featured solar items including planets and dwarf planets
  - Beyond planets and dwarf planets, this items must match 100% the static generated JSON of actual elements
*/
// -------------------------------
export async function getSolarItemsInfo() {
  const query = `{
  entries(section: "elements", siteId: "${getLang()}") {
    ... on elements_default_Entry {
      title
      elementID
      text
      elementDiameter
      elementCategory {
        slug
      }
      viewInSkyviewerLink
    }
  }
}`;

  return await getQuery(query);
}