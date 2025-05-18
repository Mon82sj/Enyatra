import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import WaveSurfer from 'wavesurfer.js';  // Import WaveSurfer.js
import './meets.css'; // Import the CSS file

function App() {
  const [story, setStory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [showWaveform, setShowWaveform] = useState(false);
  const [audioUrl, setAudioUrl] = useState('/story.mp3');
  const [showQuestions, setShowQuestions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Total time (in seconds)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mcqCorrect, setMcqCorrect] = useState(0);
  const [textCorrect, setTextCorrect] = useState(0);
  const [viewResult, setViewResult] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const waveformRef = useRef(null); // Reference for the waveform container
  const wavesurferRef = useRef(null); // Store the WaveSurfer instance

  useEffect(() => {
    fetch('http://localhost:5000/api/story')
      .then(res => res.json())
      .then(data => {
        setStory(data.story);
        const selected = selectQuestions(data.questions);
        setQuestions(selected);
        setAudioUrl('/audio/story.mp3');
      })
      .catch(err => console.error("Failed to fetch data:", err));
  }, []);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      // Initialize WaveSurfer
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current, // Set container for waveform
        waveColor: 'gray',
        progressColor: 'orange',
        barWidth: 3,
        barRadius: 2,
        cursorWidth: 2,
        cursorColor: 'navy',
        responsive: true,
        height: 100
      });

      // Load the audio file
      wavesurfer.load(audioUrl);

      // Store the wavesurfer instance for later usage
      wavesurferRef.current = wavesurfer;

      // Cleanup on unmount
      return () => wavesurfer.destroy();
    }
  }, [audioUrl]);

  const selectQuestions = (questions) => {
    const mcqs = questions.filter(q => q.type === 'mcq');
    const nonMcqs = questions.filter(q => q.type !== 'mcq');
    const selectedMcqs = getRandomItems(mcqs, 7);
    const selectedNonMcqs = getRandomItems(nonMcqs, 3);
    return [...selectedMcqs, ...selectedNonMcqs];
  };

  const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startAssessment = () => {
    setShowRulesModal(false);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      setTimeout(() => {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio started successfully ✅");
              setShowWaveform(true);
              // Play the waveform as well
              wavesurferRef.current.play();
            })
            .catch(error => {
              console.error("Audio play failed ❌", error);
            });
        }
      }, 100); // Delay of 100ms
    } else {
      console.error("audioRef is null at the time of play attempt");
    }
  };

  const handleAudioEnd = () => {
    console.log("Audio finished 🎶");
    setShowWaveform(false);

    setTimeout(() => {
      setStarted(true);
      setShowQuestions(true);
    }, 5000); // Wait before showing questions
  };

  useEffect(() => {
    if (started && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started]);

  const handleChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    let total = 0;
    let mcq = 0;
    let text = 0;
    const fb = {};

    questions.forEach(q => {
      const userAns = answers[q.id];
      const correctAns = q.answer;
      const isCorrect = userAns
        ? (q.type === 'mcq'
          ? userAns === correctAns
          : userAns.trim().toLowerCase() === correctAns.toLowerCase())
        : false;

      fb[q.id] = {
        isCorrect,
        correctAnswer: isCorrect ? null : correctAns
      };

      if (isCorrect) {
        if (q.type === 'mcq') {
          total += 5;
          mcq += 1;
        } else {
          total += 10;
          text += 1;
        }
      }
    });

    setScore(total);
    setMcqCorrect(mcq);
    setTextCorrect(text);
    setFeedback(fb);
    setSubmitted(true);
    setViewResult(true);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const attemptedCount = Object.keys(answers).length;
  const current = questions[currentQuestionIndex];

  if (viewResult) {
    return (
      <Container>
        <h1 className="text-center">🎧 Listening Skill Assessment</h1>
        <Card className="my-4 p-3">
          <h3>📊 Assessment Summary</h3>
          <p><strong>Total Questions:</strong> {questions.length}</p>
          <p><strong>Attempted:</strong> {attemptedCount}</p>
          <p><strong>MCQ Correct:</strong> {mcqCorrect}</p>
          <p><strong>Non-MCQ Correct:</strong> {textCorrect}</p>
          <p><strong>Score:</strong> {score} / 65</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Modal show={showRulesModal} onHide={() => setShowRulesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assessment Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>Listen to the audio carefully.</li>
            <li>The length of the audio is 2 minutes</li>
            <li>From that you have to answer following questions.</li>
            <li>After audio ends, questions will appear automatically.</li>
            <li>You have limited time to answer.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRulesModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={startAssessment}>
            Start Assessment
          </Button>
        </Modal.Footer>
      </Modal>

      <h1 className="text-center my-4">🎧 Listening Skill Assessment</h1>

      {audioUrl && (
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <audio ref={audioRef} onEnded={handleAudioEnd} style={{ display: 'none' }}>
      <source src={audioUrl} type="audio/mp3" />
    </audio>

    {showWaveform && (
      <div className="waveform-container">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`waveform-bar wave-${i % 14}`} // Cycle through 14 wave classes
          ></div>
        ))}
      </div>
    )}
  </div>
)}


{showQuestions && current && (
  <>
    <Row className="mb-3">
      <Col>
        <h3>⏱ Time Left: {formatTime(timeLeft)}</h3>
        <ProgressBar now={(timeLeft / 120) * 100} />
      </Col>
    </Row>

    <Card className="my-4 p-3">
      <h2>📝 Question {currentQuestionIndex + 1}</h2>
      <p>{current.question}</p>
      {current.type === 'mcq' ? (
        current.options.map((opt, i) => (
          <Row key={i} className="mb-2">
            <Col>
              <Button
                variant={answers[current.id] === opt ? 'primary' : 'outline-primary'}
                onClick={() => handleChange(current.id, opt)}
                style={{ width: '100%' }}
              >
                {opt}
              </Button>
            </Col>
          </Row>
        ))
      ) : (
        <input
          type="text"
          placeholder="Type your answer..."
          value={answers[current.id] || ''}
          onChange={(e) => handleChange(current.id, e.target.value)}
          className="form-control"
        />
      )}
      <Row className="mt-3">
        <Col>
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestionIndex(i => i - 1)}
            disabled={currentQuestionIndex === 0}
          >
            ⬅ Previous
          </Button>
        </Col>
        <Col className="text-right">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestionIndex(i => i + 1)}
              disabled={!answers[current.id]}
            >
              Next ➡
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={!Object.keys(answers).length === questions.length} // Disable if not all questions are answered
            >
              Submit
            </Button>
          )}
        </Col>
      </Row>
    </Card>
  </>
)}    </Container>
  );
}

export default App;
