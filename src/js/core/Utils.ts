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
export const STATIC_URL = "./assets/data/";

export async function getSolarStaticData(weight:string) {
    const url = `${STATIC_URL}data-${weight}.json`;
    const response = await fetch(url);
    return await response.json();
}