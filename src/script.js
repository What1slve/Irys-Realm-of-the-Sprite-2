import './style.css';

import spriteSheet from './images/hsac.png';

import pupSound from './sounds/pup.mp3';
import highSound from './sounds/high.mp3';
import gameOverSound from './sounds/gameover.mp3';

import backgroundVideo from './images/background.MOV';
import discordLogoVideo from './images/Discord_PFP_Teal.gif.mp4';

import Irys from '@irys/sdk';

let currentAnimationFrame=true;


document.addEventListener('DOMContentLoaded', () => {

    const backgroundSource = document.querySelector('.background-video source');
    if (backgroundSource) {
        backgroundSource.src = backgroundVideo;
        const backgroundVideoElement = backgroundSource.parentElement;
        backgroundVideoElement.load();
        backgroundVideoElement.play().catch(() => {
            console.log('Autoplay background is blocked, waiting for interaction');
            document.addEventListener('keydown', () => backgroundVideoElement.play(), {once: true});
            document.addEventListener('click', () => backgroundVideoElement.play(), {once: true});
        });
    } else {
        console.error('Background video source not found');
    }

    const discordSource = document.querySelector('.discord-logo source');
    if (discordSource) {
        discordSource.src = discordLogoVideo;
        const discordVideoElement = discordSource.parentElement;
        discordVideoElement.load();
        discordVideoElement.play().catch(() => {
            console.log('Discord logo autoplay blocked, waiting for interaction');
            document.addEventListener('keydown', () => discordVideoElement.play(), {once: true});
            document.addEventListener('click', () => discordVideoElement.play(), {once: true});
        });
    } else {
        console.error('Discord logo source not found');
    }

    const startButton = document.getElementById('start-game');
    startButton.addEventListener('click', StartGame);

    const retryButton = document.getElementById('retry-game');
    retryButton.addEventListener('click', RetryGame);


    const connectButton = document.getElementById('connect-metamask');
    const gameContainer = document.querySelector('.game-container');
    const leaderBoard = document.querySelector('#leader-board');

    connectButton.addEventListener('click', async () => {
        const success = await initializeIrys();
        if (success) {
            connectButton.textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
            connectButton.disabled = true;
            gameContainer.classList.add('visible');
            leaderBoard.classList.add('visible');
        }
    });

    InitializeIdleState();
});

function InitializeIdleState() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    player.render();
    background.render();
    platforms.forEach(p => p.render());
}

const spriteSheetImage = new Image();
spriteSheetImage.src = spriteSheet;

window.requestAnimFrame = function (callback, fps) {
    window.setTimeout(callback, 1000 / fps);
};

var canvas = document.getElementById('game-canvas'),
    context = canvas.getContext('2d');

var canvasWidth = 422,
    canvasHeight = 552;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

var platforms = [],
    player, platformCount = 10,
    platformSpacing = 0,
    gravity = 0.2,
    gameLoop,
    gameOverFlag = 0,
    animationLoop, powerUpCount = 0,
    playerDirection, score = 0, gameActive = true;

