import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const ComprehensionQuickieGame = ({ difficulty, onGameEnd }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    axios.post('/api/generate-verbal-voyage', { gameType: 'Comprehension Quickie', difficulty })
      .then(res => {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(''));
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, [difficulty]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAnswers = () => {
    onGameEnd(questions, answers);
  };

  return (
    <Container>
      <h3>Comprehension Quickie Game</h3>
      <Form>
        {questions.map((question, index) => (
          <div key={index} className="mb-3">
            <h5>{question.paragraph}</h5>
            <Form.Control
              as="textarea"
              rows={3}
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
          </div>
        ))}
        <Button onClick={submitAnswers}>Submit</Button>
      </Form>
    </Container>
  );
};

export default ComprehensionQuickieGame;
