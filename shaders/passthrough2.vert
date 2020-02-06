
uniform mat4 g_ModelViewProjectionMatrix;

attribute vec3 a_Position;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;

void main() {
	vec3 position = vec3(a_TexCoord, 0.0);
	
#ifdef HLSL
	position.y = 1.0 - position.y;
#endif
	
	position.xy = position.xy * 2.0 - 1.0;
	gl_Position = vec4(position, 1.0);
	
	v_TexCoord = a_TexCoord;
}
