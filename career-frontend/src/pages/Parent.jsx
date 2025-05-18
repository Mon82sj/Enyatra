import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Badge, Container, Row, Col } from 'react-bootstrap';
import { BarChart3, UserRound, GraduationCap, School } from 'lucide-react';

const ParentDashboard = () => {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchDashboard(userData.id);
    }
  }, []);

  const fetchDashboard = async (parentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/parent-datas/${parentId}`);
      setChildren(response.data.children || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold">Welcome, {user?.fullName}</h2>
          <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </Col>
      </Row>

      <Row>
        {children.length === 0 ? (
          <Col>
            <Card className="p-4 shadow-sm text-center">
              <h5>No children records found.</h5>
            </Card>
          </Col>
        ) : (
          children.map((child) => (
            <Col md={6} lg={4} className="mb-4" key={child.id}>
              <Card className="shadow-sm rounded-4 p-3">
                <h5 className="mb-2">
                  <UserRound size={20} className="me-2" /> {child.name}
                </h5>
                <p><GraduationCap size={16} className="me-2" /> Grade: {child.grade}</p>
                <p><School size={16} className="me-2" /> School: {child.school}</p>

                <Badge bg={child.assessment_completed ? 'success' : 'secondary'} className="mb-3">
                  {child.assessment_completed ? 'Test Completed' : 'Test Pending'}
                </Badge>

                {child.report && (
                  <div className="mb-3">
                    <h6>Psychometric Test</h6>
                    <p><strong>Summary:</strong> {child.overall_analysisX}</p>
                    <div className="bg-light border rounded p-2 text-center">Radar Chart</div>
                  </div>
                )}

                {child.selfDiscovery && (
                  <div>
                    <h6>Self-Discovery Assessment</h6>
                    <p><strong>Self Awareness:</strong> {child.selfDiscovery.self_awareness_score} - {child.selfDiscovery.self_awareness_insight}</p>
                    <p><strong>Learning Style:</strong> {child.selfDiscovery.learning_style_score} - {child.selfDiscovery.learning_style_insight}</p>
                    <p><strong>Career Interest:</strong> {child.selfDiscovery.career_interest_score} - {child.selfDiscovery.career_interest_insight}</p>
                    <p><strong>Subject Preference:</strong> {child.selfDiscovery.subject_preference_score} - {child.selfDiscovery.subject_preference_insight}</p>
                  </div>
                )}
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default ParentDashboard;