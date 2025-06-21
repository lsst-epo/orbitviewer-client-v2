const PROD_TOKEN = "Ma3vUfBJiY3XXmjerRcBQo5PpE3A0jxU";
const url = 'https://orbitviewer-api-dot-skyviewer.uw.r.appspot.com';

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
        Authorization: `Bearer ${PROD_TOKEN}`,
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
  const query = `{
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
  const query = `{
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