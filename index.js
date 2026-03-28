function generateEquilibratedPassword(length) {
  if (length > 30 || length <= 0) {
    throw new Error("The length should be more than 0 and less or equal to 30");
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()";

  const numbersQty = parseInt(document.getElementById("number").value);
  const specialsQty = parseInt(document.getElementById("special").value);
  const lengthQty =
    parseInt(document.getElementById("length").value) -
    numbersQty -
    specialsQty;

  let password = [];

  function obtainRandomCharacter(chain) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % chain.length;
    return chain[randomIndex];
  }

  for (let i = 0; i < lengthQty; i++) {
    password.push(obtainRandomCharacter(letters));
  }
  for (let i = 0; i < numbersQty; i++) {
    password.push(obtainRandomCharacter(numbers));
  }
  for (let i = 0; i < specialsQty; i++) {
    password.push(obtainRandomCharacter(specials));
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

function validateInputs() {
  const length = parseInt(document.getElementById("length").value) || 0;
  const numbers = parseInt(document.getElementById("number").value) || 0;
  const specials = parseInt(document.getElementById("special").value) || 0;
  const msg = document.getElementById("validation-msg");
  const btn = document.getElementById("btn-generate");

  if (numbers + specials > length) {
    msg.textContent = `Numbers (${numbers}) + specials (${specials}) can't exceed length (${length})`;
    btn.disabled = true;
  } else {
    msg.textContent = "";
    btn.disabled = false;
  }
}

// This  function will be called when the "Generate Password" button is clicked
let newPasswordGlobal = "";

function generatePassword() {
  const btn = document.getElementById("btn-generate");
  
  if (btn.disabled) return;
  
  const length = parseInt(document.getElementById("length").value);
  try {
    let newPassword = generateEquilibratedPassword(length);
    document.getElementById("result").textContent = newPassword;
    document.getElementById("result-box").classList.add("has-password");
    newPasswordGlobal = newPassword;

    anime({
      targets: "#result",
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 2000,
      easing: "easeOutElastic(1, .8)",
    });

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Wait...";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 500);
  } catch (error) {
    document.getElementById("result").textContent = `Error: ${error.message}`;
    document.getElementById("result-box").classList.remove("has-password");
  }
}

// This  function will be called when the "Copy Password" button is clicked

function copyPassword() {
  if (!newPasswordGlobal) {
    document.getElementById("btn-copy").textContent = "Generate one first!";
    setTimeout(() => {
      document.getElementById("btn-copy").textContent = "Copy";
    }, 1500);
    return;
  }

  navigator.clipboard
    .writeText(newPasswordGlobal)
    .then(() => {
      document.getElementById("btn-copy").textContent = "Copied!";
      setTimeout(() => {
        document.getElementById("btn-copy").textContent = "Copy";
      }, 1000);
    })
    .catch((err) => {
      console.error("Error al copiar texto: ", err);
    });
}

document.getElementById("year").textContent = new Date().getFullYear();

const lengthInput = document.getElementById("length");
const lengthSlider = document.getElementById("length-slider");

lengthSlider.addEventListener("input", () => {
  lengthInput.value = lengthSlider.value;
  validateInputs();
});

lengthInput.addEventListener("input", () => {
  let val = parseInt(lengthInput.value);
  if (val < 3) val = 3;
  if (val > 30) val = 30;
  lengthSlider.value = val;
  validateInputs();
});

document.getElementById("number").addEventListener("input", validateInputs);
document.getElementById("special").addEventListener("input", validateInputs);
document.getElementById("btn-generate").addEventListener("click", generatePassword);
document.getElementById("btn-copy").addEventListener("click", copyPassword);
