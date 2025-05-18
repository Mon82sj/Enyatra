import React, { useState } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  ListGroup
} from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';

const CompareBox = () => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  const handleCompare = async () => {
    if (!inputA || !inputB) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputA, inputB }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Something went wrong.' });
    }

    setLoading(false);
  };

  const handleGoBack = () => {
    navigate("/student-dashboard"); // Navigate back to previous page
  };
  

  return (
    <Container className="py-5">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
      ⬅ Back
    </Button><br/><br/><br/>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-4 shadow-lg">
        
          <h2 className="text-center text-primary mb-3">
            🔍 Compare Career / Courses / Roles
          </h2>
          <p className="text-center text-muted mb-4">
            Streams, Careers, Subjects — Get AI-powered comparisons
          </p>

          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Control
                  placeholder="Enter first topic"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="Enter second topic"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                />
              </Col>
            </Row>
            <div className="text-center">
              <Button variant="info" onClick={handleCompare} disabled={loading}>
                {loading ? <Spinner size="sm" animation="border" /> : 'Compare Now'}
              </Button>
            </div>
          </Form>

          {result?.error && (
            <Alert variant="danger" className="mt-4 text-center">
              {result.error}
            </Alert>
          )}

          {result && !result.error && result.A && result.B && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-5"
            >
              <h4 className="text-center text-success mb-4">
                📊 Here's the Comparison
              </h4>
              <Row>
                {[{ key: 'A', title: inputA }, { key: 'B', title: inputB }].map(({ key, title }) => {
                  const info = result[key];
                  if (!info) return null;

                  return (
                    <Col md={6} key={key}>
                      <Card className="mb-4 shadow-sm border-info">
                        <Card.Header className="bg-info text-white text-center">
                          <h5>{info.title || title}</h5>
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item>
                              <strong>Reason:</strong> {info.reason || 'N/A'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Avg Salary:</strong> ₹{info.salary || 'N/A'}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Eligibility:</strong> {info.exam_eligibility || 'N/A'}
                            </ListGroup.Item>
                            <ListGroup.Item>
  <strong>Entrance Exams:</strong><br />
  {Array.isArray(info.entrance_exams)
    ? info.entrance_exams.map((exam, i) => <div key={i}>• {exam}</div>)
    : (info.entrance_exams || 'N/A').split(',').map((exam, i) => <div key={i}>• {exam.trim()}</div>)
  }
</ListGroup.Item>

<ListGroup.Item>
  <strong>Top Companies:</strong><br />
  {Array.isArray(info.companies)
    ? info.companies.map((comp, i) => <div key={i}>• {comp}</div>)
    : (info.companies || 'N/A').split(',').map((comp, i) => <div key={i}>• {comp.trim()}</div>)
  }
</ListGroup.Item>

<ListGroup.Item>
  <strong>Common Roles:</strong><br />
  {Array.isArray(info.roles)
    ? info.roles.map((role, i) => <div key={i}>• {role}</div>)
    : (info.roles || 'N/A').split(',').map((role, i) => <div key={i}>• {role.trim()}</div>)
  }
</ListGroup.Item>

                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </Container>
  );
};

export default CompareBox;
