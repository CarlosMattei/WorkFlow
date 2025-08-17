import {
    getDatabase, ref, get, set, onChildAdded, onValue, onDisconnect, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

export let destinatarioId = null;
let userIdLogado = null;
const conversasMap = new Map();
const listenersMensagens = new Map();

onAuthStateChanged(auth, (user) => {
    if (user) {
        userIdLogado = user.uid;
        registrarStatusOnline(user.uid);
        iniciarChat(user);
    } else {
        userIdLogado = null;
        document.querySelectorAll('.chat-user').forEach(el => el.remove());
        limparChat();
        atualizarBadgeNavbar(0);
        listenersMensagens.forEach(unsub => unsub());
        listenersMensagens.clear();
    }
});

export function registrarStatusOnline(userId) {
    const statusRef = ref(db, `/status/${userId}`);
    const conectadoRef = ref(db, ".info/connected");

    onValue(conectadoRef, (snap) => {
        if (!snap.val()) return;
        onDisconnect(statusRef).set({ online: false, last_seen: serverTimestamp() }).then(() => {
            set(statusRef, { online: true, last_seen: serverTimestamp() });
        });
    });
}

async function iniciarChat(user) {
    const userId = user.uid;
    const conversasRef = ref(db, `Conversas/${userId}`);
    const conversasSnap = await get(conversasRef);
    if (!conversasSnap.exists()) return;

    const conversaKeys = Object.keys(conversasSnap.val());
    for (const outroUid of conversaKeys) {
        escutarUltimaMensagem(userId, outroUid);
    }
}

async function escutarUltimaMensagem(userId, outroUid) {
    const mensagensRef = ref(db, `Conversas/${userId}/${outroUid}/mensagens`);
    const leituraRef = ref(db, `LeituraMensagens/${userId}/${outroUid}`);

    let nome = "Usuário";
    let avatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const snapFreelancer = await get(ref(db, `Freelancer/${outroUid}`));
    const snapContratante = await get(ref(db, `Contratante/${outroUid}`));

    if (snapFreelancer.exists()) {
        const info = snapFreelancer.val();
        nome = info.nome || nome;
        avatar = info.foto_perfil || avatar;
    } else if (snapContratante.exists()) {
        const info = snapContratante.val();
        nome = info.nome || nome;
        avatar = info.foto_perfil || avatar;
    }

    onValue(leituraRef, (snapLeitura) => {
        const ultimaMensagemLida = snapLeitura.val()?.timestamp || 0;

        if (listenersMensagens.has(outroUid)) {
            const unsub = listenersMensagens.get(outroUid);
            unsub();
            listenersMensagens.delete(outroUid);
        }

        conversasMap.delete(outroUid);

        let mensagensNaoLidas = 0;

        const unsubscribeMsg = onChildAdded(mensagensRef, (snapMsg) => {
            const msg = snapMsg.val();
            if (!msg.timestamp) return;

            const naoLida = msg.autor !== userIdLogado && msg.timestamp > ultimaMensagemLida;
            if (naoLida) mensagensNaoLidas++;

            conversasMap.set(outroUid, {
                id: outroUid,
                nome,
                avatar,
                ultimaMensagem: msg.timestamp,
                ultimaMensagemTexto: msg.texto ? msg.texto : (msg.imagem ? "📷 Imagem" : ""),
                lida: mensagensNaoLidas === 0,
                qtdNaoLidas: mensagensNaoLidas
            });

            atualizarSidebarEBadge();
        });

        listenersMensagens.set(outroUid, unsubscribeMsg);
    });
}

function atualizarSidebarEBadge() {
    renderizarSidebar(userIdLogado);
    const naoLidasCount = [...conversasMap.values()].filter(c => !c.lida).length;
    atualizarBadgeNavbar(naoLidasCount);
}

function atualizarBadgeNavbar(contagem) {
    const badge = document.querySelector('#badge-mensagens');
    if (!badge) return;

    if (contagem > 0) {
        badge.style.display = 'flex';
        badge.textContent = contagem > 99 ? '99+' : contagem;
    } else {
        badge.style.display = 'none';
    }
}

function renderizarSidebar(userIdLogadoParam) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.querySelectorAll('.chat-user').forEach(el => el.remove());

    const conversasOrdenadas = [...conversasMap.values()].sort(
        (a, b) => b.ultimaMensagem - a.ultimaMensagem
    );

    for (const conversa of conversasOrdenadas) {
        const chatUser = document.createElement('div');
        chatUser.dataset.id = conversa.id;
        chatUser.className = 'chat-user';

        const naoLidaClass = conversa.lida ? '' : 'nao-lida';

        chatUser.innerHTML = `
            <div style="position: relative; margin-right: 10px;">
                <img src="${conversa.avatar}" alt="avatar" style="width: 30px; height: 30px; border-radius: 50%;" />
                <span class="status-dot" style="
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    top: 25px;
                    width: 10px;
                    height: 10px;
                    background-color: gray;
                    border-radius: 50%;
                    border: 2px solid #111;
                "></span>
            </div>
            <div class="chat-user-info ${naoLidaClass}">
                <div>${conversa.nome}</div>
                <small>Clique para abrir</small>
            </div>
            ${!conversa.lida ? `<span class="notificacao-nao-lida" style="
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                width: 17px;
                height: 17px;
                background: #4276FE;
                border-radius: 50%;
                z-index: 10;
                color: white;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
            ${conversa.qtdNaoLidas > 99 ? '99+' : conversa.qtdNaoLidas}
            </span>` : ''}
        `;

        chatUser.addEventListener("click", () => {
            selecionarChatUser(chatUser, conversa, userIdLogadoParam, conversa.id);
        });

        sidebar.appendChild(chatUser);

        setTimeout(() => {
            chatUser.classList.add('animated');
        }, 10);

        const statusRef = ref(db, `status/${conversa.id}`);
        const dot = chatUser.querySelector('.status-dot');

        onValue(statusRef, (snap) => {
            const status = snap.val();
            dot.style.backgroundColor = (status && status.online) ? 'limegreen' : 'gray';
        });
    }
}

