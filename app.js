"use strict";
// Usa quizBank, reactionBank e checkReactionAnswer definidos em data.js

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const PAGES = ["home", "logic", "quiz", "reaction", "memory", "words", "stroop", "results"];
const STEP = { logic: 1, quiz: 2, reaction: 3, memory: 4, words: 5, stroop: 6, results: 7 };
const RING = 276.46;
const LIMIT = 10;

let S, tick = null, wait = null, memT = [];

const getBest = () => { try { return +localStorage.getItem("bthBest2") || 0; } catch { return 0; } };
const setBest = (v) => { try { localStorage.setItem("bthBest2", v); } catch { /* ignora */ } };
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);

function fresh() {
    S = {
        secret: 1 + Math.floor(Math.random() * 100), lo: 1, hi: 100, tries: 0, logic: 0, logicDone: false, guesses: [],
        qs: pick(quizBank, 5).map((q) => ({ ...q, options: shuffle(q.options) })), qi: 0, quiz: 0, qa: [], locked: false,
        cs: pick(reactionBank, 5), ci: 0, react: 0, ra: [], t0: 0, busy: false,
        mem: { seq: [], pos: 0, input: false }, memScore: 0,
        ws: pick(wordBank, 5), wi: 0, wscore: 0, wa: [],
        st: Array.from({ length: 10 }, () => { const w = Math.floor(Math.random() * 4); return [w, (w + 1 + Math.floor(Math.random() * 3)) % 4]; }), si: 0, stroop: 0, stimes: [],
    };
}

let scareT = null;
function scare() {
    const el = $("#scare");
    el.hidden = false;
    el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
    try {
        const ac = beep.ac || (beep.ac = new AudioContext()), o = ac.createOscillator(), g = ac.createGain();
        o.type = "sawtooth"; o.frequency.setValueAtTime(140, ac.currentTime); o.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.8);
        g.gain.setValueAtTime(0.25, ac.currentTime); g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.9);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.9);
    } catch { /* sem som */ }
    clearTimeout(scareT); scareT = setTimeout(() => (el.hidden = true), 1000);
}

function fb(el, msg, type) { el.textContent = msg; el.className = `feedback ${type}`; el.hidden = false; }
function clearTimers() {
    clearInterval(tick); clearTimeout(wait); tick = wait = null; memT.forEach(clearTimeout); memT = [];
    $("#page-reaction").classList.remove("shake");
    $("#explosion").hidden = true;
}

function go(page) {
    clearTimers();
    PAGES.forEach((p) => ($("#page-" + p).hidden = p !== page));
    $("#stepper").hidden = page === "home";
    $$("#stepper li").forEach((li, i) => {
        li.classList.toggle("active", i + 1 === STEP[page]);
        li.classList.toggle("done", i + 1 < STEP[page]);
    });
    window.scrollTo({ top: 0 });
    ({ logic: renderLogic, quiz: renderQuestion, reaction: renderChallenge, memory: renderMemory, words: renderWord, stroop: renderStroop, results: renderResults }[page] || (() => {}))();
}

/* ---------- 1. Logic ---------- */
function renderLogic() {
    $("#range-fill").style.left = `${S.lo - 1}%`;
    $("#range-fill").style.width = `${S.hi - S.lo + 1}%`;
    $("#range-text").textContent = S.logicDone ? `Tentativas usadas: ${S.tries}` : `O número está entre ${S.lo} e ${S.hi}`;
    $("#dots").replaceChildren(...Array.from({ length: LIMIT }, (_, i) => Object.assign(document.createElement("span"), { className: i < S.tries ? "used" : "" })));
    $("#history").replaceChildren(...S.guesses.map((g) => Object.assign(document.createElement("span"), {
        className: "chip" + (g.n === S.secret ? " ok" : ""), textContent: g.n === S.secret ? `${g.n} ✓` : `${g.n} ${g.n > S.secret ? "↓" : "↑"}`,
    })));
    $("#logic-form").hidden = S.logicDone;
    $("#logic-finished").hidden = !S.logicDone;
    if (!S.logicDone) $("#logic-guess").focus();
}

