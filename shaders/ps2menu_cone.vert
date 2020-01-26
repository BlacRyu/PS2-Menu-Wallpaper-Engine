#include "common_vertex.h"

attribute vec3 a_Position;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;
attribute vec4 a_Tangent4;

uniform mat4 g_ViewProjectionMatrix;
uniform mat4 g_ModelMatrix;
uniform vec3 g_EyePosition;
uniform vec3 g_LightsPosition[4];
uniform vec3 g_LightAmbientColor;
uniform vec3 g_LightSkylightColor;
uniform float g_Time;
uniform sampler2D g_Texture0; // {"material":"ui_editor_properties_normal","default":"clouds_normal"}

varying vec3 v_ViewDir;
varying vec2 v_TexCoord;
varying vec4 v_Position;
varying vec3 v_Normal;

varying vec4 v_Light0DirectionL3X;
varying vec4 v_Light1DirectionL3Y;
varying vec4 v_Light2DirectionL3Z;
varying vec3 v_LightAmbientColor;

//Noise Texture Sample Iterations: (UV Scale, UV Speed, Strength)
const int numIters = 4;
#if HLSL
    const vec3 noiseIters[4] = {
#else
    const vec3 noiseIters[4] = vec3[]( 
#endif
    vec3(0.25,0.035,4.0),
    vec3(0.5,0.04,2.0),
    vec3(1.5,0.0435,1.0),
    vec3(5.5,0.0465,1.0)
#if HLSL
    };
#else
    );
#endif

void main() {
	vec3 worldPos = mul(vec4(a_Position, 1.0), g_ModelMatrix).xyz;
	
	vec3 l3 = g_LightsPosition[3] - worldPos.xyz;
	mat3 tangentSpace = BuildTangentSpace(CAST3X3(g_ModelMatrix), a_Normal, a_Tangent4);
	v_Light0DirectionL3X.xyz = mul(tangentSpace, v_Light0DirectionL3X.xyz);
	v_Light1DirectionL3Y.xyz = mul(tangentSpace, v_Light1DirectionL3Y.xyz);
	v_Light2DirectionL3Z.xyz = mul(tangentSpace, v_Light2DirectionL3Z.xyz);
	l3 = mul(tangentSpace, l3);
	v_ViewDir = mul(tangentSpace, v_ViewDir);

	v_Normal = normalize(mul(a_Normal, tangentSpace));
	vec2 uv = a_TexCoord;

	v_ViewDir = g_EyePosition - worldPos.xyz;

	v_Light0DirectionL3X.xyz = g_LightsPosition[0] - worldPos.xyz;
	v_Light1DirectionL3Y.xyz = g_LightsPosition[1] - worldPos.xyz;
	v_Light2DirectionL3Z.xyz = g_LightsPosition[2] - worldPos.xyz;

	vec3 normal;
  
  // Time varying vertex offset
	//for (int i=0; i < numIters; i++)
	//{
		int i = 0;
		normal = texSample2DLod( g_Texture0, noiseIters[i].x * vec2(uv.x, -uv.y + noiseIters[i].z * g_Time), 0).xyz;
		worldPos.xyz += normal * noiseIters[i].z;
  //}
	//v_Normal = normal;
	gl_Position = mul(vec4(worldPos, 1.0), g_ViewProjectionMatrix);
	v_TexCoord = uv;
	v_Position = gl_Position;
}