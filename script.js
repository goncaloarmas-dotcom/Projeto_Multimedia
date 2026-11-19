"use strict";

// Dados das perguntas e dos desafios
const quizQuestions = [
    {
        question: "Qual planeta é conhecido como o Planeta Vermelho?",
        options: ["Vénus", "Marte", "Júpiter", "Mercúrio"],
        correct: "Marte",
    },
    {
        question: "Quanto é 9 × 7?",
        options: ["56", "63", "72", "49"],
        correct: "63",
    },
    {
        question: "Qual é a capital da Austrália?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correct: "Canberra",
    },
    {
        question: "Para que serve principalmente o HTML?",
        options: [
            "Estruturar páginas Web",
            "Editar fotografias",
            "Criar folhas de cálculo",
            "Proteger um computador contra vírus",
        ],
        correct: "Estruturar páginas Web",
    },
    {
        question: "Quem escreveu a obra «Os Lusíadas»?",
        options: [
            "Fernando Pessoa",
            "Eça de Queirós",
            "Luís de Camões",
            "José Saramago",
        ],
        correct: "Luís de Camões",
    },
];

const reactionChallenges = [
    { question: "Quanto é 8 × 7?", answer: "56" },
    { question: "Completa o padrão: 2, 4, 8, 16, ...", answer: "32" },
    {
        question: "Qual não pertence ao grupo: maçã, banana, cenoura, pera?",
        answer: "cenoura",
    },
    { question: "Completa o padrão: 3, 6, 9, 12, ...", answer: "15" },
    {
        question: "Se ontem foi segunda-feira, que dia será amanhã?",
        answer: "quarta-feira",
    },
];

const storageKey = "brainTrainingHubStateV1";


// Cria o estado inicial de todos os jogos
function createInitialState() {
    return {
        currentPage: "home",
        logic: {
            secretNumber: Math.floor(Math.random() * 100) + 1,
            attempts: 0,
            score: 0,
            done: false,
            feedback: "",
            feedbackType: "",
        },
        quiz: {
            answers: Array(quizQuestions.length).fill(null),
            score: 0,
            done: false,
            feedback: "",
            feedbackType: "",
        },
        reaction: {
            index: 0,
            score: 0,
            done: false,
            answers: [],
            startedAt: null,
            startedIndex: -1,
            feedback: "",
            feedbackType: "",
        },
    };
}


// Carrega os dados guardados nesta sessão do navegador
function loadState() {
    const savedState = sessionStorage.getItem(storageKey);

    if (!savedState) {
        return createInitialState();
    }

    try {
        const parsedState = JSON.parse(savedState);

        if (
            parsedState &&
            parsedState.logic &&
            parsedState.quiz &&
            parsedState.reaction
        ) {
            return parsedState;
        }
    } catch (error) {
        console.warn("Não foi possível carregar o estado guardado.", error);
    }

    return createInitialState();
}

let state = loadState();

function saveState() {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
}


// Mostra uma página e esconde as restantes
function showPage(pageName) {
    const pages = ["home", "logic", "quiz", "reaction", "results"];

    pages.forEach((page) => {
        const section = document.getElementById(`page-${page}`);
        section.hidden = page !== pageName;
    });

    state.currentPage = pageName;
    saveState();
    renderCurrentPage();
}


// Apresenta uma mensagem com o estilo adequado
function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `feedback ${type}`;
    element.hidden = false;
}

function hideFeedback(element) {
    element.textContent = "";
    element.className = "feedback";
    element.hidden = true;
}


// Atualiza a interface de acordo com o estado guardado
function renderCurrentPage() {
    document.getElementById("page-home").hidden = state.currentPage !== "home";
    document.getElementById("page-logic").hidden = state.currentPage !== "logic";
    document.getElementById("page-quiz").hidden = state.currentPage !== "quiz";
    document.getElementById("page-reaction").hidden =
        state.currentPage !== "reaction";
    document.getElementById("page-results").hidden =
        state.currentPage !== "results";

    renderLogic();
    renderQuiz();
    renderReaction();
    renderFinalResults();
}


// Atualiza o Logic Challenge
function renderLogic() {
    const logic = state.logic;
    const form = document.getElementById("logic-form");
    const finished = document.getElementById("logic-finished");
    const feedback = document.getElementById("logic-feedback");

    document.getElementById("logic-attempts").textContent =
        `Tentativas utilizadas: ${logic.attempts} de 10`;

    form.hidden = logic.done;
    finished.hidden = !logic.done;

    if (logic.feedback) {
        showFeedback(feedback, logic.feedback, logic.feedbackType);
    } else {
        hideFeedback(feedback);
    }

    if (logic.done) {
        document.getElementById("logic-score").textContent =
            `Pontuação: ${logic.score} / 10`;
    }
}


