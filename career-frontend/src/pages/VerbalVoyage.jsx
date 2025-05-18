import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col,Button } from 'react-bootstrap';

// Import the logos for the games
import wordMatchLogo from '../assets/word-match.png';
import fillInTheBlankLogo from '../assets/fill-up.jpg';
import sentenceBuilderLogo from '../assets/sentence-builder.png';
import comprehensionLogo from '../assets/comprehension.jpg';
import wordRiddleLogo from '../assets/word-riddle.png';
import CareerJalebiLogo from '../assets/career-jalebi-ai.png';

const VerbalVoyage = () => {
  const navigate = useNavigate();

  const handleGameSelection = (selectedGame) => {
    // Navigate to the specific game page by transforming the name
    navigate(`/${selectedGame.toLowerCase().replace(/\s+/g, '')}`);
  };
  const handleGoBack = () => {
    navigate("/game-home-page");
  };
  return (
    <Container className="text-center">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                ⬅ Back
              </Button>
      <h1>Welcome to Verbal Voyage Games</h1><br/><br/>
      <Row className="justify-content-center">
      <Col md={2} onClick={() => navigate('/career-jalebi')}>
          <img
            src={CareerJalebiLogo}
            alt="Career Jalebi Game"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/>
          <h2>Career Jalebi</h2>
        </Col>
        <Col md={2} onClick={() => handleGameSelection('Word Riddle')}>
          <img
            src={wordRiddleLogo}
            alt="Word Riddle Game"
            style={{ width: '104%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/><h2>Word Riddle</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default VerbalVoyage;
