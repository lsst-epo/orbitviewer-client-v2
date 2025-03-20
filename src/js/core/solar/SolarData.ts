import { OrbitElements } from "./SolarSystem";
import { mapOrbitElements, OrbitDataElements } from "./SolarUtils";

const data:OrbitElements[] = [];

export const getSimData = (d:Array<OrbitDataElements>, forceKeep:boolean=false):OrbitElements[] => {
    if(!forceKeep) {
        data.splice(0, data.length);
    }
    for(const el of d) {            
        const mel = mapOrbitElements(el);
        data.push(mel);
    }

    return data;
}