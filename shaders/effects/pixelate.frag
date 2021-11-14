// [COMBO] {"material":"ui_editor_properties_point_filter","combo":"POINTFILTER","type":"options","default":1}
// [COMBO] {"material":"ui_editor_properties_multiply","combo":"MULTIPLY","type":"options","default":1}

uniform float g_ResolutionScale;  // {"material":"resolution_scale","label":"Resolution Scale","default":0.125,"range":[0.01, 1.0]}
uniform vec2 g_NewResolution;  // {"material":"new_resolution","label":"New Resolution","default":"960 540"}

uniform vec4 g_Texture0Resolution;
uniform vec2 g_TexelSize;

varying vec2 v_TexCoord;

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}

#ifdef HLSL
	#define fract frac
#endif

void main() {
#if MULTIPLY
	vec2 scaledCoord = v_TexCoord * g_Texture0Resolution.xy * g_ResolutionScale;
	vec2 newTexelSize = 1.0 / (g_ResolutionScale * g_Texture0Resolution.xy);
#else
	vec2 scaledCoord = v_TexCoord * g_NewResolution;
	vec2 newTexelSize = 1.0 / (g_NewResolution);
#endif

#if POINTFILTER
	vec2 v_TexCoord00 = round(scaledCoord) * newTexelSize;
	v_TexCoord00 = round(v_TexCoord00 * g_Texture0Resolution.xy) * g_TexelSize + g_TexelSize * 0.5;
	vec4 finalColor = texSample2D(g_Texture0, v_TexCoord00);
#else
	// Bilinear Filtering
	vec2 v_TexCoord00 = floor(scaledCoord) * newTexelSize;
	vec2 v_TexCoord01 = v_TexCoord00 + vec2(0.0, newTexelSize.y);
	vec2 v_TexCoord10 = v_TexCoord00 + vec2(newTexelSize.x, 0.0);
	vec2 v_TexCoord11 = v_TexCoord00 + vec2(newTexelSize.x, newTexelSize.y);
	vec2 lerp = fract(scaledCoord);
	vec4 finalColor = texSample2D(g_Texture0, v_TexCoord00) * (1.0 - lerp.x) * (1.0 - lerp.y) +
										texSample2D(g_Texture0, v_TexCoord01) * (1.0 - lerp.x) * lerp.y + 
										texSample2D(g_Texture0, v_TexCoord10) * lerp.x * (1.0 - lerp.y) + 
										texSample2D(g_Texture0, v_TexCoord11) * lerp.x * lerp.y;
#endif

	gl_FragColor = finalColor;
}
