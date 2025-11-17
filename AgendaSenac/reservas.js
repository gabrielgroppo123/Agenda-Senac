document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista-reservas");
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    function renderizar() {
        lista.innerHTML = "";

        if (reservas.length === 0) {
            lista.innerHTML = "<p>Nenhuma reserva realizada.</p>";
            return;
        }

        reservas.forEach((r, index) => {
            const card = document.createElement("div");
            card.classList.add("reserva-card");

            card.innerHTML = `
                <div class="reserva-info">
                    <strong>${r.dia}</strong><br>
                    ${r.quadra} — ${r.horario}
                </div>

                <button class="btn-excluir" data-index="${index}">
                    Cancelar
                </button>
            `;

            lista.appendChild(card);
        });

        document.querySelectorAll(".btn-excluir").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const i = e.target.dataset.index;
                reservas.splice(i, 1);
                localStorage.setItem("reservas", JSON.stringify(reservas));
                renderizar();
            });
        });
    }

    renderizar();
});
