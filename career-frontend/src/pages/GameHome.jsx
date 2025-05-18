// src/components/Home.js
import React from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/student-dashboard");
  };
  return (
    <Container className="mt-5">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                ⬅ Back
              </Button>
      <h1 className="text-center mb-4">Welcome to Career Guidance Games</h1>
      <Row>
        <Col md={4}>
          <Card className="mb-4 shadow-lg">
            <Card.Header className="bg-primary text-white">Verbal Voyage</Card.Header>
            <Card.Body>
              <h3>"Words are your compass — sail bravely through uncharted seas of imagination."</h3><br/>
              {/* Add more buttons as you create other career-related games */}
              <Button variant="outline-primary" onClick={() => navigate('/verbal-voyage')} >Let's Sail</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-lg">
            <Card.Header className="bg-warning text-white">Reasoning Race</Card.Header>
            <Card.Body>
              <h3>"Speed meets strategy — let your mind race toward victory."</h3><br/><br/>
              <Button variant="outline-warning" onClick={() => navigate('/reasoning-race')}>Start Race</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-lg">
            <Card.Header className="bg-danger text-white">Skill Shoot</Card.Header>
            <Card.Body>
              <h3>"Sharpen your aim, master your game — your skills are your greatest weapon."</h3><br/><br/>
              {/* Add more buttons as you create other skill-based games */}
              <Button variant="outline-danger" onClick={() => navigate('/skill-shoot')}>Let's Smash</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
