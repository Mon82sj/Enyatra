import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

const skillTasks = [
  { skill: "Logical Reasoning", task: "Solving puzzles" },
  { skill: "Numerical Ability", task: "Calculating discounts" },
  { skill: "Verbal Ability", task: "Understanding passages" },
  { skill: "Spatial Ability", task: "Reading maps" }
];

const shuffledTasks = [...skillTasks].sort(() => 0.5 - Math.random());

const AptitudeAssessment = () => {
  const [matches, setMatches] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleMatch = (skill, task) => {
    setMatches({ ...matches, [skill]: task });
  };

  const handleSubmit = () => {
    const isCorrect = skillTasks.every(
      (pair) => matches[pair.skill] === pair.task
    );
    setSubmitted(true);
    if (isCorrect) {
      setShowConfetti(true);
    }
  };

  const resetGame = () => {
    setMatches({});
    setSubmitted(false);
    setShowConfetti(false);
  };

  return (
    <Container className="mt-4 text-center">
      {showConfetti && <Confetti width={width} height={height} />}
      <h2 className="mb-4">🧠 Match the Aptitude Skill</h2>
      <Row>
        <Col md={6}>
          <h5>Skills</h5>
          {skillTasks.map(({ skill }) => (
            <Card className="p-2 m-2" key={skill}>
              <strong>{skill}</strong>
              <select
                className="form-select mt-2"
                value={matches[skill] || ""}
                onChange={(e) => handleMatch(skill, e.target.value)}
                disabled={submitted}
              >
                <option value="">Select Task</option>
                {shuffledTasks.map(({ task }) => (
                  <option key={task} value={task}>
                    {task}
                  </option>
                ))}
              </select>
            </Card>
          ))}
        </Col>
        <Col md={6}>
          <h5>Task Options</h5>
          {shuffledTasks.map(({ task }) => (
            <Card className="p-2 m-2" key={task}>
              {task}
            </Card>
          ))}
        </Col>
      </Row>
      <div className="mt-4">
        <Button variant="success" onClick={handleSubmit} disabled={submitted}>
          ✅ Submit
        </Button>{" "}
        <Button variant="secondary" onClick={resetGame}>
          🔄 Reset
        </Button>
      </div>
      {submitted && (
        <div className="mt-3">
          {skillTasks.every((pair) => matches[pair.skill] === pair.task) ? (
            <h4 className="text-success">🎉 All correct! Great job!</h4>
          ) : (
            <h4 className="text-danger">❌ Some matches are incorrect. Try again!</h4>
          )}
        </div>
      )}
    </Container>
  );
};

export default AptitudeAssessment;
