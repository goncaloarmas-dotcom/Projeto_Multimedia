"use strict";

// =============================================================================
// BANCO DE DESAFIOS DO REACTION CHALLENGE
// =============================================================================
const reactionBank = [
    // --- Matemática mental ---
    { question: "Quanto é 17 + 28?", answer: "45", acceptable: ["45"] },
    { question: "Quanto é 12 × 12?", answer: "144", acceptable: ["144"] },
    { question: "Quanto é 200 - 76?", answer: "124", acceptable: ["124"] },
    { question: "Quanto é 81 ÷ 9?", answer: "9", acceptable: ["9"] },
    { question: "Quanto é 15 × 6?", answer: "90", acceptable: ["90"] },
    { question: "Quanto é 250 + 175?", answer: "425", acceptable: ["425"] },
    { question: "Quanto é metade de 186?", answer: "93", acceptable: ["93"] },
    { question: "Quanto é 11 × 11?", answer: "121", acceptable: ["121"] },
    { question: "Quanto é 1000 - 375?", answer: "625", acceptable: ["625"] },
    { question: "Quanto é 144 ÷ 8?", answer: "18", acceptable: ["18"] },
    { question: "Quanto é 8 × 9?", answer: "72", acceptable: ["72"] },
    { question: "Quanto é 15 × 4?", answer: "60", acceptable: ["60"] },
    { question: "Quanto é 100 - 37?", answer: "63", acceptable: ["63"] },
    { question: "Quanto é 144 ÷ 9?", answer: "16", acceptable: ["16"] },
    { question: "Quanto é 7²?", answer: "49", acceptable: ["49"] },
    { question: "Quanto é 25 × 4?", answer: "100", acceptable: ["100"] },

    // --- Sequências numéricas e padrões ---
    { question: "Completa: 2, 6, 10, 14, ...", answer: "18", acceptable: ["18"] },
    { question: "Completa: 2, 4, 8, 16, ...", answer: "32", acceptable: ["32"] },
    { question: "Completa: 5, 10, 15, 20, ...", answer: "25", acceptable: ["25"] },
    { question: "Completa: 1, 4, 9, 16, ...", answer: "25", acceptable: ["25"] },
    { question: "Completa: 3, 6, 12, 24, ...", answer: "48", acceptable: ["48"] },
    { question: "Completa: 100, 90, 80, 70, ...", answer: "60", acceptable: ["60"] },
    { question: "Completa: 1, 1, 2, 3, 5, 8, ...", answer: "13", acceptable: ["13"] },
    { question: "Completa: 10, 20, 30, 40, ...", answer: "50", acceptable: ["50"] },
    { question: "Completa: 2, 5, 8, 11, ...", answer: "14", acceptable: ["14"] },
    { question: "Completa: 50, 45, 40, 35, ...", answer: "30", acceptable: ["30"] },

    // --- Raciocínio lógico ---
    {
        question: "Qual não pertence ao grupo: maçã, banana, cenoura, pera?",
        answer: "Cenoura",
        acceptable: ["cenoura"],
    },
    {
        question: "Se ontem foi segunda-feira, que dia será amanhã?",
        answer: "Quarta-feira",
        acceptable: ["quarta-feira", "quarta feira", "quarta", "quartafeira"],
    },
    {
        question: "Tenho 3 maçãs e dou 1. Quantas me restam?",
        answer: "2",
        acceptable: ["2", "duas", "2 macas"],
    },
    {
        question: "Quantos meses têm 28 dias?",
        answer: "12",
        acceptable: ["12", "todos", "todos os 12", "12 meses", "os 12"],
    },
    {
        question: "Se um relógio marca 3 horas, qual será a hora daqui a 5 horas?",
        answer: "8 horas",
        acceptable: ["8", "8h", "8 horas", "oito"],
    },
    {
        question: "Um pai tem 40 anos e o filho 10. Daqui a 5 anos, qual será a diferença de idades?",
        answer: "30 anos",
        acceptable: ["30", "30 anos", "trinta"],
    },
    {
        question: "Se hoje é domingo, que dia foi anteontem?",
        answer: "Sexta-feira",
        acceptable: ["sexta-feira", "sexta feira", "sexta", "sextafeira"],
    },
    {
        question: "Qual não pertence ao grupo: cão, gato, leão, carro?",
        answer: "Carro",
        acceptable: ["carro"],
    },

    // --- Cultura geral ---
    { question: "Qual é a capital de Portugal?", answer: "Lisboa", acceptable: ["lisboa"] },
    { question: "Qual é o maior planeta do Sistema Solar?", answer: "Júpiter", acceptable: ["jupiter", "júpiter"] },
    { question: "Quantos dias tem uma semana?", answer: "7", acceptable: ["7", "sete", "7 dias"] },
    { question: "Qual é o oceano entre a Europa e a América?", answer: "Atlântico", acceptable: ["atlantico", "atlântico", "oceano atlantico"] },
    { question: "Qual é a língua oficial do Brasil?", answer: "Português", acceptable: ["portugues", "português"] },
    { question: "Quantas cores tem tradicionalmente o arco-íris?", answer: "7", acceptable: ["7", "sete", "7 cores"] },
    { question: "Qual é a capital de França?", answer: "Paris", acceptable: ["paris"] },

    // --- Desafios rápidos ---
    { question: "Quantas letras tem a palavra COMPUTADOR?", answer: "10", acceptable: ["10", "dez", "10 letras"] },
    { question: "Qual é o contrário de aumentar?", answer: "Diminuir", acceptable: ["diminuir", "reduzir", "baixar"] },
    { question: "Qual é a terceira letra do alfabeto?", answer: "C", acceptable: ["c"] },
    { question: "Quantos segundos existem num minuto?", answer: "60", acceptable: ["60", "sessenta", "60 segundos", "60s"] },
    { question: "Qual é o dobro de 37?", answer: "74", acceptable: ["74"] },
    { question: "Se tens 20 euros e gastas 7, quanto sobra?", answer: "13 euros", acceptable: ["13", "13€", "13 euros", "treze"] },
    { question: "Quanto é 6 × 7?", answer: "42", acceptable: ["42"] },
    { question: "Quanto é 50 ÷ 2?", answer: "25", acceptable: ["25"] },
    { question: "Qual é o triplo de 9?", answer: "27", acceptable: ["27"] },
    { question: "Quantos lados tem um quadrado?", answer: "4", acceptable: ["4", "quatro"] },
    { question: "Quanto é 100 ÷ 4?", answer: "25", acceptable: ["25"] },
    { question: "Qual é o contrário de quente?", answer: "Frio", acceptable: ["frio"] },
    { question: "Quantas horas tem um dia?", answer: "24", acceptable: ["24", "vinte e quatro", "24 horas", "24h"] },
    { question: "Quanto é 9 × 9?", answer: "81", acceptable: ["81"] },
];

