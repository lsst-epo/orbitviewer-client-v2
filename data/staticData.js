export default {
	// Get global "isProduction"
	isProduction: process.env.ELEVENTY_ENV === 'production',
	baseURL: "",
  title: "Orbit Viewer Engine V2",
	description: "Vera Rubin's interactive explorer.",
	languages: ["en", "es"],
	defaultLanguage: "en",
	locale: {
    en: "en",
		es: "es"
	}
}