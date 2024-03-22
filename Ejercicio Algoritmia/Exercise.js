// Función shapeArea: Calcula el área de un polígono de interés n.
// Parámetro: n - El número que representa el nivel de interés del polígono.
// Retorna: El área del polígono de interés n.
function shapeArea(n) {
    // Fórmula para calcular el área de un polígono de interés n.
    // Area = 1 + 2^2 + 3^2 + ... + n^2 = n*(n + 1)*(2n + 1)/6
    return (n * (n + 1) * (2 * n + 1)) / 6;
}

// Ejemplo de uso con n = 2.
// Se espera que el área del polígono de interés 2 sea 5.
console.log(shapeArea(2)); // Output esperado: 5

// Ejemplo de uso con n = 3.
// Se espera que el área del polígono de interés 3 sea 13.
console.log(shapeArea(3)); // Output esperado: 13
