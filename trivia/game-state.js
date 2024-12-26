let players = [];

const QuestionTypes = {
  TRUE_FALSE: "TRUE_FALSE",
  NUMBER: "NUMBER",
  ORDER: "ORDER",
  DECADE: "DECENNIUM",
  COLOR: "COLOR",
  OPEN: "OPEN",
};

// Example data for questions
const questions = [
  {
    id: 1,
    type: QuestionTypes.TRUE_FALSE,
    question: "Which of these animals are mammals?",
    answers: [
      { alternative: "Dolphin", correct: true },
      { alternative: "Snake", correct: false },
      { alternative: "Elephant", correct: true },
      { alternative: "Lizard", correct: false },
      { alternative: "Bat", correct: true },
      { alternative: "Penguin", correct: false },
      { alternative: "Whale", correct: true },
      { alternative: "Crocodile", correct: false },
      { alternative: "Kangaroo", correct: true },
    ],
  },
  {
    id: 2,
    type: QuestionTypes.NUMBER,
    question: "How old where these artists when they died?",
    answers: [
      { alternative: "Kurt Cobain", correct: 27 },
      { alternative: "Jimi Hendrix", correct: 27 },
      { alternative: "Janis Joplin", correct: 27 },
      { alternative: "Jim Morrison", correct: 27 },
      { alternative: "Amy Winehouse", correct: 27 },
      { alternative: "Michael Jackson", correct: 50 },
      { alternative: "Prince", correct: 57 },
      { alternative: "David Bowie", correct: 69 },
      { alternative: "John Lennon", correct: 40 },
    ],
  },
  {
    id: 3,
    type: QuestionTypes.ORDER,
    question: "Rank these planets by their distance from the Sun. 1 is closest",
    answers: [
      { alternative: "Mercury", correct: 1 },
      { alternative: "Venus", correct: 2 },
      { alternative: "Neptune", correct: 8 },
      { alternative: "Mars", correct: 4 },
      { alternative: "Earth", correct: 3 },
      { alternative: "Pluto", correct: 9 },
      { alternative: "Uranus", correct: 7 },
      { alternative: "Jupiter", correct: 5 },
      { alternative: "Saturn", correct: 6 },
    ],
  },
  {
    id: 4,
    type: QuestionTypes.DECADE,
    question: "In which decade did these events occur?",
    answers: [
      { alternative: "Moon Landing", correct: 1960 },
      { alternative: "French Revolution", correct: 1780 },
      { alternative: "Fall of the Berlin Wall", correct: 1980 },
      { alternative: "Discovery of America", correct: 1490 },
      { alternative: "World War I", correct: 1910 },
      { alternative: "World War II", correct: 1930 },
      { alternative: "Industrial Revolution", correct: 1760 },
      { alternative: "Renaissance", correct: 1400 },
      { alternative: "Printing Press Invention", correct: 1440 },
    ],
  },
  {
    id: 5,
    type: QuestionTypes.COLOR,
    question: "What color is typically associated with these things?",
    answers: [
      { alternative: "Stop signs", correct: "red" },
      { alternative: "The sky on a clear day", correct: "blue" },
      { alternative: "Bananas", correct: "yellow" },
      { alternative: "Grass", correct: "green" },
      { alternative: "The sun", correct: "yellow" },
      { alternative: "Eggplants", correct: "purple" },
      { alternative: "Oranges", correct: "orange" },
      { alternative: "Snow", correct: "white" },
      { alternative: "Coal", correct: "black" },
    ],
  },
  {
    id: 6,
    type: QuestionTypes.OPEN,
    question: "What is the capital of...",
    answers: [
      { alternative: "France", correct: "Paris" },
      { alternative: "Germany", correct: "Berlin" },
      { alternative: "Spain", correct: "Madrid" },
      { alternative: "Italy", correct: "Rome" },
      { alternative: "Japan", correct: "Tokyo" },
      { alternative: "Canada", correct: "Ottawa" },
      { alternative: "Australia", correct: "Canberra" },
      { alternative: "Moscow", correct: "Russia" },
      { alternative: "Beijing", correct: "China" },
    ],
  },
];

