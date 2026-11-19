import random
import time

import streamlit as st


# Configuração da página
st.set_page_config(
    page_title="BRAIN TRAINING HUB",
    page_icon="🧠",
    layout="wide",
)


# Estilo visual
st.markdown(
    """
    <style>
    .stApp {
        background: linear-gradient(135deg, #070914 0%, #11132a 55%, #090b18 100%);
        color: #f4f4f8;
    }

    h1, h2, h3 {
        color: #ffffff;
    }

    p, label, .stCaption {
        color: #d0d2df;
    }

    .hero {
        padding: 2rem;
        border: 1px solid #663cff;
        border-radius: 20px;
        background: linear-gradient(120deg, #17132d, #101b35);
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .hero h1 {
        color: #b69cff;
        letter-spacing: 3px;
        margin-bottom: 0.4rem;
    }

    .game-card {
        min-height: 150px;
        padding: 1.3rem;
        border: 1px solid #303452;
        border-radius: 16px;
        background: #14172a;
        margin-bottom: 1rem;
    }

    .game-card h3 {
        color: #9fbaff;
    }

    .score-card {
        padding: 1.2rem;
        border-radius: 16px;
        border: 1px solid #663cff;
        background: #17152b;
        text-align: center;
    }

    div.stButton > button {
        width: 100%;
        min-height: 2.8rem;
        border: 0;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        background: linear-gradient(90deg, #7041ff, #277bff);
    }

    div.stButton > button:hover {
        color: white;
        border: 1px solid #c5b5ff;
        background: linear-gradient(90deg, #825aff, #438cff);
    }

    [data-testid="stForm"] {
        padding: 1rem;
        border: 1px solid #303452;
        border-radius: 14px;
        background: #111426;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# Perguntas do Quick Quiz
perguntas_quiz = [
    {
        "pergunta": "Qual planeta é conhecido como o Planeta Vermelho?",
        "opcoes": ["Vénus", "Marte", "Júpiter", "Mercúrio"],
        "correta": "Marte",
    },
    {
        "pergunta": "Quanto é 9 × 7?",
        "opcoes": ["56", "63", "72", "49"],
        "correta": "63",
    },
    {
        "pergunta": "Qual é a capital da Austrália?",
        "opcoes": ["Sydney", "Melbourne", "Canberra", "Perth"],
        "correta": "Canberra",
    },
    {
        "pergunta": "Para que serve principalmente o HTML?",
        "opcoes": [
            "Estruturar páginas Web",
            "Editar fotografias",
            "Criar folhas de cálculo",
            "Proteger um computador contra vírus",
        ],
        "correta": "Estruturar páginas Web",
    },
    {
        "pergunta": "Quem escreveu a obra «Os Lusíadas»?",
        "opcoes": [
            "Fernando Pessoa",
            "Eça de Queirós",
            "Luís de Camões",
            "José Saramago",
        ],
        "correta": "Luís de Camões",
    },
]


# Desafios do Reaction Challenge
desafios_reacao = [
    {"pergunta": "Quanto é 8 × 7?", "resposta": "56"},
    {"pergunta": "Completa o padrão: 2, 4, 8, 16, ...", "resposta": "32"},
    {
        "pergunta": "Qual não pertence ao grupo: maçã, banana, cenoura, pera?",
        "resposta": "cenoura",
    },
    {"pergunta": "Completa o padrão: 3, 6, 9, 12, ...", "resposta": "15"},
    {
        "pergunta": "Se ontem foi segunda-feira, que dia será amanhã?",
        "resposta": "quarta-feira",
    },
]


# Reinicia todos os jogos e limpa as respostas dos campos
def reiniciar_jogo():
    chaves_de_widgets = ["logic_guess"]

    for i in range(len(perguntas_quiz)):
        chaves_de_widgets.append(f"quiz_{i}")

    for i in range(len(desafios_reacao)):
        chaves_de_widgets.append(f"reaction_answer_{i}")

    for chave in chaves_de_widgets:
        if chave in st.session_state:
            del st.session_state[chave]

    st.session_state.current_page = "home"

    st.session_state.secret_number = random.randint(1, 100)
    st.session_state.logic_attempts = 0
    st.session_state.logic_score = 0
    st.session_state.logic_done = False
    st.session_state.logic_feedback = ""

    st.session_state.quiz_answers = []
    st.session_state.quiz_score = 0
    st.session_state.quiz_done = False
    st.session_state.quiz_feedback = ""

    st.session_state.reaction_index = 0
    st.session_state.reaction_score = 0
    st.session_state.reaction_done = False
    st.session_state.reaction_answers = []
    st.session_state.reaction_started_for = -1
    st.session_state.reaction_start_time = 0.0
    st.session_state.reaction_feedback = ""


# Inicializa os dados da sessão na primeira visita
if "current_page" not in st.session_state:
    reiniciar_jogo()


# Cabeçalho comum às páginas
st.markdown(
    """
    <div class="hero">
        <h1>BRAIN TRAINING HUB</h1>
        <p>Treina a tua lógica. Pensa rápido. Descobre do que és capaz.</p>
    </div>
    """,
    unsafe_allow_html=True,
)


# Página inicial
if st.session_state.current_page == "home":
    st.write(
        "Uma plataforma interativa com três jogos de raciocínio. "
        "Completa os desafios e consulta a tua classificação final."
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(
            """
            <div class="game-card">
                <h3>01 · Logic Challenge</h3>
                <p>Adivinha um número entre 1 e 100 em até dez tentativas.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col2:
        st.markdown(
            """
            <div class="game-card">
                <h3>02 · Quick Quiz</h3>
                <p>Responde a cinco perguntas de cultura geral.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col3:
        st.markdown(
            """
            <div class="game-card">
                <h3>03 · Reaction Challenge</h3>
                <p>Resolve cinco desafios. Cada resposta tem um limite de dez segundos.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.subheader("Sistema de pontuação")
    st.markdown(
        """
        - **Logic Challenge:** até 10 pontos. Quanto menos tentativas, maior a pontuação.
        - **Quick Quiz:** 2 pontos por resposta correta, até 10 pontos.
        - **Reaction Challenge:** 2 pontos por resposta correta dentro do tempo, até 10 pontos.
        - **Pontuação máxima:** 30 pontos.
        """
    )

    if st.button("START CHALLENGE"):
        st.session_state.current_page = "logic"
        st.rerun()


# Jogo 1: Logic Challenge
elif st.session_state.current_page == "logic":
    st.subheader("01 · Logic Challenge")
    st.write("Adivinha o número secreto entre 1 e 100.")
    st.write(f"Tentativas utilizadas: {st.session_state.logic_attempts} de 10")

    if not st.session_state.logic_done:
        with st.form("logic_form"):
            palpite = st.number_input(
                "Introduz um número:",
                min_value=1,
                max_value=100,
                step=1,
                key="logic_guess",
            )
            enviou_palpite = st.form_submit_button("SUBMETER PALPITE")

        if enviou_palpite:
            st.session_state.logic_attempts += 1

            if palpite == st.session_state.secret_number:
                st.session_state.logic_score = 11 - st.session_state.logic_attempts
                st.session_state.logic_done = True
                st.session_state.logic_feedback = (
                    f"Correto! Acertaste em {st.session_state.logic_attempts} "
                    f"tentativa(s) e ganhaste {st.session_state.logic_score} pontos."
                )
            elif palpite > st.session_state.secret_number:
                st.session_state.logic_feedback = "Demasiado alto! Tenta um número menor."
            else:
                st.session_state.logic_feedback = "Demasiado baixo! Tenta um número maior."

            if (
                st.session_state.logic_attempts >= 10
                and not st.session_state.logic_done
            ):
                st.session_state.logic_done = True
                st.session_state.logic_score = 0
                st.session_state.logic_feedback = (
                    "Terminaste as 10 tentativas sem acertar. "
                    f"O número secreto era {st.session_state.secret_number}. "
                    "Pontuação: 0 pontos."
                )

    if st.session_state.logic_feedback:
        if st.session_state.logic_score > 0:
            st.success(st.session_state.logic_feedback)
        elif st.session_state.logic_done:
            st.error(st.session_state.logic_feedback)
        else:
            st.info(st.session_state.logic_feedback)

    if st.session_state.logic_done:
        st.write(f"Pontuação: **{st.session_state.logic_score} / 10**")

        if st.button("CONTINUAR PARA O QUICK QUIZ"):
            st.session_state.current_page = "quiz"
            st.rerun()


# Jogo 2: Quick Quiz
elif st.session_state.current_page == "quiz":
    st.subheader("02 · Quick Quiz")
    st.write("Seleciona uma resposta para cada uma das cinco perguntas.")

    if not st.session_state.quiz_done:
        with st.form("quiz_form"):
            respostas = []

            for i, pergunta in enumerate(perguntas_quiz):
                resposta = st.radio(
                    f"{i + 1}. {pergunta['pergunta']}",
                    pergunta["opcoes"],
                    index=None,
                    key=f"quiz_{i}",
                )
                respostas.append(resposta)

            enviou_quiz = st.form_submit_button("VERIFICAR RESPOSTAS")

        if enviou_quiz:
            if any(resposta is None for resposta in respostas):
                st.session_state.quiz_feedback = (
                    "Faltam respostas. Responde às cinco perguntas antes de submeter."
                )
            else:
                st.session_state.quiz_answers = respostas
                st.session_state.quiz_score = sum(
                    2
                    for i, pergunta in enumerate(perguntas_quiz)
                    if respostas[i] == pergunta["correta"]
                )
                st.session_state.quiz_done = True
                st.session_state.quiz_feedback = (
                    "Questionário concluído! Consulta o resultado de cada pergunta."
                )

    if st.session_state.quiz_feedback:
        if st.session_state.quiz_done:
            st.success(st.session_state.quiz_feedback)
        else:
            st.warning(st.session_state.quiz_feedback)

    if st.session_state.quiz_done:
        st.subheader("Resultados do Quick Quiz")

        for i, pergunta in enumerate(perguntas_quiz):
            resposta_utilizador = st.session_state.quiz_answers[i]

            if resposta_utilizador == pergunta["correta"]:
                st.success(f"Pergunta {i + 1}: correta! Ganhaste 2 pontos.")
            else:
                st.error(
                    f"Pergunta {i + 1}: incorreta. "
                    f"A resposta correta era: {pergunta['correta']}."
                )

        st.write(f"Pontuação: **{st.session_state.quiz_score} / 10**")

        if st.button("CONTINUAR PARA O REACTION CHALLENGE"):
            st.session_state.current_page = "reaction"
            st.rerun()


# Jogo 3: Reaction Challenge
elif st.session_state.current_page == "reaction":
    st.subheader("03 · Reaction Challenge")
    st.write("Cada desafio vale 2 pontos. Responde corretamente em até 10 segundos.")

    if st.session_state.reaction_index < len(desafios_reacao):
        indice = st.session_state.reaction_index
        desafio = desafios_reacao[indice]

        # O tempo começa quando o desafio é apresentado e mantém-se entre atualizações.
        if st.session_state.reaction_started_for != indice:
            st.session_state.reaction_start_time = time.monotonic()
            st.session_state.reaction_started_for = indice

        st.write(f"Desafio {indice + 1} de {len(desafios_reacao)}")
        st.markdown(f"### {desafio['pergunta']}")
        st.caption(
            "O tempo é verificado ao submeter a resposta. "
            "Não é apresentado um cronómetro automático."
        )

        if st.session_state.reaction_feedback:
            if st.session_state.reaction_answers[-1]["pontos"] == 2:
                st.success(st.session_state.reaction_feedback)
            else:
                st.warning(st.session_state.reaction_feedback)

        with st.form(f"reaction_form_{indice}"):
            resposta_reacao = st.text_input(
                "A tua resposta:",
                key=f"reaction_answer_{indice}",
            )
            enviou_resposta = st.form_submit_button("SUBMETER RESPOSTA")

        if enviou_resposta:
            tempo_decorrido = time.monotonic() - st.session_state.reaction_start_time
            resposta_limpa = resposta_reacao.strip().lower()
            resposta_correta = desafio["resposta"].strip().lower()

            ganhou_pontos = (
                resposta_limpa == resposta_correta and tempo_decorrido <= 10
            )
            pontos_desafio = 2 if ganhou_pontos else 0

            st.session_state.reaction_score += pontos_desafio
            st.session_state.reaction_answers.append(
                {
                    "resposta": resposta_reacao,
                    "tempo": tempo_decorrido,
                    "pontos": pontos_desafio,
                    "correta": desafio["resposta"],
                }
            )

            if ganhou_pontos:
                st.session_state.reaction_feedback = (
                    f"Correto! Respondeste em {tempo_decorrido:.1f} segundos "
                    "e ganhaste 2 pontos."
                )
            elif tempo_decorrido > 10:
                st.session_state.reaction_feedback = (
                    f"Tempo ultrapassado ({tempo_decorrido:.1f} segundos). "
                    f"A resposta correta era «{desafio['resposta']}». "
                    "Este desafio vale 0 pontos."
                )
            else:
                st.session_state.reaction_feedback = (
                    f"Resposta incorreta. A resposta correta era "
                    f"«{desafio['resposta']}». Este desafio vale 0 pontos."
                )

            st.session_state.reaction_index += 1

            if st.session_state.reaction_index >= len(desafios_reacao):
                st.session_state.reaction_done = True

            # Avança para o desafio seguinte ou mostra o resultado final.
            st.rerun()

    if st.session_state.reaction_done:
        st.subheader("Resultado do Reaction Challenge")

        for i, resultado in enumerate(st.session_state.reaction_answers):
            st.write(
                f"Desafio {i + 1}: {resultado['pontos']} pontos "
                f"({resultado['tempo']:.1f} segundos)."
            )

        st.write(f"Pontuação: **{st.session_state.reaction_score} / 10**")

        if st.button("VER RESULTADOS FINAIS"):
            st.session_state.current_page = "results"
            st.rerun()


# Resultados finais
elif st.session_state.current_page == "results":
    st.subheader("Resultados finais")

    total = (
        st.session_state.logic_score
        + st.session_state.quiz_score
        + st.session_state.reaction_score
    )
    percentagem = (total / 30) * 100

    if percentagem <= 20:
        classificacao = "Iniciante"
    elif percentagem <= 40:
        classificacao = "Em desenvolvimento"
    elif percentagem <= 60:
        classificacao = "Inteligência média"
    elif percentagem <= 80:
        classificacao = "Inteligência elevada"
    else:
        classificacao = "Génio"

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Logic Challenge", f"{st.session_state.logic_score} / 10")

    with col2:
        st.metric("Quick Quiz", f"{st.session_state.quiz_score} / 10")

    with col3:
        st.metric("Reaction Challenge", f"{st.session_state.reaction_score} / 10")

    st.markdown(
        f"""
        <div class="score-card">
            <h2>{total} / 30 pontos</h2>
            <p>{percentagem:.1f}% · Classificação: <strong>{classificacao}</strong></p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.info(
        "Esta classificação representa apenas o desempenho nestes jogos. "
        "Não mede cientificamente a inteligência nem o QI."
    )

    if st.button("PLAY AGAIN"):
        reiniciar_jogo()
        st.rerun()
