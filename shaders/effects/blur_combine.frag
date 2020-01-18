
// [COMBO] {"material":"ui_editor_properties_composite","combo":"COMPOSITE","type":"options","default":0,"options":{"ui_editor_properties_normal":0,"ui_editor_properties_blend":1,"ui_editor_properties_under":2,"ui_editor_properties_cutout":3}}
// [COMBO] {"material":"ui_editor_properties_blend_mode","combo":"BLENDMODE","type":"imageblending","default":0}
// [COMBO] {"material":"ui_editor_properties_monochrome","combo":"COMPOSITEMONO","type":"options","default":0}

#include "common_composite.h"

varying vec4 v_TexCoord;

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}
uniform sampler2D g_Texture1; // {"material":"mask","label":"ui_editor_properties_opacity_mask","mode":"opacitymask","default":"util/white","paintdefaultcolor":"0 0 0 1"}
uniform sampler2D g_Texture2; // {"material":"previous","label":"Prev","hidden":true}

uniform vec4 g_Texture0Resolution;

void main() {

	vec2 blurredCoords = v_TexCoord.xy;
	
#ifdef HLSL_SM30
	blurredCoords += 0.75 / g_Texture0Resolution.zw;
#endif

	vec4 blurred = texSample2D(g_Texture0, ApplyCompositeOffset(blurredCoords, g_Texture0Resolution.xy));
	vec4 albedoOld = texSample2D(g_Texture2, v_TexCoord.xy);
	float mask = texSample2D(g_Texture1, v_TexCoord.zw).r;
	
	blurred = ApplyComposite(albedoOld, blurred);
	blurred = mix(albedoOld, blurred, mask);
	
	gl_FragColor = blurred;
}
