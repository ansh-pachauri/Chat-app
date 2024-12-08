import { useEffect, useState, useRef } from "react";
import axios from "axios";


interface Message {
  content: string;
  id: string;
  isSent: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("WebSocket connected");
    };
    ws.onclose = () => console.log("WebSocket disconnected");

    wsRef.current = ws;

    //connect to the server
    async function getMessages() {
      try {
        const response = await axios.post("http://localhost:8080/message");
        const data = response.data;
        setMessages((m) => [...m, 
          {
            id: crypto.randomUUID(),
            content: data.message || data.sendMessage,
            isSent: false
          }
        ]);
      } catch (error) {
          console.error("Error fetching messages:", error);
      }
    }
    getMessages()
    //used to receive messages from the server

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: crypto.randomUUID(),
            content: data.message,
            isSent: false
          }
        ]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    return () => {
      ws.close();
    };


  }, []);

  

  return (
    <div className="flex bg-black flex-col h-screen w-full p-4">
      <div className="h-[90vh] overflow-y-auto">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-4 flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
          >
            <span 
              className={`p-2 rounded-lg max-w-[70%] ${
                msg.isSent 
                  ? 'bg-purple-500 text-white ml-auto' 
                  : 'bg-white text-black mr-auto'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 p-2 flex justify-between items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          className="w-full p-2 rounded-md flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const messageContent = inputRef.current?.value;
              if (messageContent && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current?.send(JSON.stringify({ message: messageContent }));
                setMessages(prevMessages => [
                  ...prevMessages,
                  {
                    id: crypto.randomUUID(),
                    content: messageContent,
                    isSent: true
                  }
                ]);
              }
            }
          }}
        />
        <button
          onClick={() => {
            const messageContent = inputRef.current?.value;
            if (messageContent && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current?.send(JSON.stringify({ message: messageContent }));
              setMessages(prevMessages => [
                ...prevMessages,
                {
                  id: crypto.randomUUID(),
                  content: messageContent,
                  isSent: true
                }
              ]);
              if (inputRef.current) {
              inputRef.current.value = "";
            }
            
          }}}
          className="bg-purple-500 text-white p-2 rounded-md font-bold"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
