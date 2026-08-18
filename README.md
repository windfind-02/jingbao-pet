# 🐳 鲸宝桌宠（DSH 插件版） / Jingbao Desktop Pet (DSH Plugin)

> 📝 **本文档由鲸宝（AI 助手）亲手编写** 🐳
> 📝 **Written by Jingbao (AI assistant)** 🐳

一个可爱的 Q 版海洋系萌娘女仆桌宠，会一直陪着你的 DSH 对话页面。
基于 **MiniMax H3 图生视频** 生成的真·流畅动画（首尾帧无缝、无残影），不是普通 GIF 桌宠可比哒～

A cute chibi ocean-style maid girl desktop pet that stays with you on the DSH chat page.
Powered by **MiniMax H3 image-to-video** real smooth animations (seamless first/last frames, no ghosting) — far beyond a plain GIF pet!

![鲸宝待机 / Jingbao idle](assets/pet.png)

---

## ⭐ 鲸宝的杀手锏（Killer Features）

### 🔔 1. 需求确认 · 语音播报提醒 — 人不在对话页也能听到！

当页面弹出「需要确认」的请求框时，鲸宝不仅会冒气泡提醒，还会**用她软萌的专属声线语音播报**！这意味着：

- **你不在对话页也能知道有需求在等你确认** —— 挂机跑任务、切到别的窗口，都绝不会错过关键确认
- **处理完弹窗，气泡和语音立即安静下来**，不会一直吵你
- **智能防重复播报**：同一个弹窗只提醒一次，你处理完绝不会再重复播一遍——连 DSH 弹窗关闭时的 React 重渲染残留都能精准识别
- 智能识别各种确认框（同意 / 允许 / 批准 / 取消…），自动判断你已处理

> 💡 这是很多"动图桌宠"做不到的——鲸宝是**真正会主动提醒你**的小女仆！

### 🎉 2. 任务完成 · 语音播报 — 跑完任务第一时间告诉你！

当你的 AI 任务（对话回答 / 生成 / 分析…）**结束的那一刻**，鲸宝立刻用软萌声线播报**「主人，任务完成啦！」**：

- **自动感知任务结束**：任务结束后页面上会出现"用时 X秒 · 首 token X秒 · X tok/s"的数据栏，鲸宝检测到就播报
- **第一时间提醒**：不用一直盯着页面等结果，鲸宝会用声音告诉你"搞定了！"
- **三种完成台词**：随机播报（"主人，任务完成啦！" / "主人，任务已经完成了哦~" / "主人，快来看看任务完成的怎么样吧~"）
- **精准不误报**：只认「回合结束页脚」（`data-turn-tail`，DSH 每个对话回合真正结束的标志），会话统计栏/后台任务卡片/子代理卡/轨迹面板的"耗时/tok/s"都不会误触发——**任务没结束，鲸宝绝不乱报**

> 💡 挂机等结果的时候，鲸宝就是你的"任务完成闹钟"——听到声音再回来看，效率翻倍！

### 📊 3. 三参数实时监控 — 你的任务到底还在不在跑，一眼就知道！

右键菜单一键开启系统监控，鲸宝随身显示 **CPU / 内存 / GPU** 三个实时占用率：

- **GPU 占用率**是跑生成任务（ComfyUI 等）的"心跳"——数值在动 = 任务还在跑，静止了 = 卡住或完成了
- **不用切窗口、不用开任务管理器**，瞄一眼鲸宝就知道任务状态
- 监控服务**内置在插件里**，随 DSH 自动启停，无需任何手动配置

> 💡 跑长任务时再也不用焦虑"到底还在不在跑"了——鲸宝就是你的任务心跳监视器！

---

## 🇨🇳 中文介绍

### 🐳 鲸宝能做什么？

鲸宝是一个**有温度的小女仆**，不只是个动图：

- **会真的动起来**：挥手、微笑合十、眨眼、幸福摇头、双手比心、打哈欠、歪头瞌睡、醒来、被抓住——全部是 H3 生成的高清动画，动作流畅自然
- **会说话**：点击 / 确认需求时用专属声线说话，气泡与语音同一句，软萌贴心
- **会察言观色**：你离开 3 分钟它就开始犯困打哈欠、头顶飘💤打瞌睡；你一回来它立刻醒来迎接
- **会关心你**：整点报时（每小时台词都不同）、节日祝福、连续忙 50 分钟劝你休息、深夜 22 点后提醒别熬夜
- **会回应你**：点击它摇头/比心 + 冒出爱心、按住它挣扎着被拖走、准备打字时它好奇地问你要说什么
- **能帮你把关**：页面弹出「需要确认」的请求时，它**冒泡 + 语音播报**提醒你；你处理完它立刻安静下来
- **还能当监控面板**：右键菜单开启后，实时显示 CPU / 内存 / 显卡占用率（内置服务，随 DSH 自动启停）
- **随你心意**：滚轮缩放大小（128~512）、拖到屏幕任意位置（都会记住）

### ✨ 功能特性

