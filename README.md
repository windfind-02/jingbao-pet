# 🐳 鲸宝桌宠（DSH 插件版） / Jingbao Desktop Pet (DSH Plugin)

> 📝 **本文档由鲸宝（AI 助手）亲手编写** 🐳
> 📝 **Written by Jingbao (AI assistant)** 🐳

一个可爱的 Q 版海洋系萌娘女仆桌宠，会一直陪着你的 DSH 对话页面。
基于 **MiniMax H3 图生视频** 生成的真·流畅动画（首尾帧无缝、无残影），不是普通 GIF 桌宠可比哒～

A cute chibi ocean-style maid girl desktop pet that stays with you on the DSH chat page.
Powered by **MiniMax H3 image-to-video** real smooth animations (seamless first/last frames, no ghosting) — far beyond a plain GIF pet!

![鲸宝待机 / Jingbao idle](assets/pet.png)

---

## 🇨🇳 中文介绍

### 🐳 鲸宝能做什么？

鲸宝是一个**有温度的小女仆**，不只是个动图：

- **会真的动起来**：挥手、微笑合十、眨眼、幸福摇头、双手比心、打哈欠、歪头瞌睡、醒来、被抓住——全部是 H3 生成的高清动画，动作流畅自然
- **会说话**：点击 / 确认需求时用专属克隆声线说话，气泡与语音同一句，软萌贴心
- **会察言观色**：你离开 3 分钟它就开始犯困打哈欠、头顶飘💤打瞌睡；你一回来它立刻醒来迎接
- **会关心你**：整点报时（每小时台词都不同）、节日祝福、连续忙 50 分钟劝你休息、深夜 22 点后提醒别熬夜
- **会回应你**：点击它摇头/比心 + 冒出爱心、按住它挣扎着被拖走、准备打字时它好奇地问你要说什么
- **能帮你把关**：页面弹出「需要确认」的请求时，它冒泡提醒你；你处理完它立刻安静下来
- **还能当监控面板**：右键菜单开启后，实时显示 CPU / 内存 / 显卡占用率（随 DSH 自动启停，无需手动开服务）
- **随你心意**：滚轮缩放大小（128~512）、拖到屏幕任意位置（都会记住）

### ✨ 功能特性

| 类别 | 功能 |
|---|---|
| 🎬 真动画 | 挥手 / 微笑合十 / 眨眼 / 幸福摇头 / 双手比心 / 打哈欠 / 歪头瞌睡 / 醒来 / 被抓——全部 H3 生成、首尾帧无缝循环 |
| 🗣️ 语音 | 点击 4 句 + 确认 4 句，克隆声线（Qwen3-TTS），气泡与语音同句、瞬时出声不叠加 |
| 🖱️ 交互 | 点击摇头/比心+爱心特效、按住拖拽（被抓动画）、滚轮缩放（128~512）、右键菜单 |
| 💬 情感陪伴 | 整点报时（每小时不同台词）、节日祝福、劝休息、深夜关怀、待机卖萌 |
| 📊 系统监控 | 可选：CPU / 内存 / 显卡实时占用率（内置服务，随 DSH 自动启停） |
| ✅ 智能确认 | 检测到「需要确认」的请求时冒泡提示，处理完气泡立即消失 |
| 💤 瞌睡状态机 | 3 分钟无操作 → 打哈欠 → 头顶💤 → 歪头瞌睡循环 → 主人回来播醒来动画 |

### 📦 安装（两种方式）

#### 方式一：一键安装脚本
以管理员身份运行 PowerShell，执行：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

脚本会自动完成插件复制、素材（含语音）部署、配置注册，并按提示重启 dsh web。

#### 方式二：手动安装

**1. 复制插件**

把 `plugin` 目录复制为：
```
C:\Users\<你的用户名>\.dsh\profiles\node_modules\@local\dsh-pet\
```

**2. 部署素材**

把 `assets` 目录里的 `pet_*.webp` / `pet_*.png` / `voice_*.mp3` 复制到 DSH 前端静态目录：
```
C:\Users\<你的用户名>\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\dsh-web-frontend\dist\
```

**3. 注册插件**

编辑 `C:\Users\<你的用户名>\.dsh\profiles\web\cordis.patch.yml`，追加：

```yaml
# 鲸宝桌宠
- insert:
    - id: pet
      name: '@local/dsh-pet'
```

**4. 重启生效**

```powershell
$conn = Get-NetTCPConnection -LocalPort 3080 -State Listen -ErrorAction SilentlyContinue
if ($conn) { Stop-Process -Id $conn.OwningProcess -Force; Start-Sleep -Seconds 2 }
Set-Location "C:\Users\<你的用户名>\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh"
dsh web
```

然后浏览器打开 `http://127.0.0.1:3080` 按 **Ctrl+F5** 强刷。

### 📊 系统监控

桌宠右键菜单 → 开启「系统监控」即可，**无需额外启动服务**——监控已内置到插件，随 DSH 启动/停止自动启停，实时显示 CPU / 内存 / 显卡占用率（GPU 需 NVIDIA 显卡）。

### 🎮 操作说明

| 操作 | 效果 |
|---|---|
| 左键点击 | 幸福摇头 / 双手比心 + 红色爱心飞走 + 卖萌语音 |
| 按住拖动 | 被抓动画 + 移动位置（位置会记住） |
| 滚轮 | 缩放鲸宝（128~512，大小会记住） |
| 右键 | 设置菜单（系统监控开关等） |

### 🐳 鲸宝会说什么

