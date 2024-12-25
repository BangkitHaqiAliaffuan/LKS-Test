const gunType = document.getElementById("gunType");
const welcome = document.getElementById("welcome");
const btnPlay = document.getElementById("btnPlay");
const game = document.getElementById("game");
const register = document.getElementById("register");
const targetType = document.getElementById("targetType");
const countdown = document.getElementById("countdown");
const playerName = document.getElementById("playerName");
const optionLevel = document.getElementById("level");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const collideCanvas = document.getElementById("collideCanvas");
const cc = collideCanvas.getContext("2d");
const score = document.getElementById("score") 
const gameOver = document.getElementById("gameOver")
let targets = [];
let selectedGun = "";
let selectedTarget = "";
var scores = 0
collideCanvas.width = 1000;
collideCanvas.height = 600;
canvas.width = 1000;
canvas.height = 600;

var timeleft = 3;
var timeLimitInMinutes = 5;
var timeLimitInSeconds = timeLimitInMinutes * 60;

var timeElement = document.getElementById("timer");

function startTimerGame() {
  timeLimitInSeconds--;
  var minutes = Math.floor(timeLimitInSeconds / 60);
  var seconds = timeLimitInSeconds % 60;
  if (timeLimitInSeconds < 0) {
    timeElement.textContent = "00.00";
    gameOver.classList.remove("hidden")
    gameOver.classList.add("flex")
    return;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  timeElement.textContent = minutes + ":" + seconds;
}



function openGunType() {
  if (gunType.classList.contains("hidden")) {
    gunType.classList.remove("hidden");
    gunType.classList.add("flex");
  } else {
    gunType.classList.add("hidden");
    gunType.classList.remove("flex");
  }
}

function openTargetType() {
  if (targetType.classList.contains("hidden")) {
    targetType.classList.remove("hidden");
    targetType.classList.add("flex");
  } else {
    targetType.classList.add("hidden");
    targetType.classList.remove("flex");
  }
}

function startCountDown() {
  var downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);
      countdown.classList.add("hidden");
      var timerInterval = setInterval(startTimerGame, 1000);
    }
    countdown.textContent = timeleft;
    timeleft -= 1;
  }, 1000);
}

function updateGunAndTargetType() {
  const gunsType = document.getElementsByName("gun");
  const targetsType = document.getElementsByName("target");
  for (const target of targetsType) {
    if (target.checked) {
      selectedTarget = target.value;
    }
  }
  for (const gun of gunsType) {
    if (gun.checked) {
      selectedGun = gun.value;
    }
  }
}

function startGame() {
  register.classList.remove("flex");
  register.classList.add("hidden");
  game.classList.remove("hidden");
  game.classList.add("flex");
  countdown.classList.remove("hidden");
  countdown.classList.add("flex");
  GunClass = new Gun(selectedGun);
  itemClass = new Item(selectedTarget);
  startCountDown();
  const name = document.getElementById("name").value;
  playerName.textContent = name;
  console.log(name);
}

function togglePlayBtn() {
  const usernameInput = document.getElementById("name");
  if (usernameInput.value.trim() === "" && optionLevel.value === "") {
    btnPlay.classList.add("disabled");
    btnPlay.style.pointerEvents = "none";
  } else {
    btnPlay.classList.remove("disabled");
    btnPlay.style.cursor = "pointer";
  }
}

window.onload = () => {
  btnPlay.classList.add("disabled");

  setTimeout(() => {
    welcome.classList.remove("flex");
    welcome.classList.add("hidden");
  }, 3000);
};

class Item {
  update() {
    if (targets.length < 3) {
      const newTarget = new Target(selectedTarget);
      let isOverLapping = false;
      for (let target of targets) {
        if (newTarget.isOverLapping(target)) {
          isOverLapping = true;
          break;
        }
      }

      if (!isOverLapping) {
        targets.push(newTarget);
      }
    }

    targets.forEach((object) => object.update());
  }

  draw() {
    targets.forEach((object) => object.draw());
  }
}

class Target {
  constructor(selectedTarget) {
    this.y = Math.random() * 350;
    this.x = Math.random() * 700;
    this.width = 150;
    this.height = 150;
    this.image = document.getElementById(selectedTarget);
    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColor[0] +
      "," +
      this.randomColor[1] +
      "," +
      this.randomColor[2] +
      ")";
  }

  isOverLapping(other) {
    return !(
      this.x > other.x + other.width ||
      this.x + this.width < other.x ||
      this.y > other.y + other.height ||
      this.y + this.height < other.y
    );
  }

  update() {}
  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Gun {
  constructor(selectedGun) {
    this.width = 150;
    this.height = 150;

    this.image = document.getElementById(selectedGun);
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height;
  }

  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

canvas.addEventListener("click", function (e) {
  const rect = collideCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let isInTargetArea = false;
  for (let i = targets.length - 1; i >= 0; i--) {
    let target = targets[i];
    if (
      x >= target.x &&
      x <= target.x + target.width &&
      y >= target.y &&
      y <= target.y + target.height
    ) {
      isInTargetArea = true;
      targets.splice(i, 1);
      c.clearRect(0, 0, canvas.width, canvas.height);
      timeLimitInSeconds += 2;
      scores++
      score.textContent = scores
      break;
    }
  }
  
  if (!isInTargetArea) {
    timeLimitInSeconds -= 10;
  }
});


let GunClass;
let itemClass;

function animate() {
  if (GunClass && itemClass) {
    itemClass.update();
    itemClass.draw();
    GunClass.draw();
  }
  requestAnimationFrame(animate);
}

animate();
