varying vec2 v_TexCoord;
varying vec3 v_ScreenCoord;

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer"}

uniform vec4 g_Texture0Resolution;
uniform float g_PixelScale;  // {"material":"pixel scale","label":"Pixel Scale","default":2.0,"range":[1,50]}

void main() {
	vec2 pixelCoord = floor(v_TexCoord * g_Texture0Resolution.xy / g_PixelScale) * g_PixelScale / g_Texture0Resolution;
	gl_FragColor = vec4(texSample2D(g_Texture0, pixelCoord).rgb, 1.0);
}
