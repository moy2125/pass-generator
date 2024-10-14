function generateEquilibratedPassword(lenght) {
  if (lenght % 3 !== 0) {
    throw new Error(
      "The lenght should be divisible by 3 to have  equal parts of alphabetic, numeric and special characters."
    );
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()";

  const equalParts = lenght / 3;
  let password = [];

  function obtainRandomCharacter(chain) {
    const randomIndex = Math.floor(Math.random() * chain.length);
    return chain[randomIndex];
  }

  for (let i = 0; i < equalParts; i++) {
    password.push(obtainRandomCharacter(letters));
    password.push(obtainRandomCharacter(numbers));
    password.push(obtainRandomCharacter(specials));
  }

  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}

// This  function will be called when the button is clicked

let newPasswordGlobal = "";

function generatePassword() {
  const lenght = parseInt(document.getElementById("lenght").value);
  try {
    let newPassword = generateEquilibratedPassword(lenght);
    document.getElementById(
      "result"
    ).textContent = `Your new password is: ${newPassword}`;
    newPasswordGlobal = newPassword;
  } catch (error) {
    document.getElementById("result").textContent = `Error: ${error.message}`;
  }
}

function copyPassword() {
  navigator.clipboard
    .writeText(newPasswordGlobal)
    .then(() => {
      document.getElementById("copy").textContent = "Password copied!";
      setTimeout(() => {
        document.getElementById("copy").textContent = "Copy Password";
      }, 2000);

      console.log("Password successfuly copied!");
    })
    .catch((err) => {
      console.error("Error al copiar texto: ", err);
    });
}
