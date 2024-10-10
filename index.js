function generarPasswordEquilibrada(longitud) {
  if (longitud % 3 !== 0) {
    throw new Error(
      "La longitud debe ser divisible por 3 para tener partes iguales de caracteres alfabéticos, numéricos y especiales."
    );
  }

  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numeros = "0123456789";
  const especiales = "!@#$%^&*()";

  const partesIguales = longitud / 3;
  let password = [];

  function obtenerCaracterAleatorio(cadena) {
    const randomIndex = Math.floor(Math.random() * cadena.length);
    return cadena[randomIndex];
  }

  for (let i = 0; i < partesIguales; i++) {
    password.push(obtenerCaracterAleatorio(letras));
    password.push(obtenerCaracterAleatorio(numeros));
    password.push(obtenerCaracterAleatorio(especiales));
  }

  password = password.sort(() => Math.random() - 0.5);

  return password.join("");
}

// Esta función se llamará cuando el botón sea clickeado
function generarPassword() {
  const longitud = parseInt(document.getElementById("longitud").value);
  try {
    const nuevaPassword = generarPasswordEquilibrada(longitud);
    document.getElementById(
      "resultado"
    ).textContent = `Tu nueva contraseña es: ${nuevaPassword}`;
  } catch (error) {
    document.getElementById(
      "resultado"
    ).textContent = `Error: ${error.message}`;
  }
}
