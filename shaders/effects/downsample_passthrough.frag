
varying vec2 v_TexCoord;

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}

#ifndef FILTER
uniform vec4 g_Texture0Resolution;
#endif

void main() {
#ifndef FILTER
	v_TexCoord = floor(v_TexCoord * g_Texture0Resolution.xy) / g_Texture0Resolution.xy;
#endif
	gl_FragColor = texSample2D(g_Texture0, v_TexCoord);
}
