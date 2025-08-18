import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set, update, child, serverTimestamp, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { iconeCurtida } from "/js/projects/curtirProjeto.js"
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { iconeFavorito } from "/js/projects/favoritarProjeto.js";
// Config do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAtfGyZc3SLzdK10zdq-ALyTyIs1s4qwQ",
    authDomain: "workflow-da28d.firebaseapp.com",
    projectId: "workflow-da28d",
    storageBucket: "workflow-da28d.appspot.com",
    messagingSenderId: "939828605253",
    appId: "1:939828605253:web:0a286fe00f1c29ba614e2c",
    measurementId: "G-3LXB7BR5M1"
};

let app;
try {
    app = getApp();
} catch {
    app = initializeApp(firebaseConfig);
}

const db = getDatabase(app);
const auth = getAuth();


const container = document.getElementById("card-zone");
const modal = document.getElementById("modal");

async function criarCardProjeto(id, { titulo, descricao, dataCriacao, capaUrl, userId }, cardIndex = 0) {
    const card = document.createElement("div");
    card.className = "card_projeto";
    card.dataset.projetoId = id;
    card.style.setProperty('--card-index', cardIndex);

    card.innerHTML = `
<div class="capa">
    <figure>
        <img src="${capaUrl}" alt="thumbnail" class="thumbnail">
    </figure>
    <div class="thumbnail-overlay">
        <div class="project-overlay-content">
            <div class="containerFavCurtir flex justify-between" style="width: 100%;">
                <div class="favoritar">
                    <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round">
                        </g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M30.051 45.6071L17.851 54.7401C17.2728 55.1729 16.5856 55.4363 15.8662 55.5008C15.1468 55.5652 14.4237 55.4282 13.7778 55.1049C13.1319 54.7817 12.5887 54.2851 12.209 53.6707C11.8293 53.0563 11.6281 52.3483 11.628 51.626V15.306C11.628 13.2423 12.4477 11.2631 13.9069 9.8037C15.3661 8.34432 17.3452 7.52431 19.409 7.52405H45.35C47.4137 7.52431 49.3929 8.34432 50.8521 9.8037C52.3112 11.2631 53.131 13.2423 53.131 15.306V51.625C53.1309 52.3473 52.9297 53.0553 52.55 53.6697C52.1703 54.2841 51.6271 54.7807 50.9812 55.1039C50.3353 55.4272 49.6122 55.5642 48.8928 55.4998C48.1734 55.4353 47.4862 55.1719 46.908 54.739L34.715 45.6071C34.0419 45.1031 33.2238 44.8308 32.383 44.8308C31.5422 44.8308 30.724 45.1031 30.051 45.6071V45.6071Z"
                                stroke="#426AB2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                        </g>
                    </svg>
                </div>
                <div class="like">
                    <svg width="25" height="25" viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M10.2366 18.4731L18.35 10.3598L18.483 10.2267L18.4809 10.2246C20.6263 7.93881 20.5826 4.34605 18.35 2.11339C16.1173 -0.11928 12.5245 -0.16292 10.2387 1.98247L10.2366 1.98036L10.2366 1.98039L10.2366 1.98037L10.2345 1.98247C7.94862 -0.162927 4.35586 -0.119289 2.12319 2.11338C-0.109476 4.34605 -0.153114 7.93881 1.99228 10.2246L1.99017 10.2268L10.2365 18.4731L10.2366 18.4731L10.2366 18.4731Z"
                            fill="none" stroke="#fff" />
                    </svg>
                </div>
            </div>
            <div class="project-title" style="position: absolute; left: 0;">
                <h1 class="text-xl font-medium">${titulo}</h1>
            </div>
        </div>
    </div>
</div>
<div class="project-right flex justify-between items-center" style="width: 100%;">

    <div class="autor pd-x-1 pd-y-2 flex items-center gap-2">
        <img class='autor-img rounded-full' src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile pic"
            style="width: 32px; height: 32px; object-fit: cover;">
        <h2 class="username text-sm text-white truncate" title="@Christopher" style="max-width: 100px;">
            @Christopher
        </h2>
    </div>

    <div class="project-stats flex gap-2 text-sm text-white">
        <div class="likes flex items-center gap-1">
            <svg width="14" height="14" viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M10.2366 18.4731L18.35 10.3598L18.483 10.2267L18.4809 10.2246C20.6263 7.93881 20.5826 4.34605 18.35 2.11339C16.1173 -0.11928 12.5245 -0.16292 10.2387 1.98247L10.2366 1.98036L10.2366 1.98039L10.2366 1.98037L10.2345 1.98247C7.94862 -0.162927 4.35586 -0.119289 2.12319 2.11338C-0.109476 4.34605 -0.153114 7.93881 1.99228 10.2246L1.99017 10.2268L10.2365 18.4731L10.2366 18.4731L10.2366 18.4731Z"
                    fill="#414141" stroke="#414141" />
            </svg>
            <span class="text-xs text-white">124</span>
        </div>
        <div class="views flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"
                class="size-6">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#414141" stroke="#414141" />
                <path fill="#414141" stroke="#414141" fill-rule="evenodd"
                    d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
                    clip-rule="evenodd" />
            </svg>

            <span class="text-xs text-white"></span>
        </div>
        <div class="comments flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                class="size-6">
                <path fill="#414141" stroke="#414141" fill-rule="evenodd"
                    d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                    clip-rule="evenodd" />
            </svg>

            <span class="text-xs text-white">16</span>
        </div>
    </div>

</div>
</div>

`;
    const svgCurtida = card.querySelector('.like svg')
    svgCurtida.addEventListener('click', (event) => {
        event.stopPropagation()
        iconeCurtida(id, svgCurtida)
    })
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid
            const curtidaRef = ref(db, `Curtidas/${id}/${userId}`)

            onValue(curtidaRef, (snapshot) => {
                if (snapshot.exists()) {
                    svgCurtida.classList.add('curtido')
                } else {
                    svgCurtida.classList.remove('curtido')
                }
            })
        }
        else{
            svgCurtida.style.display = 'none'
        }
    })

    const svgFavorito = card.querySelector('.favoritar svg')
    svgFavorito.addEventListener('click', (event) => {
        event.stopPropagation()
        iconeFavorito(id, svgFavorito)
    })

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid
            const favoritarRef = ref(db, `Favoritos/${id}/${userId}`)
            const path = svgFavorito.querySelector('path')


            onValue(favoritarRef, (snapshot) => {
                if (snapshot.exists()) {
                    path.classList.add('favoritado')
                }
                else {
                    path.classList.remove('favoritado')
                }
            })
        }
        else{
            svgFavorito.style.display = 'none'
            const likeBtn = document.getElementById('likeBtn');
            likeBtn.style.display = 'none'
            const btnContatar = document.getElementById('contactar')
            btnContatar.style.display = 'none'
            const btnVerperfil = document.getElementById('btnVerPerfil');
            btnVerperfil.style.display = 'none'


        }
    })
    if (userId) {
        const autorRef = ref(db, `Freelancer/${userId}`);
        get(autorRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const autor = snapshot.val();
                    card.querySelector('.autor-img').src = autor.foto_perfil;
                    card.querySelector('.username').textContent = autor.nome;
                }
            });
    }

    card.addEventListener("click", () => {
        const dbRef = ref(db);
        get(child(dbRef, `Projetos/${id}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const projeto = snapshot.val();
                    abrirModalProjeto(
                        id,
                        projeto.titulo,
                        projeto.descricao,
                        projeto.dataCriacao,
                        projeto.userId,
                        projeto.tags || []  // passa as tags aqui
                    );
                } else {
                    console.warn("Projeto não encontrado:", id);
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar projeto:", error);
            });
    });

    const img = card.querySelector('.thumbnail');
    if (img) {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });

        if (img.complete) {
            img.classList.add('loaded');
        }
    }

    container.appendChild(card);

    await atualizarViewsCard(id)
}

async function registrarVisualizacao(idProjeto, userId) {
    if (!userId) return

    const visualizaçãoRef = ref(db, `Visualizacoes/${idProjeto}/${userId}`)
    const projetoRef = ref(db, `Projetos/${idProjeto}`);

    try {
        const snapshot = await get(visualizaçãoRef)
        if (!snapshot.exists()) {
            await set(visualizaçãoRef, true)
            const projetoSnap = await get(projetoRef)

            if (projetoSnap.exists()) {
                const projetosDados = projetoSnap.val()
                const contagemAtual = projetosDados.visualizacoes || 0
                await update(projetoRef, { visualizacoes: contagemAtual + 1 })
            }
        }
    }
    catch (error) {
        console.error('Erro ao registrar visualização: ', error)
    }
}

window.idProjetoAtual = null
async function abrirModalProjeto(idProjeto, titulo, descricao, dataCriacao, userId, tags = []) {
    const modal = document.getElementById("modal");
    const containerComponentes = document.getElementById('modal-componentes');
    const modalTitulo = modal.querySelector(".modal-titulo h1");
    const modalCreator = modal.querySelector('.modal-creator p');
    const modalUserPhoto = document.getElementById('modalUserPhoto');
    const modalAutor = document.getElementById('modalAutor');
    const modalTag = document.getElementById('modalTag');
    const txtTituloTag = document.getElementById('txtTituloTag');

    const btnVerperfil = document.getElementById('btnVerPerfil');

    modalTitulo.textContent = titulo || 'Sem título';
    txtTituloTag.textContent = titulo;


    modal.style.display = 'flex';

    const dataCriado = modal.querySelector('#data-criado');
    if (dataCriado && dataCriacao) {
        const data = new Date(dataCriacao);
        if (!isNaN(data)) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const dataFormatada = data.toLocaleDateString('pt-BR', options);
            dataCriado.textContent = `Criado em ${dataFormatada}`;
        } else {
            dataCriado.textContent = 'Data inválida';
        }
    } else if (dataCriado) {
        dataCriado.textContent = 'teste adsdadadad';
    }


    containerComponentes.innerHTML = '';

    function renderTags(tagsArray) {
        const tagsContainer = modal.querySelector('.tags-container');
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';

        tagsArray.forEach(tag => {
            const span = document.createElement('span');
            span.classList.add('tag-span', 'bg-gray-25', 'text-white', 'pd-2', 'pd-x-4', 'rounded-full', 'text-sm', 'font-medium', 'border', 'border-gray-50', 'transition-colors');
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
    }

    renderTags(tags);

    const dbRef = ref(db);

    console.log('Buscando componentes do projeto...');

    get(child(dbRef, `componentesProjeto/${idProjeto}`))
        .then((snapshot) => {
            console.log('componentesProjeto snapshot:', snapshot.exists(), snapshot.val());

            if (snapshot.exists()) {
                const componentes = snapshot.val();
                Object.keys(componentes)
                    .sort((a, b) => Number(a) - Number(b))
                    .forEach(key => {
                        const comp = componentes[key];
                        const compDiv = document.createElement('div');
                        compDiv.classList.add('componente-item');

                        if (comp.tipo === 'imagem') {
                            const img = document.createElement('img');
                            img.src = comp.conteudo || '';
                            img.alt = 'Imagem do projeto';
                            img.style.width = '100%';
                            img.style.maxWidth = '100%';
                            img.style.borderRadius = '10px';
                            compDiv.appendChild(img);
                        } else if (comp.tipo === 'texto') {
                            const p = document.createElement('p');
                            p.innerHTML = comp.conteudo || '';
                            compDiv.appendChild(p);
                        }
                        else if (comp.tipo === 'titulo') {
                            const h2 = document.createElement('h2')
                            h2.innerHTML = comp.conteudo || "Titulo Vazio"
                            h2.style.fontSize = '2.5rem'
                            h2.style.fontWeight = 'bold'
                            h2.style.marginBottom = '10px'
                            compDiv.appendChild(h2)
                        }
                        else if (comp.tipo === 'paleta') {
                            let cores = []
                            try {
                                cores = typeof comp.conteudo === 'string' ? JSON.parse(comp.conteudo) : comp.conteudo
                            }
                            catch {
                                cores = []
                            }

                            const coresHtml = cores.map(cor => `
                                <div class="color cor-visual flex justify-start items-end pd-2 rounded-lg" 
                                    style="background-color: ${cor}; height: 150px; width: calc(50% - 12px); position: relative;">
                                <h1 class="colorCode text-xl font-medium mg-0">${cor}</h1>
                                </div>`).join('');
                            const paletaDiv = document.createElement('div');
                            paletaDiv.classList.add('componente-item', 'paleta-container');
                            paletaDiv.innerHTML = `
                                <div class="PTitulo pd-y-3 w-full">
                                    <h1 class="text-3xl text-white mg-0">Cores do Projeto</h1>
                                </div>
                                <div class="Pcores pd-y-3 w-full">
                                    <div class="paleta-cores flex flex-row flex-wrap gap-3 mg-b-2">
                                        ${coresHtml}
                                    </div>
                                </div>`;

                            containerComponentes.appendChild(paletaDiv);
                        }
                        else {
                            compDiv.textContent = `Tipo: ${comp.tipo || 'N/A'} - Conteúdo: ${comp.conteudo || 'Sem conteúdo'}`;
                        }

                        containerComponentes.appendChild(compDiv);
                    });
            } else {
                containerComponentes.textContent = 'Nenhum componente encontrado para este projeto.';
            }
        })
        .catch((error) => {
            console.error('Erro ao buscar componentes:', error);
            containerComponentes.textContent = 'Erro ao carregar componentes.';
        });

    if (userId) {
        get(child(dbRef, `Freelancer/${userId}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const autor = snapshot.val();
                    const nomeAutor = autor.nome;
                    const userPhoto = autor.foto_perfil;
                    const tagAutor = autor.tag;

                    const btnContatar = document.getElementById('contactar')
                    btnContatar.dataset.userId = userId
                    btnContatar.dataset.nome = nomeAutor
                    btnContatar.dataset.avatar = userPhoto

                    btnContatar.addEventListener('click', async () => {
                        const authUser = auth.currentUser;
                        if (!authUser) return;

                        const userIdLogado = authUser.uid;
                        const userIdContato = btnContatar.dataset.userId;
                        const nomeContato = btnContatar.dataset.nome;
                        const avatarContato = btnContatar.dataset.avatar;

                        const db = getDatabase();

                        const conversaRefLogado = ref(db, `Conversas/${userIdLogado}/${userIdContato}/mensagens`);
                        const conversaRefContato = ref(db, `Conversas/${userIdContato}/${userIdLogado}/mensagens`);

                        const conversaLogadoSnap = await get(conversaRefLogado);
                        const conversaContatoSnap = await get(conversaRefContato);

                        const jaExisteConversa = conversaLogadoSnap.exists() || conversaContatoSnap.exists();

                        const timestamp = Date.now();

                        // Atualizações comuns (nome/avatar/timestamp)
                        const updates = {};
                        updates[`Conversas/${userIdLogado}/${userIdContato}/nome`] = nomeContato;
                        updates[`Conversas/${userIdLogado}/${userIdContato}/avatar`] = avatarContato;
                        updates[`Conversas/${userIdLogado}/${userIdContato}/ultimoTimestamp`] = timestamp;

                        updates[`Conversas/${userIdContato}/${userIdLogado}/nome`] = "Você";
                        updates[`Conversas/${userIdContato}/${userIdLogado}/avatar`] = "";
                        updates[`Conversas/${userIdContato}/${userIdLogado}/ultimoTimestamp`] = timestamp;

                        updates[`LeituraMensagens/${userIdLogado}/${userIdContato}/timestamp`] = timestamp;
                        updates[`LeituraMensagens/${userIdContato}/${userIdLogado}/timestamp`] = 0;

                        if (!jaExisteConversa) {
                            const refMensagensUser = ref(db, `Conversas/${userIdLogado}/${userIdContato}/mensagens`);
                            const novaMsgKey = push(refMensagensUser).key;

                            updates[`Conversas/${userIdLogado}/${userIdContato}/mensagens/${novaMsgKey}`] = {
                                texto: "Você iniciou uma conversa",
                                autor: userIdLogado,
                                timestamp
                            };
                        }

                        await update(ref(db), updates);

                        window.location.href = '/chat';
                    });

                    const gridProjetos = modal.querySelector('.grid-projetos')
                    if (gridProjetos) {
                        gridProjetos.innerHTML = ''

                        get(child(dbRef, 'Projetos')).then((snapshot) => {
                            if (snapshot.exists()) {
                                const projetos = snapshot.val()

                                Object.entries(projetos).forEach(([id, projeto]) => {
                                    if (projeto.userId === userId && id !== idProjeto) {
                                        const card = criarCardProjetoMiniatura({
                                            ...projeto,
                                            id
                                        })
                                        gridProjetos.appendChild(card)
                                    }
                                })
                            }
                        }).catch((error) => {
                            console.error('Erro ao buscar projeto autor')
                        })
                    }

                    modalCreator.innerHTML = `Projeto criado por <a href="/perfil?id=${userId}" class="user-name-modal text-white no-underline font-bold link">${nomeAutor}</a>.`;
                    modalAutor.textContent = nomeAutor;

                    get(child(dbRef, 'Projetos')).then((snapshot) => {
                        if (snapshot.exists()) {
                            const projetos = snapshot.val();
                            let contador = 0;

                            Object.values(projetos).forEach((projeto) => {
                                if (projeto.userId === userId) {
                                    contador++;
                                }
                            });

                            const statProjetos = modal.querySelector('.autor-stats .stat');
                            if (statProjetos) {
                                statProjetos.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            ${contador} projeto${contador !== 1 ? 's' : ''}
            `;
                            }
                        }
                    });

                    modalUserPhoto.src = userPhoto;
                    modalTag.textContent = tagAutor;

                    if (window.updateIslandInfo) {
                        window.updateIslandInfo({
                            title: titulo,
                            creatorName: nomeAutor,
                            userPhoto: userPhoto
                        });
                    }

                    btnVerperfil.addEventListener('click', () => {
                        window.location.href = `/perfil?id=${userId}`;
                    });
                }
            });
    }
    window.idProjetoAtual = idProjeto;

    document.dispatchEvent(new CustomEvent("modalProjetoAberto", {
        detail: { idProjeto }
    }));

    if (window.setupIslandScrollListener) {
        setTimeout(() => {
            window.setupIslandScrollListener();
        }, 100);
    }

    const user = auth.currentUser
    if (user) {
        await registrarVisualizacao(idProjeto, user.uid)

        const likeBtn = document.getElementById('likeBtn');
        const curtidaRef = ref(db, `Curtidas/${idProjeto}/${user.uid}`);

        onValue(curtidaRef, (snapshot) => {
            if (snapshot.exists()) {
                likeBtn.classList.add('curtido');
            } else {
                likeBtn.classList.remove('curtido');
            }
        });

        likeBtn.onclick = async () => {
            const snapshot = await get(curtidaRef);
            if (snapshot.exists()) {
                await remove(curtidaRef); // Descurtir
            } else {
                await set(curtidaRef, true); // Curtir (sem timestamp)
            }
        };
    }
}
async function atualizarViewsCard(idProjeto) {
    const card = document.querySelector(`.card_projeto[data-projeto-id="${idProjeto}"]`);
    if (!card) return;

    const spanViews = card.querySelector('.views span');
    const spanLikes = card.querySelector('.likes span');
    const spanComentarios = card.querySelector('.comments span');

    const projetoRef = ref(db, `Projetos/${idProjeto}`);
    onValue(projetoRef, (snapshot) => {
        const dados = snapshot.val();
        if (spanViews) {
            spanViews.textContent = dados?.visualizacoes || 0;
        }
    });

    const curtidasRef = ref(db, `Curtidas/${idProjeto}`);
    onValue(curtidasRef, (snapshot) => {
        const likes = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        if (spanLikes) {
            spanLikes.textContent = likes;
        }
    });

    const comentariosRef = ref(db, `Comentarios/${idProjeto}`);
    onValue(comentariosRef, (snapshot) => {
        const comentarios = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        if (spanComentarios) {
            spanComentarios.textContent = comentarios;
        }
    });
}
function criarCardProjetoMiniatura(projeto) {
    const card = document.createElement('div')
    card.classList.add('card-projeto', 'rounded-lg')

    card.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    card.style.cursor = 'pointer';
    card.style.position = 'relative';

    const capa = document.createElement('img')
    capa.classList.add('rounded-lg')
    capa.style.width = '100%';
    capa.style.height = '100%';
    capa.style.objectFit = 'cover';
    capa.style.display = 'block';

    capa.src = projeto.capaUrl || ''
    capa.alt = 'Capa Outros Projetos do Autor'
    card.appendChild(capa)

    card.addEventListener('click', () => {
        abrirModalProjeto(projeto.id, projeto.titulo, projeto.descricao, projeto.dataCriacao, projeto.userId, projeto.tags)
    })

    return card
}
async function carregarProjetos(tagFiltro = "tudo", tipoOrdenacao = "") {
    const dbRef = ref(db);
    container.innerHTML = '';

    try {
        const snapshot = await get(child(dbRef, `Projetos`));
        if (!snapshot.exists()) return console.log("Nenhum projeto encontrado no banco.");

        const projetos = snapshot.val();
        const listaProjetos = [];

        for (const [id, dados] of Object.entries(projetos)) {
            const tagsProjeto = dados.tags || [];
            const incluir = tagFiltro === "tudo" || (Array.isArray(tagsProjeto) && tagsProjeto.some(t => t.toLowerCase() === tagFiltro.toLowerCase()));

            if (!incluir) continue;

            let curtidas = 0;
            let comentarios = 0;

            if (tipoOrdenacao === "curtidas") {
                const curtidaSnap = await get(child(dbRef, `Curtidas/${id}`));
                curtidas = curtidaSnap.exists() ? Object.keys(curtidaSnap.val()).length : 0;
            }

            if (tipoOrdenacao === "comentarios") {
                const comentarioSnap = await get(child(dbRef, `Comentarios/${id}`));
                comentarios = comentarioSnap.exists() ? Object.keys(comentarioSnap.val()).length : 0;
            }

            listaProjetos.push({
                id,
                dados,
                curtidas,
                comentarios,
                visualizacoes: dados.visualizacoes || 0,
                dataCriacao: dados.dataCriacao || 0
            });
        }

        if (tipoOrdenacao === "curtidas") {
            listaProjetos.sort((a, b) => b.curtidas - a.curtidas);
        } else if (tipoOrdenacao === "comentarios") {
            listaProjetos.sort((a, b) => b.comentarios - a.comentarios);
        } else if (tipoOrdenacao === "visualizacoes") {
            listaProjetos.sort((a, b) => b.visualizacoes - a.visualizacoes);
        } else if (tipoOrdenacao === "maisRecentes") {
            listaProjetos.sort((a, b) => {
                const dataA = new Date(a.dataCriacao).getTime() || 0;
                const dataB = new Date(b.dataCriacao).getTime() || 0;
                return dataB - dataA;
            })
        }

        for (let i = 0; i < listaProjetos.length; i++) {
            const projeto = listaProjetos[i];
            await criarCardProjeto(projeto.id, projeto.dados, i);
        }
        localStorage.setItem('cacheProjetos', JSON.stringify(listaProjetos));
        localStorage.setItem('cacheTimestamp', Date.now());

    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }


}


function carregarDoCache() {
    const cache = localStorage.getItem('cacheProjetos');
    const tempoCache = localStorage.getItem('cacheTimestamp');

    const cacheValido = tempoCache && Date.now() - tempoCache < 5 * 60 * 1000;

    if (cache && cacheValido) {
        try {
            const projetos = JSON.parse(cache);
            projetos.forEach((projeto, i) => {
                criarCardProjeto(projeto.id, projeto.dados, i);
            });
        } catch (e) {
            console.warn('Erro ao ler cache localStorage:', e);
        }
    }
}

carregarDoCache()
carregarProjetos('tudo', 'curtidas');

const containerCategorias = document.querySelector('.categorias-container .categorias');


async function carregarCategoriasComContagem() {
    const db = getDatabase();
    const categoriasSnap = await get(ref(db, 'Categoria'));
    const projetosSnap = await get(ref(db, 'Projetos'));

    if (!categoriasSnap.exists()) return;

    const categorias = categoriasSnap.val();
    const projetos = projetosSnap.exists() ? Object.values(projetosSnap.val()) : [];

    containerCategorias.innerHTML = '';
    let categoriaSelecionada = null;

    Object.entries(categorias).forEach(([id, categoria]) => {
        const count = projetos.filter(p => Array.isArray(p.tags) && p.tags.includes(id)).length;

        const card = document.createElement('div');
        card.className = 'pd-2 noWrap cardCategoria bg-gray-100 rounded-xl cursor-pointer transition-all';
        card.dataset.categoriaId = id;
        card.innerHTML = `
        <h1 class="text-lg font-bold mg-0">${categoria.nome}</h1>
        <p class="mg-0 text-xs text-gray-25">${count} projeto${count !== 1 ? 's' : ''}</p>
    `;

        card.addEventListener('click', () => {
            const estaSelecionado = categoriaSelecionada === id;

            document.querySelectorAll('.cardCategoria').forEach(c => {
                c.classList.remove('bg-primary', 'text-white', 'bg-tertiary');
                c.classList.add('bg-gray-100', 'text-black');
            });

            if (estaSelecionado) {
                categoriaSelecionada = null;
                carregarProjetos("tudo");
            } else {
                categoriaSelecionada = id;
                card.classList.remove('bg-gray-100', 'text-black');
                card.classList.add('bg-tertiary', 'text-white');
                carregarProjetos(id);
            }
        });

        containerCategorias.appendChild(card);
    });
}

carregarCategoriasComContagem();