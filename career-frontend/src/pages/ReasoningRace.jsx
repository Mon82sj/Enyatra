import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col,Button } from 'react-bootstrap';

// Import the logos for the games
import wordMatchLogo from '../assets/word-match.png';
import fillInTheBlankLogo from '../assets/fill-up.jpg';
import sentenceBuilderLogo from '../assets/sentence-builder.png';
import HanoiTowerLogo from '../assets/hanoi.png';
import SudokuLogo from '../assets/sudoku-img.png';
import NonogramLogo from '../assets/nonogram-img.jpg';

const VerbalVoyage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/game-home-page");
  };
  const handleGameSelection = (selectedGame) => {
    // Navigate to the specific game page by transforming the name
    navigate(`/${selectedGame.toLowerCase().replace(/\s+/g, '')}`);
  };

  return (
    <Container className="text-center">
      <Button variant="secondary" onClick={handleGoBack} style={{marginLeft:"90%"}}>
                ⬅ Back
              </Button>
      <h1>Welcome to Reasoning Race Games</h1><br/><br/>
      <Row className="justify-content-center">
      <Col md={2} onClick={() => navigate('/sudoku')}>
          <img
            src={SudokuLogo}
            alt="Sudoku"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/>
          <h2>Sudoku</h2>
        </Col>
        <Col md={2} onClick={() => navigate('/nonogram')}>
          <img
            src={NonogramLogo}
            alt="Word Riddle Game"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/><h2>Nonogram</h2>
        </Col>
        <Col md={2} onClick={() => navigate('/nonogram')}>
          <img
            src={HanoiTowerLogo}
            alt="Word Riddle Game"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/><h2>Hanoi Tower</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default VerbalVoyage;
