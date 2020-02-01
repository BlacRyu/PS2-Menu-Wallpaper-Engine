#include "common_fragment.h"

#if HLSL
    #define mod fmod
#endif

uniform float g_Light; // {"material":"Light","default":0,"range":[0,1]}
uniform float g_FadeAlpha; // {"material":"Alpha","default":1,"range":[0,1]}

uniform float g_Time;
uniform vec3 g_Color1; // {"material":"ui_editor_properties_color_start", "type":"color", "default":"1.0 0.25 1.0"}
uniform vec3 g_Color2; // {"material":"ui_editor_properties_color_end", "type":"color", "default":"0.25 1.0 1.0"}
const float colorPeriod = 20.0; // time in seconds to cycle from color 1 to 2 and back

uniform sampler2D g_Texture0; // {"material":"ui_editor_properties_albedo","default":"util/clouds_256"}
uniform sampler2D g_Texture1; // {"material":"ui_editor_properties_normal", "format":"normalmap", "combo":"NORMALMAP"}
uniform sampler2D g_Texture2; // {"material":"ui_editor_properties_framebuffer","default":"_rt_FullFrameBuffer","hidden":true}
uniform sampler2D g_Texture3; // {"material":"Reflection","default":"_rt_Reflection","hidden":true}

#ifndef NORMALMAP
varying vec3 v_Normal;
#endif

varying vec3 v_ScreenPos;
uniform vec2 g_TexelSizeHalf;

varying vec2 v_TexCoord;
varying vec3 v_ViewDir;
varying vec3 v_LightAmbientColor;
varying float v_Height;

void main( )
{
    vec4 diffuse = texSample2D(g_Texture0, v_TexCoord.xy * 4.0);

#if NORMALMAP
    vec3 normal = DecompressNormal(texSample2D(g_Texture1, v_TexCoord.xy));
#else
    vec3 normal = normalize(v_Normal);
#endif

    vec2 screenUV = (v_ScreenPos.xy / v_ScreenPos.z) * 0.5 + 0.5;
#ifdef HLSL_SM30
    screenUV += g_TexelSizeHalf;
#endif
    
    vec3 viewDir = normalize(v_ViewDir);
    
    // Lighting
    float rim = 1.0 - max(0.0,dot(viewDir, normal));
    float emissive = smoothstep(v_Height * 0.95, v_Height * 0.95 + 0.5, g_Light) * 0.5;
    emissive += rim; // rim light
    emissive += step(0, g_Light) * 0.25; // Make the primary crystal glow all over
    vec3 light = v_LightAmbientColor;
    diffuse.rgb *= light;

    // Refraction
    vec2 screenRefractionOffset = refract( viewDir, normal, 0.5 ).xy / v_ScreenPos.z;
#if HLSL
    vec3 refract = texSample2D( g_Texture3, vec2(screenUV.x, 1.0 - screenUV.y) + screenRefractionOffset ).rgb;
    refract = refract * 2.0 * (0.75 + emissive * 4.0);
#else
    vec3 refract = CAST3(0.5);
#endif

    // "Reflection"
    float reflect = texSample2D( g_Texture0, normal.xy + CAST2(v_Height*0.002) ).r;
    reflect *= reflect;
    reflect *= reflect;
    reflect *= reflect * 0.6;

    vec3 finalColor = mix(refract, diffuse.rgb, diffuse.r * .2); // blend between diffuse and (refracted) scene
    float tintLerp = abs(mod(g_Time / colorPeriod, 1.0) * 2.0 - 1.0);
    finalColor *= mix(g_Color1, g_Color2, tintLerp); // tint color by blending two input colors over time
    finalColor = finalColor + reflect; // add "reflections"
    
    gl_FragColor = vec4(finalColor * g_FadeAlpha, 1.0);
}