varying vec2 v_TexCoord;
varying vec4 v_Position;

uniform float     g_Time;                // Application time, starts with 0
uniform vec2 g_TexelSize;
uniform sampler2D g_Texture0; // {"material":"ui_editor_properties_noise","default":"util/noise"}

#define ZOOM 0.6
#define TIMESCALE 0.4
#define MINBRIGHTNESS 0.7
#define MAXBRIGHTNESS 1.0

#if HLSL
    #define dFdx ddx
    #define dFdy ddy
    #define textureGrad(s, uv, dx, dy) s.SampleGrad(s ## SamplerState, uv, dx, dy)
#endif

const vec3 tint = vec3(.68, .54, 1);
    
//Noise Texture Sample Iterations: (UV Scale, Weight)
const int numIters = 3;
#if HLSL
    const vec2 noiseIters[3] = {
#else
    const vec2 noiseIters[3] = vec2[]( 
#endif
    vec2(0.2,4.0), 
    vec2(0.5,2.0), 
    vec2(1.0,2.0)
#if HLSL
    };
#else
    );
#endif

void main( )
{
    float time = float(g_Time) * TIMESCALE;
    
    // Normalized pixel coordinates (from -1 to 1)
    vec2 p = v_Position.xy / v_Position.w;
    p.x *= g_TexelSize.y / g_TexelSize.x;
    
    // Adjust Center
    p += vec2(.25, 0.);
    p *= ZOOM;
    
    // Cylindrical Tunnel
    float r = length(p);
    r = r * (1.0 + 0.025 * sin(15.0 * r - 2.0 * time));

    // angle of each pixel to the center of the screen
    float a = atan(p.y/p.x);
    
    // index texture by (animated inverse) radious and angle
    vec2 uv = vec2( 0.3/r + .05 * time, a/3.1415927 );
    
    vec2 uv2 = vec2( uv.x, atan(p.y/(abs(p.x))/3.1415927) );

    // Time varying pixel color
    float totalWeight = 0.0;
    float noise = 0.0;
    
    for (int i=0; i < numIters; i++)
    {
        totalWeight += noiseIters[i].y;
        //noise += textureGrad( g_Texture0, noiseIters[i].x * uv, dFdx(uv2), dFdy(uv2) ).x * noiseIters[i].y;
        noise += texSample2D( g_Texture0, noiseIters[i].x * uv).x * noiseIters[i].y;
    }
    
    noise *= (MAXBRIGHTNESS-MINBRIGHTNESS) / totalWeight;
    noise += MINBRIGHTNESS;
    
    vec3 col = tint * noise * (.05 + .95*r) * 0.3 / ZOOM;
    
    gl_FragColor  = vec4(col, 1.0);
}