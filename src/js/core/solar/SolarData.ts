import { OrbitElements } from "./SolarSystem";
import { mapOrbitElements, mapOrbitElementsV2, OrbitDataElements, OrbitDataElementsV2 } from "./SolarUtils";

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

export const getSimDataV2 = (d:Array<OrbitDataElementsV2>, forceKeep:boolean=false):OrbitElements[] => {
    if(!forceKeep) {
        data.splice(0, data.length);
    }
    for(const el of d) {            
        const mel = mapOrbitElementsV2(el);
        data.push(mel);
    }

    return data;
}