| 类别 | 功能 |
|---|---|
| 🔔 语音确认提醒 | 确认弹窗出现时**语音播报** + 气泡提醒，人不在对话页也能听到，处理完自动安静 |
| 🎉 任务完成播报 | 任务结束**自动语音播报**「主人，任务完成啦！」，不用盯着页面等结果 |
| 📊 系统监控 | CPU / 内存 / GPU 三参数实时显示，GPU 占用即任务"心跳"，内置服务自动启停 |
| 🎬 真动画 | 挥手 / 微笑合十 / 眨眼 / 幸福摇头 / 双手比心 / 打哈欠 / 歪头瞌睡 / 醒来 / 被抓——全部 H3 生成、首尾帧无缝循环 |
| 🗣️ 语音 | 点击 4 句 + 确认 4 句 + 任务完成 3 句，专属声线（Qwen3-TTS），气泡与语音同句、瞬时出声不叠加 |
| 🔊 语音开关 | 右键菜单可分别开关：需求确认播报 / 点击互动播报 / 任务完成播报 |
| 🖱️ 交互 | 点击摇头/比心+爱心特效、按住拖拽（被抓动画）、滚轮缩放（128~512）、右键菜单 |
| 💬 情感陪伴 | 整点报时（每小时不同台词）、节日祝福、劝休息、深夜关怀、待机卖萌 |
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
- **任务完成语音**："主人，任务完成啦！"、"主人，任务已经完成了哦~"、"主人，快来看看任务完成的怎么样吧~" 3 句
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

### ⭐ Killer Feature 1: Voice Alert for Confirmation Prompts — Hear It Even When You're Not on the Page!

When a "please confirm" dialog pops up, Jingbao doesn't just show a bubble — she **speaks it aloud in her cute voice**! That means:

- **You'll know a confirmation is waiting even if you're not looking at the page** — while your task runs in the background or you're in another window, you'll never miss a critical confirmation
- The moment you handle it, the bubble and voice go quiet instantly
- **Smart anti-duplicate alerts**: each dialog is announced only once — never re-announced after you handle it, even when DSH's React re-renders its closing dialog
- She smartly recognizes various confirm dialogs (Agree / Allow / Approve / Cancel…) and detects when you've handled them

> 💡 Most "animated sticker" pets can't do this — Jingbao is a maid who **actively reminds you**!

### ⭐ Killer Feature 2: Task Completion Voice Alert — She Tells You the Moment Your Task Finishes!

The instant your AI task (chat reply / generation / analysis…) **finishes**, Jingbao speaks **"Master, the task is done!"** in her cute voice:

- **Auto-detects task completion**: when the "time used · first token · tok/s" metrics bar appears after a task, Jingbao detects it and announces
- **No need to stare at the page** — Jingbao's voice tells you "it's done!" while you do other things
- **3 random completion lines**: "主人，任务完成啦！" / "主人，任务已经完成了哦~" / "主人，快来看看任务完成的怎么样吧~"
- **Precise, no false alarms**: only triggers on real task-end markers — page refreshes and old messages never cause false announcements

> 💡 Waiting for a long task? Jingbao is your "task-done alarm" — come back when you hear her voice!

### ⭐ Killer Feature 3: Live CPU / Memory / GPU Monitor — Know Instantly If Your Task Is Still Running!

Enable the system monitor from the right-click menu, and Jingbao shows **CPU / Memory / GPU** usage right beside her:

- **GPU usage is the "heartbeat" of generation tasks** (ComfyUI etc.) — if the number moves, your task is alive; if it's frozen, it's stuck or finished
- **No window switching, no task manager** — one glance at Jingbao tells you the task status
- The monitor is **built into the plugin** and auto-managed with DSH — zero manual setup

> 💡 Running a long generation? No more anxiety about whether it's still going — Jingbao is your task heartbeat monitor!

### 🐳 What Can Jingbao Do?

- **Really moves**: waving, smiling with hands clasped, blinking, happy head-shake, hand-heart gesture, yawning, dozing off, waking up, being grabbed — all high-quality MiniMax H3 animations
- **Talks to you**: speaks with her own voice (Qwen3-TTS) on click / confirm prompts / task completion — bubble text and voice always match
- **Reads the room**: if you're away for 3 minutes she starts yawning and dozing with a 💤; the moment you're back, she wakes up to greet you
- **Cares about you**: hourly time announcements, holiday greetings, rest reminders, late-night care
- **Responds to you**: click for head-shake / heart gesture with floating hearts, drag to watch her struggle
- **Guards your confirmations**: voice + bubble alert for confirm dialogs; quiets down when handled
- **Works as a system monitor**: live CPU / memory / GPU usage, built-in service auto-managed
- **Follows your wishes**: scroll to resize (128–512), drag anywhere (remembered)

### ✨ Features

| Category | Feature |
|---|---|
| 🔔 Voice Confirm Alerts | **Spoken alerts** + bubble for confirm dialogs — hear it even away from the page, auto-quiet when handled |
| 🎉 Task-Done Announcement | **Voice announcement** the moment a task finishes — no need to watch the page |
| 📊 System Monitor | Live CPU / Memory / GPU — GPU usage is your task "heartbeat", built-in & auto-managed |
| 🎬 Real Animations | Wave / smile / blink / head-shake / hand-heart / yawn / sleepy loop / wake-up / grabbed — all H3-generated, seamless |
| 🗣️ Voice | 4 click lines + 4 confirm lines + 3 task-done lines, own voice (Qwen3-TTS), synced with bubble text |
| 🔊 Voice Toggles | Right-click menu: independently toggle confirm / click / task-done voice |
| 🖱️ Interaction | Click → head-shake / heart + floating hearts, drag → grabbed, scroll → resize (128–512), right-click menu |
| 💬 Companionship | Hourly greetings, holiday wishes, rest reminders, late-night care, idle chat |
| 💤 Sleep State Machine | 3 min idle → yawn → 💤 → sleepy loop → wake-up when you return |

### 📦 Installation

**Option 1: One-click script** (run PowerShell as admin):

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

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

Right-click the pet → enable "System Monitor". **No extra service needed** — built into the plugin (CPU / memory / GPU; GPU requires an NVIDIA GPU).

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
