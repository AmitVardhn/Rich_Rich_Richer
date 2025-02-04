// Game Variables
let score = 0;
let timer = 30;
let clickPower = 1;
let autoInvestorActive = false;
let level = 1;
let totalMoney = localStorage.getItem('totalMoney') ? parseInt(localStorage.getItem('totalMoney')) : 0;
let highestLevel = localStorage.getItem('highestLevel') ? parseInt(localStorage.getItem('highestLevel')) : 1;
let gameInterval; // Timer interval
let autoInvestorInterval; // Auto-investor interval
let soundMuted = false; // State to track if sound is muted

// DOM Elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const clickerButton = document.getElementById('clicker-button');
const upgradeButton = document.getElementById('upgrade');
const timeBoostButton = document.getElementById('time-boost');
const autoInvestorButton = document.getElementById('auto-investor');
const finalScoreElement = document.getElementById('final-score');
const restartMenu = document.getElementById('restart-menu');
const progressBar = document.getElementById('progress');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const totalMoneyElement = document.getElementById('total-money');
const shoptotalMoneyElement = document.getElementById('shop-total-money');
const highestLevelElement = document.getElementById('highest-level');
const inventoryList = document.getElementById('inventory-list');
const backgroundSound = document.getElementById('background-sound');
const clickSound = document.getElementById('click-sound');
const powerUpSound = document.getElementById('power-up-sound');


// Disable text selection and Enter key
document.addEventListener('selectstart', (event) => event.preventDefault());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
});



// Show watermark and then start screen
window.onload = () => {
  document.getElementById('watermark').style.display = 'block'; // Show watermark
  setTimeout(() => {
    document.getElementById('watermark').style.display = 'none'; // Hide watermark
    startScreen.style.display = 'block'; // Show start screen
    totalMoneyElement.textContent = totalMoney; // Display total money
    highestLevelElement.textContent = highestLevel; // Display highest level
  }, 5000); // 5 seconds duration
};

// Start the game
document.getElementById('start-button').addEventListener('click', () => {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  startGame();
  backgroundSound.play(); // Start background sound
  
});

// Open shop
document.getElementById('shop-button').addEventListener('click', () => {
  hideGameElements();
  document.getElementById('shop').style.display = 'block';
  shoptotalMoneyElement.textContent = totalMoney;
});

// Close shop
document.getElementById('close-shop').addEventListener('click', () => {
    document.getElementById('shop').style.display = 'none';
    showGameElements();
    
    // Update totalMoney to equal the shop's total money
    totalMoney = parseInt(shoptotalMoneyElement.textContent); // Get the value from the shop total money element
    totalMoneyElement.textContent = totalMoney; // Update displayed total money

    // Save total money in local storage
    localStorage.setItem('totalMoney', totalMoney);
});

// Function to hide game elements
function hideGameElements() {
  gameScreen.style.display = 'none';
  startScreen.style.display = 'none';
  restartMenu.style.display = 'none';
}

// Function to show game elements
function showGameElements() {
  gameScreen.style.display = 'none';
  startScreen.style.display = 'block';
  restartMenu.style.display = 'none';
}

// Start game function
function startGame() {
  resetGameVariables();
  startTimer(); // Start the timer when the game begins
}

// Reset game variables
function resetGameVariables() {
  score = 0;
  timer = 30;
  clickPower = 1;
  autoInvestorActive = false;
  level = 1;
  updateUI();
  resetShopButtons();
}

// Update UI elements
function updateUI() {
  scoreElement.textContent = score;
  timerElement.textContent = timer;
  levelElement.textContent = level;
  progressBar.style.width = "0%";
  clickerButton.disabled = false; // Ensure the clicker is enabled
}

// Timer countdown
function startTimer() {
  gameInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      timerElement.textContent = timer;
    } else {
      clearInterval(gameInterval); // Stop timer when it reaches zero
      endGame();
    }
  }, 1000);
}

// Clicker functionality
clickerButton.addEventListener('click', (event) => {
    updateScore(clickPower);
    playClickSound();
    scatterCoins(event.clientX, event.clientY); // Scatter coins on click
});

// Update score and handle level progression
function updateScore(points) {
  score += points;
  scoreElement.textContent = score;
  
  // Level progression
  const newLevel = Math.floor(score / 100) + 1;
  if (newLevel > level) {
    level = newLevel;
    levelElement.textContent = level;
    highestLevel = Math.max(highestLevel, level);
    highestLevelElement.textContent = highestLevel; 
    localStorage.setItem('highestLevel', highestLevel);
    showNotification(`Level up! You are now Level ${level}`);
    playPowerUpSound();
  }

  // Enable shop buttons based on score
  upgradeButton.disabled = score < 50;
  timeBoostButton.disabled = score < 100;
  autoInvestorButton.disabled = score < 200;
  enableLuxuryButtons();
  updateProgressBar();
}


