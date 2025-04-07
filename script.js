let playerHP = 50, enemyHP = 50;
let tymonCount = 3;
let playerName = "";
const DAMAGE_MULTIPLIER = 5;
const gameDiv = document.getElementById('game');

// Function to sample a normally distributed random number using Box–Muller transform.
function normalRandom(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * std + mean;
}

// Show the initial start screen with a name input.
function showStartScreen() {
  gameDiv.innerHTML = `
    <h1>Cubeverse: Simultaneous Cube Challenge</h1>
    <h5>Developed by Lichi</h5>
    <img src="coverimage.png" alt="Logo" style="width: 700px; height: auto;">
    <div id="startForm">
      <p>Enter your name to start:</p>
      <input type="text" id="playerNameInput" placeholder="Your name" />
      <button onclick="startBattle()">Start Battle</button>
    </div>
    <div id="turnLog"></div>
  `;
}

// Update the battlefield: images, HP text, HP bars, and display names plus a "VS" between.
function updateStatus() {
  let playerPercent = Math.max((playerHP / 50) * 100, 0);
  let enemyPercent = Math.max((enemyHP / 50) * 100, 0);
  const battlefieldHTML = `
    <div id="battlefieldContainer" class="battlefield-container">
      <div class="battlefield">
        <div class="combatant" id="playerCombatant">
          <img src="yza.png" alt="Player" class="combatant-img" id="playerImg">
          <p>
            <span class="name-label">Player:</span> <span id="playerNameDisplay">${playerName}</span> - HP: <span id="playerHPValue" class="hp-value">${playerHP}</span> / 50
          </p>
          <div class="bar-container">
            <div class="bar player-bar" style="width: ${playerPercent}%"></div>
          </div>
        </div>
        <div class="vs">VS</div>
        <div class="combatant" id="enemyCombatant">
          <img src="flc.png" alt="Enemy" class="combatant-img" id="enemyImg">
          <p>
            <span class="name-label">Enemy:</span> Lichi Fang - HP: <span id="enemyHPValue" class="hp-value">${enemyHP}</span> / 50
          </p>
          <div class="bar-container">
            <div class="bar enemy-bar" style="width: ${enemyPercent}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('currentTurn').innerHTML = battlefieldHTML;
  
  // Animate HP values to highlight the change.
  document.getElementById('playerHPValue').classList.add('highlight');
  document.getElementById('enemyHPValue').classList.add('highlight');
  setTimeout(() => {
    document.getElementById('playerHPValue').classList.remove('highlight');
    document.getElementById('enemyHPValue').classList.remove('highlight');
  }, 500);
}

// Append a new log entry.
function appendLog(message) {
  const logDiv = document.getElementById('turnLog');
  if (logDiv) {
    const p = document.createElement('p');
    p.innerHTML = message;
    logDiv.appendChild(p);
    // Auto-scroll to the bottom.
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}

// Animate an impact effect (red glow) on the target's image.
function showImpactAnimation(target) {
  let imgElem;
  if (target === "player") {
    imgElem = document.getElementById('playerImg');
  } else {
    imgElem = document.getElementById('enemyImg');
  }
  if (imgElem) {
    imgElem.classList.add('impact');
    setTimeout(() => {
      imgElem.classList.remove('impact');
    }, 500);
  }
}

// Show floating damage numbers above the target.
function showFloatingDamage(target, damage) {
  const container = document.getElementById('battlefieldContainer');
  let combatant;
  if (target === "player") {
    combatant = document.getElementById('playerCombatant');
  } else {
    combatant = document.getElementById('enemyCombatant');
  }
  const rect = combatant.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const span = document.createElement('span');
  span.className = "floating-damage";
  span.innerText = "-" + damage;
  span.style.left = (rect.left + rect.width / 2 - containerRect.left) + "px";
  span.style.top = (rect.top - containerRect.top) + "px";
  container.appendChild(span);
  setTimeout(() => {
    container.removeChild(span);
  }, 1000);
}

// Start a new battle.
function startBattle() {
  // Read player's name from the input.
  const nameInput = document.getElementById('playerNameInput');
  if (nameInput) {
    playerName = nameInput.value.trim() || "Player";
  }
  // Replace the start form with the game containers.
  gameDiv.innerHTML = `
    <div id="currentTurn"></div>
    <div id="turnLog"></div>
  `;
  playerHP = 50;
  enemyHP = 50;
  tymonCount = 3;
  gameTurn();
}

// Player's turn: prompt for solving time with an option to use Tymon.
function gameTurn() {
  if (playerHP <= 0) return showGameOver("Game Over! You were defeated.");
  if (enemyHP <= 0) return showGameOver("Victory! You defeated the enemy.");
  
  updateStatus();
  
  let tymonButton = "";
  if (tymonCount > 0) {
    tymonButton = `<button onclick="useTymonTime()">
      <img src="tymon.png" alt="Tymon" style="vertical-align:middle; width:20px; height:20px;"> Use Tymon (${tymonCount} left)
    </button>`;
  }
  
  const turnPrompt = `
    <h2>Your Turn</h2>
    <p>Enter your solving time (in seconds):</p>
    <input type="number" id="timeInput" placeholder="e.g., 11" step="0.1" onkeydown="if(event.key==='Enter'){ submitTurn(); }" />
    <button onclick="submitTurn()">
      <img src="attack.png" alt="Attack" style="vertical-align:middle; width:20px; height:20px;"> Submit
    </button>
    ${tymonButton}
  `;
  // Append the turn prompt.
  document.getElementById('currentTurn').innerHTML += turnPrompt;
  
  // Auto-focus the input field.
  setTimeout(() => {
    const inputField = document.getElementById('timeInput');
    if (inputField) inputField.focus();
  }, 50);
}

// Process turn using the player's entered time.
function submitTurn() {
  const timeInput = document.getElementById('timeInput');
  if (!timeInput) return;
  const playerTime = parseFloat(timeInput.value);
  if (isNaN(playerTime) || playerTime <= 0) {
    alert("Please enter a valid positive number for your time.");
    return;
  }
  // Clear the input field.
  timeInput.value = "";
  processTurn(playerTime);
}

// Use Tymon: simulate player's time using helper (random between 4 and 6 sec).
function useTymonTime() {
  tymonCount--;
  const tymonTime = (Math.random() * 2) + 4; // 4 to 6 seconds.
  processTurn(tymonTime, true);
}

// Compare the player's time with a simulated enemy time (sampled from a normal distribution)
// with mean 11.62 and standard deviation 1.10, and apply damage.
// If isTymon is true, indicate that Tymon assisted.
function processTurn(playerTime, isTymon = false) {
  const enemyTime = normalRandom(11.62, 1.10);
  let resultText = `<p>`;
  if (isTymon) {
    resultText += `<em>Tymon</em> assisted with a time of <span class="result-value">${playerTime.toFixed(2)}</span> sec. `;
  } else {
    resultText += `Your time: <span class="result-value">${playerTime.toFixed(2)}</span> sec. `;
  }
  resultText += `Enemy's time: <span class="result-value">${enemyTime.toFixed(2)}</span> sec. `;
  
  if (playerTime < enemyTime) {
    const diff = enemyTime - playerTime;
    const damage = Math.round((diff * DAMAGE_MULTIPLIER)+5);
    enemyHP -= damage;
    resultText += `You were faster by <span class="result-value">${diff.toFixed(2)}</span> sec. Enemy loses <span class="result-value">${damage}</span> HP.`;
    showImpactAnimation("enemy");
    showFloatingDamage("enemy", damage);
    document.getElementById("hitSound").play();
  } else if (playerTime > enemyTime) {
    const diff = playerTime - enemyTime;
    const damage = Math.round((diff * DAMAGE_MULTIPLIER)+5);
    playerHP -= damage;
    resultText += `Enemy was faster by <span class="result-value">${diff.toFixed(2)}</span> sec. You lose <span class="result-value">${damage}</span> HP.`;
    showImpactAnimation("player");
    showFloatingDamage("player", damage);
    document.getElementById("hitSound").play();
  } else {
    resultText += `It's a tie! No damage dealt.`;
  }
  resultText += `</p>`;
  
  appendLog(resultText);
  
  // Automatically start the next turn after a delay.
  setTimeout(() => {
    document.getElementById('currentTurn').innerHTML = "";
    updateStatus();
    gameTurn();
  }, 1000);
}

// End game screen with outcome image and sound.
function showGameOver(message) {
  let outcomeImage = "";
  if (message.indexOf("Victory") !== -1) {
    outcomeImage = `<img src="victory.png" alt="Victory" class="outcome-img">`;
    document.getElementById("victorySound").play();
  } else {
    outcomeImage = `<img src="defeat.png" alt="Defeat" class="outcome-img">`;
    document.getElementById("defeatSound").play();
  }
  gameDiv.innerHTML = `
    <h2>${message}</h2>
    ${outcomeImage}
    <p>Final Stats: Player HP: <span class="result-value">${playerHP}</span>, Enemy HP: <span class="result-value">${enemyHP}</span></p>
    <button onclick="showStartScreen()">Play Again</button>
  `;
}

showStartScreen();
