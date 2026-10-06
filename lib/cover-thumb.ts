/**
 * 哔哩哔哩图床缩略图：在原图地址后加 @{w}w_{h}h_1c.webp，由 B 站按尺寸裁切并转 WebP。
 * 追番封面原图是 960×1280 的 PNG（单张 0.5–2 MB），卡片只显示约 220×293；缩略图约 14 KB（2x 约 36 KB）。
 * 非 hdslb 地址或已经带参数的地址原样返回。
 */
export function coverThumb(url:string,width:number,height:number):string{
  if(!/^https?:\/\/[^/]*hdslb\.com\//.test(url)||url.includes("@"))return url;
  return `${url}@${Math.round(width)}w_${Math.round(height)}h_1c.webp`;
}
/** 1x / 2x 的 srcset，配合 width/height 属性使用。 */
export function coverSrcSet(url:string,width:number,height:number):string|undefined{
  const one=coverThumb(url,width,height);
  if(one===url)return undefined;
  return `${one} 1x, ${coverThumb(url,width*2,height*2)} 2x`;
}
