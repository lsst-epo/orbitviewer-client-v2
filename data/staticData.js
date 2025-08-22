export default {
	// Get global "isProduction"
	isProduction: process.env.ELEVENTY_ENV === 'production',
	baseURL: "",
  title: "Orbit Viewer",
	description: "Vera Rubin's interactive explorer.",
	languages: ["en", "es"],
	defaultLanguage: "en",
	rootDomain: "https://orbitviewer.app/",
	stagingDomain: "https://d251spak4lbyvj.cloudfront.net/",
	og: {
		basePath: 'assets/images/og/',
		default: 'default.webp'
	},
	locale: {
    en: "en",
		es: "es"
	}
}