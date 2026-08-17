// @local/dsh-pet —— 鲸宝 Q 版桌宠。
// 服务端入口：负责「系统监控」数据服务，随 DSH 启动/停止自动启停，无需手动开进程。
//  - HTTP 服务监听 127.0.0.1:8765，提供 GET /stats（CPU/内存/GPU）
//  - GPU 数据：每 1 秒调 nvidia-smi 写入 gpu.json（client 端 fetch /stats 读取）
//  - 生命周期：apply 时启动，dispose 时关闭（Cordis 标准），DSH 重启自动恢复
// 前端逻辑在 ./client.js（package.json 的 "./client" 子路径导出）。
import http from "node:http";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

/** gpu.json 固定位置（client.js 的 stats-server 逻辑与历史脚本共用）。 */
const GPU_FILE = path.join("E:\\", "Deepseek harness", "图像理解测试", "gpu.json");

/** 写 JSON（无 BOM，UTF-8；避免 PowerShell Set-Content 带 BOM 导致 JSON.parse 失败）。 */
function writeJson(file, obj) {
  try {
    fs.writeFileSync(file, JSON.stringify(obj), { encoding: "utf8" });
  } catch (e) { /* 写失败静默（比如路径不可写） */ }
}

function apply(ctx) {
  let gpuCache = null;
  let lastCpu = os.cpus();

  function cpuUsage() {
    try {
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
    } catch (e) { return 0; }
  }

  function memUsage() {
    try {
      const total = os.totalmem(), free = os.freemem();
      return total > 0 ? Math.max(0, Math.min(100, Math.round((1 - free / total) * 100))) : 0;
    } catch (e) { return 0; }
  }

  /** 查一次 GPU（nvidia-smi → gpu.json），失败保留上次值。 */
  function queryGpu() {
    execFile("nvidia-smi", ["--query-gpu=utilization.gpu,memory.used,memory.total", "--format=csv,noheader,nounits"], { timeout: 8000 }, (err, stdout) => {
      if (err) return; // nvidia-smi 不可用（无 N 卡等）→ 保持旧值
      try {
        const parts = stdout.trim().split(",").map((s) => s.trim());
        const usage = parseInt(parts[0], 10);
        const memUsed = parseInt(parts[1], 10);
        const memTotal = parseInt(parts[2], 10);
        if (Number.isFinite(usage) && Number.isFinite(memUsed) && Number.isFinite(memTotal)) {
          gpuCache = { usage, memUsed, memTotal };
          writeJson(GPU_FILE, gpuCache);
        }
      } catch (e) { /* 解析失败忽略 */ }
    });
  }

  queryGpu();
  const gpuTimer = setInterval(queryGpu, 1000);

  // HTTP 服务（监听 127.0.0.1:8765，提供 /stats 与 /ping）
  const server = http.createServer((req, res) => {
    try {
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
    } catch (e) { res.writeHead(500); res.end(); }
  });
  server.on("error", (e) => {
    // 8765 被占用（比如旧 stats-server 还在跑）→ 记录但不崩溃，前端仍可访问旧服务
    if (e.code === "EADDRINUSE") {
      console.log("[dsh-pet] 8765 已被占用（旧 stats-server？），内置监控服务跳过监听");
    }
  });
  server.listen(8765, "127.0.0.1", () => {
    console.log("[dsh-pet] 监控服务已启动 http://127.0.0.1:8765/stats");
  });

  // 插件卸载/DSH 停止 → 关掉服务与定时器（不残留进程）
  ctx.on("dispose", () => {
    try { server.close(); } catch (e) { /* 忽略 */ }
    clearInterval(gpuTimer);
  });
}

export { apply };
