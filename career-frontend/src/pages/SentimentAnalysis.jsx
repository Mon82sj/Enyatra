import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];
const EMOTION_COLORS = ["#007bff", "#dc3545", "#ffc107", "#6f42c1", "#17a2b8", "#28a745"];

const SentimentDashboard = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [role, setRole] = useState("all");
  const [from, setFrom] = useState("2024-01-01");
  const [to, setTo] = useState("2025-12-31");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await axios.get("http://localhost:5000/api/sentiment-analysis", {
      params: { role, from, to }
    });
    setSentimentData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="p-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <h2 className="text-center mb-4">📊 Sentiment & Emotion Analysis</h2>

      <Form className="mb-4" onSubmit={(e) => { e.preventDefault(); fetchData(); }}>
        <Row>
          <Col md={3}>
            <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Col>
          <Col md={3}>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="counselor">Counselor</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Analyze"}
            </Button>
          </Col>
        </Row>
      </Form>

      {sentimentData && (
        <>
          <Row>
            <Col md={6}>
              <h5>Sentiment Distribution</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={Object.entries(sentimentData.sentiments).map(([k, v]) => ({ name: k, value: v }))}
                    dataKey="value" nameKey="name" label outerRadius={100}>
                    {COLORS.map((color, idx) => <Cell key={idx} fill={color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>

            <Col md={6}>
              <h5>Emotion Breakdown</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={Object.entries(sentimentData.emotions).map(([k, v]) => ({ name: k, value: v }))}
                    dataKey="value" nameKey="name" label outerRadius={100}>
                    {EMOTION_COLORS.map((color, idx) => <Cell key={idx} fill={color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <h5 className="mt-5">Sentiment Trend Over Time</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentData.timeline}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#28a745" />
              <Line type="monotone" dataKey="neutral" stroke="#ffc107" />
              <Line type="monotone" dataKey="negative" stroke="#dc3545" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Container>
  );
};

export default SentimentDashboard;