var Background = function () {
    this.height = 5;
    this.width = canvasWidth;

    this.sourceX = 0;
    this.sourceY = 614;
    this.sourceWidth = 100;
    this.sourceHeight = 5;

    this.velocity = 0;

    this.x = 0;
    this.y = canvasHeight - this.height;

    this.render = function () {
        try {
            context.drawImage(spriteSheetImage, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
        } catch (e) {
        }
    };
};

var background = new Background();

var Player = function () {
    this.velocityY = 11;
    this.velocityX = 0;

    this.moveLeft = false;
    this.moveRight = false;
    this.isDead = false;

    this.width = 55 * 1.5;
    this.height = 40 * 1.5;

    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 110;
    this.sourceHeight = 80;

    this.direction = "left";

    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight;

    this.render = function () {
        try {
            if (this.direction == "right") this.sourceY = 121;
            else if (this.direction == "left") this.sourceY = 201;
            else if (this.direction == "right_land") this.sourceY = 289;
            else if (this.direction == "left_land") this.sourceY = 371;

            context.drawImage(spriteSheetImage, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
        } catch (e) {
        }
    };

    this.pupAudio = new Audio(pupSound);
    this.highAudio = new Audio(highSound);

    this.jump = function () {
        this.velocityY = -8;
        this.pupAudio.play().catch(error => console.error("Audio reception error:", error));
    };

    this.highJump = function () {
        this.velocityY = -16;
        this.highAudio.play().catch(error => console.error("Audio reception error:", error));
    };
};

player = new Player();

function Platform() {
    this.width = 70;
    this.height = 17;

    this.x = Math.random() * (canvasWidth - this.width);
    this.y = platformSpacing;

    platformSpacing += (canvasHeight / platformCount);

    this.isBroken = 0;
    this.isCollected = 0;

    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 105;
    this.sourceHeight = 31;

    this.render = function () {
        try {
            if (this.type == 1) this.sourceY = 0;
            else if (this.type == 2) this.sourceY = 61;
            else if (this.type == 3 && this.isBroken === 0) this.sourceY = 31;
            else if (this.type == 3 && this.isBroken == 1) this.sourceY = 1000;
            else if (this.type == 4 && this.isCollected === 0) this.sourceY = 90;
            else if (this.type == 4 && this.isCollected == 1) this.sourceY = 1000;

            context.drawImage(spriteSheetImage, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
        } catch (e) {
        }
    };

    if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
    else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
    else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
    else this.types = [1];

    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    if (this.type == 3 && powerUpCount < 1) {
        powerUpCount++;
    } else if (this.type == 3 && powerUpCount >= 1) {
        this.type = 1;
        powerUpCount = 0;
    }

    this.velocity = 0;
    this.velocityX = 1;
}

for (var i = 0; i < platformCount; i++) {
    platforms.push(new Platform());
}

var PowerUp = function () {
    this.height = 30;
    this.width = 70;

    this.x = 0;
    this.y = 0;

    this.sourceX = 0;
    this.sourceY = 554;
    this.sourceWidth = 105;
    this.sourceHeight = 60;

    this.isActive = false;

    this.render = function () {
        try {
            if (this.isActive === true) context.drawImage(spriteSheetImage, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
            else return;
        } catch (e) {
        }
    };
};

var powerUp = new PowerUp();

var Spring = function () {
    this.x = 0;
    this.y = 0;

    this.width = 26;
    this.height = 30;

    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 45;
    this.sourceHeight = 53;

    this.isCompressed = 0;

    this.render = function () {
        try {
            if (this.isCompressed === 0) this.sourceY = 445;
            else if (this.isCompressed == 1) this.sourceY = 501;

            context.drawImage(spriteSheetImage, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.x, this.y, this.width, this.height);
        } catch (e) {
        }
    };
};

var spring = new Spring();

function StartGame() {
    if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame);
    }

    var direction = "left",
        powerUpCounter = 0;

    gameActive = true;
    player.isDead = false;
    score = 0;

    const gameOverAudio = new Audio(gameOverSound);

    function clearCanvas() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function updatePlayer() {
        if (direction == "left") {
            player.direction = "left";
            if (player.velocityY < -7 && player.velocityY > -15) player.direction = "left_land";
        } else if (direction == "right") {
            player.direction = "right";
            if (player.velocityY < -7 && player.velocityY > -15) player.direction = "right_land";
        }

        document.onkeydown = function (e) {
            var keyCode = e.keyCode;

            if (keyCode == 37) {
                direction = "left";
                player.moveLeft = true;
            } else if (keyCode == 39) {
                direction = "right";
                player.moveRight = true;
            }

            if (keyCode == 32) {
                e.preventDefault();
                if (player.isDead === "lol") {
                    RetryGame();
                } else if (!gameActive) {
                    StartGame();
                    gameActive = true;
                }
            }
        };

        document.onkeyup = function (e) {
            var keyCode = e.keyCode;

            if (keyCode == 37) {
                direction = "left";
                player.moveLeft = false;
            } else if (keyCode == 39) {
                direction = "right";
                player.moveRight = false;
            }
        };

        if (player.moveLeft === true) {
            player.x += player.velocityX;
            player.velocityX -= 0.15;
        } else {
            player.x += player.velocityX;
            if (player.velocityX < 0) player.velocityX += 0.1;
        }

        if (player.moveRight === true) {
            player.x += player.velocityX;
            player.velocityX += 0.15;
        } else {
            player.x += player.velocityX;
            if (player.velocityX > 0) player.velocityX -= 0.1;
        }

        if ((player.y + player.height) > background.y && background.y < canvasHeight) player.jump();


        if (background.y > canvasHeight && (player.y + player.height) > canvasHeight && player.isDead != "lol") {
            player.isDead = true;
            gameOverAudio.play().catch(error => console.error("Audio reception error:", error));
        }

        if (player.x > canvasWidth) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = canvasWidth;

        if (player.y >= (canvasHeight / 2) - (player.height / 2)) {
            player.y += player.velocityY;
            player.velocityY += gravity;
        } else {
            platforms.forEach(function (platform, index) {
                if (player.velocityY < 0) {
                    platform.y -= player.velocityY;
                }

                if (platform.y > canvasHeight) {
                    platforms[index] = new Platform();
                    platforms[index].y = platform.y - canvasHeight;
                }
            });

            background.y -= player.velocityY;
            player.velocityY += gravity;

            if (player.velocityY >= 0) {
                player.y += player.velocityY;
                player.velocityY += gravity;
            }

            score++;
        }

        checkCollisions();

        if (player.isDead === true) handleGameOver();
    }

    function updateSpring() {
        var springObj = spring;
        var firstPlatform = platforms[0];

        if (firstPlatform.type == 1 || firstPlatform.type == 2) {
            springObj.x = firstPlatform.x + firstPlatform.width / 2 - springObj.width / 2;
            springObj.y = firstPlatform.y - firstPlatform.height - 10;

            if (springObj.y > canvasHeight / 1.1) springObj.isCompressed = 0;

            springObj.render();
        } else {
            springObj.x = 0 - springObj.width;
            springObj.y = 0 - springObj.height;
        }
    }

    function updatePlatforms() {
        var powerUpObj = powerUp;

        platforms.forEach(function (platform, index) {
            if (platform.type == 2) {
                if (platform.x < 0 || platform.x + platform.width > canvasWidth) platform.velocityX *= -1;
                platform.x += platform.velocityX;
            }

            if (platform.isBroken == 1 && powerUpObj.isActive === false && powerUpCounter === 0) {
                powerUpObj.x = platform.x;
                powerUpObj.y = platform.y;
                powerUpObj.isActive = true;
                powerUpCounter++;
            }

            platform.render();
        });

        if (powerUpObj.isActive === true) {
            powerUpObj.render();
            powerUpObj.y += 8;
        }

        if (powerUpObj.y > canvasHeight) powerUpObj.isActive = false;
    }

    function checkCollisions() {
        platforms.forEach(function (platform, index) {
            if (player.velocityY > 0 && platform.isCollected === 0 &&
                (player.x + 15 < platform.x + platform.width) &&
                (player.x + player.width - 15 > platform.x) &&
                (player.y + player.height > platform.y) &&
                (player.y + player.height < platform.y + platform.height)) {
                if (platform.type == 3 && platform.isBroken === 0) {
                    platform.isBroken = 1;
                    powerUpCounter = 0;
                    return;
                } else if (platform.type == 4 && platform.isCollected === 0) {
                    player.jump();
                    platform.isCollected = 1;
                } else if (platform.isBroken == 1) return;
                else {
                    player.jump();
                }
            }
        });
        var springObj = spring;
        if (player.velocityY > 0 && (springObj.isCompressed === 0) &&
            (player.x + 15 < springObj.x + springObj.width) &&
            (player.x + player.width - 15 > springObj.x) &&
            (player.y + player.height > springObj.y) &&
            (player.y + player.height < springObj.y + springObj.height)) {
            springObj.isCompressed = 1;
            player.highJump();
        }
    }

    function updateScore() {
        var scoreElement = document.getElementById("score-value");
        scoreElement.innerHTML = score;
    }

    function handleGameOver() {
        platforms.forEach(function (platform, index) {
            platform.y -= 12;
        });

        if (player.y > canvasHeight / 2 && gameOverFlag === 0) {
            player.y -= 8;
            player.velocityY = 0;
        } else if (player.y < canvasHeight / 2) gameOverFlag = 1;
        else if (player.y + player.height > canvasHeight) {
            showGameOver();
            hideControls();
            player.isDead = "lol";

            if (window.ethereum && window.ethereum.selectedAddress) {
                document.getElementById('submit-score').disabled = false;
            }
        }
    }

    function gameUpdate() {
        clearCanvas();
        updatePlatforms();
        updateSpring();
        updatePlayer();
        player.render();
        background.render();
        updateScore();
    }

    /*    animationLoop = function() {
            return;
        };
        gameLoop = function() {
            gameUpdate();
            requestAnimFrame(gameLoop);
        };

        gameLoop();*/

    animationLoop = function () {
        if (player.isDead !== "lol") {
            gameUpdate();
           
            const baseFPS = 60;
            const maxFPS = 2000; 
            const multiplier = 0.03; 
            let fps = baseFPS + score * multiplier;
            if (fps > maxFPS) fps = maxFPS;
            window.requestAnimFrame(animationLoop, fps);
        }
    };
    animationLoop();

    hideStartScreen();
    showControls();
}

function RetryGame() {
    hideGameOver();
    showControls();
    player.isDead = false;

    gameOverFlag = 0;
    platformSpacing = 0;
    score = 0;

    background = new Background();
    player = new Player();
    spring = new Spring();
    powerUp = new PowerUp();

    platforms = [];
    for (var i = 0; i < platformCount; i++) {
        platforms.push(new Platform());
    }
    animationLoop("left", 0);
}

function hideStartScreen() {
    var startScreen = document.getElementById("start-screen");
    startScreen.style.zIndex = -1;
}

function showGameOver() {
    var gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.style.zIndex = 1;
    gameOverScreen.style.visibility = "visible";

    var resultElement = document.getElementById("score-display");
    resultElement.innerHTML = "Result: " + score + " units!";

    const submitButton = document.getElementById('submit-score');
    submitButton.addEventListener('click', submitScoreToIrys);
}

function hideGameOver() {
    var gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.style.zIndex = -1;
    gameOverScreen.style.visibility = "hidden";
}

function showControls() {
    var controls = document.getElementById("score-container");
    controls.style.zIndex = 1;
}

function hideControls() {
    var controls = document.getElementById("score-container");
    controls.style.zIndex = -1;
}

function playerJump() {
    player.y += player.velocityY;
    player.velocityY += gravity;

    if (player.velocityY > 0 &&
        (player.x + 15 < 260) &&
        (player.x + player.width - 15 > 155) &&
        (player.y + player.height > 435) &&
        (player.y + player.height < 500))
        player.jump();

    if (playerDirection == "left") {
        player.direction = "left";
        if (player.velocityY < -7 && player.velocityY > -15) player.direction = "left_land";
    } else if (playerDirection == "right") {
        player.direction = "right";
        if (player.velocityY < -7 && player.velocityY > -15) player.direction = "right_land";
    }

    document.onkeydown = function (e) {
        var keyCode = e.keyCode;

        if (keyCode == 37) {
            playerDirection = "left";
            player.moveLeft = true;
        } else if (keyCode == 39) {
            playerDirection = "right";
            player.moveRight = true;
        }

/*        if (keyCode == 32) {
            if (gameActive === true) {
                StartGame();
                gameActive = false;
            } else
                RetryGame();
        }*/
    };

    document.onkeyup = function (e) {
        var keyCode = e.keyCode;

        if (keyCode == 37) {
            playerDirection = "left";
            player.moveLeft = false;
        } else if (keyCode == 39) {
            playerDirection = "right";
            player.moveRight = false;
        }
    };

    if (player.moveLeft === true) {
        player.x += player.velocityX;
        player.velocityX -= 0.15;
    } else {
        player.x += player.velocityX;
        if (player.velocityX < 0) player.velocityX += 0.1;
    }

    if (player.moveRight === true) {
        player.x += player.velocityX;
        player.velocityX += 0.15;
    } else {
        player.x += player.velocityX;
        if (player.velocityX > 0) player.velocityX -= 0.1;
    }

    if ((player.y + player.height) > background.y && background.y < canvasHeight) player.jump();

    if (player.x > canvasWidth) player.x = 0 - player.width;
    else if (player.x < 0 - player.width) player.x = canvasWidth;

    player.render();
}

/*function updateGame() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    playerJump();
}

animationLoop = function () {
    updateGame();
    window.requestAnimFrame(animationLoop);
};*/

/*window.StartGame = StartGame;
window.RetryGame = RetryGame;*/












import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import axios from "axios";

let irysUploader = null;
let userAddress = null;

async function initializeIrys() {
    if (!window.ethereum) {
        alert("Please install MetaMask to use this feature!");
        return false;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        userAddress = await signer.getAddress();

        irysUploader = await WebUploader(WebEthereum).withAdapter(EthersV6Adapter(provider));
        /*console.log("Irys initialized with address:", userAddress);
        console.log("Network:", await provider.getNetwork());*/
        return true;
    } catch (error) {
        /*console.error("Error initializing Irys:", error);*/
        alert("Failed to connect to MetaMask. Please try again.");
        return false;
    }
}

async function submitScoreToIrys() {
    if (!irysUploader || !userAddress) {
        alert("Please connect MetaMask first!");
        return;
    }

    const scoreData = {
        player: userAddress,
        score: score,
        timestamp: new Date().toISOString(),
    };
    const scoreString = JSON.stringify(scoreData);
    const scoreBuffer = Buffer.from(scoreString)

    const tags = [
        { name: "Content-Type", value: "application/json" },
        { name: "game-id", value: "IrysRealmSprite" },
    ];

    /*console.log('score = ',score)*/

    const receipt = await irysUploader.upload(scoreBuffer, { tags });
    /*console.log("Score submitted to Irys! Transaction ID:", receipt.id);
    console.log("Receipt:", receipt);*/
    alert(`Score submitted successfully! Transaction ID: ${receipt.id}`);
    /*console.log("View your score at:", `https://gateway.irys.xyz/${receipt.id}`);*/
}

async function fetchLeaderboard() {
    const query = `
        query getGameScores {
            transactions(
                tags: [{ name: "game-id", values: ["IrysRealmSprite"] }],
                first: 1000
            ) {
                edges {
                    node {
                        id
                        address
                        tags {
                            name
                            value
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await axios.post("https://uploader.irys.xyz/graphql", { query });
        let transactions = response.data.data.transactions.edges;
        /*console.log("Fetched from uploader.irys.xyz:", transactions);*/

        const leaderboard = {};
        for (const tx of transactions) {
            const { id, address } = tx.node;
            const contentType = tx.node.tags.find((tag) => tag.name === "Content-Type")?.value;
            if (contentType !== "application/json") {
                /*console.log(`Skipping transaction ${id}: not JSON`);*/
                continue;
            }

            try {
                const dataResponse = await axios.get(`https://gateway.irys.xyz/${id}`);
                const scoreData = dataResponse.data;
                /*console.log(`Transaction ${id} data:`, scoreData);*/

                if (!scoreData.player || typeof scoreData.score !== "number" || !scoreData.timestamp) {
                    console.log(`Skipping transaction ${id}: missing or invalid player, score, or timestamp`);
                    continue;
                }

                if (!leaderboard[address] || leaderboard[address].score < scoreData.score) {
                    leaderboard[address] = {
                        player: address,
                        score: scoreData.score,
                        timestamp: scoreData.timestamp,
                        id,
                    };
                }
            } catch (error) {
                console.error(`Error fetching data for transaction ${id}:`, error);
            }
        }

        const result = Object.values(leaderboard).sort((a, b) => b.score - a.score);
        console.log("Leaderboard result:", result);
        return result;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

async function fetchPlayerHistory(playerAddress) {
    const query = `
        query getPlayerScores {
            transactions(
                tags: [{ name: "game-id", values: ["IrysRealmSprite"] }],
                owners: ["${playerAddress}"],
                first: 1000
            ) {
                edges {
                    node {
                        id
                        timestamp
                    }
                }
            }
        }
    `;

    try {
        const response = await axios.post("https://uploader.irys.xyz/graphql", { query });
        let transactions = response.data.data.transactions.edges;
        console.log(`Fetched history for ${playerAddress} from uploader.irys.xyz:`, transactions);

        const history = [];
        for (const tx of transactions) {
            const { id } = tx.node;
            try {
                const dataResponse = await axios.get(`https://gateway.irys.xyz/${id}`);
                const scoreData = dataResponse.data;
                console.log(`History transaction ${id} data:`, scoreData);

                if (scoreData.player && typeof scoreData.score === "number") {
                    history.push({
                        id,
                        score: scoreData.score,
                        timestamp: scoreData.timestamp,
                    });
                }
            } catch (error) {
                console.error(`Error fetching history data for transaction ${id}:`, error);
            }
        }

        const result = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log("History result:", result);
        return result;
    } catch (error) {
        console.error("Error fetching player history:", error);
        return [];
    }
}

function displayLeaderboard(leaderboard) {
    console.log('Leaderboard:', leaderboard);

    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; max-width: 32rem; width: 100%; max-height: 80vh; overflow-y: auto;">
            <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Leaderboard</h2>
            <table style="width: 100%; text-align: left; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Player</th>
                        <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Best Score</th>
                        <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Timestamp</th>
                    </tr>
                </thead>
                <tbody id="leaderboard-body">
                    ${
        !Array.isArray(leaderboard) || leaderboard.length === 0
            ? '<tr><td colspan="3" style="padding: 0.5rem; text-align: center;">No scores found</td></tr>'
            : leaderboard
                .map(
                    (entry, index) => {
                        
                        if (!entry.player || entry.score == null || !entry.timestamp) {
                            console.log(`Skipping invalid entry at index ${index}:`, entry);
                            return '';
                        }
                        return `
                                              <tr style="cursor: pointer;" data-player="${entry.player}">
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">${entry.player.slice(0, 6)}...${entry.player.slice(-4)}</td>
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">${entry.score}</td>
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">${new Date(entry.timestamp).toLocaleString()}</td>
                                              </tr>
                                          `;
                    }
                )
                .join("")
    }
                </tbody>
            </table>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 1rem; background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    const rows = modal.querySelectorAll("#leaderboard-body tr");
    rows.forEach((row) => {
        row.addEventListener("click", () => {
            const playerAddress = row.getAttribute("data-player");
            showPlayerHistory(playerAddress);
        });
    });
}


async function showPlayerHistory(playerAddress) {
    try {
        const history = await fetchPlayerHistory(playerAddress);
        if (!history || !Array.isArray(history)) {
            throw new Error("Invalid history data");
        }

        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; max-width: 32rem; width: 100%; max-height: 80vh; overflow-y: auto;">
                <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">History for ${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)}</h2>
                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Score</th>
                            <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Timestamp</th>
                            <th style="padding: 0.5rem; border-bottom: 1px solid #ccc;">Transaction</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
            history.length === 0
                ? '<tr><td colspan="3" style="padding: 0.5rem; text-align: center;">No history found</td></tr>'
                : history
                    .map(
                        (entry) => `
                                              <tr>
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">${entry.score}</td>
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">${new Date(entry.timestamp).toLocaleString()}</td>
                                                  <td style="padding: 0.5rem; border-bottom: 1px solid #ccc;">
                                                      <a href="https://gateway.irys.xyz/${entry.id}" target="_blank" style="color: #3b82f6; text-decoration: underline;">
                                                          ${entry.id.slice(0, 6)}...
                                                      </a>
                                                  </td>
                                              </tr>
                                          `
                    )
                    .join("")
        }
                    </tbody>
                </table>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 1rem; background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (error) {
        console.error("Error in showPlayerHistory:", error);
        alert("Failed to load player history. Please try again.");
    }
}


const leaderBoardButton = document.getElementById("leader-board");
leaderBoardButton.addEventListener("click", async () => {
    const leaderboard = await fetchLeaderboard();
    displayLeaderboard(leaderboard);
});
