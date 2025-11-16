// ---------------------------------------------------------
// 1. NAVEGAÇÃO ENTRE TELAS
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    const btnVerAgenda = document.getElementById("btn-ver-agenda");
    const btnVerReservas = document.getElementById("btn-ver-reservas");
    const btnVoltar = document.getElementById("btn-voltar");
    const btnVoltarReservas = document.getElementById("btn-voltar-reservas");

    if (btnVerAgenda) btnVerAgenda.onclick = () => window.location.href = "agenda.html";
    if (btnVerReservas) btnVerReservas.onclick = () => window.location.href = "reservas.html";
    if (btnVoltar) btnVoltar.onclick = () => window.location.href = "index.html";
    if (btnVoltarReservas) btnVoltarReservas.onclick = () => window.location.href = "index.html";

    carregarReservas(); // só roda se estiver na página de reservas
});

// ---------------------------------------------------------
// 2. CALENDÁRIO (agenda.html)
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const calendarGrid = document.getElementById("calendar-grid");
    const currentMonthYearEl = document.getElementById("current-month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");

    if (!calendarGrid) return;

    let currentDate = new Date(2025, 4, 1);

    const monthNames = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    function renderCalendar() {
        while (calendarGrid.children.length > 7) {
            calendarGrid.removeChild(calendarGrid.lastChild);
        }

        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        currentMonthYearEl.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const span = document.createElement("span");
            span.className = "calendar-day day-inactive";
            span.textContent = prevMonthLastDay - firstDayOfMonth + i + 1;
            calendarGrid.appendChild(span);
        }

        for (let day = 1; day <= lastDayOfMonth; day++) {
            const span = document.createElement("span");
            span.className = "calendar-day";
            span.textContent = day;

            span.onclick = () => {
                document.querySelectorAll(".day-selected")
                    .forEach((d) => d.classList.remove("day-selected"));

                span.classList.add("day-selected");
                abrirPopupQuadras(day, month + 1, year);
            };

            calendarGrid.appendChild(span);
        }

        const total = firstDayOfMonth + lastDayOfMonth;
        for (let i = 1; i <= 42 - total; i++) {
            const span = document.createElement("span");
            span.className = "calendar-day day-inactive";
            span.textContent = i;
            calendarGrid.appendChild(span);
        }
    }

    prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

    renderCalendar();
});

// ---------------------------------------------------------
// 3. SISTEMA DE RESERVAS
// ---------------------------------------------------------
let diaSelecionado = null;
let quadraSelecionada = null;

const horariosDisponiveis = [
    "8h às 10h",
    "10h às 12h",
    "12h às 14h",
    "14h às 16h",
    "16h às 18h",
    "18h às 20h",
    "20h às 22h"
];

function abrirPopupQuadras(dia, mes, ano) {
    diaSelecionado = `${dia}/${mes}/${ano}`;
    document.getElementById("popup-quadras").classList.remove("hidden");
}

function selecionarQuadra(q) {
    quadraSelecionada = q;
    document.getElementById("popup-quadras").classList.add("hidden");
    abrirPopupHorarios();
}

function abrirPopupHorarios() {
    const lista = document.getElementById("lista-horarios");
    lista.innerHTML = "";

    const [dia, mes, ano] = diaSelecionado.split("/").map(Number);
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    const ocupados = reservas
        .filter(r => r.dia === dia && r.mes === mes && r.ano === ano && r.quadra === quadraSelecionada)
        .map(r => r.horario);

    const livres = horariosDisponiveis.filter(h => !ocupados.includes(h));

    if (livres.length === 0) {
        lista.innerHTML = "<p style='margin:20px;color:#333;'>Nenhum horário disponível.</p>";
        return;
    }

    livres.forEach(h => {
        const btn = document.createElement("button");
        btn.textContent = h;
        btn.onclick = () => selecionarHorario(h);
        lista.appendChild(btn);
    });

    document.getElementById("popup-horarios").classList.remove("hidden");
}

const diasSemanaNomes = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

function selecionarHorario(horario) {
    const [dia, mes, ano] = diaSelecionado.split("/").map(Number);
    const diaSemana = diasSemanaNomes[new Date(ano, mes - 1, dia).getDay()];

    const novaReserva = { dia, mes, ano, diaSemana, quadra: quadraSelecionada, horario };

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    const existe = reservas.some(r =>
        r.dia === dia &&
        r.mes === mes &&
        r.ano === ano &&
        r.quadra === quadraSelecionada &&
        r.horario === horario
    );

    if (existe) {
        alert("Essa reserva já existe!");
        return;
    }

    reservas.push(novaReserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    fecharPopups();
    alert("Reserva realizada com sucesso!");
    window.location.href = "reservas.html";
}

function fecharPopups() {
    document.getElementById("popup-quadras").classList.add("hidden");
    document.getElementById("popup-horarios").classList.add("hidden");
}

// ---------------------------------------------------------
// 4. TELA DE RESERVAS
// ---------------------------------------------------------
function carregarReservas() {
    const lista = document.querySelector(".reservas-list");
    const msg = document.getElementById("no-reservations-msg");

    if (!lista) return;

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    lista.innerHTML = "";

    if (reservas.length === 0) {
        msg.style.display = "block";
        return;
    }

    msg.style.display = "none";

    reservas.sort((a, b) => {
        const da = new Date(a.ano, a.mes - 1, a.dia);
        const db = new Date(b.ano, b.mes - 1, b.dia);
        if (da.getTime() !== db.getTime()) return da - db;
        return a.horario.localeCompare(b.horario);
    });

    reservas.forEach((r, index) => {
        const item = document.createElement("div");
        item.className = "reserva-item";

        item.innerHTML = `
            <h3>${r.diaSemana} - ${r.dia}/${r.mes}/${r.ano}</h3>
            <p><b>Quadra:</b> ${r.quadra}</p>
            <p><b>Horário:</b> ${r.horario}</p>
            <button class="btn-cancelar-reserva" onclick="cancelarReserva(${index})">Cancelar</button>
        `;

        lista.appendChild(item);
    });
}

function cancelarReserva(index) {
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.splice(index, 1);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    carregarReservas();
}


// -----------------------------------------
// 5. SALVAR RESERVA NA AGENDA (ajuste na função selecionarHorario)
// -----------------------------------------


function selecionarHorario(horario) {
    const partes = diaSelecionado.split("/");
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);

    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = diasSemanaNomes[dataObj.getDay()];

    const novaReserva = {
        dia,
        mes,
        ano,
        diaSemana,
        quadra: quadraSelecionada,
        horario
    };

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    // Impedir duplicadas (mesmo dia, quadra e horário)
    const existe = reservas.some(r =>
        r.dia === novaReserva.dia &&
        r.mes === novaReserva.mes &&
        r.ano === novaReserva.ano &&
        r.quadra === novaReserva.quadra &&
        r.horario === novaReserva.horario
    );

    if (existe) {
        alert("Já existe uma reserva igual!");
        return;
    }

    reservas.push(novaReserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    fecharPopups();
    alert("Reserva realizada com sucesso!");

    window.location.href = "reservas.html";
}


// -----------------------------------------
// 6. BOTÃO VOLTAR NA tela de reservas
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-voltar-reservas");
    if (btn) {
        btn.addEventListener("click", () => {
            window.location.href = "index.html"; // ajuste se o nome estiver diferente
        });
    }
const btnSuporte = document.getElementById("btn-suporte");
if (btnSuporte) btnSuporte.onclick = () => window.location.href = "suporte.html";   
    carregarReservas();
});
