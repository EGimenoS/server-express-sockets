import express from "express";
import { SERVER_PORT } from "../globals/environment";
import socketIO from "socket.io";
import http from "http";

import * as socket from "../sockets/socket";

export default class Server {
  private static _instance: Server;
  public app: express.Application;
  public port: number;
  public io: socketIO.Server;
  private httpServer: http.Server;

  private constructor() {
    this.app = express();
    this.port = SERVER_PORT;

    this.httpServer = new http.Server(this.app);
    this.io = socketIO(this.httpServer);
    this.listenSockets();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private listenSockets() {
    console.log("listening sockets");
    this.io.on("connection", (client) => {
      socket.connectUser(client, this.io);
      console.log("new client connected with id", client.id);
      socket.configUser(client, this.io);
      socket.message(client, this.io);

      socket.handleDisconnect(client, this.io);
    });
  }

  start(callback: any) {
    this.httpServer.listen(this.port, callback);
  }
}
