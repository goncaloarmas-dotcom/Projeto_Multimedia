"use strict";
// Usa reactionBank e checkReactionAnswer definidos em data.js (carregado antes deste ficheiro)


const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const PAGES = ["home", "logic", "reaction", "memory", "results"];
const STEP = { logic: 1, reaction: 2, memory: 3, results: 4 };
const RING = 276.46;
const LIMIT = 10;

let S, tick = null, wait = null, memT = [];

const getBest = () => { try { return +localStorage.getItem("bthBest3") || 0; } catch { return 0; } };
const setBest = (v) => { try { localStorage.setItem("bthBest3", v); } catch { /* ignora */ } };
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);

function fresh() {
    S = {
        secret: 1 + Math.floor(Math.random() * 100), lo: 1, hi: 100, tries: 0, logic: 0, logicDone: false, guesses: [],
        cs: pick(reactionBank, 5), ci: 0, react: 0, ra: [], t0: 0, busy: false,
        mem: { seq: [], pos: 0, input: false }, memScore: 0,
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
    ({ logic: renderLogic, reaction: renderChallenge, memory: renderMemory, results: renderResults }[page] || (() => {}))();
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
$("#mem-next").addEventListener("click", () => go("results"));

/* ---------- Resultados ---------- */
function renderResults() {
    const games = [["Logic Challenge", S.logic], ["Reaction Challenge", S.react], ["Memory Sequence", S.memScore]];
    const total = games.reduce((n, g) => n + g[1], 0), pct = (total / 30) * 100;
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
    setTimeout(() => (ring.style.strokeDashoffset = 439.8 * (1 - total / 30)), 80);

    const prev = getBest(), rec = $("#final-record");
    rec.hidden = !(total > prev && total > 0);
    if (!rec.hidden) { rec.textContent = prev ? `Novo recorde! Anterior: ${prev}/30` : "Primeiro recorde guardado!"; }
    if (total > prev) { setBest(total); $("#best").textContent = total; }

    const row = (txt, ok) => Object.assign(document.createElement("p"), { className: ok ? "ok" : "no", textContent: txt });
    $("#review").replaceChildren(
        ...S.ra.map((r, i) => row(`Reação ${i + 1}: ${r.q} → ${r.a}${r.ok ? ` (${r.t.toFixed(1)} s)` : ` (certa: ${r.c})`}`, r.ok)),
    );
}

/* ---------- Navegação ---------- */
$("#start-button").addEventListener("click", () => go("logic"));
$("#to-quiz-button").addEventListener("click", () => go("reaction"));
$("#play-again-button").addEventListener("click", () => { fresh(); go("home"); });
$("#brand").addEventListener("click", (e) => { e.preventDefault(); fresh(); go("home"); });

fresh();
$("#best").textContent = getBest();
go("home");
