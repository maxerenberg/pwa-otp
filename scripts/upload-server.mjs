#!/usr/bin/env node
import * as fs from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";

function writeResponse(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain",
    Connection: "close",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(text + "\n");
}

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method !== "PUT") {
    writeResponse(res, 405, "Method Not Allowed");
    return;
  }
  if (req.headers["content-type"] !== "application/json") {
    writeResponse(res, 400, "Invalid content-type");
    return;
  }
  req.setEncoding("utf-8");
  const chunks = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    let body;
    try {
      body = JSON.parse(chunks.join(""));
    } catch (err) {
      writeResponse(res, 400, "Invalid JSON");
      return;
    }
    fs.writeFileSync("settings.json", JSON.stringify(body, undefined, 2), {
      mode: 0o600,
    });
    console.log("Wrote body to settings.json");
    writeResponse(res, 200, "OK");
  });
});

const publicIpAddresses = [];
for (const addrs of Object.values(networkInterfaces())) {
  for (const addr of addrs) {
    if (!addr.internal && addr.family === "IPv4") {
      publicIpAddresses.push(addr.address);
    }
  }
}

let port = 3000;

function listen() {
  server.listen(port, "0.0.0.0");
}

server.on("listening", () => {
  for (const publicIpAddress of publicIpAddresses) {
    console.log(`Listening on http://${publicIpAddress}:${port}`);
  }
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    port++;
    listen();
  } else {
    throw err;
  }
});
listen();
