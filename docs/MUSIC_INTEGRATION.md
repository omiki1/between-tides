# 音乐与语音

## QQ 音乐

使用用户指定的公开歌单 [9779067540](https://y.qq.com/n/ryqq_v2/playlist/9779067540) 作为底本。歌曲元数据保存在 `data/qq-playlist.json`，共 7 首，不包含登录 Cookie、账户资料或签名播放地址。

原列表里 Earthing、オルクドール〜プラチナの風、Snooze 无法公开试听。已按用户提供的 QQ 分享链接替换为 Midnight Mass、Evening Epiphany、Young and Beautiful。更新歌单不会把这三首覆盖回去。

官方外链播放器没有自动播放参数，也不会接收父页面的 `postMessage`。进页播放改为用 QQ 公开的 vkey 接口取试听流，交给本站 `<audio>` 播放：

```
https://u.y.qq.com/cgi-bin/musicu.fcg?callback=…&format=jsonp&data={vkey.GetVkeyServer}
```

`lib/music.ts` 的 `resolveQqPlayUrl` 只在浏览器里用 JSONP 请求，签名地址不写入仓库、不落地文件。本站不再运行 `127.0.0.1:3200` 代理，也不再安装 `@sansenjian/qq-music-api`。拿不到试听流时，才退回官方外链：

```
https://i.y.qq.com/n2/m/outchain/player/index.html?songid=<歌曲数字 ID>&songtype=0
```

### 行为

- 默认播放 Kyoto’s Jam。歌单弹窗可切换曲目；切歌会重新解析试听地址。
- 官方外链没有自动播放参数。进页播放走试听流；解析失败或音频报错时，改显示外链播放器，需点封面才会出声。
- 受版权、登录或地区限制的歌曲可能没有试听流。页面提供「打开歌曲」和原歌单链接，不下载音频，也不改用其他平台。
- 静态导出和公网部署不需要额外音乐后端。`npm run dev` 即可。

## 本站环境音

`site.music` 里的两段 WAV 仍由本站 `<audio>` 播放。歌单切到「环境音」后，使用原来的播放 / 暂停 / 切歌 / 音量控件。打开网站不会自动播放环境音。

### 进页播放

`config/site.ts` 的 `musicAutoplay` 为 `true` 时，打开网站在开场动画结束后播放导入的 QQ 歌单。浏览器拦截自动播放时，等第一次点击或按键再开始。关掉「进页播放」会暂停当前歌曲。选择写入 `localStorage`，下次访问沿用。系统开启「减少动效」时默认不自动播放。角色语音仍会暂停正在播的歌曲。

## 达妮娅中文语音

来源：[Encore 角色资料](https://encore.moe/character/1211?lang=zh-Hans)，资料接口 `https://api-v2.encore.moe/api/zh-Hans/character/1211`。选取四段短台词，原始来源 URL、文本与 ID 在 `data/denia-voices.json`。音频本地保存于 `public/audio/denia/zh/`，版权归 Kuro Games。

点击人物泡泡依次播放，播放期间再点停止；播放语音会暂停本站环境音。只有用户点击才播放，不自动发声。
