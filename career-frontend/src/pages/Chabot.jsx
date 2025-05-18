import React, { useState, useEffect } from "react";
import { Card, Button, Form, Spinner, Container } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AIChatBot = () => {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add a warm welcome message from bot
    const welcomeMessage = {
      sender: "bot",
      text: "👋 Welcome to your AI Career Assistant! Ask me anything about your psychometric results, career choices, or next steps.",
    };
    setConversation([welcomeMessage]);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setConversation((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ask", { message: input });
      const botMessage = { sender: "bot", text: res.data.response };
      setConversation((prev) => [...prev, botMessage]);
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go to the previous page
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "1000px",height:"1700px" }}>
        <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"870px"}}>
      ⬅️ Back
    </Button><br/><br/>
      <Card className="shadow p-4">
        <h4 className="text-center mb-3 text-primary">AI Career Assistant</h4>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1rem" }}>
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded mb-2 ${
                  msg.sender === "user" ? "bg-light text-end ms-auto" : "bg-primary text-white me-auto"
                }`}
                style={{
                  maxWidth: "55%",
                  minWidth: "40%",
                  wordWrap: "break-word",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  borderRadius: "20px",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-center text-muted">
                <Spinner animation="border" size="sm" /> Thinking...
              </div>
            )}
          </div>
          
        <Form onSubmit={handleSend} className="d-flex">
          <Form.Control
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" className="ms-2" disabled={loading}>
            Send
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AIChatBot;
