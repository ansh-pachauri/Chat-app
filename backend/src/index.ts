import { WebSocket, WebSocketServer } from "ws";
import express, {Request, Response} from "express";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());


app.post("/message",  (req: Request, res: Response) => {
    const {message} = req.body;
    console.log(message);
    // res.status(200).json({message: message});
   
});

const server = app.listen(8080, () => {
    console.log("HTTP and WebSocket server running on port 8080");
});

// const clients = new Map<string, WebSocket>();
export const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("New client connected");

    // Handle incoming messages
    ws.on("message", (message) => {
        try {
            

            const textMessage = message.toString();
            console.log("Received:", textMessage);

            // Attempt to parse as JSON
             const parsedMessage = JSON.parse(textMessage);
     
                
                // Broadcast to all connected clients except the sender
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(parsedMessage));
                    }
                });
            //  }
        } catch (err) {
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
wss.on("error", (err) => {
    console.error("WebSocket Server Error:", err.message);
});

console.log("WebSocket server started on port 8080");


