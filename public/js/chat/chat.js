import {
    getDatabase, ref, get, onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const db = getDatabase();
const auth = getAuth();

export let destinatarioId = null;
let userIdLogado = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        userIdLogado = user.uid;
        iniciarChat(user);
    } else {
        userIdLogado = null;
        document.querySelector('.sidebar').innerHTML = '';
        limparChat();
    }
});

async function iniciarChat(user) {
    const userId = user.uid;
    const conversasRef = ref(db, `Conversas/${userId}`);
    const sidebar = document.querySelector('.sidebar');

    onChildAdded(conversasRef, async (snapshot) => {
        const outroUid = snapshot.key;
        const dados = snapshot.val();

        if (sidebar.querySelector(`.chat-user[data-id="${outroUid}"]`)) return;

        if (!dados.nome || !dados.avatar) {
            const snapFreelancer = await get(ref(db, `Freelancer/${outroUid}`));
            const snapContratante = await get(ref(db, `Contratante/${outroUid}`));

            if (snapFreelancer.exists()) {
                const info = snapFreelancer.val();
                dados.nome = info.nome || "Usuário";
                dados.avatar = info.foto_perfil || "https://via.placeholder.com/30";
            } else if (snapContratante.exists()) {
                const info = snapContratante.val();
                dados.nome = info.nome || "Usuário";
                dados.avatar = info.foto_perfil || "https://via.placeholder.com/30";
            } else {
                dados.nome = "Usuário";
                dados.avatar = "https://via.placeholder.com/30";
            }
        }

        const chatUser = document.createElement('div');
        chatUser.dataset.id = outroUid;
        chatUser.className = 'chat-user';
        chatUser.innerHTML = `
      <img src="${dados.avatar}" alt="avatar" />
      <div class="chat-user-info">
        <div>${dados.nome}</div>
        <small>Clique para abrir</small>
      </div>
    `;

        chatUser.addEventListener("click", () => {
            selecionarChatUser(chatUser, dados, userId, outroUid);
        });

        sidebar.appendChild(chatUser);
    });
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

    const mensagemRef = ref(db, `Conversas/${userIdLogadoParam}/${destinatario}/mensagens`);

    if (window._mensagemListener) {
        window._mensagemListener();
    }

    const unsubscribe = onChildAdded(mensagemRef, (msgSnap) => {
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
            div.appendChild(imagem);
        }

        if (msg.texto) {
            const textoMsg = document.createElement('span');
            textoMsg.textContent = msg.texto;
            div.appendChild(textoMsg);
        }

        const horario = document.createElement('small');
        horario.className = 'hora-msg';
        horario.style.marginBottom = '25px';
        if (msg.timestamp) {
            const hora = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
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