// =============================================================================
// VALIDAÇÃO INTELIGENTE DE RESPOSTAS (NORMALIZAÇÃO AVANÇADA)
// =============================================================================

// Normaliza texto: remove acentos, maiúsculas, pontuação, aspas e normaliza espaços/traços
function normalizeAnswer(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/['"“”‘’`]/g, "")       // remove aspas
        .replace(/[.,!?;:]/g, "")       // remove pontuação
        .replace(/[-_–—]/g, " ")        // substitui hífenes e traços por espaços
        .replace(/\s+/g, " ")           // unifica múltiplos espaços num único
        .trim();
}

// Remove todos os espaços para permitir comparação sem espaços (ex.: "quarta feira" vs "quartafeira")
function stripAllSpaces(text) {
    return normalizeAnswer(text).replace(/\s+/g, "");
}

// Validação comparativa inteligente e flexível
function checkReactionAnswer(userAnswer, challenge) {
    const rawUser = String(userAnswer || "").trim();
    if (!rawUser) return false;

    const normUser = normalizeAnswer(rawUser);
    const compactUser = stripAllSpaces(rawUser);

    const normCorrect = normalizeAnswer(challenge.answer);
    const compactCorrect = stripAllSpaces(challenge.answer);

    // 1. Igualdade direta normalizada
    if (normUser === normCorrect || compactUser === compactCorrect) {
        return true;
    }

    // 2. Verificação na lista de aceitáveis do desafio
    if (Array.isArray(challenge.acceptable)) {
        for (const alt of challenge.acceptable) {
            if (normUser === normalizeAnswer(alt) || compactUser === stripAllSpaces(alt)) {
                return true;
            }
        }
    }

    // 3. Tolerância a respostas numéricas com/sem unidades (ex.: "8 horas" -> "8", "13 euros" -> "13")
    const numMatch = challenge.answer.match(/^(\d+)\s*(horas|anos|euros|dias|minutos|macas|cores|letras|s|h)?$/i);
    if (numMatch) {
        const numOnly = numMatch[1];
        if (
            normUser === numOnly ||
            normUser === `${numOnly}h` ||
            normUser === `${numOnly}€` ||
            normUser === `${numOnly} euros` ||
            normUser === `${numOnly} eur` ||
            normUser === `${numOnly} horas` ||
            normUser === `${numOnly} anos` ||
            normUser === `${numOnly} dias`
        ) {
            return true;
        }
    }

    return false;
}
