import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, update, onValue, onChildAdded, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onDisconnect } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAtfGyZc3SLzdK10zdq-ALyTyIs1s4qwQ",
    authDomain: "workflow-da28d.firebaseapp.com",
    projectId: "workflow-da28d",
    storageBucket: "workflow-da28d.firebasestorage.app",
    messagingSenderId: "939828605253",
    appId: "1:939828605253:web:0a286fe00f1c29ba614e2c",
    measurementId: "G-3LXB7BR5M1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app)

const btnLogin = document.getElementById('btnEntrar');
const btnRegister = document.getElementById('btnCriarConta');
const aRegister = document.getElementById('aRegister');
const aLogin = document.getElementById('aLogin');
const userControls = document.getElementById('userControls');
const containerButtonSm = document.getElementById('containerButtonSm');
const userPhoto = document.getElementById('userPhoto');
const userPhotoDrop = document.getElementById('userPhotoDrop')
const btnAdd = document.getElementById('btnAdd');
const dropDownLogout = document.getElementById('dropDownLogout');
const dropDown = document.getElementById('dropDownMenu');
const dropDownNotificacao = document.getElementById('dropdownNotificacoes');
const notificacoes = document.getElementById('notificacoes');

const perfilLink = document.querySelector("#dropDownMenu a[href='/perfil']")

onAuthStateChanged(auth, async (user) => {
    const uid = user?.uid;

    const btnTurboSM = document.getElementById("btnProjetoTurboSM");
    const btnTurboLG = document.getElementById("btnProjetoTurbo-lg");

    if (user) {
        escutarMensagensNaoLidasNavbar(uid);
        carregarNotificacoesInfo(uid);

        const statusRef = ref(db, 'status/' + uid);
        await update(statusRef, {
            online: true,
            last_seen: Date.now()
        });

        onDisconnect(statusRef).update({
            online: false,
            last_seen: Date.now()
        });

        if (btnLogin) btnLogin.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (userControls) userControls.style.display = 'flex';
        if (containerButtonSm) containerButtonSm.style.display = 'flex';

        if (userPhoto) {
            try {
                const freelancerRef = ref(db, 'Freelancer/' + uid);
                const contratanteRef = ref(db, 'Contratante/' + uid);

                let userData = null;
                let tipoUsuario = null;

                let snapshot = await get(freelancerRef);
                if (snapshot.exists()) {
                    userData = snapshot.val();
                    tipoUsuario = "Freelancer";
                    btnAdd.textContent = 'Criar Projeto';
                } else {
                    snapshot = await get(contratanteRef);
                    if (snapshot.exists()) {
                        userData = snapshot.val();
                        tipoUsuario = "Contratante";
                        btnAdd.textContent = 'Criar Proposta';
                        carregarNotificacoesCandidaturas(uid);
                    }
                }

                const userNameSpan = document.querySelector(".user-name");
                if (userData?.nome && userNameSpan) {
                    userNameSpan.textContent = userData.nome;
                }

                if (userData) {
                    localStorage.setItem('cacheUsuario', JSON.stringify({
                        uid,
                        nome: userData?.nome,
                        foto_perfil: userData?.foto_perfil
                    }));
                    localStorage.setItem('cacheUsuarioTempo', Date.now());
                }

                const photoUrl = userData?.foto_perfil || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                userPhoto.style.backgroundImage = `url('${photoUrl}')`;
                userPhoto.style.display = 'block';
                if (userPhotoDrop) userPhotoDrop.src = photoUrl;

                if (tipoUsuario === "Contratante") {
                    if (btnTurboSM) btnTurboSM.remove();
                    if (btnTurboLG) btnTurboLG.remove();
                } else if (tipoUsuario === "Freelancer") {
                    if (btnTurboSM) btnTurboSM.style.display = "flex";
                    if (btnTurboLG) btnTurboLG.style.display = "flex";
                }

            } catch (error) {
                console.error("Erro ao buscar avatar:", error);
                userPhoto.style.backgroundImage = `url('https://cdn-icons-png.flaticon.com/512/149/149071.png')`;
                userPhoto.style.display = 'block';
            }
        }

        if (dropDownLogout) {
            dropDownLogout.onclick = async () => {
                signOut(auth)
                    .then(() => {
                        console.log("Usuário deslogado.");
                        const uid = auth.currentUser?.uid;
                        if (uid) {
                            const statusRef = ref(db, 'status/' + uid);
                            update(statusRef, {
                                online: false,
                                last_seen: Date.now()
                            });
                        }
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.error("Erro ao sair:", error);
                    });
            };
        }

        if (btnAdd) {
            btnAdd.addEventListener('click', async () => {
                try {
                    const freelancerSnap = await get(ref(db, 'Freelancer/' + uid));
                    if (freelancerSnap.exists()) {
                        window.location.href = '/criarProjeto';
                        btnAdd.textContent = 'Criar Projeto';
                    } else {
                        window.location.href = '/criarProposta';
                        btnAdd.textContent = 'Criar Proposta';
                    }
                } catch (error) {
                    console.error('Erro ao verificar tipo de usuário:', error);
                    alert('Erro ao verificar tipo de usuário. Tente novamente.');
                }
            });
        }

        if (perfilLink) {
            perfilLink.href = `/perfil?id=${uid}`;
        }

    } else {
        if (btnLogin) btnLogin.style.display = 'inline-block';
        if (btnRegister) btnRegister.style.display = 'inline-block';
        if (aLogin) aLogin.style.display = 'inline-block';
        if (aRegister) aRegister.style.display = 'inline-block';
        if (userControls) userControls.style.display = 'none';
        if (containerButtonSm) containerButtonSm.style.display = 'none';

        if (userPhoto) {
            userPhoto.style.backgroundImage = `url('${DEFAULT_USER_PHOTO}')`;
            userPhoto.style.display = 'none';
        }

        if (btnTurboSM) btnTurboSM.remove();
        if (btnTurboLG) btnTurboLG.remove();
    }

    onValue(ref(db, 'Projetos'), (snapshot) => {
        const projetos = snapshot.val();
        if (!projetos) return;

        Object.entries(projetos).forEach(([id, projeto]) => {
            if (projeto.visualizacoes === 20 && projeto.userId === uid && !projetosNotificados.has(id)) {
                criarNotificacaoInfo(projeto);
                projetosNotificados.add(id);
            }
        });

        totalNotificacoesProjeto = projetosNotificados.size;
        atualizarBadgeNavbar();
    });
});

