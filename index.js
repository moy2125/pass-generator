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

  // if (numbersQty + specialsQty > lengthQty) {
  //   throw new Error(
  //     `The sum of  numbers and specials should be less or equal to ${lengthQty}`
  //   );
  // }
  let password = [];

  function obtainRandomCharacter(chain) {
    const randomIndex = Math.floor(Math.random() * chain.length);
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

  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}

// This  function will be called when the "Generate Password" button is clicked
let newPasswordGlobal = "";

function generatePassword() {
  const length = parseInt(document.getElementById("length").value);
  try {
    let newPassword = generateEquilibratedPassword(length);
    document.getElementById(
      "result"
    ).textContent = `Your new password is: ${newPassword}`;
    newPasswordGlobal = newPassword;
  } catch (error) {
    document.getElementById("result").textContent = `Error: ${error.message}`;
  }
}

// This  function will be called when the "Copy Password" button is clicked

function copyPassword() {
  navigator.clipboard
    .writeText(newPasswordGlobal)
    .then(() => {
      document.getElementById("copy").textContent = "Password copied!";
      setTimeout(() => {
        document.getElementById("copy").textContent = "Copy Password";
      }, 1000);

      console.log("Password successfuly copied!");
    })
    .catch((err) => {
      console.error("Error al copiar texto: ", err);
    });
}
