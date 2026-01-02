// installer/start-backend.js
const { spawn } = require("child_process");
const net = require("net");
const path = require("path");

function waitForPort(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const socket = new net.Socket();

      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Port ${port} not ready`));
        } else {
          setTimeout(check, 500);
        }
      });

      socket.connect(port, "127.0.0.1");
    };

    check();
  });
}

function startBackend() {
  const backendDir = path.join(__dirname, "../backend");
  console.log("Starting backend (dev)...");

  const proc = spawn("npm", ["start"], {
    cwd: backendDir,
    stdio: "inherit",
    shell: true,
  });

  return waitForPort(5001)
    .then(() => {
      console.log("Backend ready!");
      return proc;
    })
    .catch((err) => {
      console.error("Backend failed to start:", err);
      proc.kill();
      throw err;
    });
}

startBackend();
