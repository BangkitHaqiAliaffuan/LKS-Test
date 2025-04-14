// mengambil semua element menggunakan id untuk keperluan fungsi
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
const score = document.getElementById("score");
const gameOver = document.getElementById("gameOver");
// mendlekarasi variabel target untuk diisi
let targets = [];
// mendeklarasi variabel selected gun dan selected target untuk keperluan canvas
let selectedGun = "";
let selectedTarget = "";
// mendeklarasi variabel scores untuk score akhir
var scores = 0;
// mendeklarasi gunClass dan ItemClass
let GunClass;
let itemClass;
// mengatur width dan height semua canvas agar mirip dengan ukuran aslinya
collideCanvas.width = 1000;
collideCanvas.height = 600;
canvas.width = 1000;
canvas.height = 600;

// mendeklarasi variabel timeleft untuk function countdown
var timeleft = 3;
// mendeklarasi var time limit dalam menit
var timeLimitInMinutes = 5;
// mendeklarasi untuk membuat time limit dari menit menjadi detik
var timeLimitInSeconds = timeLimitInMinutes * 60;
// mengambil elemen timer
var timeElement = document.getElementById("timer");

// function untuk memulai timer game
function startTimerGame() {
  // mengurangi time limit detik
  timeLimitInSeconds--;
  // membuat var sisa menit dengan cara membulatkan ke bawah yaitu time limit detik dibagi dengan 60
  var minutes = Math.floor(timeLimitInSeconds / 60);
  /* membuat var sisa detik dengan menggunakan modulus misalnya  

    timelimit second = 480 % 60 = 0
    timelimit second = 479 % 60 = 59
    timelimit second = 478 % 60 = 58
  
  */
  var seconds = timeLimitInSeconds % 60;

  // jika timer sudah mencapai 0 maka element timer akan menjadi 00.00 serta game over screen akan muncul
  if (timeLimitInSeconds < 0) {
    timeElement.textContent = "00.00";
    gameOver.classList.remove("hidden");
    gameOver.classList.add("flex");
    // mematikan semua fungsi dengan return
    return;
  }
  // jika sisa menit lebih kecil daripada 10 menit maka variabel minutes akan tetap menjadi 2 bagian yaitu 0 dan sisa menit di bawah sepuluh
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  // jika sisa detik lebih kecil daripada 10 detik maka variabel seconds akan tetap menjadi 2 bagian yaitu 0 dan sisa detik di bawah sepuluh
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  // mengatur display timer element yang sudah di ambil
  timeElement.textContent = minutes + ":" + seconds;
}

// mengatur terbukanya kolom gun type
function openGunType() {
  if (gunType.classList.contains("hidden")) {
    gunType.classList.remove("hidden");
    gunType.classList.add("flex");
  } else {
    gunType.classList.add("hidden");
    gunType.classList.remove("flex");
  }
}

// mengatur terbukanya kolom target type
function openTargetType() {
  if (targetType.classList.contains("hidden")) {
    targetType.classList.remove("hidden");
    targetType.classList.add("flex");
  } else {
    targetType.classList.add("hidden");
    targetType.classList.remove("flex");
  }
}

// membuat countdown selama 3 detik
function startCountDown() {
  // membuat variabel timernya dengan isi setinterval
  var downloadTimer = setInterval(function () {
    // jika timeleft sama dengan 0 maka interval download timer akan dihapus, lalu menambahkan class hidden untuk countdown, serta menjalankan function start timer game dengan cara set interval selama 1 detik
    if (timeleft <= 0) {
      clearInterval(downloadTimer);
      countdown.classList.add("hidden");
      var timerInterval = setInterval(startTimerGame, 1000);
    }
    // mengatur elemen countdown agar countdown dapat muncul di layar
    countdown.textContent = timeleft;
    // mengurangi timeleft tiap function interval dijalankan yaitu setiap 1 detik
    timeleft -= 1;
  }, 1000);
}

