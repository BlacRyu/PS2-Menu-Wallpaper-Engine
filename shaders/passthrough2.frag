
varying vec2 v_TexCoord;

uniform sampler2D g_Texture0; // {"material":"ui_editor_properties_framebuffer","label":"Render Target","default":"_rt_FullFrameBuffer"}

void main() {
	gl_FragColor = texSample2D(g_Texture0, v_TexCoord);
}