userPhoto.addEventListener('click', (e) => {
    e.stopPropagation()
    dropDown.style.display = dropDown.style.display === 'block' ? 'none' : 'block'
})
notificacoes.addEventListener('click', (e) => {
    e.stopPropagation()
    dropDownNotificacao.style.display = dropDownNotificacao.style.display === 'block' ? 'none' : 'block'
})
document.addEventListener('click', () => {
    dropDown.style.display = 'none'
    dropDownNotificacao.style.display = 'none'
})
dropDown.addEventListener('click', (e) => {
    e.stopPropagation()
})

const DEFAULT_USER_PHOTO = '/assets/image/defaultIcon.jpg';

async function contarNaoLidasDeConversa(uid, outroId) {
    const mensagensRef = ref(db, `Conversas/${uid}/${outroId}/mensagens`);
    const leituraRef = ref(db, `LeituraMensagens/${uid}/${outroId}`);

    const leituraSnap = await get(leituraRef);
    const ultimaLeitura = leituraSnap.exists() ? leituraSnap.val().timestamp || 0 : 0;

    const mensagensSnap = await get(mensagensRef);
    if (!mensagensSnap.exists()) return 0;

    return Object.values(mensagensSnap.val()).filter(
        msg => msg.autor !== uid && msg.timestamp > ultimaLeitura
    ).length;
}