// Upgrade power
upgradeButton.addEventListener('click', () => {
  if (score >= 50) {
    score -= 50;
    clickPower++;
    scoreElement.textContent = score;
    upgradeButton.disabled = true;
    showNotification(`You upgraded your skills! Your click power is now ${clickPower}`);
  }
});

// Extend time
timeBoostButton.addEventListener('click', () => {
  if (score >= 100) {
    score -= 100;
    timer += 10;
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    timeBoostButton.disabled = true;
    showNotification("You extended your time by 10 seconds!");
    playPowerUpSound();
  }
});

// Auto-investor activation
autoInvestorButton.addEventListener('click', () => {
  if (score >= 200 && !autoInvestorActive) {
    score -= 200;
    autoInvestorActive = true;
    scoreElement.textContent = score;

    // Start auto-investor
    autoInvestorInterval = setInterval(() => {
      if (timer > 0) {
        updateScore(1);
      } else {
        clearInterval(autoInvestorInterval);
      }
    }, 1000);

    autoInvestorButton.disabled = true;
    showNotification("Auto-Investor activated! You will earn 1 wealth every second.");
    playPowerUpSound();
  }
});


// Update progress bar
function updateProgressBar() {
  const progressPercentage = (score % 100) * 100 / 100;
  progressBar.style.width = progressPercentage + "%";
}

// End game function
function endGame() {
  finalScoreElement.textContent = score;
  disableButtons();
  clearInterval(gameInterval); 
  clearInterval(autoInvestorInterval); 
  gameScreen.style.display = 'none';
  restartMenu.style.display = 'block';

  totalMoney += score; 
  localStorage.setItem('totalMoney', totalMoney); 
  totalMoneyElement.textContent = totalMoney; 
}

// Disable all buttons
function disableButtons() {
  upgradeButton.disabled = true;
  timeBoostButton.disabled = true;
  autoInvestorButton.disabled = true;
  document.querySelectorAll('.luxury-theme').forEach(button => button.disabled = true);
}

// Restart game
document.getElementById('restart-button').addEventListener('click', () => {
  restartMenu.style.display = 'none';
  startScreen.style.display = 'block'; 
  resetGameVariables(); 
  totalMoneyElement.textContent = totalMoney; 
  highestLevelElement.textContent = highestLevel; 
});

// Reset shop buttons
function resetShopButtons() {
  document.querySelectorAll('.luxury-theme').forEach(button => {
    button.disabled = true; 
  });
  upgradeButton.disabled = true; 
  timeBoostButton.disabled = true; 
  autoInvestorButton.disabled = true; 
}

// Display notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.background = 'rgba(0, 0, 0, 0.7)';
  notification.style.color = '#fff';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Scatter coins animation with protective range
function scatterCoins(x, y) {
    const coinCount = 10; // Number of coins to scatter
    for (let i = 0; i < coinCount; i++) {
        const coin = document.createElement('div');
        coin.classList.add('coin');
        coin.textContent = '🪙';

        // Random scatter position
        const scatterX = (Math.random() - 0.5) * 200; 
        const scatterY = (Math.random() - 0.5) * 200; 

        coin.style.position = 'absolute';
        coin.style.left = `${x + scatterX}px`;
        coin.style.top = `${y + scatterY}px`;
        document.body.appendChild(coin);

        // Remove coin after a short delay
        setTimeout(() => {
            document.body.removeChild(coin);
        }, 500);
    }
}
// Toggle sound functionality
document.getElementById('toggle-sound').addEventListener('click', () => {
  soundMuted = !soundMuted;
  if (soundMuted) {
    backgroundSound.volume= 0.0; // Stop background sound
    document.getElementById('toggle-sound').textContent = 'Play Sound'; // Change button text
  } else {
    backgroundSound.volume= 1.0; // Play background sound
    document.getElementById('toggle-sound').textContent = 'Mute Sound'; // Change button text
  }
});

// Play sounds
function playClickSound() {
  if (!soundMuted) {
    clickSound.currentTime = 0; 
    clickSound.play();
  }
}

function playPowerUpSound() {
  if (!soundMuted) {
    powerUpSound.currentTime = 0; 
    powerUpSound.play();
  }
}

