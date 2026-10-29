const net = require("net");

const LISTEN_IP = "192.168.0.13";
const LISTEN_PORT = 3000;
const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 3000;

const server = net.createServer((clientSocket) => {
  const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
    clientSocket.pipe(targetSocket);
    targetSocket.pipe(clientSocket);
  });

  clientSocket.on("error", () => targetSocket.destroy());
  targetSocket.on("error", () => clientSocket.destroy());
});

server.listen(LISTEN_PORT, LISTEN_IP, () => {
  console.log(`[LAN Proxy] Listening on http://${LISTEN_IP}:${LISTEN_PORT} -> http://${TARGET_HOST}:${TARGET_PORT}`);
});

server.on("error", (err) => {
  console.error("[LAN Proxy Error]", err.message);
});