// Atualiza o Quick Quiz
function renderQuiz() {
    const quiz = state.quiz;
    const form = document.getElementById("quiz-form");
    const results = document.getElementById("quiz-results");
    const feedback = document.getElementById("quiz-feedback");

    form.hidden = quiz.done;
    results.hidden = !quiz.done;

    if (quiz.feedback) {
        showFeedback(feedback, quiz.feedback, quiz.feedbackType);
    } else {
        hideFeedback(feedback);
    }

    if (!quiz.done) {
        return;
    }

    const resultItems = document.getElementById("quiz-result-items");
    resultItems.replaceChildren();

    quizQuestions.forEach((question, index) => {
        const item = document.createElement("p");
        const isCorrect = quiz.answers[index] === question.correct;

        item.className = `result-item ${isCorrect ? "correct" : "incorrect"}`;

        if (isCorrect) {
            item.textContent = `Pergunta ${index + 1}: correta! Ganhaste 2 pontos.`;
        } else {
            const userAnswer = quiz.answers[index] || "Sem resposta";
            item.textContent =
                `Pergunta ${index + 1}: ${userAnswer}. ` +
                `A resposta correta era: ${question.correct}.`;
        }

        resultItems.appendChild(item);
    });

    document.getElementById("quiz-score").textContent =
        `Pontuação: ${quiz.score} / 10`;
}


// Atualiza o Reaction Challenge
function renderReaction() {
    const reaction = state.reaction;
    const form = document.getElementById("reaction-form");
    const finished = document.getElementById("reaction-finished");
    const feedback = document.getElementById("reaction-feedback");

    if (!reaction.done && reaction.index < reactionChallenges.length) {
        if (reaction.startedIndex !== reaction.index || reaction.startedAt === null) {
            reaction.startedAt = Date.now();
            reaction.startedIndex = reaction.index;
            saveState();
        }

        document.getElementById("reaction-progress").textContent =
            `Desafio ${reaction.index + 1} de ${reactionChallenges.length}`;
        document.getElementById("reaction-question").textContent =
            reactionChallenges[reaction.index].question;

        form.hidden = false;
        finished.hidden = true;

        if (reaction.feedback) {
            showFeedback(feedback, reaction.feedback, reaction.feedbackType);
        } else {
            hideFeedback(feedback);
        }

        return;
    }

    form.hidden = true;
    finished.hidden = !reaction.done;
    document.getElementById("reaction-progress").textContent = "";

    if (!reaction.done) {
        return;
    }

    hideFeedback(feedback);

    const resultItems = document.getElementById("reaction-result-items");
    resultItems.replaceChildren();

    reaction.answers.forEach((answer, index) => {
        const item = document.createElement("p");
        item.className = `result-item ${answer.points === 2 ? "correct" : "incorrect"}`;
        item.textContent =
            `Desafio ${index + 1}: ${answer.points} pontos ` +
            `(${answer.elapsed.toFixed(1)} segundos).`;
        resultItems.appendChild(item);
    });

    document.getElementById("reaction-score").textContent =
        `Pontuação: ${reaction.score} / 10`;
}


// Calcula e apresenta a classificação final
function renderFinalResults() {
    const total =
        state.logic.score +
        state.quiz.score +
        state.reaction.score;
    const percentage = (total / 30) * 100;

    let rating;

    if (percentage <= 20) {
        rating = "Iniciante";
    } else if (percentage <= 40) {
        rating = "Em desenvolvimento";
    } else if (percentage <= 60) {
        rating = "Inteligência média";
    } else if (percentage <= 80) {
        rating = "Inteligência elevada";
    } else {
        rating = "Génio";
    }

    document.getElementById("final-logic-score").textContent =
        `${state.logic.score} / 10 pontos`;
    document.getElementById("final-quiz-score").textContent =
        `${state.quiz.score} / 10 pontos`;
    document.getElementById("final-reaction-score").textContent =
        `${state.reaction.score} / 10 pontos`;
    document.getElementById("final-total").textContent =
        `${total} / 30 pontos`;
    document.getElementById("final-rating").textContent =
        `${percentage.toFixed(1)}% · Classificação: ${rating}`;
}


