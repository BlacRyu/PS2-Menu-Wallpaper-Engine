attribute vec3 a_Position;
attribute vec2 a_TexCoord;

uniform mat4 g_ModelViewProjectionMatrix;

varying vec2 v_TexCoord;
varying vec4 v_Position;

void main() {
	gl_Position = mul(vec4(a_Position, 1.0), g_ModelViewProjectionMatrix);
	v_TexCoord = a_TexCoord;
	v_Position = gl_Position;
}