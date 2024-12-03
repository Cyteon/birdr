import { WebSocketServer } from "ws";
import type { ViteDevServer } from "vite";
import mongoose from "mongoose";
import User from "./lib/models/User";
import AuthToken from "./lib/models/AuthToken";
import dotenv from "dotenv";
import { error } from "@sveltejs/kit";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI!);

interface Client {
  userId: mongoose.Types.ObjectId;
  socket: WebSocket;
  heartbeatInterval: number;
  untilNextHeartbeat: number;
}

enum OPCode {
  HEARTBEAT = 1,
  HEARTBEAT_ACK = 2,
}

let clients: Client[] = [];

export const configureServer = (server: ViteDevServer) => {
  if (!server.httpServer) {
    throw new Error("No httpServer found");
  }

  const result = new WebSocketServer({
    noServer: true,
  });

  server.httpServer.on("upgrade", (req, socket, head) => {
    if (req.headers["sec-websocket-protocol"] === "vite-hmr") {
      return;
    }

    result.handleUpgrade(req, socket, head, (ws) => {
      result.emit("connection", ws, req);
    });
  });
    
  result.on("connection", (socket, request) => {
    let verified = false;

    socket.on("message", async (data, isBinary) => {
      if (!verified) {
        try {
          const { token } = JSON.parse(data.toString());

          if (!token) {
            socket.send(JSON.stringify({ error: "No token provided", status: 400 }));
            socket.close();
            return;
          } else {
            const tokenResult = await AuthToken.findOne({ token });

            if (!tokenResult) {
              socket.send(JSON.stringify({ error: "Invalid token", status: 401 }));
              socket.close();
              return;
            }

            const user = await User.findById(tokenResult.userId);

            if (!user) {
              socket.send(JSON.stringify({ error: "Invalid token", status: 401 }));
              socket.close();
              return;
            }

            verified = true;

            const heartbeatInterval = Math.floor(Math.random() * 500) + 10000;

            clients.push({
              userId: user._id,
              socket,
              heartbeatInterval,
              untilNextHeartbeat: heartbeatInterval,
            });

            user.password = undefined;
            socket.send(JSON.stringify({ user, interval: heartbeatInterval }));
          }
        } catch (e) {
          console.error(e);

          socket.send(JSON.stringify({ error: "Invalid JSON", status: 400 }));
          socket.close();
          return;
        }
      } else {
        try {
          const { op, d } = JSON.parse(data.toString());

          if (op === OPCode.HEARTBEAT) {
            socket.send(JSON.stringify({ op: OPCode.HEARTBEAT_ACK }));

            const clientIndex = clients.findIndex((client) => client.socket === socket);
            clients[clientIndex].untilNextHeartbeat = clients[clientIndex].heartbeatInterval;
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  });

  setInterval(() => {
    clients = clients.map((client) => {
      client.untilNextHeartbeat -= 1000;

      if (client.untilNextHeartbeat + 10000 <= 0) {
        client.socket.send(JSON.stringify({ error: "Heartbeat timeout", status: 400 }));
        client.socket.close();
      }

      return client;
    });
  }, 1000);
}

const webSocketServer = {
    name: "webSocketServer",
    configureServer,
}

export default webSocketServer;