import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>((resolve) => {
    const RELAY_ROOT = process.cwd();
    const scriptPath = `${RELAY_ROOT}/scripts/run-nanobot.sh`;

    // Spawn the nanobot script - don't wait for it to complete since it runs interactively
    const proc = spawn("bash", [scriptPath], {
      cwd: RELAY_ROOT,
      detached: true, // Run independently so the API can return immediately
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        RELAY_BASE_URL: process.env.RELAY_BASE_URL ?? "http://localhost:3000",
      },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    // Consider it a success if the process started
    // The nanobot runs in background and updates shared memory
    proc.on("spawn", () => {
      // Unref the process so it can run independently
      proc.unref();
      resolve(NextResponse.json({
        success: true,
        message: "Nanobot started successfully. Check shared memory for updates.",
        note: "Nanobot runs in background. Flow will start when it publishes to shared memory.",
      }));
    });

    proc.on("error", (err) => {
      resolve(NextResponse.json({
        success: false,
        message: "Failed to start nanobot",
        error: err.message,
      }, { status: 500 }));
    });

    // Timeout after 5 seconds if no spawn
    setTimeout(() => {
      if (!proc.killed) {
        proc.kill();
      }
      resolve(NextResponse.json({
        success: true,
        message: "Nanobot start initiated. Check shared memory for updates.",
        note: "Nanobot runs in background. Flow will start when it publishes to shared memory.",
      }));
    }, 5000);
  });
}
