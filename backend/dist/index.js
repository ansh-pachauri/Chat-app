"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/message", (req, res) => {
    const { message } = req.body;
    console.log(message);
    // res.status(200).json({message: message});
});
const server = app.listen(8080, () => {
    console.log("HTTP and WebSocket server running on port 8080");
});
// const clients = new Map<string, WebSocket>();
exports.wss = new ws_1.WebSocketServer({ server });
exports.wss.on("connection", (ws) => {
    console.log("New client connected");
    // Handle incoming messages
    ws.on("message", (message) => {
        try {
            const textMessage = message.toString();
            console.log("Received:", textMessage);
            // Attempt to parse as JSON
            const parsedMessage = JSON.parse(textMessage);
            // Broadcast to all connected clients except the sender
            exports.wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
            //  }
        }
        catch (err) {
            console.error("Invalid JSON message received:", message.toString());
            ws.send(JSON.stringify({ error: "Invalid JSON format" }));
        }
    });
    // Handle disconnections
    ws.on("close", () => {
        console.log("Client disconnected");
    });
    // Handle connection errors
    ws.on("error", (err) => {
        console.error("WebSocket Error for client:", err.message);
    });
});
// Handle WebSocket Server errors
exports.wss.on("error", (err) => {
    console.error("WebSocket Server Error:", err.message);
});
console.log("WebSocket server started on port 8080");
