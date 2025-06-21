export default {
	// Get global "isProduction"
	isProduction: process.env.ELEVENTY_ENV === 'production',
	baseURL: "",
  title: "Orbit Viewer",
	description: "Vera Rubin's interactive explorer.",
	languages: ["en"],//["en", "es"],
	defaultLanguage: "en",
	rootDomain: "https://d251spak4lbyvj.cloudfront.net/en/",
	stagingDomain: "https://d251spak4lbyvj.cloudfront.net/",
	og: {
		basePath: 'images/og/',
		default: 'default.webp'
	},
	locale: {
    en: "en",
		es: "es"
	}
}