// function yang mengatur update pada input radio gun type dan target
function updateGunAndTargetType() {
  // mengambil element menggunakan nama karena banyak pilihan
  const gunsType = document.getElementsByName("gun");
  const targetsType = document.getElementsByName("target");
  // melakukan for loop dengan menggunakan variabel target sebagai key
  for (const target of targetsType) {
    // jika target di cek maka var selected target akan terisi dengan value target tersebut
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

// function yang mengatur mulainya game
function startGame() {
  // mengatur agar semua elemen yang tidak diperlukan menjadi hidden
  register.classList.remove("flex");
  register.classList.add("hidden");
  game.classList.remove("hidden");
  game.classList.add("flex");
  countdown.classList.remove("hidden");
  countdown.classList.add("flex");
  // membuat variabel baru untuk class masing masing dengan paraneter selected gun dan target
  GunClass = new Gun(selectedGun);
  itemClass = new Item(selectedTarget);
  // memulai function start countdown
  startCountDown();
  // mengambil value nama untuk disimpan dan ditampilkan pada layar
  const name = document.getElementById("name").value;
  playerName.textContent = name;
}

// function yang mengatur disabled atau tidaknya play btn
function togglePlayBtn() {
  // mengambil elemen name
  const usernameInput = document.getElementById("name");
  // jika value usernameInput yang sudah di trim masih memiliki string kosong serta optionlevel yang belum memiliki value
  if (usernameInput.value.trim() === "" && optionLevel.value === "") {
    // btn play akan menjadi disabled dan tak bisa di tekan
    btnPlay.classList.add("disabled");
    btnPlay.style.pointerEvents = "none";
  } else {
    btnPlay.classList.remove("disabled");
    btnPlay.style.cursor = "pointer";
  }
}

window.onload = () => {
  // mengatur timeout untuk welcome screen hanya untuk 3 detik saja
  setTimeout(() => {
    welcome.classList.remove("flex");
    welcome.classList.add("hidden");
  }, 3000);
};

// membuat class item untuk target
class Item {
  update() {
    // jika array targets lengthnya kurang dari 3 maka akan dibuat var newTarget dengan parameter selectedTarget
    if (targets.length < 3) {
      const newTarget = new Target(selectedTarget);
      // serta default value isOverlapping menjadi false
      let isOverLapping = false;
      // menggunakan target sebagai key dari array targets
      for (let target of targets) {
        // jika class Target function isOverLapping dengan parameter other yang diisi dengan target menjadi true maka isoverLapping = true
        if (newTarget.isOverLapping(target)) {
          isOverLapping = true;
          break;
        }
      }
      // jika tidak overlapping maka target akan push value class baru ke array
      if (!isOverLapping) {
        targets.push(newTarget);
      }
    }
    // setiap value array dari target akan menjalankan function yang diberi parameter object untuk menjalankan target update untuk memperbarui value
    targets.forEach((object) => object.update());
  }

  draw() {
    // menjalankan object draw untuk menggambar targetnya
    targets.forEach((object) => object.draw());
  }
}

class Target {
  // menggunakan parameter selectedTarget
  constructor(selectedTarget) {
    // mengatur agar Y direction menjadi random diantara 350 px
    this.y = Math.random() * 350;
    // mengatur agar X direction menjadi random diantara 700 px
    this.x = Math.random() * 700;
    // mengatur width dan height dari elemen target sesuai dengan ukuran gambarnya
    this.width = 150;
    this.height = 150;
    // mengambil element gambar dengann id var selectedTarget
    this.image = document.getElementById(selectedTarget);
  }
  
  // mengecek apakah target lain menimpa target yang sudah di buat
  isOverLapping(other) {
    // membalikkan function dengan operator not
    return !(
      // jika this.x lebih besar daripada other.x + other.width yang berarti jika this.x berada di kanan other.x maka tidak akan menimpa
      (
        this.x > other.x + other.width ||
        // jika this.x + this.width lebih kecil daripada other.x yang berarti jika this.x berada di kiri other.x maka tidak akan menimpa
        this.x + this.width < other.x ||
        // jika this.y lebih besar daripada other.y + other.height yang berarti jika this.y berada di bawah other.y maka tidak akan menimpa
        this.y > other.y + other.height ||
        // jika this.y + this.height lebih kecil daripada other.y yang berarti jika this.y berada di atas other.y maka tidak akan menimpa
        this.y + this.height < other.y
      )
    );
  }
  // menggambar gambar untuk targetnya
  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Gun {
  // menggunakan parameter selectedGun dari function updateGunAndTargetType untuk constructor
  constructor(selectedGun) {
    // width dan height yang diambil dari ukuran gambar
    this.width = 150;
    this.height = 150;
    // mengambil element gambar dengann id var selectedTarget
    this.image = document.getElementById(selectedGun);
    // mengatur supaya this.x berada di tengah tengah canvas
    this.x = canvas.width / 2 - this.width / 2;
    // mengatur supaya this.y berada di paling bawah canvas
    this.y = canvas.height - this.height;
  }

  // menggambar image gun pada layar
  draw() {
    c.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
// mengambil event saat canvas di click 
canvas.addEventListener("click", function (e) {
  // mendapatkan informasi posisi dan ukuran canvas dalam hubungan dengan viewport
  const rect = collideCanvas.getBoundingClientRect();
  // menghitung posisi horizontal kursor relatif terhadap elemen canvas
  const x = e.clientX - rect.left; 
  // menghitung posisi vertical kursor relatif terhadap elemen canvas
  const y = e.clientY - rect.top;

  // default value var apakah target berada di area mouse yang di klik
  let isInTargetArea = false;
  // menggunakan for loop i-- untuk looping fungsi if 
  for (let i = targets.length - 1; i >= 0; i--) {
    // membuat variabel target untuk array targets dengan indeks i supaya bisa terulang ulang
    let target = targets[i];
    if (
      /*
      
      jika x lebih besar sama dengan target.x dan 
      jika x lebih kecil sama dengan target.x + target.width dan
      jika y lebih besar sama dengan target.y dan
      jika y lebih kecil sama dengan target.y + target.height dan

      */ 
      x >= target.x &&
      x <= target.x + target.width &&
      y >= target.y &&
      y <= target.y + target.height
    ) {
      // is in target area menjadi true
      isInTargetArea = true;
      // value class target dalam array targets akan dihapus
      targets.splice(i, 1);
      // menghapus seluruh gambar canvas supaya dapat menghilangkan target yang sudah tidak digunakan
      c.clearRect(0, 0, canvas.width, canvas.height);
      // menambah time limit setiap tembakan terkena
      timeLimitInSeconds += 2;
      // menambah score
      scores++;
      // menampilkan score
      score.textContent = scores;
      break;
    }
  }
  // jika yang di klik tidak mengenai target area maka time limit akan dikurangi
  if (!isInTargetArea) {
    timeLimitInSeconds -= 10;
  }
});

// function untuk menganimasikan setiap frame 
function animate() {
  // menunggu gunclass dan itemclass selesai loading
  if (GunClass && itemClass) {
    // menjalankan function dalam setiap class
    itemClass.update();
    itemClass.draw();
    GunClass.draw();
  }
  // kunci penting supaya frame selalu berjalan
  requestAnimationFrame(animate);
}
// memanggil function animate
animate();
