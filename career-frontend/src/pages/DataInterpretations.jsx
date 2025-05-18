import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import Confetti from "react-confetti";
import {
  Container,
  Button,
  Table,
  Card,
  Spinner,
  Row,
  Col,
  Alert,
  ProgressBar,
} from "react-bootstrap";

const pastelColors = ["#7FB3D5", "#76D7C4", "#F1948A", "#F8C471", "#BB8FCE", "#F5B7B1"];


function DataInterpretations() {
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [aiFeedback, setAIFeedback] = useState("");

  useEffect(() => {
    let interval;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            autoSubmit();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, currentQuestionIndex]);

  const startGame = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/start-game");
      setSessionData(res.data);
      setGameStarted(true);
      setTimer(30);
      setScore(0);
    } catch (error) {
      console.error("Failed to start game:", error.message);
      alert("Failed to start game. Check console for details.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setLoading(true);

    const res = await axios.post("http://localhost:5000/api/submit-answer", {
      session_id: sessionData.session_id,
      question_index: currentQuestionIndex,
      user_answer: selectedAnswer,
    });

    if (res.data.is_correct) setScore((prev) => prev + 1);
    setLoading(false);

    if (res.data.next_question) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setTimer(30);
    } else {
      setGameOver(true);
      generateAIFeedback(score + (res.data.is_correct ? 1 : 0));
    }
  };

  const autoSubmit = async () => {
    setLoading(true);
    const res = await axios.post("http://localhost:5000/api/submit-answer", {
      session_id: sessionData.session_id,
      question_index: currentQuestionIndex,
      user_answer: selectedAnswer || "",
    });

    if (res.data.is_correct) setScore((prev) => prev + 1);
    setLoading(false);

    if (res.data.next_question) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setTimer(30);
    } else {
      setGameOver(true);
      generateAIFeedback(score + (res.data.is_correct ? 1 : 0));
    }
  };

  const generateAIFeedback = (finalScore) => {
    if (finalScore >= 8) setAIFeedback("🌟 Excellent Data Interpretation Skills!");
    else if (finalScore >= 5) setAIFeedback("🚀 Good job! But you can be faster.");
    else setAIFeedback("💪 Needs practice. Keep pushing!");
  };

  const renderChart = (dataset) => {
    const normalizedData = dataset.dataset.map((item, idx) => ({
      label: item.label || item.category || item.name || item.x || `Item ${idx + 1}`,
      value: item.value ?? item.amount ?? item.y ?? 0,
      color: pastelColors[idx % pastelColors.length],
    }));

    switch (dataset.dataset_type) {
      case "Table":
        return (
          <Table striped bordered hover responsive className="my-3">
            <thead>
              <tr>
                {Object.keys(dataset.dataset[0]).map((key, idx) => (
                  <th key={idx}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.dataset.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => <td key={i}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </Table>
        );
      case "Pie Chart":
        return (
          <ResponsiveContainer height={300}>
            <PieChart>
              <Pie data={normalizedData} dataKey="value" nameKey="label" outerRadius={100} label>
                {normalizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "Bar Chart":
        return (
          <ResponsiveContainer height={300}>
            <BarChart data={normalizedData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {normalizedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (!gameStarted) {
    return (
      <Container className="text-center mt-5">
        <h1>🧠 Data Interpretation Game</h1>
        <p className="text-muted">
          Test your skills with charts and tables. You have 30 seconds per question!
        </p>
        <Button variant="primary" onClick={startGame}>Start Game</Button>
      </Container>
    );
  }

  if (!sessionData) return <Container className="text-center"><Spinner animation="border" /></Container>;

  if (gameOver) {
    return (
      <Container className="text-center mt-5">
        <Confetti />
        <h2>🎉 Game Over!</h2>
        <p>Your Score: <strong>{score}</strong> / {sessionData.questions.length}</p>
        <Alert variant="info">{aiFeedback}</Alert>
        <Button variant="success" onClick={() => window.location.reload()}>Play Again</Button>
      </Container>
    );
  }

  const currentDataset = sessionData.datasets[currentQuestionIndex];
  const currentQuestion = sessionData.questions[currentQuestionIndex];

  return (
    <Container className="my-4">
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between">
            <span>Question {currentQuestionIndex + 1}</span>
            <span>⏱️ Timer: <strong style={{ color: timer <= 10 ? "red" : "black" }}>{timer}s</strong></span>
          </Card.Title>
          <ProgressBar now={(timer / 30) * 100} className="my-2" />
          {renderChart(currentDataset)}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>{currentQuestion.question_text}</Card.Title>
          <Row className="mt-3">
            {currentQuestion.options.map((option, idx) => (
              <Col xs={6} className="mb-2" key={idx}>
                <Button
                  variant={selectedAnswer === option ? "success" : "outline-secondary"}
                  className="w-100"
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </Button>
              </Col>
            ))}
          </Row>
          <div className="text-end">
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DataInterpretations;
