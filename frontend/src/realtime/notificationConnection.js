import * as signalR from "@microsoft/signalr";

let connection = null;

export function getNotificationConnection() {
  if (connection) return connection;

  const token = localStorage.getItem("hd_token");
  const base = import.meta.env.VITE_API_URL || "https://localhost:7204/api";
  const hubUrl = base.replace(/\/api$/, "") + "/hubs/notifications";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("hd_token") || token || "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startNotificationConnection() {
  const conn = getNotificationConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
    } catch {
      return conn;
    }
  }
  return conn;
}

export function stopNotificationConnection() {
  if (connection) {
    connection.stop();
    connection = null;
  }
}