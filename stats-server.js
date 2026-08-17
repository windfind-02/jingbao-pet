// 鲸宝桌宠系统监控服务：CPU / 内存 / 显卡占用率
// 用法: node stats-server.js   →  http://127.0.0.1:8765/stats
// GPU 数据由 PowerShell 定时写入 gpu.json（沙箱下 node 无法 spawn nvidia-smi，改为读文件）
const http = require("http");
const os = require("os");
const fs = require("fs");

const GPU_FILE = "E:/Deepseek harness/图像理解测试/gpu.json";

let lastCpu = os.cpus();
function cpuUsage() {
  const now = os.cpus();
  let idle = 0, total = 0;
  for (let i = 0; i < now.length; i++) {
    const a = lastCpu[i].times, b = now[i].times;
    const diffIdle = b.idle - a.idle;
    const diffTotal = (b.user - a.user) + (b.nice - a.nice) + (b.sys - a.sys) + diffIdle + (b.irq - a.irq);
    idle += diffIdle; total += diffTotal;
  }
  lastCpu = now;
  return total > 0 ? Math.max(0, Math.min(100, Math.round((1 - idle / total) * 100))) : 0;
}

function memUsage() {
  const total = os.totalmem(), free = os.freemem();
  return Math.max(0, Math.min(100, Math.round((1 - free / total) * 100)));
}

let gpuCache = null;
function queryGpu() {
  try {
    if (fs.existsSync(GPU_FILE)) {
      const data = JSON.parse(fs.readFileSync(GPU_FILE, "utf8"));
      if (data && typeof data.usage === "number") gpuCache = data;
    }
  } catch (e) { /* 文件读取失败时保持上次值 */ }
}
queryGpu();
setInterval(queryGpu, 1000);

const server = http.createServer((req, res) => {
  if (req.url === "/stats") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify({ cpu: cpuUsage(), mem: memUsage(), gpu: gpuCache }));
  } else if (req.url === "/ping") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("pong");
  } else {
    res.writeHead(404); res.end();
  }
});
server.listen(8765, "127.0.0.1", () => console.log("jingbao stats server on 127.0.0.1:8765"));
