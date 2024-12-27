const defaultPlayerNames = ["Ida", "Ignacio", "Ada", "Lukas"];

const QuestionTypes = {
  TRUE_FALSE: "TRUE_FALSE",
  NUMBER: "NUMBER",
  ORDER: "ORDER",
  DECADE: "DECADE",
  COLOR: "COLOR",
  OPEN: "OPEN",
};

// make sure to import questions.js with the following format:
// const questions: Array<{
//   id: 1,
//   type: QuestionTypes.TRUE_FALSE,
//   question: "Which of these animals are mammals?",
//   answers: Array<{ alternative: string, correct: boolean | string }>,
// }>

const gameState = {
  currentQuestionIndex: 0,
  currentPlayerIndex: 0,
  roundActive: true,
  disabledAnswers: new Set(),
  players: [],
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
        <label for="player-${i}">Player ${i + 1}:</label>
        <input type="text" id="player-${i}" value="${defaultPlayerNames[i%defaultPlayerNames.length]}" placeholder="Name ${i + 1}">
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
    gameState.players = Array.from(playerInputs).map(input => ({
      name: input.value.trim() || input.placeholder,
      score: 0,
      roundScores: [],
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
  console.log(gameState);
  const scoresDiv = document.getElementById("scores");
  scoresDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Player</th>
          ${Array(gameState.currentQuestionIndex + 1)
            .fill()
            .map((_, i) => `<th>${i + 1}.</th>`)
            .join('')}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${gameState.players.map((player, index) => `
          <tr>
            <td>${player.name} ${index === gameState.currentPlayerIndex ? '👈' : ''}</td>
            ${Array(gameState.currentQuestionIndex + 1)
              .fill()
              .map((_, i) => `<td>${player.roundScores[i]}</td>`)
              .join('')}
            <td>${player.score}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const questionText = document.getElementById("question-text");
  const currentQuestion = questions[gameState.currentQuestionIndex];
  questionText.innerText = `${gameState.currentQuestionIndex + 1}. ${currentQuestion.question}`;

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
  // Shuffle questions
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  gameState.players.forEach((player) => {
    player.score = 0;
    player.roundScores = [0];
    player.isEliminated = false;
  });
  gameState.currentQuestionIndex = 0;
  gameState.currentPlayerIndex = -1;
  nextTurn();
}

function createTrueFalseModal(question, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const text = document.createElement('p');
  text.textContent = question;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'modal-buttons';
  
  const trueButton = document.createElement('button');
  trueButton.textContent = '👍';
  trueButton.onclick = () => {
    document.body.removeChild(modal);
    callback(true);
  };
  
  const falseButton = document.createElement('button');
  falseButton.textContent = '👎';
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
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
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

function createNumberInputModal(question, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  const text = document.createElement('p');
  text.textContent = question;
  
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'number-input';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'modal-buttons';
  
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.className = 'submit-button';
  submitButton.onclick = () => {
    document.body.removeChild(modal);
    callback(input.value);
  };
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitButton.click();
    }
  });
  
  buttonContainer.appendChild(submitButton);
  content.appendChild(text);
  content.appendChild(input);
  content.appendChild(buttonContainer);
  modal.appendChild(content);
  
  document.body.appendChild(modal);
  input.focus();
}

function selectAnswer(answerIndex) {
  const currentQuestion = questions[gameState.currentQuestionIndex];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
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
      createNumberInputModal(
        `How old was ${selectedAnswer.alternative}?`,
        (answer) => {
          isCorrect = Math.abs(parseInt(answer) - selectedAnswer.correct) <= 2;
          handleAnswer(isCorrect, button, currentPlayer);
        }
      );
      return;
      
    case QuestionTypes.ORDER:
      createNumberInputModal(
        `Enter position (1-9) for ${selectedAnswer.alternative}:`,
        (answer) => {
          isCorrect = parseInt(answer) === selectedAnswer.correct;
          handleAnswer(isCorrect, button, currentPlayer);
        }
      );
      return;
      
    case QuestionTypes.DECADE:
      createNumberInputModal(
        `Enter the decade (e.g., 1990) for ${selectedAnswer.alternative}:`,
        (answer) => {
          isCorrect = Math.floor(parseInt(answer) / 10) === Math.floor(selectedAnswer.correct / 10);
          handleAnswer(isCorrect, button, currentPlayer);
        }
      );
      return;
      
    case QuestionTypes.OPEN:
      const answer = prompt("Enter your answer:");
      if (answer === null) return; // Cancel clicked
      isCorrect = answer.trim().toLowerCase() === selectedAnswer.correct.toLowerCase();
      handleAnswer(isCorrect, button, currentPlayer);
      break;
  }

  // ... rest of the function ...
}

// Add this helper function to reduce code duplication
function handleAnswer(isCorrect, button, currentPlayer) {
  button.classList.add(isCorrect ? 'correct' : 'incorrect');
  if (isCorrect) {
    updateInfoBox(`${currentPlayer.name} answered correctly: ${button.textContent} ✅`);
    currentPlayer.roundScores[gameState.currentQuestionIndex]++;
  } else {
    updateInfoBox(`${currentPlayer.name} answered incorrectly: ${button.textContent} ❌`);
    currentPlayer.isEliminated = true;
    currentPlayer.roundScores[gameState.currentQuestionIndex] = 0;
  }

  // Check if all answers have been selected
  const currentQuestion = questions[gameState.currentQuestionIndex];
  if (gameState.disabledAnswers.size >= currentQuestion.answers.length) {
    endRound();
  } else {
    nextTurn();
  }
}

function nextTurn() {
  // Find next non-eliminated player
  let nextIndex = gameState.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % gameState.players.length;
  } while (gameState.players[nextIndex].isEliminated && nextIndex !== gameState.currentPlayerIndex);

  gameState.currentPlayerIndex = nextIndex;

  const activePlayers = gameState.players.filter((player) => !player.isEliminated);
  if (activePlayers.length === 0) {
    endRound();
    return;
  }

  // Get the current player AFTER updating the index
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  updateInfoBox(`${currentPlayer.name}'s turn!`);
  updateUI();
}

function passTurn() {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  currentPlayer.isEliminated = true;
  currentPlayer.score += currentPlayer.roundScores[gameState.currentQuestionIndex];
  nextTurn();
}

function endRound() {
  updateInfoBox("Round ended!");

  // Make round scores permanent for non-eliminated players
  gameState.players.forEach((player) => {
    if (!player.isEliminated) {
      player.score += player.roundScores[gameState.currentQuestionIndex];
      player.roundScores.push(0);
    }
    player.roundScores.push(0);
    player.isEliminated = false;
  });

  gameState.currentQuestionIndex++;
  if (gameState.currentQuestionIndex >= questions.length) {
    updateInfoBox("Game over!");
    document.querySelectorAll('button').forEach(button => {
      button.disabled = true;
    });
    return;
  }
  gameState.disabledAnswers.clear();
  
  // Set starting player to be the next player from last round's starter
  gameState.currentPlayerIndex = gameState.currentQuestionIndex % gameState.players.length - 1;
  
  updateInfoBox(`New round!`);
  nextTurn();
}

function updateInfoBox(message) {
  const infoMessage = document.getElementById('info-message');
  infoMessage.textContent = message + '\n' + infoMessage.textContent;
}

document.getElementById("pass-button").onclick = passTurn;

initializeGameConfig();