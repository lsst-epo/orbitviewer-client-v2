export const env = {
    PROD_TOKEN: process.env.PROD_TOKEN ?? "missing_prod_token", // TODO: remove the hard-coded prod token from version control
    URL: process.env.URL ?? 'https://orbitviewer-api-dot-skyviewer.uw.r.appspot.com'
}

export default env;