- **待机卖萌**：随机冒泡（"主人辛苦啦，摸摸鲸宝吧～"等）
- **点击语音**："呀！主人戳到鲸宝啦～"、"主人最喜欢鲸宝了对吧？"等 4 句
- **确认语音**："主人主人，这里需要你确认一下哦～"等 4 句
- **整点报时**：每小时不同台词，贴合国内作息（9-12 上班 / 12-14 午休 / 14-18 下午班）
- **节日祝福**：新年、情人节、儿童节、中秋、国庆、平安夜、圣诞、跨年
- **关怀**：连续活跃 50 分钟劝休息、深夜 22 点后提醒睡觉

### 🎬 动画素材清单

| 动画 | 触发 |
|---|---|
| 挥手 | 整点报时 |
| 微笑合十 / 眨眼 | 待机随机 |
| 幸福摇头 / 双手比心 | 点击（随机） |
| 被抓 | 按住拖拽 |
| 哈欠 → 瞌睡循环 → 醒来 | 3 分钟无操作 / 主人回来 |

---

## 🇬🇧 English Introduction

### 🐳 What Can Jingbao Do?

Jingbao is a **warm-hearted little maid** — much more than an animated sticker:

- **Really moves**: waving, smiling with hands clasped, blinking, happy head-shake, hand-heart gesture, yawning, dozing off, waking up, being grabbed — all high-quality MiniMax H3 animations, smooth and natural
- **Talks to you**: speaks with her own cloned voice (Qwen3-TTS) on click / confirmation prompts — bubble text and voice always match, instant playback, never overlapping
- **Reads the room**: if you're away for 3 minutes she starts yawning and dozing with a 💤 above her head; the moment you're back, she wakes up to greet you
- **Cares about you**: hourly time announcements (different lines each hour), holiday greetings, reminds you to rest after 50 minutes of work, tells you not to stay up late after 22:00
- **Responds to you**: click her for a happy head-shake / heart gesture with floating hearts, drag her to watch her struggle, she gets curious when you're about to type
- **Guards your confirmations**: when a "please confirm" dialog appears, she pops up a bubble to remind you; as soon as you handle it, she quiets down
- **Works as a system monitor**: enable it from the right-click menu to see live CPU / memory / GPU usage (built-in service, auto starts/stops with DSH — no manual setup)
- **Follows your wishes**: scroll to resize (128–512), drag anywhere on screen (both are remembered)

### ✨ Features

| Category | Feature |
|---|---|
| 🎬 Real Animations | Wave / smile / blink / head-shake / hand-heart / yawn / sleepy loop / wake-up / grabbed — all H3-generated, seamless looping |
| 🗣️ Voice | 4 click lines + 4 confirm lines, cloned voice (Qwen3-TTS), synced with bubble text, instant & non-overlapping |
| 🖱️ Interaction | Click → head-shake / heart + floating hearts, drag → grabbed animation, scroll → resize (128–512), right-click menu |
| 💬 Companionship | Hourly greetings, holiday wishes, rest reminders, late-night care, idle chat |
| 📊 System Monitor | Optional: CPU / memory / GPU usage (built-in, auto-managed by the plugin) |
| ✅ Smart Confirm | Detects "please confirm" dialogs and bubbles a reminder; bubble disappears when handled |
| 💤 Sleep State Machine | 3 min idle → yawn → 💤 → sleepy loop → wake-up animation when you return |

### 📦 Installation

**Option 1: One-click script** (run PowerShell as admin):

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

The script copies the plugin, deploys assets (including voice files), registers the plugin, and tells you to restart dsh web.

**Option 2: Manual install**

1. Copy the `plugin` folder to:
   ```
   C:\Users\<your-username>\.dsh\profiles\node_modules\@local\dsh-pet\
   ```
2. Copy `pet_*.webp`, `pet_*.png`, `voice_*.mp3` from `assets` to the DSH web static dir:
   ```
   C:\Users\<your-username>\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\dsh-web-frontend\dist\
   ```
3. Append to `C:\Users\<your-username>\.dsh\profiles\web\cordis.patch.yml`:
   ```yaml
   # Jingbao pet
   - insert:
       - id: pet
         name: '@local/dsh-pet'
   ```
4. Restart dsh web, then open `http://127.0.0.1:3080` and press **Ctrl+F5**.

### 📊 System Monitor

Right-click the pet → enable "System Monitor". **No extra service needed** — monitoring is built into the plugin and auto-managed with DSH lifecycle (CPU / memory / GPU; GPU requires an NVIDIA GPU).

### 🎮 Controls

| Action | Effect |
|---|---|
| Left-click | Head-shake / hand-heart + flying hearts + cute voice |
| Drag | Grabbed animation + move position (remembered) |
| Scroll | Resize Jingbao (128–512, remembered) |
| Right-click | Settings menu (system monitor toggle, etc.) |

### 🎬 Animation List

| Animation | Trigger |
|---|---|
| Wave | Hourly announcement |
| Smile / Blink | Random idle |
| Head-shake / Hand-heart | Click (random) |
| Grabbed | Hold & drag |
| Yawn → Sleepy loop → Wake-up | 3 min idle / when you return |

---

## 📄 许可证 / License

- 代码 / Code：MIT License (see `LICENSE`)
- 形象素材 / Character art：AI-generated (Krea 2 + MiniMax H3), open-sourced with the plugin, please keep the attribution `@jingbao-pet`

## 🙏 致谢 / Credits

- 动画生成 / Animations：MiniMax H3 (ComfyUI)
- 形象设计 / Design：the "Jingbao" look chosen by her master
- 语音 / Voice：Qwen3-TTS
- 图标 / Icon：drawn by Jingbao herself 🐳