async function recalcularNaoLidas(uid) {
    const conversasRef = ref(db, `Conversas/${uid}`);
    const snapConversas = await get(conversasRef);
    if (!snapConversas.exists()) {
        totalMensagensNaoLidas = 0;
        atualizarBadgeNavbar();
        return 0;
    }

    const conversaIds = Object.keys(snapConversas.val());
    let totalNaoLidas = 0;

    for (const outroId of conversaIds) {
        totalNaoLidas += await contarNaoLidasDeConversa(uid, outroId);
    }

    totalMensagensNaoLidas = totalNaoLidas;
    atualizarBadgeNavbar();
    return totalNaoLidas;
}

async function escutarMensagensNaoLidasNavbar(uid) {
    const conversasRef = ref(db, `Conversas/${uid}`);
    const snapConversas = await get(conversasRef);
    if (!snapConversas.exists()) {
        atualizarBadgeNavbar();
        return;
    }

    const conversaIds = Object.keys(snapConversas.val());

    await recalcularNaoLidas(uid);

    for (const outroId of conversaIds) {
        const mensagensRef = ref(db, `Conversas/${uid}/${outroId}/mensagens`);
        const leituraRef = ref(db, `LeituraMensagens/${uid}/${outroId}`);

        onValue(leituraRef, () => recalcularNaoLidas(uid));
        onChildAdded(mensagensRef, () => recalcularNaoLidas(uid));
    }
}

let totalMensagensNaoLidas = 0;
let totalNotificacoesProjeto = 0;
let totalCandidaturasNaoVistas = 0;

function atualizarBadgeNavbar() {
    const badge = document.getElementById('badge-mensagens');
    if (!badge) return;

    const total = totalMensagensNaoLidas + totalNotificacoesProjeto + totalCandidaturasNaoVistas

    if (total > 0) {
        badge.style.display = 'flex';
        badge.textContent = total > 99 ? '99+' : total;
    } else {
        badge.style.display = 'none';
    }
}

