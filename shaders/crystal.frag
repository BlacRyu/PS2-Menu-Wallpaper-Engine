#include "common_fragment.h"

#if HLSL
    #define mod fmod
#endif

uniform vec4 g_LightsColorRadius[4];

uniform float g_Metallic; // {"material":"Metal","default":0,"range":[0,1]}
uniform float g_Roughness; // {"material":"Rough","default":0,"range":[0,1]}
uniform float g_Light; // {"material":"Light","default":0,"range":[0,1]}

uniform float g_Time;
uniform vec3 g_Color1; // {"material":"ui_editor_properties_color_start", "type":"color", "default":"1.0 0.25 1.0"}
uniform vec3 g_Color2; // {"material":"ui_editor_properties_color_end", "type":"color", "default":"0.25 1.0 1.0"}
const float colorPeriod = 40.0; // time in seconds to cycle from color 1 to 2 and back

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
varying vec4 v_Light0DirectionL3X;
varying vec4 v_Light1DirectionL3Y;
varying vec4 v_Light2DirectionL3Z;
varying vec3 v_LightAmbientColor;

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
    vec3 specularResult = vec3(0, 0, 0);
    float specularPower = ComputeMaterialSpecularPower(g_Roughness, g_Metallic);
    float specularStrength = ComputeMaterialSpecularStrength(g_Roughness, g_Metallic);
    
    // Lighting
    float emissive = step(1.0 - v_TexCoord.y, g_Light);
    emissive += 1.0 - max(0.0,dot(viewDir, normal)); // rim light
    vec3 light = ComputeLightSpecular(normal, v_Light0DirectionL3X.xyz, g_LightsColorRadius[0].rgb, g_LightsColorRadius[0].w, viewDir, specularPower, specularStrength, emissive, g_Metallic, specularResult);
    light += ComputeLightSpecular(normal, v_Light1DirectionL3Y.xyz, g_LightsColorRadius[1].rgb, g_LightsColorRadius[1].w, viewDir, specularPower, specularStrength, emissive, g_Metallic, specularResult);
    light += ComputeLightSpecular(normal, v_Light2DirectionL3Z.xyz, g_LightsColorRadius[2].rgb, g_LightsColorRadius[2].w, viewDir, specularPower, specularStrength, emissive, g_Metallic, specularResult);
    light += ComputeLightSpecular(normal, vec3(v_Light0DirectionL3X.w, v_Light1DirectionL3Y.w, v_Light2DirectionL3Z.w), g_LightsColorRadius[3].rgb, g_LightsColorRadius[3].w, viewDir, specularPower, specularStrength, emissive, g_Metallic, specularResult);
    light += v_LightAmbientColor;
    diffuse.rgb *= light;

    // Refraction
    vec2 screenRefractionOffset = refract(viewDir, normal, 0.5) / v_ScreenPos.z;
    vec3 refract = texSample2D(g_Texture3, vec2(screenUV.x, 1.0 - screenUV.y) + screenRefractionOffset).rgb;
    refract = refract * 4.0 * (1.0 + emissive * 4.0);

    // "Reflection"
    float reflect = texSample2D(g_Texture0, normal.xy).r;
    reflect = reflect * reflect;
    reflect = reflect * reflect * .25;

    vec3 finalColor = mix(refract, diffuse.rgb, diffuse.r * .5); // blend between diffuse and (refracted) scene
    float tintLerp = abs(mod(g_Time / colorPeriod, 1.0) * 2.0 - 1.0);
    finalColor *= mix(g_Color1, g_Color2, tintLerp); // tint color by blending two input colors over time
    finalColor = finalColor + specularResult; // add specular highlights
    finalColor = finalColor + reflect; // add "reflections"
    
    gl_FragColor = vec4(finalColor, 1.0);
}