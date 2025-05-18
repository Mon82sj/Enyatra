import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col,Button } from 'react-bootstrap';

// Import the logos for the games
import wordMatchLogo from '../assets/word-match.png';
import fillInTheBlankLogo from '../assets/fill-up.jpg';
import sentenceBuilderLogo from '../assets/sentence-builder.png';
import chartLogo from '../assets/chart.png';
import DandC from '../assets/DescribeandConquer.png';
import HearandHustle from '../assets/hearand hustle.jpg';

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
      <h1>Welcome to Skill Shoot Games</h1><br/><br/>
      <Row className="justify-content-center">
      <Col md={2} onClick={() => navigate('/describe-image')}>
          <img
            src={DandC}
            alt="Describe and Conquer"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/>
          <h3>Describe & Conquer</h3>
        </Col>
        <Col md={2} onClick={() => navigate('/listening-activity')}>
          <img
            src={HearandHustle}
            alt="Listening Activity"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/><h3>Hear & Hustle</h3>
        </Col>
        <Col md={2} onClick={() => navigate('/listening-activity')}>
          <img
            src={chartLogo}
            alt="Listening Activity"
            style={{ width: '100%', cursor: 'pointer',borderRadius:"20px" }}
          /><br/><br/><h3>Chart Sniper</h3>
        </Col>
      </Row>
    </Container>
  );
};

export default VerbalVoyage;
