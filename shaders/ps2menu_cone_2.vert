#include "common_vertex.h"
#include "noise.h"

uniform mat4 g_ModelMatrix;
uniform mat4 g_ViewProjectionMatrix;
uniform vec3 g_EyePosition;
uniform vec3 g_LightsPosition[4];
uniform vec3 g_LightAmbientColor;
uniform vec3 g_LightSkylightColor;
uniform sampler2D g_Texture0; // {"material":"Albedo","default":"clouds_normal"}
uniform float g_Time;

attribute vec3 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

#if NORMALMAP
attribute vec4 a_Tangent4;
#else
varying vec3 v_Normal;
#endif

varying vec3 v_ViewDir;
varying vec2 v_TexCoord;

varying vec4 v_Light0DirectionL3X;
varying vec4 v_Light1DirectionL3Y;
varying vec4 v_Light2DirectionL3Z;

varying float v_Noise;

#if REFLECTION
varying vec3 v_ScreenPos;
#endif

varying vec3 v_LightAmbientColor;

//varying vec4 v_Albedo;

void main() {
	vec4 worldPos = mul(vec4(a_Position, 1.0), g_ModelMatrix);
	vec3 normal = normalize(mul(a_Normal, CAST3X3(g_ModelMatrix)));
	v_Noise = smoothstep(-1, 1, snoise(vec2(a_TexCoord.x * 20.0, a_TexCoord.y * 20.0 - g_Time * 0.5))); //normalNoise(a_TexCoord * 4, 1.0, g_Time * 0.5);
	worldPos.xyz += normal * v_Noise * 1.0 * a_TexCoord.y;
	//worldPos.xyz += normalNoise(v_TexCoord, 1.0, g_Time);
	gl_Position = mul(worldPos, g_ViewProjectionMatrix);
	v_TexCoord = a_TexCoord;
	//v_Albedo = texSample2DLod(g_Texture0, v_TexCoord.xy, 0);
	//vec3 normal = DecompressNormal(texSample2DLod(g_Texture0, v_TexCoord.xy, 0));
	//vec3 normal = normalNoise(v_TexCoord);
	
#if REFLECTION
	v_ScreenPos = gl_Position.xyw;
#endif

	
	v_ViewDir = g_EyePosition - worldPos.xyz;

	v_Light0DirectionL3X.xyz = g_LightsPosition[0] - worldPos.xyz;
	v_Light1DirectionL3Y.xyz = g_LightsPosition[1] - worldPos.xyz;
	v_Light2DirectionL3Z.xyz = g_LightsPosition[2] - worldPos.xyz;
	
	vec3 l3 = g_LightsPosition[3] - worldPos.xyz;
	
#if NORMALMAP
	mat3 tangentSpace = BuildTangentSpace(CAST3X3(g_ModelMatrix), a_Normal, a_Tangent4);
	v_Light0DirectionL3X.xyz = mul(tangentSpace, v_Light0DirectionL3X.xyz);
	v_Light1DirectionL3Y.xyz = mul(tangentSpace, v_Light1DirectionL3Y.xyz);
	v_Light2DirectionL3Z.xyz = mul(tangentSpace, v_Light2DirectionL3Z.xyz);
	l3 = mul(tangentSpace, l3);
	v_ViewDir = mul(tangentSpace, v_ViewDir);
#else
	v_Normal = normal;
#endif

	v_Light0DirectionL3X.w = l3.x;
	v_Light1DirectionL3Y.w = l3.y;
	v_Light2DirectionL3Z.w = l3.z;
	v_LightAmbientColor = mix(g_LightSkylightColor, g_LightAmbientColor, dot(normal, vec3(0, 1, 0)) * 0.5 + 0.5);
}
