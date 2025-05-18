import React, { useState, useEffect } from "react";
import { Button, Modal, ProgressBar, Card, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import Confetti from "react-confetti";
import { Mic } from 'lucide-react';
import school from "../assets/school.jpg";

const DescribeImage = () => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  const imageUrl ="https://static.vecteezy.com/system/resources/previews/015/529/452/original/100th-day-of-school-cartoon-colored-clipart-free-vector.jpg"; // Your image link here

  const handleStartActivity = () => {
    setShowModal(false);
    setImageVisible(true);
    setTimeLeft(15);
    setTimerActive(true);
    console.log("Timer Started");
  };

  const startListening = async () => {
    setIsListening(true);
    try {
      const response = await axios.post("http://localhost:5001/capture-speech");
      const { text, evaluation } = response.data;
      setSpeechText(text);
      setEvaluation(evaluation);
      setConfetti(true);
    } catch (error) {
      console.error("Error capturing speech:", error);
      setSpeechText("Failed to capture speech.");
    } finally {
      setIsListening(false);
    }
  };

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      clearInterval(timer);
      setTimerActive(false);
      setImageVisible(false);
      startListening();  // Start recording when timer hits 0
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {confetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      {/* Modal for Rules */}
      <Modal show={showModal} onHide={() => {}}>
        <Modal.Header>
          <Modal.Title>Rules & Regulations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You have 15 seconds to think about the image that will be shown. After that,
            you will have 2 minutes to describe the image. The microphone will
            automatically start recording. The AI will analyze your speech and provide feedback.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleStartActivity}>Start Activity</Button>
        </Modal.Footer>
      </Modal>

      
      

      {/* Image */}
      {imageVisible && timeLeft > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2>Collect your thoughts about<br/> the image to describe</h2><br/>
          <img src={school} alt="Image to describe" style={{ width: "100%", maxHeight: "300px" }} /><br/><br/>
        </div>
      )}
{/* Progress Bar */}
{timerActive && (
        <ProgressBar
          animated
          now={(timeLeft / 15) * 100}
          label={`${timeLeft}s to think`}
          style={{ marginBottom: "20px", width: "60%", margin: "auto" }}
        />
      )}

      {/* Listening */}
      {!timerActive && isListening && (
        <div>
         <div>
    <h2>Start Speaking Now!</h2>
    <div className="listening-mic">
      <Mic size={64} color="#ff4d4f" />
      <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Listening...</div>
    </div>
  </div>
        </div>
      )}

      {/* Displaying Speech Evaluation */}
      {evaluation && (
        <Container>
          <Row>
            <Col>
              <Card>
                <Card.Header>Repeated Words</Card.Header>
                <Card.Body>{evaluation.repeatedWords}</Card.Body>
              </Card><br/>
            </Col>
            <Col>
              <Card>
                <Card.Header>Suggested Improvements</Card.Header>
                <Card.Body>{evaluation.improvements}</Card.Body>
              </Card><br/>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Header>Lagging Areas</Card.Header>
                <Card.Body>{evaluation.laggingAreas}</Card.Body>
              </Card><br/>
            </Col>
            <Col>
              <Card>
                <Card.Header>Accuracy</Card.Header>
                <Card.Body>{evaluation.accuracy}</Card.Body>
              </Card><br/>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Header>Reliability</Card.Header>
                <Card.Body>{evaluation.reliability}</Card.Body>
              </Card><br/>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default DescribeImage;
