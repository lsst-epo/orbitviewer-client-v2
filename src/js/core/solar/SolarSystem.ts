/**
 * Solar System Constants & Orbit Calculations
 * Algorithms mostly based on the following paper:
 * https://www.stjarnhimlen.se/comp/ppcomp.html
 */

import { Vector3 } from "three";
import { PlanetId, PLANET_SCALE } from "./Planet";
import { PlanetDataMap } from "./SolarUtils";

export type SolarCategory = 'trans-neptunian-objects'|'near-earth-objects'|'interstellar-objects'|'comets'|'centaurs'|'asteroids'|'planets-moons'|'jupiter-trojans';

export const DEG_TO_RAD = Math.PI / 180;
export const E_CONVERGE_MAX_ITERATIONS = 10;
export const E_CONVERGENCE_THRESHOLD = .001 * Math.PI / 180;

export const K = 0.01720209895;

export const KM2AU = 6.6846e-9;
export const AU2KM = 1 / KM2AU;
export const SUN_RADIUS = 695700; // in KM

export const EPOCH = 51544.5;

export type OrbitElements = {
    id:string;
    fulldesignation: string;
    N:number;
    a:number;
    e:number;
    name?:string;
    G?:number;
    i:number;
    H?:number;
    w:number;
    M:number;
    n:number;
    q:number;
    Tp?:number;
    epoch:number;
    type:OrbitType;
    category:SolarCategory;
    rubin_discovery:boolean;
}

export enum OrbitType {
    Elliptical,
    Parabolic,
    NearParabolic,
    Hyperbolic
}

export function cloneOrbitElements(src:OrbitElements):OrbitElements {
    return {
        id: src.id,
        fulldesignation: src.fulldesignation,
        N: src.N,
        a: src.a,
        e: src.e,
        name: src.name,
        G: src.G,
        i: src.i,
        H: src.H,
        w: src.w,
        M: src.M,
        n: src.n,
        q: src.q,
        Tp: src.Tp,
        epoch: src.epoch,
        type: src.type,
        category: src.category,
        rubin_discovery: src.rubin_discovery
    }
}

export function getCartesianCoordinates(v:number, r:number, el:OrbitElements, target:Vector3=new Vector3(), convert:boolean=true):Vector3 {
    // convert to 3D cartesian coordinates
    const N = el.N * DEG_TO_RAD;
    const w = el.w * DEG_TO_RAD;
    const i = el.i * DEG_TO_RAD;

    const xh = r * ( Math.cos(N) * Math.cos(v+w) - Math.sin(N) * Math.sin(v+w) * Math.cos(i) );
    const yh = r * ( Math.sin(N) * Math.cos(v+w) + Math.cos(N) * Math.sin(v+w) * Math.cos(i) );
    const zh = r * ( Math.sin(v+w) * Math.sin(i) );

    // Double check coordinates conversion with them!
    if(!convert) target.set(xh * PLANET_SCALE,yh * PLANET_SCALE,zh * PLANET_SCALE);
    else target.set(xh * PLANET_SCALE,zh * PLANET_SCALE,-yh * PLANET_SCALE); // convert from z up to y up (y must be also inverted to convert into Z)

    return target;
}

export function calculateOrbitByType(el:OrbitElements, d:number, type:OrbitType=OrbitType.Elliptical, target:Vector3= new Vector3()):Vector3 {
    if(type === OrbitType.Elliptical) {
        return keplerCalc(el, d, target);
    } else if(type === OrbitType.Parabolic) {
        return parabolicCalc(el, d, target);
    } else if(type === OrbitType.NearParabolic) {
        return nearParabolicCalc(el, d, target);
    } else {
        return hyperbolicCalc(el, d, target);
    }
}

export function calculateOrbit(el:OrbitElements, d:number, target:Vector3= new Vector3()):Vector3 {
    return calculateOrbitByType(el, d, el.type, target);
}