function selecionarChatUser(chatUserEl, dadosUsuario, userIdLogadoParam, destinatario) {
    document.querySelectorAll('.chat-user').forEach(el => el.classList.remove('selected'));
    chatUserEl.classList.add('selected');

    const header = document.querySelector(".chat-header");
    const headerImg = header.querySelector("img");
    const headerNome = header.querySelector("span");
    headerImg.src = dadosUsuario.avatar;
    headerNome.textContent = dadosUsuario.nome;

    document.querySelector(".nenhum-contato-selecionado").style.display = "none";
    const input = document.querySelector(".input-area");
    const messages = document.querySelector(".messages");
    header.style.display = "flex";
    input.style.display = "flex";
    messages.style.display = "flex";

    setTimeout(() => {
        header.classList.add("show");
        input.classList.add("show");
        messages.classList.add("show");
    }, 50);

    destinatarioId = destinatario;

    const messagesContainer = document.querySelector('.messages');
    messagesContainer.innerHTML = '';

    const leituraRef = ref(db, `LeituraMensagens/${userIdLogadoParam}/${destinatario}`);
    const mensagensRef = ref(db, `Conversas/${userIdLogadoParam}/${destinatario}/mensagens`);

    if (window._mensagemListener) {
        window._mensagemListener();
    }

    get(mensagensRef).then(snap => {
        if (snap.exists()) {
            const msgs = snap.val();
            const ultTs = Math.max(...Object.values(msgs).map(m => m.timestamp || 0));
            set(leituraRef, { timestamp: ultTs });
        }
    });

    const unsubscribe = onChildAdded(mensagensRef, (msgSnap) => {
        const msg = msgSnap.val();

        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';

        const div = document.createElement('div');
        div.className = 'message ' + (msg.autor === userIdLogadoParam ? "user" : 'other');

        if (msg.imagem) {
            const imagem = document.createElement("img");
            imagem.src = msg.imagem;
            imagem.style.maxWidth = "400px";
            imagem.style.borderRadius = "8px";
            imagem.style.marginBottom = "6px";
            imagem.addEventListener('click', (e) => {
                e.stopPropagation()
                imagemModalConteudo.src = msg.imagem
                imagemModal.style.display = 'flex'
            })
            div.appendChild(imagem);

        }

        if (msg.texto) {
            const textoMsg = document.createElement('span');
            textoMsg.textContent = msg.texto;
            div.appendChild(textoMsg);
        }

        if (msg.link) {
            const linkEl = document.createElement("a");
            linkEl.href = msg.link;
            linkEl.target = "_blank";
            linkEl.textContent = msg.link;
            linkEl.style.color = "#4EAFFF";
            linkEl.style.display = "block";
            linkEl.style.marginBottom = "6px";
            div.appendChild(linkEl);
        }

        const horario = document.createElement('small');
        horario.className = 'hora-msg';
        horario.style.marginBottom = '25px';

        if (msg.timestamp) {
            const hora = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit', minute: '2-digit'
            });
            horario.textContent = hora;
        } else {
            horario.textContent = '--:--';
        }

        wrapper.appendChild(div);
        wrapper.appendChild(horario);

        messagesContainer.appendChild(wrapper);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    window._mensagemListener = unsubscribe;
}

function limparChat() {
    document.querySelector(".chat-header").style.display = "none";
    document.querySelector(".input-area").style.display = "none";
    document.querySelector(".messages").style.display = "none";
    document.querySelector(".nenhum-contato-selecionado").style.display = "flex";
    destinatarioId = null;
}

const imagemModal = document.getElementById("imagemModal");
const imagemModalConteudo = document.getElementById("imagemModalConteudo");

imagemModal.addEventListener("click", () => {
    imagemModal.style.display = "none";
    imagemModalConteudo.src = "";
});