$("#logic-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#logic-guess"), n = input.valueAsNumber, f = $("#logic-feedback");
    if (!Number.isInteger(n) || n < 1 || n > 100) return fb(f, "Escreve um número inteiro entre 1 e 100.", "warning");
    S.tries++; S.guesses.push({ n });
    if (n === S.secret) {
        S.logic = 11 - S.tries; S.logicDone = true;
        fb(f, `Acertaste em ${S.tries} tentativa(s) e ganhaste ${S.logic} pontos.`, "success");
    } else {
        if (n > S.secret) { S.hi = Math.min(S.hi, n - 1); fb(f, "Demasiado alto. Tenta um número menor.", "warning"); }
        else { S.lo = Math.max(S.lo, n + 1); fb(f, "Demasiado baixo. Tenta um número maior.", "warning"); }
        if (S.tries >= LIMIT) { S.logicDone = true; fb(f, `Sem tentativas. O número secreto era ${S.secret}. 0 pontos.`, "error"); }
    }
    input.value = "";
    renderLogic();
});

/* ---------- 2. Quiz ---------- */
function renderQuestion() {
    const q = S.qs[S.qi];
    S.locked = false;
    $("#quiz-progress").textContent = `Pergunta ${S.qi + 1} de 5 · ${S.quiz} pontos`;
    $("#quiz-bar").style.width = `${(S.qi / 5) * 100}%`;
    $("#quiz-question").textContent = q.question;
    $("#quiz-feedback").hidden = true;
    $("#quiz-next").hidden = true;
    $("#quiz-options").replaceChildren(...q.options.map((o) => {
        const b = Object.assign(document.createElement("button"), { type: "button", className: "opt", textContent: o });
        b.addEventListener("click", () => answerQuiz(b, o));
        return b;
    }));
}

function answerQuiz(btn, choice) {
    if (S.locked) return;
    S.locked = true;
    const q = S.qs[S.qi], ok = choice === q.correct;
    if (ok) S.quiz += 2;
    S.qa.push({ q: q.question, a: choice, c: q.correct, ok });
    $$("#quiz-options .opt").forEach((b) => {
        b.disabled = true;
        if (b.textContent === q.correct) b.classList.add("right");
    });
    if (!ok) { btn.classList.add("wrong"); scare(); }
    fb($("#quiz-feedback"), ok ? "Correto! +2 pontos." : `Incorreto. A resposta certa era «${q.correct}».`, ok ? "success" : "error");
    $("#quiz-bar").style.width = `${((S.qi + 1) / 5) * 100}%`;
    const last = S.qi === 4;
    $("#quiz-next").textContent = last ? "Continuar para o Reaction Challenge" : "Seguinte";
    $("#quiz-next").hidden = false;
    $("#quiz-next").focus();
}

$("#quiz-next").addEventListener("click", () => {
    if (S.qi === 4) return go("reaction");
    S.qi++; renderQuestion();
});

/* ---------- 3. Reaction ---------- */
function paintTimer(rem) {
    $("#ring").style.strokeDashoffset = RING * (1 - rem / LIMIT);
    $("#timer-value").textContent = rem.toFixed(1);
    const t = $("#timer");
    t.className = "timer" + (rem <= 3 ? " danger" : rem <= 5 ? " warn" : "");
    $("#timer-icon").textContent = rem <= 3 ? "💣" : rem <= 5 ? "⚠️" : "⏱️";
}

