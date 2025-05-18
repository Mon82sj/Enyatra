import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CheckCircle, RefreshCcw, Lightbulb, XCircle } from "lucide-react"; // Added XCircle for clear button
import Confetti from "react-confetti";
const CareerJalebi = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [coins, setCoins] = useState(100);
  const [hintCount, setHintCount] = useState(3);
  const [usedLetters, setUsedLetters] = useState([]);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [letterCount, setLetterCount] = useState({}); // Track how many times each letter has been used
  const [celebration, setCelebration] = useState(false); // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPuzzleBatch();
  }, []);

  const fetchPuzzleBatch = async () => {
    const response = await fetch("http://localhost:5000/api/puzzles");
    const data = await response.json();
    setPuzzles(data.puzzles);
    setCurrentPuzzleIndex(0);
    setAnswer(data.puzzles[0].answer.replace(/ /g, "")); // Removing spaces
    setLetters(shuffle(data.puzzles[0].answer.replace(/ /g, "").split(""))); // Removing spaces
  };

  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const handleLetterClick = (letter) => {
    // Don't allow clicking the letter if it's already been used the max number of times
    const countUsed = letterCount[letter] || 0;
    const maxAllowed = answer.split(letter).length - 1;

    if (countUsed >= maxAllowed) return; // If used max number of times, don't allow it

    setUsedLetters((prev) => [...prev, letter]);

    // Update letter usage count
    setLetterCount((prev) => ({
      ...prev,
      [letter]: countUsed + 1,
    }));

    const slots = document.querySelectorAll(".letter-slot");
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].value) {
        slots[i].value = letter;
        break;
      }
    }
  };

  const handleSubmit = () => {
    const userAnswer = Array.from(document.querySelectorAll(".letter-slot"))
      .map((slot) => slot.value)
      .join("");
  
    if (userAnswer === answer) {
      setFeedback("✅ Correct! You earned 10 coins.");
      setCoins(coins + 10);
      setAnsweredCorrectly(true);
  
      // If this is the last puzzle, trigger celebration
      const isLastPuzzle = currentPuzzleIndex === puzzles.length - 1;
  
      if (isLastPuzzle) {
        setShowConfetti(true);
        setFeedback("🎉 You've completed all puzzles!");
      }
  
      setTimeout(() => {
        if (!isLastPuzzle) {
          moveToNextPuzzle();
        }
      }, 1500);
    } else {
      setFeedback("❌ Incorrect, try again!");
    }
  };
  

  const moveToNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      const nextPuzzle = puzzles[currentPuzzleIndex + 1];
      setAnswer(nextPuzzle.answer.replace(/ /g, ""));
      setLetters(shuffle(nextPuzzle.answer.replace(/ /g, "").split("")));
      setUsedLetters([]);
      setFeedback("");
      setAnsweredCorrectly(false);
      setLetterCount({}); // Reset letter usage count
      clearInputs(); // Clear filled inputs
    } else {
      setFeedback("🎉 You've completed all puzzles!");
      setCelebration(true); // Start celebration
    }
  };

  const clearInputs = () => {
    const slots = document.querySelectorAll(".letter-slot");
    slots.forEach(slot => slot.value = ""); // Clear all input fields
  };

  const handleHint = () => {
    if (hintCount > 0 && coins >= 5) {
      const firstEmptySlot = document.querySelector(".letter-slot:not([data-filled='true'])");
      if (firstEmptySlot) {
        const index = firstEmptySlot.dataset.index;
        firstEmptySlot.value = answer[index];
        firstEmptySlot.setAttribute("data-filled", "true");

        setHintCount(hintCount - 1);
        setCoins(coins - 5);

        // Disable the corresponding letter below the puzzle
        const letter = answer[index];
        setLetters(letters.filter(l => l !== letter)); // Remove the used letter
      }
    }
  };

  const handleRetry = () => {
    setUsedLetters([]);
    setFeedback("");
    setAnsweredCorrectly(false);
    setLetters(shuffle(answer.replace(/ /g, "").split("")));
    setLetterCount({});
  };

  const handleClear = () => {
    clearInputs();
    setUsedLetters([]);
    setFeedback("");
    setAnsweredCorrectly(false);
    setLetterCount({});
  };

  return (
    <Container className="text-center mt-4">
    <h2>Career Jalebi Game</h2>
    {showConfetti && <Confetti numberOfPieces={300} />}
    <Card className="mt-4" style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
      <h5>Clue: {puzzles[currentPuzzleIndex]?.clue}</h5>
      <div id="answerDisplay" style={{ marginBottom: "20px" }}>
        {Array.from(answer).map((_, index) => (
          <input
            key={index}
            className="letter-slot"
            data-index={index}
            style={{
              width: "40px",
              height: "40px",
              textAlign: "center",
              fontSize: "20px",
              margin: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            maxLength={1}
            placeholder="?"
          />
        ))}
      </div>
      <div className="letters" style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        {letters.map((letter, index) => (
          <Button
            key={index}
            variant="outline-primary"
            onClick={() => handleLetterClick(letter)}
            disabled={letterCount[letter] >= answer.split(letter).length - 1}
          >
            {letter}
          </Button>
        ))}
      </div>
      <div>
        <Button variant="success" onClick={handleSubmit} className="mt-3">
          <CheckCircle size={18} /> Submit
        </Button>
        <Button
          variant="info"
          onClick={handleHint}
          disabled={hintCount <= 0 || coins < 5}
          className="mt-3 ms-3"
        >
          <Lightbulb size={18} /> Hint ({hintCount})
        </Button>
        <Button variant="warning" onClick={handleRetry} className="mt-3 ms-3">
          <RefreshCcw size={18} /> Retry
        </Button>
        <Button variant="danger" onClick={handleClear} className="mt-3 ms-3">
          <XCircle size={18} /> Clear
        </Button>
      </div>
      <div className="feedback" style={{ marginTop: "20px" }}>{feedback}</div>
      <div>Coins: {coins}</div>
    </Card>
  </Container>
  
);
};

export default CareerJalebi;
