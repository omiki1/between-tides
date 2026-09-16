# 音乐与语音

## QQ 音乐

使用用户指定的公开歌单 [9779067540](https://y.qq.com/n/ryqq_v2/playlist/9779067540) 作为底本。歌曲元数据保存在 `data/qq-playlist.json`，共 7 首，不包含登录 Cookie、账户资料或签名播放地址。

原列表里 Earthing、オルクドール〜プラチナの風、Snooze 无法公开试听。已按用户提供的 QQ 分享链接替换为 Midnight Mass、Evening Epiphany、Young and Beautiful。更新歌单不会把这三首覆盖回去。

站内播放改用 QQ 音乐官方外链播放器：

```
https://i.y.qq.com/n2/m/outchain/player/index.html?songid=<歌曲数字 ID>&songtype=0
```

`lib/music.ts` 的 `qqOutchainPlayerUrl` 只接受纯数字 `songid`，用 `<iframe>` 嵌入。播放、进度和版权限制都由 QQ 音乐页面处理。本站不再运行 `127.0.0.1:3200` 代理，也不再安装 `@sansenjian/qq-music-api`。

### 行为

- 默认展示当前歌曲的外链播放器。歌单弹窗可切换曲目；换歌会换 iframe。
- 受版权、登录或地区限制的歌曲，外链播放器可能无法出声。页面提供「打开歌曲」和原歌单链接，不下载音频，也不改用其他来源。
- 静态导出和公网部署不需要额外音乐后端。`npm run dev` 即可。

## 本站环境音

`site.music` 里的两段 WAV 仍由本站 `<audio>` 播放。歌单切到「环境音」后，使用原来的播放 / 暂停 / 切歌 / 音量控件。QQ 歌曲和外链播放器不会走这条路径。

## 达妮娅中文语音

来源：[Encore 角色资料](https://encore.moe/character/1211?lang=zh-Hans)，资料接口 `https://api-v2.encore.moe/api/zh-Hans/character/1211`。选取四段短台词，原始来源 URL、文本与 ID 在 `data/denia-voices.json`。音频本地保存于 `public/audio/denia/zh/`，版权归 Kuro Games。

点击人物泡泡依次播放，播放期间再点停止；播放语音会暂停本站环境音。只有用户点击才播放，不自动发声。