function renderChallenge() {
    if (S.ci >= 5) return go("memory");
    const c = S.cs[S.ci];
    S.busy = false;
    $("#reaction-progress").textContent = `Desafio ${S.ci + 1} de 5 · ${S.react} pontos`;
    $("#reaction-question").textContent = c.question;
    $("#reaction-feedback").hidden = true;
    $("#explosion").hidden = true;
    const inp = $("#reaction-answer");
    inp.value = ""; inp.disabled = false;
    $("#reaction-form button").disabled = false;
    inp.focus();
    S.t0 = Date.now();
    paintTimer(LIMIT);
    clearInterval(tick);
    tick = setInterval(() => {
        const rem = Math.max(0, LIMIT - (Date.now() - S.t0) / 1000);
        paintTimer(rem);
        if (rem <= 0) settle("", true);
    }, 50);
}

function boom() {
    const page = $("#page-reaction"), box = $("#explosion");
    page.classList.remove("shake"); void page.offsetWidth; page.classList.add("shake");
    const label = Object.assign(document.createElement("strong"), { textContent: "💥 BOOM!" });
    const parts = Array.from({ length: 16 }, (_, i) => {
        const p = document.createElement("span"), a = (i / 16) * 6.283, d = 70 + Math.random() * 110;
        p.className = "p"; p.textContent = ["🔥", "💥", "✨", "💨"][i % 4];
        p.style.setProperty("--x", `${Math.cos(a) * d}px`); p.style.setProperty("--y", `${Math.sin(a) * d * 0.5}px`);
        return p;
    });
    box.replaceChildren(label, ...parts); box.hidden = false;
}

function settle(answer, timedOut) {
    if (S.busy) return;
    S.busy = true;
    clearInterval(tick);
    $("#reaction-answer").disabled = true;
    $("#reaction-form button").disabled = true;
    const c = S.cs[S.ci], f = $("#reaction-feedback");
    const elapsed = timedOut ? LIMIT : Math.min(LIMIT, (Date.now() - S.t0) / 1000);
    const ok = !timedOut && checkReactionAnswer(answer, c);
    if (ok) S.react += 2; else scare();
    S.ra.push({ q: c.question, a: timedOut ? "Tempo esgotado" : answer || "Sem resposta", c: c.answer, ok, t: elapsed });
    if (timedOut) { boom(); paintTimer(0); $("#timer-icon").textContent = "💥"; fb(f, `Tempo esgotado. A resposta era «${c.answer}».`, "error"); }
    else if (ok) fb(f, `Correto em ${elapsed.toFixed(1)} s! +2 pontos.`, "success");
    else fb(f, `Incorreto. A resposta era «${c.answer}».`, "error");
    wait = setTimeout(() => { S.ci++; renderChallenge(); }, timedOut ? 1900 : 1400);
}

$("#reaction-form").addEventListener("submit", (e) => {
    e.preventDefault();
    settle($("#reaction-answer").value, false);
});

/* ---------- 4. Memory Sequence ---------- */
const pads = $$(".pad");
const mt = (fn, ms) => memT.push(setTimeout(fn, ms));
function beep(i) {
    try {
        const ac = beep.ac || (beep.ac = new AudioContext()), o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = [330, 262, 392, 494][i]; g.gain.value = 0.07;
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.22);
    } catch { /* sem som */ }
}
function flashPad(i, ms = 380) { pads[i].classList.add("lit"); beep(i); mt(() => pads[i].classList.remove("lit"), ms); }

function renderMemory() {
    S.mem = { seq: [], pos: 0, input: false }; S.memScore = 0;
    $("#mem-status").textContent = "Memoriza a sequência e repete-a. Cada ronda vale 1 ponto (máx. 10).";
    $("#mem-start").hidden = false; $("#mem-next").hidden = true;
}
function memRound() {
    const m = S.mem; m.seq.push(Math.floor(Math.random() * 4)); m.pos = 0; m.input = false;
    $("#mem-status").textContent = `Ronda ${m.seq.length} · Observa…`;
    m.seq.forEach((n, k) => mt(() => flashPad(n), 700 + k * 650));
    mt(() => { m.input = true; $("#mem-status").textContent = `Ronda ${m.seq.length} · A tua vez!`; }, 700 + m.seq.length * 650);
}
function memEnd(msg) {
    S.mem.input = false;
    $("#mem-status").textContent = `${msg} Pontuação: ${S.memScore} / 10.`;
    $("#mem-next").hidden = false; $("#mem-next").focus();
}
$("#mem-start").addEventListener("click", () => { $("#mem-start").hidden = true; mt(memRound, 300); });
pads.forEach((p, i) => p.addEventListener("click", () => {
    const m = S.mem; if (!m.input) return;
    flashPad(i, 200);
    if (i !== m.seq[m.pos]) { scare(); return memEnd("Falhaste a sequência."); }
    if (++m.pos < m.seq.length) return;
    S.memScore = m.seq.length;
    if (m.seq.length >= 10) return memEnd("Sequência perfeita!");
    m.input = false; mt(memRound, 900);
}));
$("#mem-next").addEventListener("click", () => go("words"));

