import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, InputGroup, FormControl, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/ParentCommunityPage.css"
const ParentCommunityPage = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all'); // Filter for all, week, or month
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch messages based on the selected filter
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/community-messages?filter=${filter}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]); // Re-fetch messages when filter changes

  // Post a new message
  const handlePostMessage = async () => {
    if (!user || !messageText.trim()) return;

    const messageData = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      message: messageText,
    };

    try {
      const response = await fetch("http://localhost:5000/api/community-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setMessageText(''); // Clear message input
        fetchMessages(); // Refresh the message list
      } else {
        console.error("Failed to post message");
      }
    } catch (error) {
      console.error("Error posting message:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <Container className="py-4">
        <h2>Parent's Community Spaces</h2>
        <h6>Share your valuable insights, queries, improvements and provide your valuable feedbacks here..</h6>
      {/* Message Filter */}
      <Row className="mb-4">
        <Col>
          <Form.Select value={filter} onChange={handleFilterChange}>
            <option value="all">All Messages</option>
            <option value="week">Messages from the Last Week</option>
            <option value="month">Messages from the Last Month</option>
          </Form.Select>
        </Col>
      </Row>
      <Row>
        <Col className="chat-container">
        {[...messages].reverse().map((message) => (
  <div 
    key={message.id} 
    className={`message-bubble ${message.user_id === user.id ? 'sent' : 'received'}`}
  >
    <div className="message-header">
      <strong>{message.full_name}</strong>
      <small className="text-muted"> {new Date(message.created_at).toLocaleString()}</small>
    </div>
    <div className="message-body">{message.message}</div>
  </div>
))}

        </Col>
      </Row>
      {/* Post a New Message */}
      <Row className="mb-4">
        <Col>
          <InputGroup>
            <FormControl
              as="textarea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Post a message"
              rows={3}
            />
            <Button variant="primary" onClick={handlePostMessage}>
              Post
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default ParentCommunityPage;
