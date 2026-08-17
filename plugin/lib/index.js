// @local/dsh-pet —— 纯客户端插件（鲸宝 Q 版桌宠）。
// 服务端入口：无任何 host-side 行为，仅为满足 cordis loader 的插件解析。
// 前端逻辑在 ./client.js（package.json 的 "./client" 子路径导出）。
// 桌宠设置（开关/音量/气泡频率等）持久化在浏览器 localStorage，见 client.js。
function apply() {}
export { apply };
