import { Texture, TextureLoader } from "three"
import { PlanetId } from "../../core/solar/Planet"

export const tLoader = new TextureLoader();

export const PlanetTextureMap:Record<PlanetId, Record<string, Texture>> = {
	earth: {},
	mars: {},
	mercury: {},
	jupiter: {},
	uranus: {},
	venus: {},
	neptune: {},
	saturn: {}
}

// inject basemaps
for(const key in PlanetTextureMap) {
	PlanetTextureMap[key].map = tLoader.load(`/assets/textures/${key}.webp`);
}

PlanetTextureMap.saturn.ring = tLoader.load(`/assets/textures/saturn_ring.webp`);
