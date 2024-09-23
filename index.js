import clipboardy from "clipboardy";

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

  const passwordFinal = password.join("");

  // Copiar al portapapeles usando clipboardy
  clipboardy.writeSync(passwordFinal);
  console.log("Contraseña copiada al portapapeles: " + passwordFinal);

  return passwordFinal;
}

// Ejemplo de uso:
const longitudDeseada = 12;
const nuevaPassword = generarPasswordEquilibrada(longitudDeseada);
console.log(`Tu nueva contraseña equilibrada es: ${nuevaPassword}`);