function getPlanetMeanAnomaly(id:PlanetId, d:number):number {
    const el = PlanetDataMap[id];
    if(el === null) return 0;
    const epoch = el.epoch || 0;
    return (el.M + el.n * (d-epoch)) * DEG_TO_RAD;
}

export function keplerCalc(el:OrbitElements, d:number, target:Vector3= new Vector3()):Vector3 {
    // Mean Anomally and Eccentric Anomally
    const e = el.e;
    const epoch = el.epoch != undefined ? el.epoch : EPOCH;
    // if(el.id === 'test') console.log(epoch);
    const M = (el.M + el.n * (d-epoch)) * DEG_TO_RAD;
    let E = M + e * Math.sin(M) * ( 1.0 + e * Math.cos(M) );

    // E convergence check
    if(e >= 0.05) {
        let E0 = E;
        let E1 = E0 - ( E0 - e * Math.sin(E0) - M ) / ( 1 - e * Math.cos(E0) );
        let iterations = 0;
        while(Math.abs(E1-E0) > E_CONVERGENCE_THRESHOLD) {
            iterations++;
            E0 = E1;
            E1 = E0 - ( E0 - e * Math.sin(E0) - M ) / ( 1 - e * Math.cos(E0) );
        }
        E = E1;
    }

    // Find True Anomally and Distance
    const a = el.a;
    const xv = a * ( Math.cos(E) - e );
    const yv = a * ( Math.sqrt(1.0 - e*e) * Math.sin(E) );

    const v = Math.atan2( yv, xv );
    const r = Math.sqrt( xv*xv + yv*yv );

    if(el.id === 'jupiter' || el.id === 'saturn' || el.id === 'uranus') {
        // ---  Perturbations ----
        const Mj = getPlanetMeanAnomaly('jupiter', d);
        const Ms = getPlanetMeanAnomaly('saturn', d);
        const Mu = getPlanetMeanAnomaly('uranus', d);

        getCartesianCoordinates(v, r, el, target, false);

        // convert coords to lat lon
        let lonecl = Math.atan2( target.y, target.x );
        let latecl = Math.atan2( target.z, Math.sqrt(target.x*target.x+target.y*target.y) );

        if(this.type === 'jupiter') {
            lonecl += -0.332 * Math.sin(2*Mj - 5*Ms - 67.6 * DEG_TO_RAD);
            lonecl += -0.056 * Math.sin(2*Mj - 2*Ms + 21 * DEG_TO_RAD);
            lonecl += +0.042 * Math.sin(3*Mj - 5*Ms + 21 * DEG_TO_RAD);
            lonecl += -0.036 * Math.sin(Mj - 2*Ms);
            lonecl += +0.022 * Math.cos(Mj - Ms);
            lonecl += +0.023 * Math.sin(2*Mj - 3*Ms + 52 * DEG_TO_RAD);
            lonecl += -0.016 * Math.sin(Mj - 5*Ms - 69 * DEG_TO_RAD);
        }

        if(this.type === 'saturn') {
            lonecl += +0.812 * Math.sin(2*Mj - 5*Ms - 67.6 * DEG_TO_RAD);
            lonecl += -0.229 * Math.cos(2*Mj - 4*Ms - 2 * DEG_TO_RAD);
            lonecl += +0.119 * Math.sin(Mj - 2*Ms - 3 * DEG_TO_RAD);
            lonecl += +0.046 * Math.sin(2*Mj - 6*Ms - 69 * DEG_TO_RAD);
            lonecl += +0.014 * Math.sin(Mj - 3*Ms + 32 * DEG_TO_RAD);

            latecl += -0.020 * Math.cos(2*Mj - 4*Ms - 2 * DEG_TO_RAD);
            latecl += +0.018 * Math.sin(2*Mj - 6*Ms - 49 * DEG_TO_RAD);

        }

        if(this.type === 'uranus') {
            lonecl += +0.040 * Math.sin(Ms - 2*Mu + 6 * DEG_TO_RAD);
            lonecl += +0.035 * Math.sin(Ms - 3*Mu + 33 * DEG_TO_RAD);
            lonecl += -0.015 * Math.sin(Mj - Mu + 20 * DEG_TO_RAD);
        }

        const xh = PLANET_SCALE * r * Math.cos(lonecl) * Math.cos(latecl)
        const yh = PLANET_SCALE * r * Math.sin(lonecl) * Math.cos(latecl)
        const zh = PLANET_SCALE * r * Math.sin(latecl);

        target.x = xh;
        target.y = zh;
        target.z = -yh;
        return target;
    }

    return getCartesianCoordinates(v, r, el, target);
}

