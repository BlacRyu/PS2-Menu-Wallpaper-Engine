uniform float     g_Time;                // Application time, starts with 0


varying vec2 v_TexCoord;
varying vec4 v_Position;

    
vec2 hash( vec2 p ) // replace this by something better
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0 * frac(sin(p)*43758.5453123);
}

float simplex( vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

    vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x); 
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
    vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, CAST3(70.0) );
}


#define ZOOM 0.6
#define TIMESCALE 0.4

void main( )
{
    float time = float(g_Time) * TIMESCALE;
    
    // Normalized pixel coordinates (from -1 to 1)
    vec2 p = v_Position.xy / v_Position.w;//(-iResolution.xy + 2.0*fragCoord)/iResolution.y;
    
    // Shift Center
    p += vec2(.25, 0.);
    
    p *= ZOOM;
    
    // Cylindrical Tunnel
    float r = length(p);
    r = r * (1.0 + 0.025 * sin(15.0 * r - 2.0 * time));

    // angle of each pixel to the center of the screen
    float a = atan(p.y/p.x);
    
    // index texture by (animated inverse) radious and angle
    vec2 uv = vec2( 0.3/r + .05 * time, a/3.1415927 );
    
    // fluctuation
    //uv.x += .1*(1.0 + sin(-2.0*time + 10.*r)) * max(0.5-r, 0.0);
    
    vec2 uv2 = vec2( uv.x, atan(p.y/(abs(p.x))/3.1415927) );

    // Time varying pixel color
    //float noise = (textureGrad( iChannel0, uv, dFdx(uv2), dFdy(uv2) ).x * 3.0
    //            + textureGrad( iChannel0, 16.0*uv, dFdx(uv2), dFdy(uv2) ).x * 0.0)
    //          / 3.0;
    float noise = (simplex(20.0 * uv2) + 3.0) * .25;
    noise += (simplex(60.0 * uv2) + 9.0) * .1;
    noise *= .5;
    
    vec3 col = vec3(.68, .54, 1) * noise * (.05 + .95*r) * 0.3 / ZOOM;
    
    gl_FragColor  = vec4(col, 1.0);
}