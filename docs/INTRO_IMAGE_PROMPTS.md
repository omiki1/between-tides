# Q 版开场素材

2026-09-16，使用内置 image_gen 工具生成背景，并根据用户提供的 Q 版图像提取透明角色。原图保留不变。

最终网页资源：`public/artwork/intro/water-sky.webp`、`public/artwork/intro/denia-chibi.webp`。

## 背景提示词

Use case: stylized-concept. Asset type: full screen animated website entrance background, landscape 1536x1024 or wider. Create an original delicate anime illustration of a serene shallow mirror-water surface under an airy blush pink, pearl-white and powder-blue sky, faint lavender haze, very soft distant clouds, a few tiny glasslike translucent bubbles near the outer edges, subtle pink light reflections. Sophisticated, clean, luminous, quiet and cozy. Composition: leave a large uncluttered area in the central 50 percent for a separately composited small chibi character. Low horizon at approximately 62 percent height, glassy water below. Slight watercolor softness and precise clean gradients, understated fine sparkle details around outer edges only. Must work as a full-bleed desktop/mobile loading screen. No character, no people, no buildings, no objects in the center, no text, no letters, no watermark, no UI, no frame, no loud saturated colors. Do not bake in a central bubble or platform because those will be animated in CSS.

## 角色提示词

参考原图：`648dc880a408cad6dd3c11277beaac2b288340088.png`（抱西瓜的完整 Q 版人物）。

Use case: background-extraction. Asset type: transparent PNG character sprite for a website loading animation. Input image 1 is the edit target: user-provided full-body chibi pink-haired Denia holding a watermelon. Remove ONLY the white background outside the character and between strands, and place the exact same complete character on a genuinely transparent alpha background. Keep the face, huge blue-purple eyes, pink curled hair with pale blue tips, ahoge, hair jewelry, red gloves, watermelon slice, costume, black outlines, pose, feet, proportions and every color unchanged. Keep opaque white costume/highlight areas opaque. No white rectangular background, no checkerboard painted into the image, no new backdrop, no floor, no text, no extra objects, no redesign. Center with enough transparent padding around all sides so no hair or feet are cropped. This is a precise extraction of the supplied artwork, not a new character design.
