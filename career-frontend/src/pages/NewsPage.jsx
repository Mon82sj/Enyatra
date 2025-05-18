import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EducationNews = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/education-news")
      .then(response => {
        setNews(response.data.articles || []);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching news:", error);
        setError("Failed to fetch news articles. Please try again later.");
      });
  }, []);

  const handleGoBack = () => {
    navigate("/student-dashboard");
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-end mb-3">
        <Button variant="secondary" onClick={handleGoBack}>
          ⬅ Back
        </Button>
      </div>

      <h2 className="mb-4 fw-bold">
        📚 Latest Education & Career News (India)
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {news.length === 0 ? (
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading news...</p>
          </Col>
        ) : (
          news.map((article, idx) => (
            <Col md={6} lg={4} className="mb-4" key={idx}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {article.source.name} •{" "}
                    {new Date(article.publishedAt).toLocaleString()}
                  </Card.Subtitle>
                  <Card.Text>{article.description}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-transparent border-0">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Read more →
                  </a>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default EducationNews;
