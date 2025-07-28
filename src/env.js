export const env = {
    PROD_TOKEN: process.env.PROD_TOKEN ?? "missing_prod_token", // TODO: remove this prod token from version 
    URL: process.env.URL ?? 'https://orbitviewer-api-dot-skyviewer.uw.r.appspot.com'
}

export default env;