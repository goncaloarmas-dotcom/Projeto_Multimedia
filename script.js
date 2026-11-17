
function analisarPoema() {
    // Vai buscar o texto escrito pelo utilizador
    let poema = document.getElementById("poema").value;

    // Separa o poema em palavras
    let palavras = poema.trim().toLowerCase().split(/\s+/);

    if (poema.trim() === "") {
        alert("Por favor, escreve primeiro um poema!");
        return;
    }

    // Conta as palavras e os caracteres
    let totalPalavras = palavras.length;
    let totalCaracteres = poema.length;

    // Conta quantas vezes aparece cada palavra
    let contagem = {};

    for (let palavra of palavras) {
        palavra = palavra.replace(/[.,!?;:]/g, "");

        if (palavra !== "") {
            if (contagem[palavra]) {
                contagem[palavra]++;
            } else {
                contagem[palavra] = 1;
            }
        }
    }

    // Descobre a palavra mais repetida
    let palavraRepetida = "-";
    let maiorContagem = 0;

    for (let palavra in contagem) {
        if (contagem[palavra] > maiorContagem) {
            maiorContagem = contagem[palavra];
            palavraRepetida = palavra;
        }
    }

    // Apresenta os resultados na página
    document.getElementById("totalPalavras").textContent = totalPalavras;
    document.getElementById("totalCaracteres").textContent = totalCaracteres;
    document.getElementById("palavraRepetida").textContent =
        palavraRepetida + " (" + maiorContagem + " vezes)";
}
