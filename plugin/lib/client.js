window.__ModuleLoader__.load({
	id: "@local/dsh-pet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ═══════════════════════════════════════════════════════════════════
		//  常量
		// ═══════════════════════════════════════════════════════════════════
		// 全局单例（模块级）：防止 DSH 重载插件时 apply 重复执行，
		// 产生「双 MutationObserver + 双语音池」→ 确认弹窗触发两条语音同时播放
		let jbVoiceCache = null;     // 唯一的语音 Audio 池
		let jbConfirmMO = null;      // 唯一的确认弹窗观察器
		let jbApplied = false;       // 是否已初始化过
		/** 停掉语音池里所有正在播的 Audio（全局唯一池，跨 apply 实例也互斥）。 */
		function jbStopAllVoices() {
			try {
				if (!jbVoiceCache) return;
				Object.keys(jbVoiceCache).forEach((group) => {
					(jbVoiceCache[group] || []).forEach((a) => {
						if (a && !a.paused) {
							a.pause();
							a.currentTime = 0;
						}
					});
				});
			} catch (e) { /* 忽略 */ }
		}
		/** 动作帧（透明底 Q 版鲸宝，放在前端 dist 下）。 */
		const FRAMES = {
			idle: "/pet.png?v=2",        // 待机站姿（H3 动画首帧，与动画角色大小一致）
			wave: "/pet_wave.png",   // 挥手（静态帧，动图缺失时的兜底）
			sleepy: "/pet_sleepy.png" // 打瞌睡（闭眼）
		};
		/** 动图（透明底 WebP 循环动画，真·动作；缺失时自动退回对应静态帧）。 */
		const ANIMS = {
			wave: "/pet_wave.webp?v=3",   // 挥手循环动图
			sleepy: "/pet_sleepy.webp?v=4", // 歪头瞌睡循环动图（A-B-A 往复，无跳变）
			smile: "/pet_smile.webp?v=3",    // 微笑合十循环动图
			shake: "/pet_shake.webp?v=3",    // 被点击后幸福摇头动图
			blink: "/pet_blink.webp?v=3",    // 眨眼动图（正常状态随机触发）
			yawn: "/pet_yawn.webp?v=3",      // 犯困哈欠动图（进入瞌睡第一段）
			wakeup: "/pet_wakeup.webp?v=3",   // 打断瞌睡动画（瞌睡→醒来→待机）
			grab: "/pet_grab.webp?v=3",        // 被抓住动画（按住时循环播放）
			heart: "/pet_heart.webp?v=1"        // 双手在胸前比心（点击互动之一，首尾帧无缝循环）
		};
		/** 语音（点击/确认时播放，mp3 在 dist；音色为克隆的鲸宝专属声线）。 */
		const VOICES = {
			poke: ["/voice_poke_1.mp3", "/voice_poke_2.mp3", "/voice_poke_3.mp3", "/voice_poke_4.mp3"],
			confirm: ["/voice_confirm_1.mp3", "/voice_confirm_2.mp3", "/voice_confirm_3.mp3", "/voice_confirm_4.mp3"],
			done: ["/voice_done_1.mp3", "/voice_done_2.mp3", "/voice_done_3.mp3"]
		};
		/** 桌宠显示高度默认值（可缩放范围 128~512）。 */
		const PET_HEIGHT_DEFAULT = 256;
		const PET_HEIGHT_MIN = 128;
		const PET_HEIGHT_MAX = 512;
		/** 长时间无操作进入瞌睡的阈值（3 分钟）。 */
		const SLEEPY_AFTER_MS = 3 * 60 * 1000;
		/** 连续活跃多久开始劝休息（50 分钟）。 */
		const REST_AFTER_MS = 50 * 60 * 1000;
		/** 两次休息/深夜提醒的最小间隔（30 分钟）。 */
		const REST_INTERVAL_MS = 30 * 60 * 1000;
		/** 确认气泡防抖间隔（毫秒）。 */
		const CONFIRM_COOLDOWN = 3500;
		/** 待机随机卖萌的最小 / 最大间隔（毫秒）。 */
		const IDLE_MIN = 30000;
		const IDLE_MAX = 60000;

		// ═══════════════════════════════════════════════════════════════════
		//  文案池
		// ═══════════════════════════════════════════════════════════════════
		const IDLE_LINES = [
			"主人，鲸宝在这里～🐳",
			"有什么需要鲸宝做的吗？",
			"主人辛苦啦，摸摸鲸宝吧～",
			"鲸宝会一直陪着主人的哦！",
			"咕噜咕噜～🐋",
			"今天也要元气满满哦！",
			"主人～戳戳鲸宝嘛～"
		];
		const CONFIRM_LINES = [
			"主人主人，这里需要你确认一下哦～",
			"主人主人～有件事要你拍板啦！",
			"主人主人，看这里，需要你确认～",
			"主人主人~鲸宝在等你的确认呢~"
		];
		const POKE_LINES = [
			"呀！主人戳到鲸宝啦～💕",
			"嘿嘿，鲸宝好开心～",
			"主人～鲸宝最喜欢你啦！",
			"主人最喜欢鲸宝了对吧？"
		];
		/** 任务完成播报（与 voice_done_1~3.mp3 一一对应）。 */
		const DONE_LINES = [
			"主人，任务完成啦！",
			"主人，任务已经完成了哦~",
			"主人，快来看看任务完成的怎么样吧~"
		];
		const HOVER_LINES = [];
		const INPUT_LINES = [
			"主人，要和鲸宝说什么呀～",
			"鲸宝准备好啦，主人说吧～",
			"主人打字的样子好认真～",
			"嗯嗯，鲸宝在听～"
		];
		const WAKE_LINES = [
			"啊…主人回来啦，鲸宝在呢～",
			"主人，鲸宝才没有偷懒哦！",
			"欢迎回来，主人～"
		];
		const SMILE_LINES = [
			"主人～鲸宝好幸福呀～💕",
			"嘿嘿，想到主人就忍不住开心起来了～",
			"主人真好，鲸宝最喜欢主人啦～"
		];
		const ZZZ_LINES = [
			"呼…zzz…",
			"咕噜…zzz…",
			"呼～呼～zzz…"
		];
		const REST_LINES = [
			"主人，你连续忙了好一会儿啦，起来伸个懒腰、喝口水吧～☕",
			"主人，让眼睛休息一下，看看远处放松放松～",
			"主人辛苦啦，记得起来走动走动，鲸宝心疼你～"
		];
		const NIGHT_LINES = [
			"夜深了，主人该休息啦，别熬夜哦～💤",
			"主人，熬夜伤身体，鲸宝会心疼的～",
			"很晚啦主人，早点休息，鲸宝给你说晚安～🌙"
		];

		// ═══════════════════════════════════════════════════════════════════
		//  CSS
		// ═══════════════════════════════════════════════════════════════════
		const PET_CSS = `
/* ── 鲸宝桌宠 @local/dsh-pet 生成的样式 ── */
#jingbao-pet.jb-pet {
	position: fixed;
	right: 22px;
	bottom: 22px;
	z-index: 9999;
	width: var(--pet-w, 172px);
	height: var(--pet-h, 256px);
	pointer-events: none;
	user-select: none;
	-webkit-user-select: none;
}
#jingbao-pet .jb-body {
	pointer-events: auto;
	cursor: pointer;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: none;
	border: none;
	padding: 0;
	margin: 0;
	animation: jb-breathe 2.6s ease-in-out infinite;
	-webkit-tap-highlight-color: transparent;
	outline: none;
}
#jingbao-pet .jb-img {
	display: block;
	height: var(--pet-h, 256px);
	width: auto;
	animation: jb-sway 5.2s ease-in-out infinite;
	filter: drop-shadow(0 6px 12px rgba(60, 100, 180, 0.28));
	-webkit-user-drag: none;
}
#jingbao-pet .jb-anim {
	display: none;
}
#jingbao-pet .jb-emoji {
	display: block;
	font-size: calc(var(--pet-h, 256px) - 12px);
	line-height: 1;
	text-align: center;
	animation: jb-sway 5.2s ease-in-out infinite;
	filter: drop-shadow(0 6px 12px rgba(60, 100, 180, 0.28));
}
/* 点击弹跳 */
#jingbao-pet .jb-body.jb-hop {
	animation: jb-hop 0.62s cubic-bezier(.34, 1.56, .64, 1) both;
}
/* 气泡框 */
#jingbao-pet .jb-bubble {
	position: absolute;
	bottom: calc(100% + 16px);
	left: 50%;
	max-width: calc(var(--pet-h, 256px) * 2.0);
	padding: calc(var(--pet-h, 256px) * 0.04) calc(var(--pet-h, 256px) * 0.06);
	background: #ffffff;
	color: #35506e;
	font-size: calc(var(--pet-h, 256px) * 0.05);
	line-height: 1.45;
	font-weight: 500;
	border-radius: calc(var(--pet-h, 256px) * 0.055);
	border: 1px solid rgba(120, 160, 220, 0.25);
	box-shadow: 0 8px 22px rgba(60, 100, 180, 0.18);
	opacity: 0;
	transform: translateX(-50%) translateY(8px) scale(0.92);
	transform-origin: bottom center;
	transition: opacity .22s ease, transform .22s ease;
	pointer-events: none;
	white-space: normal;
	z-index: 3;
}
#jingbao-pet .jb-bubble.show {
	opacity: 1;
	transform: translateX(-50%) translateY(0) scale(1);
}
/* 确认气泡按钮 */
#jingbao-pet .jb-bubble-actions {
	display: none;
	gap: 8px;
	margin-top: 8px;
}
#jingbao-pet .jb-bubble-actions.show { display: flex; }
#jingbao-pet .jb-bubble-btn {
	flex: 1;
	padding: 6px 10px;
	border: none;
	border-radius: 8px;
	font-size: 13px;
	cursor: pointer;
	white-space: nowrap;
	pointer-events: auto;
}
#jingbao-pet .jb-bubble-btn-yes { background: #6fa8f0; color: #fff; }
#jingbao-pet .jb-bubble-btn-yes:hover { background: #8fc0f5; }
#jingbao-pet .jb-bubble-btn-no { background: #e3eefb; color: #35506e; }
#jingbao-pet .jb-bubble-btn-no:hover { background: #d4e6fa; }
@keyframes jb-breathe {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-7px); }
}
@keyframes jb-sway {
	0%, 100% { transform: rotate(0deg); }
	25% { transform: rotate(1.6deg); }
	75% { transform: rotate(-1.6deg); }
}
@keyframes jb-hop {
	0% { transform: translateY(0) scale(1, 1); }
	28% { transform: translateY(-20px) scale(0.98, 1.04); }
	50% { transform: translateY(0) scale(1.03, 0.96); }
	72% { transform: translateY(-11px) scale(0.99, 1.02); }
	100% { transform: translateY(0) scale(1, 1); }
}
/* 点击爱心飞走特效 */
.jb-heart {
	position: fixed;
	z-index: 10000;
	pointer-events: none;
	animation: jb-heart-fly 1.3s ease-out forwards;
	line-height: 1;
	will-change: transform, opacity;
}
@keyframes jb-heart-fly {
	0% { opacity: 1; transform: translate(0, 0) scale(0.6) rotate(-8deg); }
	100% { opacity: 0; transform: translate(var(--dx, 0px), -90px) scale(1.35) rotate(10deg); }
}
/* 💤 睡眠特效（瞌睡阶段头顶循环漂浮） */
.jb-sleepfx {
	position: absolute;
	top: -26px;
	left: 50%;
	transform: translateX(-50%);
	font-size: 26px;
	display: none;
	pointer-events: none;
	z-index: 1;
	animation: jb-zzz 2.2s ease-in-out infinite;
	line-height: 1;
}
@keyframes jb-zzz {
	0% { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.7); }
	30% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
	100% { opacity: 0; transform: translateX(-50%) translateY(-24px) scale(1.3); }
}
/* 右键菜单 */
.jb-menu {
	position: fixed;
	z-index: 10001;
	display: none;
	min-width: 158px;
	background: #ffffff;
	border: 1px solid rgba(120, 160, 220, 0.3);
	border-radius: 12px;
	box-shadow: 0 10px 28px rgba(60, 100, 180, 0.22);
	padding: 6px;
	font-size: 13px;
	color: #35506e;
	user-select: none;
	pointer-events: auto;
}
.jb-menu-title {
	padding: 6px 10px;
	font-weight: 600;
	border-bottom: 1px solid rgba(120, 160, 220, 0.18);
	margin-bottom: 4px;
}
.jb-menu-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 7px 10px;
	border-radius: 8px;
	cursor: pointer;
}
.jb-menu-item:hover {
	background: rgba(111, 168, 240, 0.16);
	box-shadow: inset 0 0 0 1.5px rgba(111, 168, 240, 0.65);
}
.jb-menu-item input { accent-color: #6fa8f0; cursor: pointer; }
/* 系统监控面板（桌宠下方，鲸宝主题渐变描边 + 纯白内部 + 随缩放） */
.jb-monitor {
	position: absolute;
	top: calc(100% + 10px);
	left: 50%;
	transform: translateX(-50%);
	display: none;
	background: #ffffff;
	border: 4px solid transparent;
	background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #6fa8f0 0%, #8fb6f5 25%, #a58ff0 50%, #6fa8f0 75%, #8fc0f5 100%);
	background-origin: border-box;
	background-clip: padding-box, border-box;
	border-radius: 12px;
	padding: calc(var(--pet-h, 256px) * 0.022) calc(var(--pet-h, 256px) * 0.045);
	font-size: calc(var(--pet-h, 256px) * 0.052);
	font-weight: 700;
	box-shadow: 0 6px 18px rgba(60, 100, 180, 0.15);
	white-space: nowrap;
	pointer-events: none;
	z-index: 2;
}
/* 文字：蓝色渐变（蓝→紫→蓝）+ 加粗，35% 透明度白阴影更二次元 */
.jb-monitor-text {
	background-image: linear-gradient(135deg, #3d7bd8 0%, #6a5ad0 45%, #3d7bd8 90%);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	text-shadow: 0 1px 3px rgba(255, 255, 255, 0.35);
}
`;

		// ═══════════════════════════════════════════════════════════════════
		//  工具
		// ═══════════════════════════════════════════════════════════════════
		function pick(arr) {
			return arr[Math.floor(Math.random() * arr.length)];
		}
		/** 根据时刻返回「报时 + 时段贴心问候」。 */
		/** 整点报时：每小时一句话（参考国内作息，主人钦定）。 */
		function timeGreeting(d) {
			const h = d.getHours();
			const hm = `${h} 点`;
			const LINES = [
				"主人，已经 0 点啦，都过午夜了，快放下手机睡觉吧～💤",
				"主人，1 点啦……这么晚还不睡，鲸宝要担心了～🥺",
				"主人，2 点了……熬夜对身体不好，鲸宝陪你一起睡好不好～",
				"主人，3 点了，再不睡的话明天会没精神的～",
				"主人，4 点了……鲸宝都困得打哈欠了，主人也快休息吧～",
				"主人，5 点了，天快亮了，熬夜的主人快去补个觉～",
				"主人早安～6 点啦，新的一天开始了，元气满满哦！🌞",
				"主人，7 点啦，起床洗漱，美好的一天开始咯～☀️",
				"主人，8 点了，出门前记得吃早餐哦～🥪",
				"主人，9 点啦，工作/学习开始，鲸宝给你加油打气！💪",
				"主人，10 点啦，忙了一会儿了，起来喝口水活动一下吧～",
				"主人，11 点啦，再坚持一下就到饭点咯～",
				"主人，12 点啦，午饭时间到，记得好好吃饭哦～🍚",
				"主人，13 点了，午休时间，小憩一会儿养足精神吧～😴",
				"主人，14 点啦，下午的活儿开始咯，鲸宝陪着你～",
				"主人，15 点了，下午茶时间，给自己泡杯茶休息下吧～☕",
				"主人，16 点啦，工作辛苦了，起来伸个懒腰～",
				"主人，17 点了，快到下班时间啦，再坚持一下～",
				"主人，18 点啦，一天辛苦啦，晚饭想好吃什么了吗？🌙",
				"主人，19 点了，晚上好呀～好好放松一下～",
				"主人，20 点啦，晚饭吃过了吗？记得别饿着肚子～",
				"主人，21 点了，晚上放松时间，看看喜欢的剧或书吧～",
				"主人，22 点啦，该准备休息了哦，鲸宝希望你早点睡～🌙",
				"主人，23 点了，夜深了，快洗漱准备睡觉吧～💤"
			];
			return LINES[h] || `主人，已经 ${hm} 啦～`;
		}
		/** 节日/特殊日期祝福文案（无节日返回空串）。 */
		function holidayGreeting() {
			const d = new Date();
			const key = (d.getMonth() + 1) + "-" + d.getDate();
			const map = {
				"1-1": ["新年快乐，主人！🎉 新的一年鲸宝也会一直陪着主人～"],
				"2-14": ["情人节快乐，主人～💕 鲸宝的心永远属于你！"],
				"6-1": ["儿童节快乐主人！🐳 鲸宝陪主人一起可可爱爱～"],
				"8-15": ["中秋节快乐主人～🌕 鲸宝想和主人一起赏月！"],
				"10-1": ["国庆节快乐主人！好好享受快乐的假期吧！"],
				"12-24": ["平安夜快乐主人～🎄 鲸宝祝你平平安安！"],
				"12-25": ["圣诞快乐主人！听说圣诞老人给每个人都送出礼物，是真的吗～"],
				"12-31": ["跨年快乐主人！🎆 鲸宝要和主人一起迎接新年～"]
			};
			const lines = map[key];
			return lines ? pick(lines) : "";
		}

		// ═══════════════════════════════════════════════════════════════════
		//  确认信号识别（用于"需要主人确认时冒泡"）
		// ═══════════════════════════════════════════════════════════════════
		const CONFIRM_RE = /^(确认|确定|同意|允许|批准|好的|好|是|没问题|立即|OK|Yes|Confirm|Sure|Allow|Approve|Accept)$/i;
		function isConfirmButton(el) {
			const tag = el && el.tagName;
			const role = el && el.getAttribute && el.getAttribute("role");
			if (tag !== "BUTTON" && role !== "button") return false;
			const text = (el.textContent || "").trim();
			if (!text || text.length > 8) return false;
			return CONFIRM_RE.test(text);
		}
		function isDialog(el) {
			if (!el || el.nodeType !== 1) return false;
			const tag = el.tagName;
			const role = el.getAttribute && el.getAttribute("role");
			return tag === "DIALOG" || role === "dialog" || role === "alertdialog";
		}
		/** 拒绝/取消类按钮文案。 */
		const CANCEL_RE = /^(取消|拒绝|否|不|不要|退出|跳过|No|Cancel|Decline|Dismiss|Close)$/i;
		/** 宽松匹配：按钮文案包含这些词就视为"同意/继续"类（覆盖「同意并继续」「确认授权」等组合文案）。 */
		const CONFIRM_CONTAINS = /确认|确定|同意|允许|批准|授权|好的|好|是|没问题|OK|Yes|Confirm|Sure|Allow|Approve|Accept|继续|执行|运行|Run|Go/i;
		/** 宽松匹配：按钮文案包含这些词就视为"取消/拒绝"类。 */
		const CANCEL_CONTAINS = /取消|拒绝|否|退出|跳过|关闭|No|Cancel|Decline|Dismiss|Stop|Deny/i;
		/** 在新增节点里定位确认弹窗：返回 { yesBtn, noBtn, text } 或 null。 */
		function findConfirmSignal(node) {
			if (!node || node.nodeType !== 1) return null;
			try {
				let container = null;
				if (isDialog(node)) container = node;
				else if (node.querySelector) {
					container = node.querySelector("dialog, [role='dialog'], [role='alertdialog']");
				}
				const scanRoot = container || node;
				if (!scanRoot || !scanRoot.querySelectorAll) return null;
				const btns = scanRoot.querySelectorAll("button, [role='button']");
				let yesBtn = null, noBtn = null;
				for (let i = 0; i < btns.length; i += 1) {
					const t = (btns[i].textContent || "").trim();
					if (!t || t.length > 8) continue;
					if (!yesBtn && CONFIRM_RE.test(t)) yesBtn = btns[i];
					else if (!noBtn && CANCEL_RE.test(t)) noBtn = btns[i];
				}
				if (!yesBtn && isConfirmButton(node)) yesBtn = node;
				if (!yesBtn && !noBtn) return null;
				// 从确认按钮向上找弹窗容器（dialog 未直接命中时，取最近的"弹窗状"祖先）
				if (!container) {
					let el = yesBtn || noBtn;
					for (let up = 0; up < 6 && el; up += 1) {
						el = el.parentElement;
						if (!el) break;
						const role = el.getAttribute && el.getAttribute("role");
						const btnCount = el.querySelectorAll ? el.querySelectorAll("button, [role='button']").length : 0;
						if (el.tagName === "DIALOG" || role === "dialog" || role === "alertdialog" ||
							(btnCount >= 2 && el.childElementCount > 3)) {
							container = el;
							break;
						}
					}
				}
				// 提取「简要概括」（标题）+ 正文
				let text = "", summary = "";
				if (container) {
					text = (container.textContent || "").trim().replace(/\s+/g, " ").slice(0, 200);
					const head = container.querySelector("h1, h2, h3, [role='heading'], [class*='title' i], [class*='Title']");
					if (head) summary = (head.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
				}
				return { yesBtn, noBtn, text, summary };
			} catch (e) { /* ignore */ }
			return null;
		}

		// ═══════════════════════════════════════════════════════════════════
		//  插件主体
		// ═══════════════════════════════════════════════════════════════════
		function apply(ctx) {
			// 0. 防重复注入（HMR / 重复加载时先清理旧桌宠，避免出现多只鲸宝）
			const existed = document.getElementById("jingbao-pet");
			if (existed) existed.remove();
			// 0b. 清理旧的全局单例：断开旧 MO（否则新旧两个观察器同时触发 → 两条语音）
			if (jbConfirmMO) {
				try { jbConfirmMO.disconnect(); } catch (e) { /* 忽略 */ }
				jbConfirmMO = null;
			}
			jbStopAllVoices();  // 停掉旧实例可能还在播的语音
			if (jbVoiceCache) jbVoiceCache = null;
			jbApplied = true;

			// 1. 注入样式
			const styleEl = document.createElement("style");
			styleEl.setAttribute("data-plugin", "@local/dsh-pet");
			styleEl.textContent = PET_CSS;
			(document.head || document.documentElement).appendChild(styleEl);

			// 2. 注入 DOM
			const root = document.createElement("div");
			root.id = "jingbao-pet";
			root.className = "jb-pet";
			root.innerHTML = [
				'<div class="jb-bubble" aria-hidden="true">',
				'  <span class="jb-bubble-text"></span>',
				'  <div class="jb-bubble-actions">',
				'    <button class="jb-bubble-btn jb-bubble-btn-yes" type="button">同意</button>',
				'    <button class="jb-bubble-btn jb-bubble-btn-no" type="button">拒绝</button>',
				"  </div>",
				"</div>",
				'<div class="jb-sleepfx" aria-hidden="true">💤</div>',
				'<div class="jb-menu" aria-hidden="true">',
				'  <div class="jb-menu-title">🐳 鲸宝设置</div>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="enabled" /> 系统监控</label>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="cpu" /> CPU 占用率</label>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="mem" /> 内存占用率</label>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="gpu" /> 显卡占用率</label>',
				'  <div class="jb-menu-title">🔊 语音播报</div>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="voiceConfirm" /> 需求确认播报</label>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="voicePoke" /> 点击互动播报</label>',
				'  <label class="jb-menu-item"><input type="checkbox" data-k="voiceDone" /> 任务完成播报</label>',
				"</div>",
				'<div class="jb-monitor" aria-hidden="true"><span class="jb-monitor-text"></span></div>',
				'<button class="jb-body" type="button" aria-label="鲸宝桌宠">',
				'  <img class="jb-img jb-static" alt="鲸宝" draggable="false" />',
				'  <img class="jb-img jb-anim" alt="" draggable="false" aria-hidden="true" />',
				"</button>"
			].join("");
			document.body.appendChild(root);

			const body = root.querySelector(".jb-body");
			const staticImg = root.querySelector(".jb-static");
			const animImg = root.querySelector(".jb-anim");
			const bubble = root.querySelector(".jb-bubble");
			const bubbleText = root.querySelector(".jb-bubble-text");
			const bubbleActions = root.querySelector(".jb-bubble-actions");
			const bubbleYes = root.querySelector(".jb-bubble-btn-yes");
			const bubbleNo = root.querySelector(".jb-bubble-btn-no");
			const sleepFx = root.querySelector(".jb-sleepfx");
			const menu = root.querySelector(".jb-menu");
			const monitorPanel = root.querySelector(".jb-monitor");
			const monitorText = root.querySelector(".jb-monitor-text");

			// 预加载所有静帧 + 动图，避免切换闪白
			Object.keys(FRAMES).forEach((k) => {
				const pre = new Image();
				pre.src = FRAMES[k];
			});
			Object.keys(ANIMS).forEach((k) => {
				const pre = new Image();
				pre.src = ANIMS[k];
			});

			// 预加载全部语音（mp3 已解码缓存），点击/确认时瞬时出声、无加载延迟
			// 用全局唯一池：apply 重复执行也只建一套，stopAllVoices 跨实例互斥
			const voiceCache = {};
			jbVoiceCache = voiceCache;
			Object.keys(VOICES).forEach((group) => {
				voiceCache[group] = VOICES[group].map((src) => {
					try {
						const a = new Audio(src);
						a.preload = "auto";
						return a;
					} catch (e) { return null; }
				});
			});

			// 状态
			let currentFrame = "idle";
			let frameTimer = null;
			let animTimer = null;
			let lastActivity = Date.now();
			let sleepyFlag = false;
			let sleepyPhase = "none";      // none | yawn | sleeping | waking
			let idleTimer = null;          // 随机动画/卖萌计时器句柄
			let idlePaused = false;        // 计时器暂停标志（瞌睡期间）
			let lastReportedHour = -1;
			let lastRestRemindAt = 0;
			let idleBlockedUntil = 0;
			const SESSION_START = Date.now();
			// 缩放状态（128~512，默认 256，持久化到 localStorage 防止页面重载重置）
			let petHeight = PET_HEIGHT_DEFAULT;
			const SIZE_KEY = "dsh.pet.size.v1";
			try {
				const savedSize = parseInt(localStorage.getItem(SIZE_KEY), 10);
				if (savedSize >= PET_HEIGHT_MIN && savedSize <= PET_HEIGHT_MAX) petHeight = savedSize;
			} catch (e) { /* ignore */ }
			function applyPetSize() {
				root.style.setProperty("--pet-h", petHeight + "px");
				root.style.setProperty("--pet-w", Math.max(172, petHeight) + "px");
				try { localStorage.setItem(SIZE_KEY, String(petHeight)); } catch (e) { /* ignore */ }
			}
			applyPetSize();
			// 位置持久化：页面重载/插件重建后恢复拖拽过的位置
			const POS_KEY = "dsh.pet.pos.v1";
			try {
				const savedPos = JSON.parse(localStorage.getItem(POS_KEY) || "{}");
				if (savedPos && typeof savedPos.left === "number" && typeof savedPos.top === "number") {
					root.style.right = "auto";
					root.style.bottom = "auto";
					root.style.left = savedPos.left + "px";
					root.style.top = savedPos.top + "px";
				}
			} catch (e) { /* ignore */ }
			// 瞌睡流程时长（毫秒；素材就绪后按实际帧数校准）
			const YAWN_MS = 7125;          // 哈欠段时长（171 帧 / 24fps ≈ 7.1s）
			const WAKEUP_MS = 5200;        // 打断动画时长（124 帧 / 24fps ≈ 5.2s）

			// 静帧 / 动图两个图层互斥显示（避免动图播放时静帧残留在背后）
			function showStatic() {
				staticImg.style.display = "block";
				animImg.style.display = "none";
			}
			function showAnim() {
				staticImg.style.display = "none";
				animImg.style.display = "block";
			}
			// 3. 帧切换
			function setFrame(name, hold) {
				if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
				if (name !== currentFrame) {
					showStatic();
					staticImg.src = FRAMES[name];
					currentFrame = name;
				}
				if (hold) {
					frameTimer = setTimeout(() => setFrame("idle"), hold);
				}
			}
			// 3b. 动图播放（真·动作循环 WebP；缺失时退回静态帧）
			function playAnim(name, duration) {
				const src = ANIMS[name];
				if (!src) { setFrame(name, duration); return; }
				if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
				if (animTimer) { clearTimeout(animTimer); animTimer = null; }
				showAnim();
				animImg.src = src;
				currentFrame = "anim:" + name;
				animTimer = setTimeout(() => {
					showStatic();
					staticImg.src = FRAMES.idle;
					currentFrame = "idle";
					animTimer = null;
				}, duration);
			}
			// 3c. 循环播放动图（打瞌睡等持续状态），stopAnim 回到待机
			function playAnimLoop(name) {
				const src = ANIMS[name];
				if (!src) { setFrame(name); return; }
				if (animTimer) { clearTimeout(animTimer); animTimer = null; }
				showAnim();
				animImg.src = src;
				currentFrame = "anim:" + name;
			}
			function stopAnim() {
				if (animTimer) { clearTimeout(animTimer); animTimer = null; }
				showStatic();
				staticImg.src = FRAMES.idle;
				currentFrame = "idle";
			}
			// 3d. 播放一次动图后回调（用于哈欠→瞌睡、打断→待机的流程衔接）
			function playAnimThen(name, duration, onDone) {
				const src = ANIMS[name];
				if (!src) { if (onDone) onDone(); return; }
				if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
				if (animTimer) { clearTimeout(animTimer); animTimer = null; }
				showAnim();
				animImg.src = src;
				currentFrame = "anim:" + name;
				animTimer = setTimeout(() => {
					animTimer = null;
					if (onDone) onDone();
				}, duration);
			}
			// 3e. 💤 睡眠特效（瞌睡阶段持续显示，打断时隐藏）
			function showSleepFx() { sleepFx.style.display = "block"; }
			function hideSleepFx() { sleepFx.style.display = "none"; }
			// 3f. 随机动画/卖萌计时器的暂停与恢复（需求③）
			function stopIdleTimer() {
				idlePaused = true;
				if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
			}
			function resumeIdleTimer() {
				idlePaused = false;
				if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
				scheduleIdle();
			}
			// 3g. 瞌睡状态机：哈欠 → 1 秒后💤 → 循环歪头瞌睡 → 打断唤醒回待机
			function startSleepy() {
				sleepyFlag = true;
				sleepyPhase = "yawn";
				stopIdleTimer();   // 哈欠播放那一刻停止随机动画计时器
				showBubble("呼…主人不在，鲸宝打个盹…", 3000);
				playAnimThen("yawn", YAWN_MS, () => {
					sleepyPhase = "sleeping";
					playAnimLoop("sleepy");   // 循环歪头闭眼瞌睡
					setTimeout(() => {
						if (sleepyPhase === "sleeping") showSleepFx();  // 1 秒后 💤
					}, 1000);
				});
			}
			function wakeUp() {
				if (!sleepyFlag) return;
				sleepyFlag = false;
				sleepyPhase = "waking";
				hideSleepFx();
				playAnimThen("wakeup", WAKEUP_MS, () => {
					sleepyPhase = "none";
					stopAnim();  // 回到正常待机
					setTimeout(() => resumeIdleTimer(), 7000);  // 打断后 7 秒恢复计时器
				});
				showBubble(pick(WAKE_LINES), 2600);
			}
			// 图片加载失败时的内联 SVG 占位（只改 src，绝不新增 DOM 元素，避免"多一只"）
			const FALLBACK_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(
				'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><text x="50%" y="54%" font-size="140" text-anchor="middle">🐳</text></svg>'
			);
			showStatic();
			staticImg.src = FRAMES.idle;
			staticImg.addEventListener("error", () => {
				if (staticImg.getAttribute("src") !== FALLBACK_SVG) {
					staticImg.src = FALLBACK_SVG;
				}
			});
			// 动图加载失败兜底：优雅回静帧，避免"微笑被截断成空白"
			animImg.addEventListener("error", () => {
				if (animImg.style.display !== "none") stopAnim();
			});

			// 4. 气泡控制
			let bubbleTimer = null;
			function showBubble(text, duration) {
				bubbleActions.classList.remove("show");
				bubbleText.textContent = text;
				bubble.classList.add("show");
				if (bubbleTimer) clearTimeout(bubbleTimer);
				bubbleTimer = setTimeout(() => bubble.classList.remove("show"), duration || 3200);
			}
			// 4b. 语音播放（点击/确认时，与气泡文案用同一索引，保证说与显示一致）
			// 互斥：播新语音前先停掉所有正在播的语音，避免确认/点击两条语音叠加
			// 注意：必须用全局 jbStopAllVoices（停全局 jbVoiceCache），
			// 不能停局部 voiceCache —— apply 重入时两个实例的局部池互不相通，会双双播放！
			function playVoiceIndex(group, idx) {
				try {
					// 语音开关：confirm→voiceConfirm / poke→voicePoke / done→voiceDone（右键菜单控制）
					const voiceKey = group === "confirm" ? "voiceConfirm" : group === "poke" ? "voicePoke" : group === "done" ? "voiceDone" : null;
					if (voiceKey && monitor && monitor[voiceKey] === false) return;  // 该语音已关闭 → 不播
					const list = voiceCache[group];
					if (!list || !list[idx]) return;
					jbStopAllVoices();             // 停全局池（跨实例互斥）
					const a = list[idx];
					a.currentTime = 0;             // 从头播放（预加载好，无延迟）
					a.volume = 0.8;
					a.play().catch(() => {});
				} catch (e) { /* 忽略 */ }
			}

			// 5. 点击互动（弹跳 + 幸福摇头 + 爱心飞走特效）
			let hopTimer = null;
			body.addEventListener("click", (e) => {
				if (petDragged) { petDragged = false; return; }  // 拖拽结束不算点击
				lastActivity = Date.now();
				if (sleepyFlag) {
					// 瞌睡中被点击：直接唤醒（播打断动画），不做普通互动
					wakeUp();
					return;
				}
				body.classList.remove("jb-hop");
				void body.offsetWidth;
				body.classList.add("jb-hop");
				if (hopTimer) clearTimeout(hopTimer);
				hopTimer = setTimeout(() => body.classList.remove("jb-hop"), 640);
				// 点击互动：50% 幸福摇头 / 50% 双手比心（比心 5.2s 完整循环）
				if (Math.random() < 0.5) {
					playAnim("shake", 3200);
				} else {
					playAnim("heart", 5400);
				}
				spawnHearts(e.clientX, e.clientY);
				// 点击后 5 秒内不让随机卖萌/微笑计时器顶替当前动画
				idleBlockedUntil = Date.now() + 5000;
				// 气泡与语音用同一句（索引同步）
				const pokeIdx = Math.floor(Math.random() * POKE_LINES.length);
				showBubble(POKE_LINES[pokeIdx]);
				playVoiceIndex("poke", pokeIdx);  // 语音与气泡同句
			});
			// 爱心飞走特效：从点击处生成若干小爱心，向上飘散淡出
			function spawnHearts(x, y) {
				const EMOJIS = ["❤️", "💕", "💗", "💖", "❤️"];
				const count = 4 + Math.floor(Math.random() * 3);
				for (let i = 0; i < count; i += 1) {
					const h = document.createElement("span");
					h.className = "jb-heart";
					h.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
					h.style.left = (x + (Math.random() - 0.5) * 20) + "px";
					h.style.top = (y + (Math.random() - 0.5) * 20) + "px";
					h.style.setProperty("--dx", ((Math.random() - 0.5) * 70) + "px");
					h.style.fontSize = (13 + Math.random() * 15) + "px";
					h.style.animationDelay = (Math.random() * 0.18) + "s";
					document.body.appendChild(h);
					setTimeout(() => h.remove(), 1600);
				}
			}
			// 5c. 主人聚焦输入框准备打字时，鲸宝回应（拟人陪伴）
			let lastInputGreetAt = 0;
			document.addEventListener("focusin", (e) => {
				const t = e.target;
				const isInput = t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable === true);
				if (!isInput) return;
				if (sleepyFlag || animTimer) return;
				const now = Date.now();
				if (now - lastInputGreetAt > 30000) {
					lastInputGreetAt = now;
					showBubble(pick(INPUT_LINES), 2600);
				}
			});

			// 5d. 拖拽移动桌宠（拖到任意位置；拖拽结束不算点击）
			let petDragging = false;
			let petDragged = false;
			let dragStartX = 0, dragStartY = 0, dragLeft = 0, dragTop = 0;
			body.addEventListener("mousedown", (e) => {
				if (e.button !== 0) return;
				petDragging = true;
				petDragged = false;
				dragStartX = e.clientX;
				dragStartY = e.clientY;
				const rect = root.getBoundingClientRect();
				dragLeft = rect.left;
				dragTop = rect.top;
				playAnimLoop("grab");  // 被抓住动画（按住期间循环播放）
			});
			document.addEventListener("mousemove", (e) => {
				if (!petDragging) return;
				const dx = e.clientX - dragStartX;
				const dy = e.clientY - dragStartY;
				if (Math.abs(dx) + Math.abs(dy) > 6) petDragged = true;
				if (petDragged) {
					root.style.right = "auto";
					root.style.bottom = "auto";
					root.style.left = Math.round(dragLeft + dx) + "px";
					root.style.top = Math.round(dragTop + dy) + "px";
				}
			});
			document.addEventListener("mouseup", () => {
				if (petDragging) {
					petDragging = false;
					stopAnim();  // 放开后回归正常静帧
					// 保存拖拽后的位置（页面重载后恢复）
					const rect = root.getBoundingClientRect();
					try {
						localStorage.setItem(POS_KEY, JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) }));
					} catch (e) { /* ignore */ }
				}
			});
			// 5e. 滚轮缩放（向上放大 / 向下缩小，范围 128~512）
			body.addEventListener("wheel", (e) => {
				e.preventDefault();
				petHeight = Math.max(PET_HEIGHT_MIN, Math.min(PET_HEIGHT_MAX, petHeight + (e.deltaY < 0 ? 48 : -48)));
				applyPetSize();
			}, { passive: false });
			// 5f. 右键菜单 + 系统监控（CPU/内存/显卡，数据来自本地 8765 监控服务）
			//      + 语音播报开关（确认/点击/任务完成，默认全开）
			const MONITOR_KEY = "dsh.pet.monitor.v1";
			let monitor = { enabled: false, cpu: true, mem: true, gpu: true, voiceConfirm: true, voicePoke: true, voiceDone: true };
			try {
				monitor = Object.assign(monitor, JSON.parse(localStorage.getItem(MONITOR_KEY) || "{}"));
			} catch (e) { /* ignore */ }
			function saveMonitor() {
				try { localStorage.setItem(MONITOR_KEY, JSON.stringify(monitor)); } catch (e) { /* ignore */ }
			}
			function renderMenu() {
				menu.querySelectorAll("input[data-k]").forEach((cb) => {
					const k = cb.dataset.k;
					cb.checked = monitor[k] === true;
					// 监控子项受 enabled 控制；语音开关独立（不受监控开关影响）
					const isMonSub = k === "cpu" || k === "mem" || k === "gpu";
					cb.disabled = isMonSub && !monitor.enabled;
					cb.parentElement.style.opacity = isMonSub && !monitor.enabled ? "0.45" : "1";
				});
			}
			body.addEventListener("contextmenu", (e) => {
				e.preventDefault();
				renderMenu();
				menu.style.display = "block";
				menu.style.left = Math.max(4, Math.min(e.clientX, window.innerWidth - 180)) + "px";
				menu.style.top = Math.max(4, Math.min(e.clientY, window.innerHeight - 170)) + "px";
			});
			document.addEventListener("mousedown", (e) => {
				if (!menu.contains(e.target)) menu.style.display = "none";
			});
			menu.addEventListener("click", (e) => {
				const cb = e.target.closest("input[data-k]");
				if (!cb) return;
				const k = cb.dataset.k;
				if (k === "enabled") monitor.enabled = cb.checked;
				else if (k === "cpu" || k === "mem" || k === "gpu") {
					if (monitor.enabled) monitor[k] = cb.checked;
				} else {
					// 语音开关：独立控制，不受监控开关影响
					monitor[k] = cb.checked;
				}
				saveMonitor();
				renderMenu();
				startMonitor();
			});
			// 监控轮询（每 2 秒）
			let statsTimer = null;
			function positionMonitor() {
				// 固定显示在鲸宝下方（不再自动检测视口位置）
				monitorPanel.style.top = "calc(100% + 10px)";
				monitorPanel.style.bottom = "auto";
			}
			function fetchStats() {
				fetch("http://127.0.0.1:8765/stats")
					.then((r) => r.json())
					.then((d) => {
						const parts = [];
						if (monitor.cpu) parts.push("CPU " + d.cpu + "%");
						if (monitor.mem) parts.push("内存 " + d.mem + "%");
						if (monitor.gpu && d.gpu) parts.push("GPU " + d.gpu.usage + "%");
						monitorText.textContent = parts.join(" · ");
						monitorPanel.style.display = parts.length ? "block" : "none";
						if (parts.length) positionMonitor();
					})
					.catch(() => { monitorPanel.style.display = "none"; });
			}
			function startMonitor() {
				if (statsTimer) { clearInterval(statsTimer); statsTimer = null; }
				if (monitor.enabled) {
					fetchStats();
					statsTimer = setInterval(fetchStats, 1000);
				} else {
					monitorPanel.style.display = "none";
				}
			}
			startMonitor();

			// 6. 活跃检测 → 长时间无操作进入瞌睡，恢复时醒来
			const onActivity = () => {
				lastActivity = Date.now();
				if (sleepyFlag) wakeUp();
			};
			["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel", "pointerdown"].forEach((ev) => {
				document.addEventListener(ev, onActivity, { passive: true });
			});
			setInterval(() => {
				if (!sleepyFlag && Date.now() - lastActivity > SLEEPY_AFTER_MS) {
					startSleepy();
				}
			}, 2000);

			// 7. 整点报时（挥手 + 时段问候）
			setInterval(() => {
				const d = new Date();
				if (d.getMinutes() === 0 && d.getHours() !== lastReportedHour) {
					lastReportedHour = d.getHours();
					sleepyFlag = false;
					lastActivity = Date.now();
					playAnim("wave", 3800);
					showBubble(timeGreeting(d), 5200);
				}
			}, 20000);

			// 8. 劝休息 / 深夜关怀
			setInterval(() => {
				const now = Date.now();
				const hour = new Date().getHours();
				const isNight = hour >= 22 || hour < 6;
				if (now - lastRestRemindAt < REST_INTERVAL_MS) return;
				const activeMs = now - SESSION_START;
				if (activeMs > REST_AFTER_MS) {
					lastRestRemindAt = now;
					showBubble(pick(REST_LINES), 6000);
				} else if (isNight) {
					lastRestRemindAt = now;
					showBubble(pick(NIGHT_LINES), 6000);
				}
			}, 30000);

			// 9. 确认联动：检测到确认弹窗 → 鲸宝冒泡提示（不自动消失、暂停随机动作）；
			//    主人处理完（弹窗关闭/按钮点击）→ 气泡立即消失并恢复随机动作
			let pendingConfirm = null;  // 挂起的确认（记录弹窗容器，用于检测关闭）
			let lastAnnouncedKey = null;  // 最近播报过的确认的特征 key（同弹窗去重用）
			/** 生成确认弹窗的特征 key：只取按钮文本（最稳定；summary/text 在重渲染时可能缺失/变化）。 */
			function confirmKey(info) {
				try {
					const parts = [];
					if (info.yesBtn) parts.push("Y:" + (info.yesBtn.textContent || "").trim().slice(0, 12));
					if (info.noBtn) parts.push("N:" + (info.noBtn.textContent || "").trim().slice(0, 12));
					return parts.join("|") || "";
				} catch (e) { return ""; }
			}
			let lastHandledBtns = [];  // 刚处理完的确认弹窗的按钮元素（残留识别：同一元素再出现 = 残留）
			let lastHandledAt = 0;
			const CONFIRM_HANDLE_WINDOW = 1500;  // 处理完 1.5s 内，同一按钮元素视为残留
			function finishConfirm() {
				if (!pendingConfirm) return;
				// 记录刚处理弹窗的按钮元素（React 关闭动画/重渲染时这些元素可能还在 → 识别为残留）
				lastHandledBtns = [];
				if (pendingConfirm.yesBtn) lastHandledBtns.push(pendingConfirm.yesBtn);
				if (pendingConfirm.noBtn) lastHandledBtns.push(pendingConfirm.noBtn);
				lastHandledAt = Date.now();
				pendingConfirm = null;
				bubbleActions.classList.remove("show");
				bubble.classList.remove("show");
				resumeIdleTimer();  // 恢复随机动作计时器
			}
			function showConfirmBubble(info) {
				// 只提示符合人设的话语（不带按钮、不自动消失）
				const cIdx = Math.floor(Math.random() * CONFIRM_LINES.length);
				bubbleText.textContent = CONFIRM_LINES[cIdx];
				bubbleActions.classList.remove("show");
				bubble.classList.add("show");
				if (bubbleTimer) clearTimeout(bubbleTimer);  // 清掉普通气泡的自动关闭定时器
				stopIdleTimer();  // 暂停随机动作计时器
				playVoiceIndex("confirm", cIdx);  // 语音与气泡同句
				pendingConfirm = info;
				// 主人点击弹窗里的同意/拒绝按钮 → 气泡立即消失
				const onBtn = () => finishConfirm();
				if (info.yesBtn) info.yesBtn.addEventListener("click", onBtn, { once: true });
				if (info.noBtn) info.noBtn.addEventListener("click", onBtn, { once: true });
				trackConfirmFallback();  // 终极兜底：轮询检查确认按钮是否还在页面上
			}
			// 终极兜底：不依赖 container，定期检查页面里是否还存在「确认/取消」类按钮；
			// 弹窗关闭（按钮被移除）→ 气泡消失 + 恢复随机动作
			function trackConfirmFallback() {
				if (!pendingConfirm) return;  // 无挂起确认时停止轮询
				let hasBtn = false;
				try {
					const all = document.querySelectorAll("button, [role='button']");
					for (let i = 0; i < all.length; i += 1) {
						const t = (all[i].textContent || "").trim();
						if (t && t.length <= 12 && (CONFIRM_CONTAINS.test(t) || CANCEL_CONTAINS.test(t))) {
							hasBtn = true;
							break;
						}
					}
				} catch (e) { /* ignore */ }
				if (!hasBtn && pendingConfirm) {
					finishConfirm();  // 挂起的确认按钮消失 = 弹窗正常关闭
					return;
				}
				// 残留窗口：不提前清空，等 MO 检测到过期时自然清理
				setTimeout(trackConfirmFallback, 500);
			}
			let lastConfirmAt = 0;
			let pendingAnnounce = null;  // 待验证的播报（延迟验证弹窗是否真实存在）
			const mo = new MutationObserver((muts) => {
				// 弹窗被移除/隐藏（ESC、遮罩、React 隐藏）→ 气泡消失 + 恢复计时器
				if (pendingConfirm && pendingConfirm.container) {
					const c = pendingConfirm.container;
					let hidden = false;
					try {
						const st = window.getComputedStyle(c);
						hidden = st.display === "none" || st.visibility === "hidden";
					} catch (e) { /* ignore */ }
					if (!document.contains(c) || hidden) finishConfirm();
				}
				for (let i = 0; i < muts.length; i += 1) {
					const added = muts[i].addedNodes;
					for (let j = 0; j < added.length; j += 1) {
						const info = findConfirmSignal(added[j]);
						if (info) {
							const now = Date.now();
							const key = confirmKey(info);
							// 同弹窗去重：当前挂起的确认（内容相同）不重复播
							const sameDialog = pendingConfirm && lastAnnouncedKey && key && key === lastAnnouncedKey;
							if (sameDialog) return;
							// 残留识别：信号按钮是"刚处理完弹窗"的同一个按钮元素，且在 1.5s 窗口内 → 残留
							// （React 关闭动画/重渲染会复用同一按钮元素；新弹窗的按钮是全新元素）
							const nowH = Date.now();
							const isHandledBtn = lastHandledBtns.length > 0 && nowH - lastHandledAt < CONFIRM_HANDLE_WINDOW &&
								((info.yesBtn && lastHandledBtns.indexOf(info.yesBtn) !== -1) ||
								 (info.noBtn && lastHandledBtns.indexOf(info.noBtn) !== -1));
							if (isHandledBtn) return;
							// 残留窗口已过期：清空按钮引用（不持有 DOM 引用，无内存残留）
							if (lastHandledBtns.length > 0 && nowH - lastHandledAt >= CONFIRM_HANDLE_WINDOW) {
								lastHandledBtns = [];
								lastHandledAt = 0;
							}
							// 延迟验证法：信号出现后 400ms 再看"信号自己的按钮是否还在页面上"。
							//   - 真新需求：弹窗稳定存在 → 按钮还在 → 播（覆盖播放）
							//   - React 残留：按钮被移除/替换 → 400ms 后不在 → 不播
							// 注意：只验证信号自己的按钮，**不检查页面其他按钮**（新弹窗的按钮会导致残留误判）
							if (pendingAnnounce) { clearTimeout(pendingAnnounce); pendingAnnounce = null; }
							const schedInfo = info;
							pendingAnnounce = setTimeout(() => {
								pendingAnnounce = null;
								// 验证：信号自己的按钮还在页面上吗？
								let stillThere = false;
								try {
									if (schedInfo.yesBtn && document.contains(schedInfo.yesBtn)) stillThere = true;
									else if (schedInfo.noBtn && document.contains(schedInfo.noBtn)) stillThere = true;
								} catch (e) { /* ignore */ }
								if (!stillThere) return;  // 按钮已消失 = 残留 → 不播
								// 真弹窗：播报（覆盖上一条未播完的语音）
								const t2 = Date.now();
								if (t2 - lastConfirmAt >= 200) {  // 极小防抖，避免同批次重复调度
									lastConfirmAt = t2;
									lastAnnouncedKey = key;
									showConfirmBubble(schedInfo);
								}
							}, 400);
							return;
						}
					}
				}
			});
			// 全局唯一 MO：apply 重入时先断开旧的，保证同一时刻只有一个观察器
			if (jbConfirmMO) { try { jbConfirmMO.disconnect(); } catch (e) { /* 忽略 */ } }
			jbConfirmMO = mo;
			mo.observe(document.body, { childList: true, subtree: true });
			// 兜底：pendingConfirm 期间，主人点击任意「同意/取消」类按钮 → 需求已处理，气泡消失
			// （宽松包含匹配，覆盖「同意并继续」「确认授权」等组合文案；React 重建也不怕）
			document.addEventListener("click", (e) => {
				if (!pendingConfirm) return;
				const btn = e.target.closest("button, [role='button']");
				if (!btn) return;
				const text = (btn.textContent || "").trim();
				if (text && text.length <= 12 && (CONFIRM_CONTAINS.test(text) || CANCEL_CONTAINS.test(text))) {
					setTimeout(finishConfirm, 350);  // 稍等弹窗关闭
				}
			}, true);

			// 9b. 任务完成播报：监听「新插入」的任务结束标记 → 播报任务完成
			// DSH 任务结束后会**新插入**产物数据栏，特征是「固定词 + 变化数字 + 固定词」：
			//   "用时 37秒" / "耗时 2.1秒" / "首 token 2.1秒" / "154 tok/s"
			// 用 MutationObserver 只看**新增节点**：刷新页面时历史消息不算新增，
			// 只有任务完成时新插入的数据栏才算 → 不会刷新就误播
			let lastTaskDoneAt = 0;
			const TASK_DONE_COOLDOWN = 20000;  // 完成后 20 秒内不重复播报
			// 完整句式：固定词 + 数字 + 固定词（数字可变）
			const TASK_METRIC_RE = /(用时|耗时|消耗|共花费)\s*[0-9.]+(秒|s|分钟|分)|首\s?token\s*[0-9.]+(秒|s)|[0-9.]+\s*tok\/?s|[0-9.]+\s*tokens?\/s/i;
			/** 判断节点文本是否含任务结束句式（含 title/aria-label 隐藏参数）。 */
			function nodeHasDoneMarker(node) {
				try {
					if (!node || node.nodeType !== 1) return false;
					if (node.closest && node.closest("#jingbao-pet")) return false;  // 排除桌宠自身
					// 节点自身文本（聚合子元素）
					const t = (node.textContent || "").trim();
					if (t && t.length <= 800 && TASK_METRIC_RE.test(t)) return true;
					// 直接检查 title/aria-label 隐藏参数（鼠标移上去看到的）
					if (node.getAttribute) {
						const title = node.getAttribute("title") || node.getAttribute("aria-label") || "";
						if (title && title.length <= 200 && TASK_METRIC_RE.test(title)) return true;
					}
					// 新增节点可能是整条消息（含"用时"的子元素在深层）：从它下面找含句式的最深元素
					if (node.querySelectorAll) {
						const hits = node.querySelectorAll("[title], [aria-label], span, div, time");
						const cap = Math.min(hits.length, 200);
						for (let i = 0; i < cap; i += 1) {
							const el = hits[i];
							const tt = (el.textContent || "").trim();
							if (tt && tt.length <= 120 && TASK_METRIC_RE.test(tt)) return true;
							const at = el.getAttribute && (el.getAttribute("title") || el.getAttribute("aria-label") || "");
							if (at && at.length <= 120 && TASK_METRIC_RE.test(at)) return true;
						}
					}
				} catch (e) { /* ignore */ }
				return false;
			}
			// 任务结束标记 MutationObserver（全局单例，apply 重入时先断开旧的）
			// 同时监听 childList（新增节点）和 characterData（文本更新）——
			// DSH 可能"先插入空数据栏再填充文本"（更新已有文本节点），两种都覆盖
			const jbDoneMO = new MutationObserver((muts) => {
				// 预热期：页面加载后 3 秒内不播报（等初始 DOM 稳定，避免把已有历史当新任务）
				if (Date.now() < jbDoneReadyAt) return;
				for (let i = 0; i < muts.length; i += 1) {
					const m = muts[i];
					// 1. 新增节点（任务完成后新插入的数据栏/消息）
					const added = m.addedNodes;
					for (let j = 0; j < added.length; j += 1) {
						if (nodeHasDoneMarker(added[j])) {
							announceTaskDone();
							return;
						}
					}
					// 2. 文本更新（characterData）：检查目标文本节点的父元素（数据栏填充内容）
					if (m.type === "characterData" && m.target && m.target.parentElement) {
						if (nodeHasDoneMarker(m.target.parentElement)) {
							announceTaskDone();
							return;
						}
					}
				}
			});
			// 触发一次任务完成播报（带 20s 冷却 + 等文字动画播完）
			function announceTaskDone() {
				const now = Date.now();
				if (now - lastTaskDoneAt >= TASK_DONE_COOLDOWN) {
					lastTaskDoneAt = now;
					lastActivity = Date.now();  // 播报也算活跃，不打断瞌睡判定
					scheduleDoneAnnounce();  // 等文字动画播完再播报
				}
			}
			if (window.__jbDoneMO) { try { window.__jbDoneMO.disconnect(); } catch (e) { /* 忽略 */ } }
			window.__jbDoneMO = jbDoneMO;
			const jbDoneReadyAt = Date.now() + 3000;  // 3 秒预热期
			jbDoneMO.observe(document.body, { childList: true, characterData: true, subtree: true });
			// 任务完成播报：检测到结束标记后**立即**播报（检测很准，无需等动画/延迟）
			function scheduleDoneAnnounce() {
				const dIdx = Math.floor(Math.random() * DONE_LINES.length);
				showBubble(DONE_LINES[dIdx], 4000);
				playVoiceIndex("done", dIdx);  // 语音与气泡同句
			}
			// 测试钩子：模拟一次任务完成播报（主人验收用）
			window.__jbTestDone = () => {
				const dIdx = Math.floor(Math.random() * DONE_LINES.length);
				showBubble(DONE_LINES[dIdx], 4000);
				playVoiceIndex("done", dIdx);
			};
			// 调试钩子：扫描页面上已存在的任务结束标记，返回检测状态（排查用）
			window.__jbTaskScan = () => {
				const hits = [];
				try {
					document.querySelectorAll("span, div, p, [title], [aria-label]").forEach((el) => {
						if (el.closest && el.closest("#jingbao-pet")) return;
						const t = (el.textContent || "").trim();
						if (t && t.length <= 120 && TASK_METRIC_RE.test(t)) {
							hits.push({ type: "metric", text: t.slice(0, 60), cls: (el.className || "").toString().slice(0, 50), tag: el.tagName });
						}
						const at = el.getAttribute && (el.getAttribute("title") || el.getAttribute("aria-label") || "");
						if (at && at.length <= 120 && TASK_METRIC_RE.test(at)) {
							hits.push({ type: "attr", text: at.slice(0, 60), tag: el.tagName });
						}
					});
				} catch (e) { /* ignore */ }
				return { hits };
			};

			// 10. 待机随机卖萌（瞌睡时冒 zzz，正常时冒卖萌语）
			function scheduleIdle(delay) {
				const d = delay !== undefined ? delay : IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
				idleTimer = setTimeout(() => {
					if (idlePaused) return;  // 暂停中：等 resumeIdleTimer 重新调度
					if (Date.now() < idleBlockedUntil) {
						// 点击后 5 秒冷却期：不触发随机动画/卖萌，重新调度
						scheduleIdle();
						return;
					}
					if (animTimer) {
						// 当前有动画（微笑/眨眼/挥手等）正在播放：不顶替，顺延到下一轮
						scheduleIdle();
						return;
					}
					if (sleepyFlag) {
						showBubble(pick(ZZZ_LINES), 2500);
					} else {
						const r = Math.random();
						if (r < 0.3) {
							// 30% 概率播「微笑合十」动画
							playAnim("smile", 3600);
							showBubble(pick(SMILE_LINES), 3600);
						} else if (r < 0.55) {
							// 25% 概率播「眨眼」动画（3 秒）
							playAnim("blink", 3000);
						} else {
							showBubble(pick(IDLE_LINES), 3000);
						}
					}
					scheduleIdle();
				}, d);
			}
			scheduleIdle();
			// 节日/特殊日期祝福（页面加载后 3 秒冒一次）
			const holidayLine = holidayGreeting();
			if (holidayLine) setTimeout(() => showBubble(holidayLine, 5000), 3000);
		}

		exports.inject = [];
		exports.apply = apply;
		return module.exports;
	}
});
