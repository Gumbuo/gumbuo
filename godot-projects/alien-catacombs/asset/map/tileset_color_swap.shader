shader_type canvas_item;

// Color shift for level variations
uniform vec4 tint_color : hint_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform float hue_shift : hint_range(0.0, 1.0) = 0.0;
uniform float saturation : hint_range(0.0, 2.0) = 1.0;
uniform float brightness : hint_range(0.0, 2.0) = 1.0;

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void fragment() {
    vec4 color = texture(TEXTURE, UV);

    // Convert to HSV for manipulation
    vec3 hsv = rgb2hsv(color.rgb);

    // Apply hue shift
    hsv.x = fract(hsv.x + hue_shift);

    // Apply saturation
    hsv.y *= saturation;

    // Apply brightness
    hsv.z *= brightness;

    // Convert back to RGB
    color.rgb = hsv2rgb(hsv);

    // Apply tint color
    color.rgb *= tint_color.rgb;

    COLOR = color;
}