const gameState = {
  currentQuestionIndex: 0,
  currentPlayerIndex: 0,
  roundActive: true,
  disabledAnswers: new Set(),
};

function initializeGameConfig() {
  const playerCountInput = document.getElementById('player-count');
  const playerNamesDiv = document.getElementById('player-names');
  const questionCountSpan = document.getElementById('question-count');
  const startGameBtn = document.getElementById('start-game-btn');
  
  // Show total questions
  questionCountSpan.textContent = questions.length;
  
  // Handle player count changes
  function updatePlayerInputs() {
    const count = parseInt(playerCountInput.value);
    playerNamesDiv.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const input = document.createElement('div');
      input.className = 'player-name-input';
      input.innerHTML = `
        <label for="player-${i}">Player ${i + 1} Name:</label>
        <input type="text" id="player-${i}" value="Player ${i + 1}">
      `;
      playerNamesDiv.appendChild(input);
    }
  }
  
  playerCountInput.addEventListener('change', updatePlayerInputs);
  
  // Initial player inputs
  updatePlayerInputs();
  
  // Handle game start
  startGameBtn.addEventListener('click', () => {
    const playerInputs = document.querySelectorAll('#player-names input');
    players = Array.from(playerInputs).map(input => ({
      name: input.value.trim() || input.placeholder,
      score: 0,
      isEliminated: false
    }));
    
    // Hide config, show game
    document.getElementById('game-config').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Start the game
    startGame();
  });
}

function updateUI() {
  // Update the scores display to use a table with current player indicator
  const scoresDiv = document.getElementById("scores");
  scoresDiv.innerHTML = `
    <table>
      <tbody>
        ${players.map((player, index) => `
          <tr>
            <td>${player.name} ${index === gameState.currentPlayerIndex ? '👈' : ''}</td>
            <td>${player.score}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const questionText = document.getElementById("question-text");
  const currentQuestion = questions[gameState.currentQuestionIndex];
  questionText.innerText = currentQuestion.question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = currentQuestion.answers
    .map(
      (answer, index) => {
        const isDisabled = gameState.disabledAnswers.has(index);
        const button = document.querySelector(`#answers button:nth-child(${index + 1})`);
        const buttonClass = button ? button.className : '';
        return `<button onclick="selectAnswer(${index})" 
          ${isDisabled ? 'disabled' : ''}
          class="${buttonClass}">${answer.alternative}</button>`;
      }
    )
    .join("");
}

function startGame() {
  players.forEach((player) => {
    player.score = 0;
    player.isEliminated = false;
  });
  gameState.currentQuestionIndex = 0;
  gameState.currentPlayerIndex = -1;
  nextTurn();
}

function createTrueFalseModal(question, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const text = document.createElement('p');
  text.textContent = question;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'modal-buttons';
  
  const trueButton = document.createElement('button');
  trueButton.textContent = 'True';
  trueButton.onclick = () => {
    document.body.removeChild(modal);
    callback(true);
  };
  
  const falseButton = document.createElement('button');
  falseButton.textContent = 'False';
  falseButton.onclick = () => {
    document.body.removeChild(modal);
    callback(false);
  };
  
  buttonContainer.appendChild(trueButton);
  buttonContainer.appendChild(falseButton);
  content.appendChild(text);
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  
  document.body.appendChild(modal);
}

function createColorModal(question, callback) {
  const colors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'white', 'black'];
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const text = document.createElement('p');
  text.textContent = question;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'modal-buttons color-buttons';
  
  colors.forEach(color => {
    const button = document.createElement('button');
    button.textContent = color;
    button.style.backgroundColor = color;
    button.style.color = ['white', 'yellow'].includes(color) ? 'black' : 'white';
    button.onclick = () => {
      document.body.removeChild(modal);
      callback(color);
    };
    buttonContainer.appendChild(button);
  });
  
  content.appendChild(text);
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  
  document.body.appendChild(modal);
}

