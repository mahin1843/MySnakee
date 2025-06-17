document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let canvas = document.getElementById('game-canvas');
    let ctx = canvas.getContext('2d');
    let snake = [];
    let food = {};
    let specialFood = null;
    let direction = 'right';
    let nextDirection = 'right';
    let gameInterval;
    let score = 0;
    let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];
    let gridSize = 20;
    let gameSpeed = 150;
    
    // Set canvas size
    function resizeCanvas() {
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight * 0.7;
        const size = Math.min(maxWidth, maxHeight);
        
        // Make sure size is a multiple of gridSize for perfect fit
        const gridAdjustedSize = Math.floor(size / gridSize) * gridSize;
        
        canvas.width = gridAdjustedSize;
        canvas.height = gridAdjustedSize;
    }
    
    // Initialize game
    function initGame() {
        resizeCanvas();
        
        // Center snake initially
        const startX = Math.floor(canvas.width / gridSize / 2) * gridSize;
        const startY = Math.floor(canvas.height / gridSize / 2) * gridSize;
        
        snake = [
            {x: startX, y: startY},
            {x: startX - gridSize, y: startY},
            {x: startX - gridSize * 2, y: startY}
        ];
        
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        document.getElementById('score').textContent = score;
        
        generateFood();
        specialFood = null;
    }
    
    // Generate regular food
    function generateFood() {
        const maxX = (canvas.width / gridSize) - 1;
        const maxY = (canvas.height / gridSize) - 1;
        
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * maxX) * gridSize;
            foodY = Math.floor(Math.random() * maxY) * gridSize;
            
            validPosition = true;
            
            // Check if food overlaps with snake
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        food = {x: foodX, y: foodY};
    }
    
    // Generate special food (appears every 20 points)
    function generateSpecialFood() {
        const maxX = (canvas.width / gridSize) - 1;
        const maxY = (canvas.height / gridSize) - 1;
        
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * maxX) * gridSize;
            foodY = Math.floor(Math.random() * maxY) * gridSize;
            
            validPosition = true;
            
            // Check if special food overlaps with snake or regular food
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
            
            if (foodX === food.x && foodY === food.y) {
                validPosition = false;
            }
        }
        
        specialFood = {x: foodX, y: foodY};
        
        // Special food disappears after 5 seconds
        setTimeout(() => {
            if (specialFood) {
                specialFood = null;
                drawGame();
            }
        }, 5000);
    }
    
    // Game loop
    function gameLoop() {
        moveSnake();
        checkCollision();
        drawGame();
    }
    
    // Move snake
    function moveSnake() {
        direction = nextDirection;
        
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= gridSize;
                break;
            case 'down':
                head.y += gridSize;
                break;
            case 'left':
                head.x -= gridSize;
                break;
            case 'right':
                head.x += gridSize;
                break;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            score += 2;
            document.getElementById('score').textContent = score;
            
            // Check if we need to spawn special food
            if (score % 20 === 0 && !specialFood) {
                generateSpecialFood();
            }
            
            generateFood();
        } 
        // Check if snake ate special food
        else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            score += 5;
            document.getElementById('score').textContent = score;
            specialFood = null;
        } 
        // If no food eaten, remove tail
        else {
            snake.pop();
        }
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (
            head.x < 0 || 
            head.y < 0 || 
            head.x >= canvas.width || 
            head.y >= canvas.height
        ) {
            gameOver();
            return;
        }
        
        // Check self collision (skip head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // Draw game
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        ctx.fillStyle = 'yellow';
        for (let segment of snake) {
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            
            // Add eyes to head
            if (segment === snake[0]) {
                ctx.fillStyle = 'black';
                
                // Eye positions based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                switch (direction) {
                    case 'up':
                        leftEyeX = segment.x + 5;
                        leftEyeY = segment.y + 5;
                        rightEyeX = segment.x + gridSize - 10;
                        rightEyeY = segment.y + 5;
                        break;
                    case 'down':
                        leftEyeX = segment.x + 5;
                        leftEyeY = segment.y + gridSize - 10;
                        rightEyeX = segment.x + gridSize - 10;
                        rightEyeY = segment.y + gridSize - 10;
                        break;
                    case 'left':
                        leftEyeX = segment.x + 5;
                        leftEyeY = segment.y + 5;
                        rightEyeX = segment.x + 5;
                        rightEyeY = segment.y + gridSize - 10;
                        break;
                    case 'right':
                        leftEyeX = segment.x + gridSize - 10;
                        leftEyeY = segment.y + 5;
                        rightEyeX = segment.x + gridSize - 10;
                        rightEyeY = segment.y + gridSize - 10;
                        break;
                }
                
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(rightEyeX, rightEyeY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'yellow';
            }
        }
        
        // Draw regular food
        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw special food if it exists
        if (specialFood) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(specialFood.x + gridSize/2, specialFood.y + gridSize/2, gridSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add sparkle effect
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(specialFood.x + gridSize/3, specialFood.y + gridSize/3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(specialFood.x + gridSize*2/3, specialFood.y + gridSize/4, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        
        // Update high scores
        highScores.push(score);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 5); // Keep top 5
        localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
        
        // Show game over dialog
        document.getElementById('final-score').textContent = score;
        document.getElementById('high-score').textContent = highScores[0] || 0;
        document.querySelector('.game-over-dialog').style.display = 'flex';
    }
    
    // Start game
    function startGame() {
        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    // Screen management
    function showScreen(screenName) {
        const screens = ['splash-screen', 'loading-screen', 'main-menu', 'game-container', 
                        'highscore-screen', 'about-screen'];
        
        screens.forEach(screen => {
            document.querySelector(`.${screen}`).style.display = 'none';
        });
        
        document.querySelector(`.${screenName}`).style.display = 'flex';
    }
    
    // Initialize screens sequence
    setTimeout(() => {
        showScreen('loading-screen');
        
        setTimeout(() => {
            showScreen('main-menu');
        }, 4000);
    }, 5000);
    
    // Event listeners
    document.getElementById('play-tab').addEventListener('click', () => {
        document.querySelector('.start-dialog').style.display = 'flex';
    });
    
    document.getElementById('highscore-tab').addEventListener('click', () => {
        showScreen('highscore-screen');
        
        // Display high scores
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = '';
        
        if (highScores.length === 0) {
            scoresContainer.innerHTML = '<p>No scores yet!</p>';
        } else {
            highScores.forEach((score, index) => {
                const scoreElement = document.createElement('div');
                scoreElement.className = 'score-item';
                scoreElement.innerHTML = `<span>${index + 1}.</span> ${score}`;
                scoresContainer.appendChild(scoreElement);
            });
        }
    });
    
    document.getElementById('about-tab').addEventListener('click', () => {
        showScreen('about-screen');
    });
    
    document.getElementById('quit-tab').addEventListener('click', () => {
        document.querySelector('.quit-dialog').style.display = 'flex';
    });
    
    document.getElementById('start-game').addEventListener('click', () => {
        document.querySelector('.start-dialog').style.display = 'none';
        showScreen('game-container');
        startGame();
    });
    
    document.getElementById('back-to-menu').addEventListener('click', () => {
        document.querySelector('.start-dialog').style.display = 'none';
    });
    
    document.getElementById('play-again').addEventListener('click', () => {
        document.querySelector('.game-over-dialog').style.display = 'none';
        startGame();
    });
    
    document.getElementById('back-to-menu2').addEventListener('click', () => {
        document.querySelector('.game-over-dialog').style.display = 'none';
        showScreen('main-menu');
    });
    
    document.getElementById('back-from-highscores').addEventListener('click', () => {
        showScreen('main-menu');
    });
    
    document.getElementById('back-from-about').addEventListener('click', () => {
        showScreen('main-menu');
    });
    
    document.getElementById('confirm-quit').addEventListener('click', () => {
        window.close();
    });
    
    document.getElementById('cancel-quit').addEventListener('click', () => {
        document.querySelector('.quit-dialog').style.display = 'none';
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
    
    // Touch controls
    document.getElementById('up-btn').addEventListener('click', () => {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    document.getElementById('down-btn').addEventListener('click', () => {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    document.getElementById('left-btn').addEventListener('click', () => {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    document.getElementById('right-btn').addEventListener('click', () => {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (document.querySelector('.game-container').style.display === 'flex') {
            resizeCanvas();
            drawGame();
        }
    });
});
