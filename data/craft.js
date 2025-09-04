import { configDotenv } from "dotenv";

const PROD_TOKEN = "Ma3vUfBJiY3XXmjerRcBQo5PpE3A0jxU";
const url = 'https://orbitviewer-api-dot-skyviewer.uw.r.appspot.com';
const dev_url = 'https://api-dev.orbitviewer.dev';

configDotenv();

// console.log(process.env.SECURITY_KEY);

async function getQuery(query = null) {

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
        // Authorization: `Bearer ${PROD_TOKEN}`,
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

async function getDevQuery(query = null) {

  if(query === null){
    throw new Error();
  }

  // content array
  let content = [];

  try {
    // initiate fetch
    const queryFetch = await fetch(`${dev_url}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: `Bearer ${process.env.SECURITY_KEY}`,
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

/**
 * 
 * @param {language code: 1 for en and 2 for es} lang 
 * @returns 
 */

export async function getSolarItemsInfo(lang) {
  const query = `query {
  entries(section: "elements", siteId: "${lang}") {
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

export async function getCategories(lang) {
  const query = `query {
    categories(group: "objectTypes", siteId: "${lang}") {
      ... on objectTypes_Category {
        title
        slug
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
  - This needs to happen on site build
  - But is it worth it?
  - Can this SEO info be static?
*/
// -------------------------------
export async function getGlobals(lang) {
  const query = `{
  globalSets(siteId: "${lang}") {
    ... on defaultSEO_GlobalSet {
      seoSiteName
      seoTitle
      seoDescription
    }
  }
}`
  return await getQuery(query);
}

export function slugify(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

export function excerpt(text) {
  const maxChars = 150;
  // Strip HTML tags using regex
  const t = text.replaceAll("</p>", ".</p> ");
  const plainText = t
  .replace(/<[^>]*>/g, '') // Remove all HTML tags
  .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
  .replace(/&amp;/g, '&') // Replace ampersand entity
  .replace(/&lt;/g, '<') // Replace less than entity
  .replace(/&gt;/g, '>') // Replace greater than entity
  .replace(/&quot;/g, '"') // Replace quote entity
  .replace(/&#39;/g, "'") // Replace apostrophe entity
  .trim(); // Remove leading/trailing whitespace

  // Truncate if longer than maxChars
  if (plainText.length > maxChars) {
    const truncatedText = plainText.substring(0, maxChars);
    return truncatedText + '...';
  }

  return plainText;
}

export async function getAbout(lang) {
  const query = `query AboutQuery {
    aboutEntries(siteId: "${lang}") {
      ... on about_Entry {
        id
        title
        eyebrowText
        headerTitle
        headerBody {
          html
          rawHtml
          markdown
          plainText
        }
        introBody {
          html
        }
        introImage {
          url @transform(width: 1480, format: "webp")
        }
        responsiveBody {
          html
          rawHtml
          markdown
          plainText
        }
        lowSettingLabel
        lowSettingCount
        lowSettingImages {
          url @transform(width: 1220, format: "webp")
        }
        mediumSettingLabel
        mediumSettingCount
        mediumSettingImages {
          url @transform(width: 1220, format: "webp")
        }
        highSettingLabel
        highSettingCount
        highSettingImages {
          url @transform(width: 1220, format: "webp")
        }
        ultraSettingLabel
        ultraSettingCount
        ultraSettingImages {
          url @transform(width: 1220, format: "webp")
        }
        observatoryBody {
          html
          rawHtml
          markdown
          plainText
        }
        observatoryImage {
          urlLarge: url @transform(width: 1920, format: "webp")
          urlMedium: url @transform(mode: "crop", width: 1440, height: 855, format: "webp")
          urlSmall: url @transform(mode: "crop", width: 768, height: 456, format: "webp")
        }
        footerBody {
          html
          rawHtml
          markdown
          plainText
        }
        footerImage {
          urlLarge: url @transform(width: 1920, format: "webp")
          urlMedium: url @transform(mode: "crop", width: 1440, height: 490, format: "webp")
          urlSmall: url @transform(mode: "crop", width: 768, height: 262, format: "webp")
        }
        creditsText {
          html
          rawHtml
          markdown
          plainText
        }
      }
    }
  }`;

  return await getDevQuery(query);

}

export async function getHowToUse(lang) {
  const query = `query HowToUseQuery {
    howToUseEntry(siteId: "${lang}") {
      ... on howToUse_Entry {
        id
        title
        eyebrowText
        headerText
        howToUseSection {
          ... on howToUseSection_section_BlockType{
            sectionTitle
            sectionBody {
              html
              rawHtml
              markdown
              plainText
            } 
            sectionImage {
              url @transform(width: 1200, format: "webp")
            }
          }
        }
      }
    }
  }`;

  return await getDevQuery(query);

}

export async function getJSONDataFiles() {
  const query = `query getDataFileEntries{
  mpcDataFilesEntries {
    ... on mpcDataFiles_Entry {
      title
      dataFileUrl
      dataFileQuality
    }
  }
  }`

  return await getDevQuery(query);

}