function selectAnswer(answerIndex) {
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const currentPlayer = players[gameState.currentPlayerIndex];
  const selectedAnswer = currentQuestion.answers[answerIndex];
  const button = document.querySelector(`#answers button:nth-child(${answerIndex + 1})`);

  gameState.disabledAnswers.add(answerIndex);

  let isCorrect = false;
  
  switch (currentQuestion.type) {
    case QuestionTypes.TRUE_FALSE:
      createTrueFalseModal(
        `Is "${selectedAnswer.alternative}" correct?`,
        (answer) => {
          isCorrect = answer === selectedAnswer.correct;
          handleAnswer(isCorrect, button, currentPlayer);
        }
      );
      return;
    
    case QuestionTypes.COLOR:
      createColorModal(
        `What color is typically associated with ${selectedAnswer.alternative}?`,
        (answer) => {
          isCorrect = answer === selectedAnswer.correct;
          handleAnswer(isCorrect, button, currentPlayer);
        }
      );
      return;
      
    case QuestionTypes.NUMBER:
      // For NUMBER type, allow small margin of error (±2)
      const guess = parseInt(prompt("Enter your guess:"));
      isCorrect = Math.abs(guess - selectedAnswer.correct) <= 2;
      handleAnswer(isCorrect, button, currentPlayer);
      break;
      
    case QuestionTypes.ORDER:
      // For ORDER type, check if player's guess matches the correct order
      const orderGuess = parseInt(prompt("Enter position (1-9):"));
      isCorrect = orderGuess === selectedAnswer.correct;
      handleAnswer(isCorrect, button, currentPlayer);
      break;
      
    case QuestionTypes.DECADE:
      // For DECADE type, allow answers within the same decade
      const yearGuess = parseInt(prompt("Enter the decade (e.g., 1960):"));
      isCorrect = Math.floor(yearGuess / 10) === Math.floor(selectedAnswer.correct / 10);
      handleAnswer(isCorrect, button, currentPlayer);
      break;
      
    case QuestionTypes.OPEN:
      // For OPEN type, case-insensitive string comparison
      const answer = prompt("Enter your answer:").trim().toLowerCase();
      isCorrect = answer === selectedAnswer.correct.toLowerCase();
      handleAnswer(isCorrect, button, currentPlayer);
      break;
  }

  // ... rest of the function ...
}

// Add this helper function to reduce code duplication
function handleAnswer(isCorrect, button, currentPlayer) {
  button.classList.add(isCorrect ? 'correct' : 'incorrect');
  if (isCorrect) {
    updateInfoBox(`Right answer!`);
    currentPlayer.score++;
  } else {
    updateInfoBox(`Wrong answer!`);
    currentPlayer.isEliminated = true;
  }
  nextTurn();
}

function nextTurn() {
  // Find next non-eliminated player
  let nextIndex = gameState.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % players.length;
  } while (players[nextIndex].isEliminated && nextIndex !== gameState.currentPlayerIndex);

  gameState.currentPlayerIndex = nextIndex;

  const activePlayers = players.filter((player) => !player.isEliminated);
  if (activePlayers.length === 0) {
    endRound();
    return;
  }

  // Get the current player AFTER updating the index
  const currentPlayer = players[gameState.currentPlayerIndex];
  updateInfoBox(`${currentPlayer.name}'s turn!`);
  updateUI();
}

function passTurn() {
  const currentPlayer = players[gameState.currentPlayerIndex];
  currentPlayer.isEliminated = true;
  nextTurn();
}

function endRound() {
  updateInfoBox("Round ended!");
  players.forEach((player) => {
    console.log(`${player.name}: ${player.score}`);
  });

  gameState.currentQuestionIndex++;
  if (gameState.currentQuestionIndex >= questions.length) {
    updateInfoBox("Game over!");
    return;
  }
  gameState.disabledAnswers.clear();

  // Reset all players' elimination status
  players.forEach((player) => (player.isEliminated = false));
  
  // Set starting player to be the next player from last round's starter
  gameState.currentPlayerIndex = gameState.currentQuestionIndex % players.length - 1;
  
  updateInfoBox(`New round!`);
  // Update UI and show first player's turn
  nextTurn(); // Using nextTurn instead of just updateUI to properly set first player
}

function updateInfoBox(message) {
  const infoMessage = document.getElementById('info-message');
  infoMessage.textContent = message + '\n' + infoMessage.textContent;
}

document.getElementById("pass-button").onclick = passTurn;

initializeGameConfig();