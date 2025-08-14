import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
const db = getDatabase();
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { contemPalavrao } from "/js/chat/censurarPalavroes.js";
const auth = getAuth();

window.usuarioLogado = null

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.usuarioLogado = {
            id: user.uid
        }
    }
    else {
        window.usuarioLogado = null
        const input = document.getElementById('commentInput')
        const btnEnviarComentario = document.getElementById('btnEnviarComentario')
        const chatForm = document.getElementById('chatForm');

        input.style.display = 'none'
        btnEnviarComentario.style.display = 'none'

        const msg = document.createElement('span')
        msg.textContent = 'Você precisa estar logado para comentar'
        msg.style.color = 'white'
        msg.style.fontSize = '14px'
        msg.style.fontWeight = '500'
        msg.style.color = '#F84241'
        chatForm.style.justifyContent = 'center'
        chatForm.appendChild(msg)
    }
})
function salvarComentario(idProjeto, userId, textoComentario) {
    const comentariosRef = ref(db, 'Comentarios/' + idProjeto)
    const novoComentarioRef = push(comentariosRef)

    return set(novoComentarioRef, {
        userId,
        texto: textoComentario,
        data: new Date().toISOString()
    })
}
function formatarTempo(dataISO) {
    const data = new Date(dataISO)
    const agora = new Date()
    const diff = agora - data

    const minutos = Math.floor(diff / (1000 * 60))
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (dias > 0) return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
}
async function carregarComentario(idProjeto) {
    const comentariosRef = ref(db)
    const snapshot = await get(child(comentariosRef, `Comentarios/${idProjeto}`))

    const container = document.getElementById('containerComentarios')
    container.innerHTML = ''

    if (snapshot.exists()) {
        const comentarios = snapshot.val()
        for (const id in comentarios) {
            const c = comentarios[id]

            let nome = ''
            let foto = ''

            let userSnapshot = await get(ref(db, `Freelancer/${c.userId}`))

            if (!userSnapshot.exists()) {
                userSnapshot = await get(ref(db, `Contratante/${c.userId}`))
            }

            if (userSnapshot.exists()) {
                const usuario = userSnapshot.val()
                nome = usuario.nome || nome
                foto = usuario.foto_perfil || foto
            }
            const div = document.createElement('div')
            const isOwn = window.usuarioLogado && c.userId === window.usuarioLogado.id;
            div.className = `message-card w-full mg-0 pd-0 bg-gray-100 rounded-md ${isOwn ? 'own' : ''}`;
            div.innerHTML = `
                <div class="user-info flex items-center gap-2 mg-b-1">
                    <img src="${foto}" alt="Usuário" class="rounded-full border mg-0" style="width:36px;height:36px;object-fit:cover;"/>
                    <div class="user-details flex flex-col">
                        <span class="user-name font-semibold text-base text-white mg-0">${nome}</span>
                        <span class="message-time text-xs text-gray-25 mg-0">${formatarTempo(c.data)}</span>
                    </div>
                </div>
                <div class="message-text w-full text-sm text-white mg-t-1 pd-2">${c.texto}</div>
            `;
            container.appendChild(div)
        }
    }
    else {
        container.innerHTML = '<p>Nenhum comentário ainda.</p>'
    }
}
document.addEventListener('modalProjetoAberto', (e) => {
    const idProjeto = e.detail.idProjeto
    carregarComentario(idProjeto)
})

document.getElementById('btnEnviarComentario').addEventListener('click', async () => {
    const input = document.getElementById('commentInput')
    const texto = input.value.trim()

    if (texto === '' || !window.idProjetoAtual) return

    if (contemPalavrao(texto)) {
        alert('Seu comentario contem palavras ofensivas e não pode ser enviado')
        return
    }

    const userId = window.usuarioLogado.id
    await salvarComentario(
        window.idProjetoAtual,
        userId,
        texto
    )
    input.value = ''
    carregarComentario(window.idProjetoAtual)
})