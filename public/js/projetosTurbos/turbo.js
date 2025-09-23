import { getDatabase, ref, get, child, remove, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const db = getDatabase();
const auth = getAuth();

const projectsListEl = document.querySelector(".projects-list");
const seletor = document.querySelector(".seletorDeProjetos");
const containerProjetosSelecionados = document.querySelector(".containerProjetosSelecionados");
const btnFinalizar = document.getElementById('btnFinalizar');

let selectedProjects = [];

let currentUser = null;
window.user = null;

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        if (selectedProjects.length === 0) {
            alert('Selecione ao menos um projeto para finalizar.');
            return;
        }

        try {
            const updates = {};
            selectedProjects.forEach(projeto => {
                // Cada projeto vai receber turbinado: true
                updates[`Projetos/${projeto.id}/turbinado`] = true;
            });

            await update(ref(db), updates);

            alert('Projetos finalizados com sucesso!');
            window.location.href = '/'

            selectedProjects = [];
            atualizarSelecaoVisual();
            atualizarProjetosSelecionados();

        } catch (err) {
            console.error('Erro ao finalizar projetos:', err);
            alert('Erro ao finalizar projetos. Tente novamente.');
        }
    });
}

if (seletor) seletor.classList.add("flex-col");

function formatarData(dataStr) {
    if (!dataStr) return 'Não informada';
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return 'Não informada';
    return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
}

function criarCardTurbo(projeto, id) {
    const card = document.createElement('div');
    card.className = 'cardTurboItem';
    card.dataset.projetoId = id;
    card.style.flex = '1 1 calc(33.333% - 1rem)';
    card.style.height = '180px';
    card.style.border = '3px solid transparent';
    card.style.borderRadius = '12px';
    card.style.cursor = 'pointer';
    card.style.backgroundImage = projeto.capaUrl ? `url('${projeto.capaUrl}')` : '';
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.style.transition = 'border-color 0.2s';
    card.style.marginBottom = '5px';

    card.addEventListener('click', () => {
        const index = selectedProjects.findIndex(p => p.id === id);

        if (index > -1) {
            selectedProjects.splice(index, 1);
        } else {
            if (selectedProjects.length < 3) {
                selectedProjects.push({ ...projeto, id });
            } else {
                alert('Você só pode selecionar até 3 projetos.');
                return;
            }
        }

        atualizarSelecaoVisual();
        atualizarProjetosSelecionados();
    });

    return card;
}

function atualizarSelecaoVisual() {
    const todosCards = document.querySelectorAll('.cardTurboItem');
    todosCards.forEach(card => {
        const isSelected = selectedProjects.some(p => p.id === card.dataset.projetoId);
        card.style.borderColor = isSelected ? '#5274D9' : 'transparent';
    });
}

function atualizarProjetosSelecionados() {
    const cardsExistentes = containerProjetosSelecionados.querySelectorAll('.cardTurbo:not(:first-child)');
    cardsExistentes.forEach(c => c.remove());

    selectedProjects.forEach(projeto => {
        const cardSelecionado = document.createElement('div');
        cardSelecionado.className = 'cardTurbo pd-3 border border-solid border-gray-50 flex rounded-xl';

        cardSelecionado.innerHTML = `
            <div class="infos flex flex-col flex-1 pd-l-2">
                <h2 class="text text-xl mg-0">${projeto.titulo ?? projeto.nome ?? 'Sem título'}</h2>
                <p class="text text-sm mg-0">Data Criação: ${formatarData(projeto.dataCriacao)}</p>
            </div>
            <div class="acoes">
                <button class="btn btn-warning" aria-label="Remover projeto">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
        `;

        const btnRemover = cardSelecionado.querySelector('button');
        btnRemover.addEventListener('click', () => {
            selectedProjects = selectedProjects.filter(p => p.id !== projeto.id);
            atualizarSelecaoVisual();
            atualizarProjetosSelecionados();
        });

        containerProjetosSelecionados.appendChild(cardSelecionado);
    });
}

async function carregarProjetosDoUsuario(uid) {
    projectsListEl.innerHTML = '';

    try {
        const projetosSnap = await get(child(ref(db), 'Projetos'));
        if (!projetosSnap.exists()) {
            projectsListEl.innerHTML = '<p class="text-gray-400">Nenhum projeto encontrado.</p>';
            return;
        }

        const projetosObj = projetosSnap.val();
        const projetosArray = Object.entries(projetosObj).map(([id, dados]) => ({ id, ...dados }));
        const projetosDoUsuario = projetosArray.filter(p => p.userId === uid);

        if (!projetosDoUsuario.length) {
            projectsListEl.innerHTML = '<p class="text-gray-400">Você não tem projetos publicados.</p>';
            return;
        }

        let linha = null;
        projetosDoUsuario.forEach((projeto, idx) => {
            if (idx % 3 === 0) {
                linha = document.createElement('div');
                linha.style.display = 'flex';
                linha.style.gap = '1rem';
                linha.style.marginBottom = '1rem';
                projectsListEl.appendChild(linha);
            }

            const card = criarCardTurbo(projeto, projeto.id);
            card.style.flex = '1 1 calc(33.333% - 1rem)';
            linha.appendChild(card);

            // Se for o último item do array, completar com "espaços vazios"
            if (idx === projetosDoUsuario.length - 1) {
                const totalNaLinha = (idx % 3) + 1;
                for (let i = totalNaLinha; i < 3; i++) {
                    const vazio = document.createElement('div');
                    vazio.style.flex = '1 1 calc(33.333% - 1rem)';
                    vazio.style.height = '180px'; // mesma altura dos cards
                    linha.appendChild(vazio);
                }
            }
        });

    } catch (err) {
        console.error('Erro ao carregar projetos:', err);
        projectsListEl.innerHTML = '<p class="text-red-500">Erro ao carregar projetos.</p>';
    }
}

// Inicialização
if (auth.currentUser) {
    carregarProjetosDoUsuario(auth.currentUser.uid);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        carregarProjetosDoUsuario(user.uid);
    } else {
        projectsListEl.innerHTML = '<p class="text-red-500">Faça login para ver seus projetos.</p>';
    }
})