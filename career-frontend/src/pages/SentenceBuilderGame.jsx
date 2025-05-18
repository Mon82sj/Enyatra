import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const SentenceBuilderGame = ({ difficulty, onGameEnd }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    axios.post('/api/generate-verbal-voyage', { gameType: 'Sentence Builder', difficulty })
      .then(res => {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill([]));
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, [difficulty]);

  const handleAnswerChange = (index, newOrder) => {
    const newAnswers = [...answers];
    newAnswers[index] = newOrder;
    setAnswers(newAnswers);
  };

  const submitAnswers = () => {
    onGameEnd(questions, answers);
  };

  return (
    <Container>
      <h3>Sentence Builder Game</h3>
      <Form>
        {questions.map((question, index) => (
          <div key={index} className="mb-3">
            <h5>{question.sentence}</h5>
            <Form.Control
              as="textarea"
              rows={2}
              value={answers[index].join(' ')}
              onChange={(e) => handleAnswerChange(index, e.target.value.split(' '))}
            />
          </div>
        ))}
        <Button onClick={submitAnswers}>Submit</Button>
      </Form>
    </Container>
  );
};

export default SentenceBuilderGame;
