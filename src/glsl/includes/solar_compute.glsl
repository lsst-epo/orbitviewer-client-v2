const float E_CONVERGENCE_THRESHOLD = radians(.001);
const float K = 0.01720209895;
#define MAX_E_ITERATIONS 100

#define PLANET_SCALE 100.0

struct OrbitElements {
    float N;
    float a;
    float e;
    float G;
    float i;
    float H;
    float w;
    float M;
    float n;
    float Tp;
    float q;
    float epoch;
    int type;
};

float cbrt(float x) {
    return exp(log(x) / 3.0);
}

vec3 getCartesianCoordinates(float v, float r, OrbitElements el) {
    float N = radians(el.N);
    float w = radians(el.w);
    float i = radians(el.i);

    float xh = PLANET_SCALE * r * ( cos(N) * cos(v+w) - sin(N) * sin(v+w) * cos(i) );
    float yh = PLANET_SCALE * r * ( sin(N) * cos(v+w) + cos(N) * sin(v+w) * cos(i) );
    float zh = PLANET_SCALE * r * ( sin(v+w) * sin(i) );

    return vec3(xh,zh,-yh);
}

vec3 ellipticalCalc(OrbitElements el, float d) {
    // Mean Anomally and Eccentric Anomally
    float e = el.e;
    float M = radians(el.M + el.n * (d-el.epoch));
    float E = M + e * sin(M) * ( 1.0 + e * cos(M) );

    // E convergence check
    if(e >= 0.05) {
        float E0 = E;
        float E1 = E0 - ( E0 - e * sin(E0) - M ) / ( 1. - e * cos(E0) );
        int iterations = 0;
        while(abs(E1-E0) > E_CONVERGENCE_THRESHOLD) {
            iterations++;
            E0 = E1;
            E1 = E0 - ( E0 - e * sin(E0) - M ) / ( 1. - e * cos(E0) );
            if(iterations >= MAX_E_ITERATIONS) break;
        }
        E = E1;
    }

    // Find True Anomally and Distance
    float a = el.a;
    float xv = a * ( cos(E) - e );
    float yv = a * ( sqrt(1.0 - e*e) * sin(E) );

    float v = atan( yv, xv );
    float r = sqrt( xv*xv + yv*yv );

    vec3 xyz = getCartesianCoordinates(v, r, el);

    return xyz;
}

vec3 parabolicCalc(OrbitElements el, float d) {
    float dT = el.Tp;//JD2MJD(el.Tp);
    float q = el.q;

    float H = (d-dT) * (K/sqrt(2.0)) / sqrt(q*q*q);
    
    float h = 1.5 * H;
    float g = sqrt( 1.0 + h*h );
    float s = cbrt( g + h ) - cbrt( g - h );

    float v = 2.0 * atan(s);
    float r = q * ( 1.0 + s*s );

    return getCartesianCoordinates(v, r, el);
}

vec3 nearParabolicCalc(OrbitElements el, float d) {
    //Perihelion distance
    float q = el.q;
    float dT = el.Tp;//JD2MJD(el.Tp);
    float e = el.e;

    float a = 0.75 * (d-dT) * K * sqrt( (1.0 + e) / (q*q*q) );
    float b = sqrt( 1.0 + a*a );
    float W = cbrt(b + a) - cbrt(b - a);
    float f = (1.0 - e) / (1.0 + e);

    float a1 = (2./3.) + (2./5.) * W*W;
    float a2 = (7./5.) + (33./35.) * W*W + (37./175.) * pow(W, 4.0);
    float a3 = W*W * ( (432./175.) + (956./1125.) * W*W + (84./1575.) * pow(W, 4.0) );

    float C = W*W / (1.0 + W*W);
    float g = f * C*C;
    float w = W * ( 1.0 + f * C * ( a1 + a2*g + a3*g*g ) );
    // float w = DEG_TO_RAD * W * ( 1 + f * C * ( a1 + a2*g + a3*g*g ) );

    float v = 2.0 * atan(w);
    float r = q * ( 1.0 + w*w ) / ( 1.0 + w*w * f );

    return getCartesianCoordinates(v, r, el);
}

vec3 hyperbolicCalc(OrbitElements el, float d) {
    float q = el.q;
    float e = el.e;
    // float a = q / (1 - e);
    float a = el.a;
    float dT = el.Tp;//JD2MJD(el.Tp);

    float M = radians(d-dT) / pow(-a,1.5);

    float F0 = M;
    float F1 = ( M + e * ( F0 * cosh(F0) - sinh(F0) ) ) / ( e * cosh(F0) - 1.0 );
    int iterations = 1;

    while(abs(F1-F0) > E_CONVERGENCE_THRESHOLD) {
        iterations++;
        F0 = F1;
        F1 = ( M + e * ( F0 * cosh(F0) - sinh(F0) ) ) / ( e * cosh(F0) - 1.0 );
        if(iterations >= MAX_E_ITERATIONS) break;
    }
    float F = F1;
    

    float v = 2.0 * atan( sqrt((e+1.0)/(e-1.0)) ) * tanh(F/2.0);
    float r = a * ( 1.0 - e*e ) / ( 1.0 + e * cos(v) );

    return getCartesianCoordinates(v, r, el);
}

vec3 computePosition(OrbitElements el, float d) {
    if(el.type == 1) return parabolicCalc(el, d);
    else if(el.type == 2) return nearParabolicCalc(el, d);
    else if(el.type == 3) return hyperbolicCalc(el, d);

    return ellipticalCalc(el, d);
}