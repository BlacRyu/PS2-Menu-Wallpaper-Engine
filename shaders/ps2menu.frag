#include "common_fragment.h"


uniform float     g_Time;                // Application time, starts with 0

varying vec2 v_TexCoord;
varying vec4 v_Position;

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
    float totalWeight = 0.0;
    float noise = 0.0;
    
    //Noise Texture Sample Iterations: (UV Scale, Weight)
#if GLSL
    vec2 noiseIters[3] = vec2[3]
    (
#else
    vec2 noiseIters[3] = 
    {
#endif
      vec2(0.75,3.0),
      vec2(2.0,1.0),
      vec2(3.4,0.5)
#if GLSL
    );
#else
    };
#endif
    
    for (int i=0; i<3; i++)
    {
        totalWeight += noiseIters[i].y;
        noise += textureGrad( g_Texture0, noiseIters[i].x * uv, dFdx(uv2), dFdy(uv2) ).x * noiseIters[i].y;
        noise += textureGrad( g_Texture0, noiseIters[i].x * uv, ddx(uv2), ddy(uv2) ).x * noiseIters[i].y;
    }
// #if GLSL
//     noise += textureGrad( g_Texture0, 0.75 * uv, dFdx(uv2), dFdy(uv2) ).x * 3.0;
//     noise += textureGrad( g_Texture0, 2.0 * uv, dFdx(uv2), dFdy(uv2) ).x * 1.0;
//     noise += textureGrad( g_Texture0, 3.4 * uv, dFdx(uv2), dFdy(uv2) ).x * 0.5;
// #else
//     noise += g_Texture0.SampleGrad( g_Texture0SamplerState, 0.75 * uv, ddx(uv2), ddy(uv2) ).x * 3.0;
//     noise += g_Texture0.SampleGrad( g_Texture0SamplerState, 2.0 * uv, ddx(uv2), ddy(uv2) ).x * 1.0;
//     noise += g_Texture0.SampleGrad( g_Texture0SamplerState, 3.4 * uv, ddx(uv2), ddy(uv2) ).x * 0.5;
// #endif
    
    noise *= (MAXBRIGHTNESS-MINBRIGHTNESS) / 4.5;
    noise += MINBRIGHTNESS;
    
    vec3 col = vec3(.68, .54, 1) * noise * (.05 + .95*r) * 0.3 / ZOOM;
    
    gl_FragColor  = vec4(col, 1.0);
}