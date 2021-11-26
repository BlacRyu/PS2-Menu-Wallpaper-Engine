// [COMBO] {"material":"ui_editor_properties_point_filter","combo":"POINTFILTER","type":"options","default":1}
// [COMBO] {"material":"ui_editor_properties_multiply","combo":"MULTIPLY","type":"options","default":1}

uniform vec4 g_Texture0Resolution;
uniform vec2 g_TexelSize;

varying vec2 v_PixelCoord; // Pixel/subpixel coordinate within the virtual shrunken screen space
varying vec2 v_PixelSize; // 1 / virtual screen resolution

uniform sampler2D g_Texture0; // {"material":"framebuffer","label":"ui_editor_properties_framebuffer","hidden":true}

#ifdef HLSL
    #define fract frac
#endif

void main() {
#if POINTFILTER
    // Sample the nearest pixel
    vec2 texCoord00 = round(v_PixelCoord) * v_PixelSize;
    texCoord00 = round(texCoord00 * g_Texture0Resolution.xy) * g_TexelSize + g_TexelSize * 0.5;
    vec4 finalColor = texSample2D(g_Texture0, texCoord00);
#else
    // Bilinear Filtering
    vec2 texCoord00 = floor(v_PixelCoord) * v_PixelSize; // Top-left
    vec2 texCoord01 = texCoord00 + vec2(0.0, v_PixelSize.y); // Bottom-left
    vec2 texCoord10 = texCoord00 + vec2(v_PixelSize.x, 0.0); // Top-right
    vec2 texCoord11 = texCoord00 + vec2(v_PixelSize.x, v_PixelSize.y); // Bottom-right
    vec2 lerp = fract(v_PixelCoord);

    // Sample each corner pixel, weighted by how close this subpixel is to them.
    vec4 finalColor = texSample2D(g_Texture0, texCoord00) * (1.0 - lerp.x) * (1.0 - lerp.y) +
                      texSample2D(g_Texture0, texCoord01) * (1.0 - lerp.x) * lerp.y + 
                      texSample2D(g_Texture0, texCoord10) * lerp.x * (1.0 - lerp.y) + 
                      texSample2D(g_Texture0, texCoord11) * lerp.x * lerp.y;
#endif

    gl_FragColor = finalColor;
}
