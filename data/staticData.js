export default {
	// Get global "isProduction"
	isProduction: process.env.ENVIRONMENT === 'production',
	baseURL: "",
  	title: "Orbitviewer",
	description: "Vera Rubin's interactive explorer.",
	languages: ["en", "es"],
	defaultLanguage: "en",
	rootDomain: process.env.ROOT_DOMAIN,
	og: {
		basePath: '/assets/images/og/',
		default: 'default.webp'
	},
	locale: {
    en: "en",
		es: "es"
	}
}