/* ---------- 5. Word Scramble ---------- */
const wordBank = [["computador", "Tecnologia"], ["bicicleta", "Transporte"], ["chocolate", "Comida"], ["elefante", "Animal"], ["janela", "Casa"],
    ["floresta", "Natureza"], ["guitarra", "Música"], ["biblioteca", "Lugar"], ["borboleta", "Animal"], ["montanha", "Natureza"], ["cadeira", "Casa"],
    ["aeroporto", "Lugar"], ["relogio", "Objeto"], ["laranja", "Fruta"], ["tartaruga", "Animal"], ["professor", "Profissão"], ["oceano", "Natureza"], ["telemovel", "Tecnologia"]];

function scramble(w) { let s; do { s = shuffle([...w]).join(""); } while (s === w); return s; }
function renderWord() {
    const [w, hint] = S.ws[S.wi];
    S.busy = false;
    $("#word-progress").textContent = `Palavra ${S.wi + 1} de 5 · ${S.wscore} pontos`;
    $("#word-hint").textContent = `Pista: ${hint} · ${w.length} letras`;
    const L = $("#letters"); L.className = "letters";
    L.replaceChildren(...[...scramble(w)].map((ch) => Object.assign(document.createElement("span"), { textContent: ch })));
    $("#word-feedback").hidden = true; $("#words-next").hidden = true; $("#word-form").hidden = false;
    const inp = $("#word-answer"); inp.value = ""; inp.disabled = false; inp.focus();
}
function settleWord(ans) {
    if (S.busy) return; S.busy = true;
    const w = S.ws[S.wi][0], ok = normalizeAnswer(ans) === w;
    if (ok) S.wscore += 2;
    S.wa.push({ q: `Palavra ${S.wi + 1}`, a: ans || "Passou", c: w, ok });
    $("#word-answer").disabled = true;
    if (ok) $("#letters").className = "letters ok"; else scare();
    fb($("#word-feedback"), ok ? "Correto! +2 pontos." : `Era «${w}».`, ok ? "success" : "error");
    if (S.wi === 4) { $("#word-form").hidden = true; $("#words-next").hidden = false; $("#words-next").focus(); return; }
    wait = setTimeout(() => { S.wi++; renderWord(); }, 1300);
}
$("#word-form").addEventListener("submit", (e) => { e.preventDefault(); settleWord($("#word-answer").value); });
$("#word-skip").addEventListener("click", () => settleWord(""));
$("#words-next").addEventListener("click", () => go("stroop"));