export function parabolicCalc(el:OrbitElements, d:number, target:Vector3= new Vector3()):Vector3 {
    const dT = el.Tp;//JD2MJD(el.Tp);
    const q = el.q;

    const H = (d-dT) * (K/Math.sqrt(2)) / Math.sqrt(q*q*q);

    const h = 1.5 * H;
    const g = Math.sqrt( 1.0 + h*h );
    const s = Math.cbrt( g + h ) - Math.cbrt( g - h );

    const v = 2.0 * Math.atan(s);
    const r = q * ( 1.0 + s*s );

    return getCartesianCoordinates(v, r, el, target);
}

export function nearParabolicCalc(el:OrbitElements, d:number, target:Vector3= new Vector3()):Vector3 {
    //Perihelion distance
    const q = el.q;
    const dT = el.Tp;//JD2MJD(el.Tp);
    const e = el.e;

    const a = 0.75 * (d-dT) * K * Math.sqrt( (1 + e) / (q*q*q) );
    const b = Math.sqrt( 1 + a*a );
    const W = Math.cbrt(b + a) - Math.cbrt(b - a);
    const f = (1 - e) / (1 + e);

    const a1 = (2/3) + (2/5) * W*W;
    const a2 = (7/5) + (33/35) * W*W + (37/175) * W**4;
    const a3 = W*W * ( (432/175) + (956/1125) * W*W + (84/1575) * W**4 );

    const C = W*W / (1 + W*W);
    const g = f * C*C;
    const w = W * ( 1 + f * C * ( a1 + a2*g + a3*g*g ) );
    // const w = DEG_TO_RAD * W * ( 1 + f * C * ( a1 + a2*g + a3*g*g ) );

    const v = 2 * Math.atan(w);
    const r = q * ( 1 + w*w ) / ( 1 + w*w * f );

    return getCartesianCoordinates(v, r, el, target);

}

export function hyperbolicCalc(el:OrbitElements, d:number, target:Vector3) {
    const q = el.q;
    const e = el.e;
    // const a = q / (1 - e);
    const a = el.a;
    const dT = el.Tp;//JD2MJD(el.Tp);

    const M = DEG_TO_RAD * (d-dT) / (-a)**1.5;

    let F0 = M;
    let F1 = ( M + e * ( F0 * Math.cosh(F0) - Math.sinh(F0) ) ) / ( e * Math.cosh(F0) - 1 );
    let iterations = 1;

    while(Math.abs(F1-F0) > E_CONVERGENCE_THRESHOLD) {
        iterations++;
        F0 = F1;
        F1 = ( M + e * ( F0 * Math.cosh(F0) - Math.sinh(F0) ) ) / ( e * Math.cosh(F0) - 1 );
    }
    const F = F1;


    const v = 2 * Math.atan( Math.sqrt((e+1)/(e-1)) ) * Math.tanh(F/2);
    const r = a * ( 1 - e*e ) / ( 1 + e * Math.cos(v) );

    return getCartesianCoordinates(v, r, el, target);
}

export function getMeanAnomaly(el:OrbitElements, d:number):number {
    if(el.type === OrbitType.Hyperbolic) {
        const a = el.a;
        const dT = el.Tp;
        return (d-dT) / (-a)**1.5;
    }

    const epoch = el.epoch != undefined ? el.epoch : EPOCH;
    return el.M + el.n * (d-epoch);
}