function carregarNotificacoesInfo(uid) {
    const notificacoesContainer = document.querySelector('.notficacoesContent');
    const conversasRef = ref(db, `Conversas/${uid}`);

    onValue(conversasRef, async (snapConversas) => {
        notificacoesContainer.innerHTML = '';

        if (!snapConversas.exists()) {
            notificacoesContainer.innerHTML = '<p class="text-white">Sem notificações</p>';
            return;
        }

        const conversaIds = Object.keys(snapConversas.val());

        for (const outroId of conversaIds) {
            const qtdNaoLidas = await contarNaoLidasDeConversa(uid, outroId);
            if (qtdNaoLidas === 0) continue;

            let userData = null;
            for (const tipo of ['Freelancer', 'Contratante']) {
                const snap = await get(ref(db, `${tipo}/${outroId}`));
                if (snap.exists()) {
                    userData = snap.val();
                    break;
                }
            }
            if (!userData) {
                userData = { nome: "Usuário", foto_perfil: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
            }

            const item = document.createElement('div');
            item.className = 'notificacaoItem info rounded-lg pd-1 cursor-pointer justify-center items-center flex flex-row gap-2';
            item.innerHTML = `
                <div class="icon rounded-xl pd-1 overflow-hidden" style="width:45px; height:45px;">
                    <img src="${userData.foto_perfil}" alt="${userData.nome}" style="width:100%; height:100%; object-fit: cover; border-radius: 50%;" />
                </div>
                <div class="notificationContent flex flex-col gap-0">
                    <h1 class="text-base text-white mg-0 text-bold">Você tem mensagens não lidas</h1>
                    <p class="messagecontent text-xs text-white mg-0 text-regular">
                        Acesse o chat para responder a <strong>${userData.nome}</strong>
                    </p>
                </div>
            `;
            item.addEventListener('click', () => window.location.href = '/chat');
            notificacoesContainer.appendChild(item);
        }

        if (!notificacoesContainer.hasChildNodes()) {
            notificacoesContainer.innerHTML = '<p class="text-white">Sem notificações</p>';
        }
    });
}

const projetosNotificados = new Set();

function criarNotificacaoInfo(projeto) {
    const container = document.querySelector('.notficacoesContent');
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacaoItem info rounded-lg pd-1 cursor-pointer justify-center items-center flex flex-row gap-2';

    notificacao.innerHTML = `
        <div class="icon bg-gray-50 rounded-xl" style="width: 60px; height: 55px; overflow: hidden;">
            <img src="${projeto.capaUrl}" alt="Capa do Projeto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
        </div>
        <div class="notificationContent flex flex-col gap-0">
            <h1 class="text-base text-white mg-0 text-bold">Parabéns!</h1>
            <p class="messagecontent text-xs text-white mg-0 text-regular">
                Seu projeto <strong>${projeto.titulo}</strong> chegou a 20 visualizações
            </p>
        </div>
    `;
    container.appendChild(notificacao);
}
const candidaturasNotificadas = new Set()
function carregarNotificacoesCandidaturas(uidContratante) {
    const container = document.querySelector('.notficacoesContent');

    const propostasRef = ref(db, 'Propostas');
    onValue(propostasRef, async (snapPropostas) => {
        if (!snapPropostas.exists()) {
            atualizarBadgeNavbar();
            return;
        }

        const propostas = snapPropostas.val();

        // Filtra apenas propostas do contratante logado
        const minhasPropostas = Object.entries(propostas)
            .filter(([propostaId, proposta]) => proposta.autorId === uidContratante);

        totalCandidaturasNaoVistas = 0; // reseta contagem
        container.innerHTML = ''; // limpa temporariamente para recarregar notificações

        for (const [propostaId, proposta] of minhasPropostas) {
            const candidaturasRef = ref(db, `Candidaturas/${propostaId}`);
            const snapCandidaturas = await get(candidaturasRef);
            const candidaturas = snapCandidaturas.exists() ? snapCandidaturas.val() : {};
            const totalCandidaturas = Object.keys(candidaturas).length;

            if (totalCandidaturas === 0 || candidaturasNotificadas.has(propostaId)) continue;

            totalCandidaturasNaoVistas++; // conta para o badge

            const notificacao = document.createElement('div');
            notificacao.className = 'notificacaoItem info rounded-lg pd-1 cursor-pointer justify-center items-center flex flex-row gap-2';
            notificacao.innerHTML = `
                <div class="icon bg-gray-50 rounded-xl" style="width: 60px; height: 55px; overflow: hidden;">
                    <img src="${proposta.fotoAutorUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
                         alt="Capa do Projeto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="notificationContent flex flex-col gap-0">
                    <h1 class="text-base text-white mg-0 text-bold">Nova Candidatura!</h1>
                    <p class="messagecontent text-xs text-white mg-0 text-regular">
                        Sua proposta <strong>${proposta.titulo}</strong> recebeu <strong>${totalCandidaturas}</strong> candidatura(s).
                    </p>
                    <button class="confirmarCandidatura btn btn-primary text-xs bg-green-500 text-white rounded px-2 py-1 mt-1">
                        Estou ciente
                    </button>
                </div>
            `;

            // Botão confirma a notificação
            notificacao.querySelector('.confirmarCandidatura').addEventListener('click', (e) => {
                e.stopPropagation();
                notificacao.remove();
                candidaturasNotificadas.add(propostaId);
                totalCandidaturasNaoVistas--;
                atualizarBadgeNavbar();
            });

            // Clique na notificação leva para o perfil do contratante
            notificacao.addEventListener('click', () => {
                window.location.href = `/contratante/${uidContratante}`;
            });

            container.appendChild(notificacao);
        }

        atualizarBadgeNavbar(); // atualiza badge com o total correto

        if (!container.hasChildNodes()) {
            container.innerHTML = '<p class="text-white">Sem notificações</p>';
        }
    });
}