import React, { useState, useRef, useEffect } from "react";
import { Input, Button, FloatButton } from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";

const Chatbot = () => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Call FastAPI backend
  const callBackend = async (message) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      return data.answer; // take only the answer (ignore sources for now)
    } catch (error) {
      console.error(error);
      return "❌ Failed to connect to backend.";
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    // user msg
    const newMessage = { sender: "user", text: chatInput };
    setChatMessages((prev) => [...prev, newMessage]);

    const currentInput = chatInput;
    setChatInput("");
    setLoading(true);

    // bot msg
    const reply = await callBackend(currentInput);
    setChatMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {chatVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,            
            width: 700, 
            height: 500,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#001529",
              color: "white",
              padding: "10px",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            Chatbot
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  textAlign: msg.sender === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: msg.sender === "user" ? "#1890ff" : "#f5f5f5",
                    color: msg.sender === "user" ? "white" : "black",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ textAlign: "left", marginBottom: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "#f5f5f5",
                  }}
                >
                  Typing...
                </span>
              </div>
            )}

            {/* Invisible div for scroll-to-bottom */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div
            style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}
          >
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPressEnter={handleChatSend}
              placeholder="Type a message..."
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleChatSend}
              style={{ marginLeft: 8 }}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 20, bottom: 20 }}
        onClick={() => setChatVisible(!chatVisible)}
      />
    </>
  );
};

export default Chatbot;
