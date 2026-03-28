const PasswordGenerator = (() => {
  const CONFIG = {
    chars: {
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      specials: "!@#$%^&*()"
    },
    defaults: {
      length: 6,
      lengthMin: 3,
      lengthMax: 30,
      numbers: 0,
      specials: 0
    },
    animation: {
      duration: 2000
    },
    rateLimit: {
      cooldownMs: 500
    }
  };

  let currentPassword = "";

  function generateEquilibratedPassword(length) {
    if (length > CONFIG.defaults.lengthMax || length <= 0) {
      throw new Error(`Length must be between ${CONFIG.defaults.lengthMin} and ${CONFIG.defaults.lengthMax}`);
    }

    const letters = CONFIG.chars.lowercase + CONFIG.chars.uppercase;

    const numbersQty = parseInt(document.getElementById("number").value);
    const specialsQty = parseInt(document.getElementById("special").value);
    const lengthQty = parseInt(document.getElementById("length").value) - numbersQty - specialsQty;

    let password = [];

    function obtainRandomCharacter(chain) {
      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % chain.length;
      return chain[randomIndex];
    }

    for (let i = 0; i < lengthQty; i++) {
      password.push(obtainRandomCharacter(letters));
    }
    for (let i = 0; i < numbersQty; i++) {
      password.push(obtainRandomCharacter(CONFIG.chars.numbers));
    }
    for (let i = 0; i < specialsQty; i++) {
      password.push(obtainRandomCharacter(CONFIG.chars.specials));
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

  function updateStrength(password) {
    const strengthContainer = document.getElementById("strength-container");
    const strengthFill = document.getElementById("strength-fill");
    const strengthText = document.getElementById("strength-text");

    if (!password) {
      strengthContainer.classList.remove("visible");
      return;
    }

    strengthContainer.classList.add("visible");

    const length = password.length;
    const hasNumbers = /\d/.test(password);
    const hasSpecials = /[!@#$%^&*()]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);

    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (hasNumbers) score++;
    if (hasSpecials) score++;
    if (hasUpper && hasLower) score++;

    let level, label;
    if (score <= 2) {
      level = "weak";
      label = "Weak";
    } else if (score <= 3) {
      level = "fair";
      label = "Fair";
    } else if (score <= 4) {
      level = "good";
      label = "Good";
    } else {
      level = "strong";
      label = "Strong";
    }

    strengthFill.className = level;
    strengthText.className = level;
    strengthText.textContent = label;
  }

  function generatePassword() {
    const btn = document.getElementById("btn-generate");

    if (btn.disabled) return;

    const length = parseInt(document.getElementById("length").value);
    try {
      currentPassword = generateEquilibratedPassword(length);
      document.getElementById("result").textContent = currentPassword;
      document.getElementById("result-box").classList.add("has-password");

      updateStrength(currentPassword);

      anime({
        targets: "#result",
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: CONFIG.animation.duration,
        easing: "easeOutElastic(1, .8)",
      });

      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = "Wait...";
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, CONFIG.rateLimit.cooldownMs);
    } catch (error) {
      document.getElementById("result").textContent = `Error: ${error.message}`;
      document.getElementById("result-box").classList.remove("has-password");
      updateStrength("");
    }
  }

  function copyPassword() {
    if (!currentPassword) {
      document.getElementById("btn-copy").textContent = "Generate one first!";
      setTimeout(() => {
        document.getElementById("btn-copy").textContent = "Copy";
      }, 1500);
      return;
    }

    navigator.clipboard
      .writeText(currentPassword)
      .then(() => {
        document.getElementById("btn-copy").textContent = "Copied!";
        setTimeout(() => {
          document.getElementById("btn-copy").textContent = "Copy";
        }, 1000);
      })
      .catch((err) => {
        console.error("Error copying to clipboard: ", err);
      });
  }

  function init() {
    document.getElementById("year").textContent = new Date().getFullYear();

    const lengthInput = document.getElementById("length");
    const lengthSlider = document.getElementById("length-slider");

    lengthSlider.addEventListener("input", () => {
      lengthInput.value = lengthSlider.value;
      validateInputs();
    });

    lengthInput.addEventListener("input", () => {
      let val = parseInt(lengthInput.value);
      if (val < CONFIG.defaults.lengthMin) val = CONFIG.defaults.lengthMin;
      if (val > CONFIG.defaults.lengthMax) val = CONFIG.defaults.lengthMax;
      lengthSlider.value = val;
      validateInputs();
    });

    document.getElementById("number").addEventListener("input", validateInputs);
    document.getElementById("special").addEventListener("input", validateInputs);
    document.getElementById("btn-generate").addEventListener("click", generatePassword);
    document.getElementById("btn-copy").addEventListener("click", copyPassword);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (
          document.activeElement === document.body ||
          document.activeElement === document.getElementById("result-box") ||
          document.activeElement === document.getElementById("result")
        ) {
          e.preventDefault();
          generatePassword();
        }
      }
    });
  }

  return { init, generatePassword, copyPassword, generateEquilibratedPassword, CONFIG };
})();

document.addEventListener("DOMContentLoaded", PasswordGenerator.init);