// Submissão do Logic Challenge
document.getElementById("logic-form").addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.logic.done) {
        return;
    }

    const input = document.getElementById("logic-guess");
    const guess = input.valueAsNumber;

    if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
        showFeedback(
            document.getElementById("logic-feedback"),
            "Introduz um número inteiro entre 1 e 100.",
            "warning"
        );
        return;
    }

    state.logic.attempts += 1;

    if (guess === state.logic.secretNumber) {
        state.logic.score = 11 - state.logic.attempts;
        state.logic.done = true;
        state.logic.feedback =
            `Correto! Acertaste em ${state.logic.attempts} tentativa(s) ` +
            `e ganhaste ${state.logic.score} pontos.`;
        state.logic.feedbackType = "success";
    } else if (guess > state.logic.secretNumber) {
        state.logic.feedback = "Demasiado alto! Tenta um número menor.";
        state.logic.feedbackType = "warning";
    } else {
        state.logic.feedback = "Demasiado baixo! Tenta um número maior.";
        state.logic.feedbackType = "warning";
    }

    if (state.logic.attempts >= 10 && !state.logic.done) {
        state.logic.done = true;
        state.logic.score = 0;
        state.logic.feedback =
            "Terminaste as 10 tentativas sem acertar. " +
            `O número secreto era ${state.logic.secretNumber}. Pontuação: 0 pontos.`;
        state.logic.feedbackType = "error";
    }

    saveState();
    renderCurrentPage();

    if (!state.logic.done) {
        input.value = "";
        input.focus();
    }
});


// Submissão do Quick Quiz
document.getElementById("quiz-form").addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.quiz.done) {
        return;
    }

    const answers = quizQuestions.map((question, index) => {
        const selected = document.querySelector(
            `input[name="quiz-${index}"]:checked`
        );

        return selected ? selected.value : null;
    });

    if (answers.some((answer) => answer === null)) {
        state.quiz.feedback =
            "Faltam respostas. Responde às cinco perguntas antes de submeter.";
        state.quiz.feedbackType = "warning";
        saveState();
        renderCurrentPage();
        return;
    }

    state.quiz.answers = answers;
    state.quiz.score = quizQuestions.reduce((score, question, index) => {
        return score + (answers[index] === question.correct ? 2 : 0);
    }, 0);
    state.quiz.done = true;
    state.quiz.feedback =
        "Questionário concluído! Consulta o resultado de cada pergunta.";
    state.quiz.feedbackType = "success";

    saveState();
    renderCurrentPage();
});


// Submissão do Reaction Challenge
document.getElementById("reaction-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const reaction = state.reaction;

    if (reaction.done || reaction.index >= reactionChallenges.length) {
        return;
    }

    const challenge = reactionChallenges[reaction.index];
    const answerInput = document.getElementById("reaction-answer");
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = challenge.answer.toLowerCase();
    const elapsed = Math.max(0, (Date.now() - reaction.startedAt) / 1000);
    const isCorrect = userAnswer === correctAnswer && elapsed <= 10;
    const points = isCorrect ? 2 : 0;

    reaction.score += points;
    reaction.answers.push({
        answer: answerInput.value,
        elapsed,
        points,
        correct: challenge.answer,
    });

    if (isCorrect) {
        reaction.feedback =
            `Correto! Respondeste em ${elapsed.toFixed(1)} segundos ` +
            "e ganhaste 2 pontos.";
        reaction.feedbackType = "success";
    } else if (elapsed > 10) {
        reaction.feedback =
            `Tempo ultrapassado (${elapsed.toFixed(1)} segundos). ` +
            `A resposta correta era «${challenge.answer}». Este desafio vale 0 pontos.`;
        reaction.feedbackType = "error";
    } else {
        reaction.feedback =
            `Resposta incorreta. A resposta correta era «${challenge.answer}». ` +
            "Este desafio vale 0 pontos.";
        reaction.feedbackType = "error";
    }

    reaction.index += 1;

    if (reaction.index >= reactionChallenges.length) {
        reaction.done = true;
    }

    saveState();
    renderCurrentPage();
});


// Navegação entre os jogos
document.getElementById("start-button").addEventListener("click", () => {
    showPage("logic");
});

document.getElementById("to-quiz-button").addEventListener("click", () => {
    if (state.logic.done) {
        showPage("quiz");
    }
});

document.getElementById("to-reaction-button").addEventListener("click", () => {
    if (state.quiz.done) {
        showPage("reaction");
    }
});

document.getElementById("to-results-button").addEventListener("click", () => {
    if (state.reaction.done) {
        showPage("results");
    }
});


// Reinicia todos os jogos
document.getElementById("play-again-button").addEventListener("click", () => {
    state = createInitialState();
    sessionStorage.setItem(storageKey, JSON.stringify(state));

    document.getElementById("logic-guess").value = "";
    document.getElementById("reaction-answer").value = "";
    document.querySelectorAll('input[name^="quiz-"]').forEach((input) => {
        input.checked = false;
    });

    showPage("home");
});


// Abre a página guardada (ou a página inicial) ao carregar o site
if (!["home", "logic", "quiz", "reaction", "results"].includes(state.currentPage)) {
    state.currentPage = "home";
}

renderCurrentPage();
