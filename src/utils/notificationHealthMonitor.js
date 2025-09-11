import * as signalR from "@microsoft/signalr";

export class ConnectionHealthMonitor {
  constructor(connection) {
    this.connection = connection;
    this.pingInterval = null;
    this.lastPongTime = 0;
    this.isMonitoring = false;
    this.PING_INTERVAL = 30000; // 30s
    this.TIMEOUT_THRESHOLD = 60000; // 60s
    this.onHealthChange = null;
  }

  start(onHealthChange) {
    if (this.isMonitoring) return;

    this.onHealthChange = onHealthChange;
    this.isMonitoring = true;
    this.lastPongTime = Date.now();

    this.connection.on("Pong", () => {
      this.lastPongTime = Date.now();
    });

    this.pingInterval = setInterval(() => {
      this.checkHealth();
    }, this.PING_INTERVAL);

    console.log("Connection health monitor started");
  }

  stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.connection.off("Pong");
    this.isMonitoring = false;
    console.log("Connection health monitor stopped");
  }

  async checkHealth() {
    if (!this.isMonitoring || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke("Ping");

      const timeSinceLastPong = Date.now() - this.lastPongTime;
      const isHealthy = timeSinceLastPong < this.TIMEOUT_THRESHOLD;

      if (!isHealthy) {
        console.warn(`Connection health check failed. Last pong: ${timeSinceLastPong}ms ago`);
      }

      this.onHealthChange?.(isHealthy);
    } catch (err) {
      console.error("Health check ping failed:", err);
      this.onHealthChange?.(false);
    }
  }

  getCurrentHealth() {
    const lastPongAge = Date.now() - this.lastPongTime;
    return {
      isHealthy: lastPongAge < this.TIMEOUT_THRESHOLD,
      lastPongAge,
    };
  }
}