/* ---------- 6. Color Clash ---------- */
const COLORS = [["Vermelho", "#ef4444"], ["Azul", "#3b82f6"], ["Verde", "#22c55e"], ["Amarelo", "#facc15"]];
function renderStroop() {
    if (S.si >= 10) {
        const avg = S.stimes.reduce((a, b) => a + b, 0) / S.stimes.length;
        $("#stroop-word").textContent = "🏁"; $("#stroop-opts").replaceChildren();
        fb($("#stroop-summary"), `${S.stroop}/10 certas · tempo médio ${Math.round(avg)} ms`, "success");
        $("#stroop-progress").textContent = "Concluído"; $("#stroop-next").hidden = false; $("#stroop-next").focus();
        return;
    }
    const [w, ink] = S.st[S.si];
    S.locked = false;
    $("#stroop-progress").textContent = `Cor ${S.si + 1} de 10 · ${S.stroop} pontos`;
    $("#stroop-summary").hidden = true; $("#stroop-next").hidden = true;
    Object.assign($("#stroop-word"), { textContent: COLORS[w][0] }).style.color = COLORS[ink][1];
    $("#stroop-opts").replaceChildren(...COLORS.map(([name], i) => {
        const b = Object.assign(document.createElement("button"), { type: "button", className: "opt", textContent: name });
        b.addEventListener("click", () => {
            if (S.locked) return; S.locked = true;
            const ok = i === ink;
            S.stimes.push(Date.now() - S.t0); if (ok) S.stroop++;
            b.classList.add(ok ? "flash-ok" : "flash-no"); if (!ok) scare();
            wait = setTimeout(() => { S.si++; renderStroop(); }, 450);
        });
        return b;
    }));
    S.t0 = Date.now();
}
$("#stroop-next").addEventListener("click", () => go("results"));

/* ---------- Resultados ---------- */
function renderResults() {
    const games = [["Logic Challenge", S.logic], ["Quick Quiz", S.quiz], ["Reaction Challenge", S.react], ["Memory Sequence", S.memScore], ["Word Scramble", S.wscore], ["Color Clash", S.stroop]];
    const total = games.reduce((n, g) => n + g[1], 0), pct = (total / 60) * 100;
    const rating = pct <= 20 ? "Iniciante" : pct <= 40 ? "Em desenvolvimento" : pct <= 60 ? "Bom desempenho" : pct <= 80 ? "Desempenho elevado" : "Mestre do raciocínio";
    $("#final-total").textContent = total;
    $("#final-rating").textContent = `${pct.toFixed(0)}% · ${rating}`;
    $("#breakdown").replaceChildren(...games.map(([name, v]) => {
        const row = document.createElement("div"), fill = document.createElement("div");
        row.innerHTML = `<span>${name}</span><div class="bar"></div><b>${v}/10</b>`;
        row.querySelector(".bar").appendChild(fill);
        requestAnimationFrame(() => (fill.style.width = `${v * 10}%`));
        return row;
    }));
    const ring = $("#final-ring");
    ring.style.strokeDashoffset = 439.8;
    setTimeout(() => (ring.style.strokeDashoffset = 439.8 * (1 - total / 60)), 80);

    const prev = getBest(), rec = $("#final-record");
    rec.hidden = !(total > prev && total > 0);
    if (!rec.hidden) { rec.textContent = prev ? `Novo recorde! Anterior: ${prev}/60` : "Primeiro recorde guardado!"; }
    if (total > prev) { setBest(total); $("#best").textContent = total; }

    const row = (txt, ok) => Object.assign(document.createElement("p"), { className: ok ? "ok" : "no", textContent: txt });
    $("#review").replaceChildren(
        ...S.qa.map((r, i) => row(`Quiz ${i + 1}: ${r.q} → ${r.a}${r.ok ? "" : ` (certa: ${r.c})`}`, r.ok)),
        ...S.wa.map((r) => row(`${r.q}: ${r.a}${r.ok ? "" : ` (certa: ${r.c})`}`, r.ok)),
        ...S.ra.map((r, i) => row(`Reação ${i + 1}: ${r.q} → ${r.a}${r.ok ? ` (${r.t.toFixed(1)} s)` : ` (certa: ${r.c})`}`, r.ok)),
    );
}

/* ---------- Navegação ---------- */
$("#start-button").addEventListener("click", () => go("logic"));
$("#to-quiz-button").addEventListener("click", () => go("quiz"));
$("#play-again-button").addEventListener("click", () => { fresh(); go("home"); });
$("#brand").addEventListener("click", (e) => { e.preventDefault(); fresh(); go("home"); });

fresh();
$("#best").textContent = getBest();
go("home");
