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
let targets = [];
let selectedGun = "";
let selectedTarget = "";

canvas.width = 1000;
canvas.height = 600;

var timeleft = 3;

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
    }
    countdown.textContent = timeleft;
    timeleft -= 1;
  }, 1000);
}

function updateGunType() {
  const guns = document.getElementsByName("gun");
  for (const gun of guns) {
    if (gun.checked) {
      selectedGun = gun.value;
      console.log(selectedGun);
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

  // Buat instance GunClass setelah memilih senjata
  GunClass = new Gun(selectedGun);

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
    targets.push(new Target());
    if (targets.length >= 3) {
      targets.splice(3, 1);
    }
    targets.forEach((object) => object.update());
  }
  
  draw() {
    targets.forEach((object) => object.draw());
  }
}

class Target {
  constructor() {
    this.y = Math.random() * 350;
    this.x = Math.random() * 700;
    this.width = 150;
    this.height = 150;
    
    // Pastikan ID gambar ditentukan di HTML
    this.image = document.getElementById(selectedTarget); // Atur image sesuai target yang dipilih
  }

  update() {}
  
  draw() {
    // c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Gun {
  constructor(selectedGun) {
    this.width = 150;
    this.height = 150;
    
    // Pastikan ID gambar ditentukan di HTML
    this.image = document.getElementById(selectedGun); // Pastikan ID sesuai
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height;
  }
  
  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

const ItemClass = new Item();
let GunClass; // Deklarasikan GunClass di luar agar bisa diinisialisasi di startGame

function animate() {
   ItemClass.update();
   ItemClass.draw();
   if (GunClass) { // Pastikan GunClass sudah terinisialisasi
       GunClass.draw();
       console.log("berhasil")
   }
   requestAnimationFrame(animate);
}

// Mulai animasi
animate();
