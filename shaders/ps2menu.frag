varying vec2 v_TexCoord;
varying vec4 v_Position;

uniform float     g_Time;
uniform vec2 g_TexelSize;
uniform sampler2D g_Texture0; // {"material":"ui_editor_properties_noise","default":"util/noise"}
uniform vec3 g_BackgroundColor; // {"material":"background_color","default":"0.68 0.54 1.0","type":"color"}
uniform float g_FOV; // {"material":"FOV","default":"53"}
uniform float g_Center; // {"material":"Center","default":"0.4"}
uniform float g_FadeAlpha; // {"material":"Alpha","default":1,"range":[0,1]}

#define ZOOM 0.65 // 1.0 is neutral
//#define PERSPECTIVE 0.35 // 0 is neutral
#define TIMESCALE 0.4
#define MINBRIGHTNESS 0.7
#define MAXBRIGHTNESS 1.0

#if HLSL
    #define dFdx ddx
    #define dFdy ddy
    #define textureGrad(s, uv, dx, dy) s.SampleGrad(s ## SamplerState, uv, dx, dy)
#endif
    
//Noise Texture Sample Iterations: (UV Scale, Weight, UV Speed)
const int numIters = 4;
#if HLSL
    const vec3 noiseIters[4] = {
#else
    const vec3 noiseIters[4] = vec3[]( 
#endif
    vec3(0.25,4.0,0.035),
    vec3(0.5,2.0,0.04),
    vec3(1.5,1.0,0.0435),
    vec3(5.5,1.0,0.0465)
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
    
    // Adjust Center
    float fov = g_FOV * -0.02 + 1.4;
    p += vec2(-2 * g_Center + 1, 0.0);

    float aspectRatio = g_TexelSize.y / g_TexelSize.x;
    p.x *= aspectRatio;

    p *= (1.0 - fov) + length(p) * fov;
    p *= ZOOM;
    
    // Cylindrical Tunnel
    float r = length(p);
    //r = r * (1.0 + 0.015 * sin(15.0 * r - 2.0 * time));

    // angle of each pixel to the center of the screen
    float a = atan(p.y/p.x);
    
    // index texture by (animated inverse) radious and angle
    vec2 uv = vec2( 0.3/r, a/3.1415927 );
    
    //vec2 uv2 = vec2( uv.x, atan(p.y/(abs(p.x))/3.1415927) );

    // Time varying pixel color
    float totalWeight = 0.0;
    float noise = 0.0;
    
    for (int i=0; i < numIters; i++)
    {
        totalWeight += noiseIters[i].y;
        //noise += textureGrad( g_Texture0, noiseIters[i].x * uv, dFdx(uv2), dFdy(uv2) ).x * noiseIters[i].y;
        noise += texSample2D( g_Texture0, noiseIters[i].x * vec2(uv.x + noiseIters[i].z * time, uv.y)).x * noiseIters[i].y;
    }
    
    noise *= (MAXBRIGHTNESS-MINBRIGHTNESS) / totalWeight;
    noise += MINBRIGHTNESS;
    
    vec3 col = g_BackgroundColor * noise * min(1.0, (.1 + .9*r)) * 0.6;
    
    gl_FragColor  = vec4(col * g_FadeAlpha, 1.0);
}