import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, update, get, child, push, set, remove, runTransaction, onValue, off } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let firebaseApp;
try {
    firebaseApp = getApp();
} catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
}

const params = new URLSearchParams(window.location.search);
const perfilUserId = params.get('id');

const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const containerCard = document.getElementById('card-zone');
const contadorProjetos = document.getElementById('quantidadeProjetos');
const tabButtons = document.querySelectorAll('.tab-button');


const abas = {
    projetos: [],
    curtidos: [],
    favoritos: []
};

let tipoUsuario = null;
const activeListeners = {};

const modalHTML = `
<div id="modalProjeto" class="modal" style="display:none;">
    <div class="modal-content">
        <span id="modalClose" class="modal-close">&times;</span>
        <div id="modalBody"></div>
    </div>
</div>
`;
if (!document.getElementById('modalProjeto')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}
const modal = document.getElementById('modalProjeto');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.dataset.currentProjectId = '';
    liberarScrollPagina();
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modal.dataset.currentProjectId = '';
        liberarScrollPagina();
    }
});

const modalCandidatosHTML = `
<div id="modalCandidatos" class="modal" style="display:none; align-items: center; justify-content: center;">
    <div class="modal-content" style="background-color: #2c2c2c; padding: 25px; border-radius: 10px; max-width: 600px; width: 90%; box-shadow: 0 4px 15px rgba(0,0,0,0.5); position: relative;">
        <span id="modalCandidatosClose" class="modal-close" style="position: absolute; top: 10px; right: 20px; font-size: 30px; color: #bbb; cursor: pointer;">&times;</span>
        <h2 id="modalCandidatosTitulo" style="color: #fff; text-align: center; margin-bottom: 20px; font-size: 1.8em;">Candidatos para a Proposta</h2>
        <div id="listaCandidatos" style="display: flex; flex-direction: column; gap: 15px; max-height: 70vh; overflow-y: auto; padding-right: 10px;">
            </div>
    </div>
</div>
`;
if (!document.getElementById('modalCandidatos')) {
    document.body.insertAdjacentHTML('beforeend', modalCandidatosHTML);
}

const modalCandidatos = document.getElementById('modalCandidatos');
const modalCandidatosClose = document.getElementById('modalCandidatosClose');
const listaCandidatosDiv = document.getElementById('listaCandidatos');

modalCandidatosClose.addEventListener('click', () => {
    modalCandidatos.style.display = 'none';
    listaCandidatosDiv.innerHTML = '';
});
modalCandidatos.addEventListener('click', (e) => {
    if (e.target === modalCandidatos) {
        modalCandidatos.style.display = 'none';
        listaCandidatosDiv.innerHTML = '';
    }
});

async function abrirModalCandidatos(propostaId) {
    listaCandidatosDiv.innerHTML = '<p style="color: #ccc; text-align: center;">Carregando candidatos...</p>';
    modalCandidatos.style.display = 'flex';

    try {
        const candidaturasRef = ref(db, `Candidaturas/${propostaId}`);
        const snapshot = await get(candidaturasRef);

        let candidatosHtml = '';
        if (snapshot.exists()) {
            const candidaturas = snapshot.val();
            const candidatosArray = Object.values(candidaturas);

            if (candidatosArray.length > 0) {
                const candidatosComDetalhes = await Promise.all(candidatosArray.map(async (candidatoBruto) => {
                    const userId = candidatoBruto.userId;
                    const { data: userData } = await obterDadosUsuario(userId);
                    return {
                        userId: userId,
                        nome: userData?.nome || 'Nome Indisponível',
                        foto_perfil: userData?.foto_perfil || 'https://via.placeholder.com/50',
                        tag: userData?.tag || 'Tag Indisponível',
                        mensagem: candidatoBruto.mensagem || 'Sem mensagem'
                    };
                }));

                candidatosComDetalhes.forEach(candidato => {
                    candidatosHtml += `
                        <div class="candidato-item" style="background-color: #3a3a3a; padding: 15px; border-radius: 8px; border: 1px solid #444; display: flex; flex-direction: column; gap: 10px;">
                            <div class="candidato-header" style="display: flex; align-items: center; gap: 10px;">
                                <img src="${candidato.foto_perfil}" alt="${candidato.nome}" class="candidato-foto" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #5274D9;">
                                <div class="candidato-info">
                                    <h3 style="margin: 0; color: #fff; font-size: 1.1em;">${candidato.nome}</h3>
                                    <p style="margin: 0; color: #bbb; font-size: 0.9em;">${candidato.tag}</p>
                                </div>
                            </div>
                            <p class="candidato-mensagem" style="color: #ccc; font-style: italic; margin-left: 60px;">"${candidato.mensagem}"</p>
                            <a href="/perfil?id=${candidato.userId}" target="_blank" class="ver-perfil-candidato" style="display: inline-block; background-color: #5274D9; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; align-self: flex-end; font-size: 0.9em; transition: background-color 0.3s ease;">Ver Perfil</a>
                        </div>
                    `;
                });
            } else {
                candidatosHtml = '<p style="color: #ccc; text-align: center;">Nenhum candidato encontrado para esta proposta.</p>';
            }
        } else {
            candidatosHtml = '<p style="color: #ccc; text-align: center;">Nenhum candidato encontrado para esta proposta.</p>';
        }

        listaCandidatosDiv.innerHTML = candidatosHtml;

    } catch (error) {
        console.error("Erro ao carregar candidatos:", error);
        listaCandidatosDiv.innerHTML = `<p style="color: red; text-align: center;">Erro ao carregar candidatos: ${error.message}</p>`;
    }
}

async function obterDadosUsuario(userId) {
    let userData = null;
    let userType = null;

    const freelancerSnap = await get(ref(db, `Freelancer/${userId}`));
    if (freelancerSnap.exists()) {
        userData = freelancerSnap.val();
        userType = 'Freelancer';
    } else {
        const contratanteSnap = await get(ref(db, `Contratante/${userId}`));
        if (contratanteSnap.exists()) {
            userData = contratanteSnap.val();
            userType = 'Contratante';
        }
    }
    return { data: userData, type: userType };
}

function formatarData(isoString) {
    const data = new Date(isoString);
    return isNaN(data) ? "Data inválida" : data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatarTempoComentario(timestamp) {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffMs = now - commentDate;
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.round(diffDays / 365);

    if (diffSeconds < 60) {
        return `há ${diffSeconds} segundos`;
    } else if (diffMinutes < 60) {
        return `há ${diffMinutes} minutos`;
    } else if (diffHours < 24) {
        return `há ${diffHours} horas`;
    } else if (diffDays < 30) {
        return `há ${diffDays} dias`;
    } else if (diffMonths < 12) {
        return `há ${diffMonths} meses`;
    } else {
        return `há ${diffYears} anos`;
    }
}

function criarCardProjeto(id, projeto, aba = 'projetos', currentUserId = null, isProjectLikedByViewer = false, autorNome = 'Desconhecido', autorFotoUrl = 'https://via.placeholder.com/50', visualizacoes = 0, curtidas = 0, comentarios = 0, cardIndex = 0, isProjectFavoritedByViewer = false) {
    const card = document.createElement('div');
    card.className = 'card_projeto';
    card.dataset.projetoId = id;
    card.style.display = 'none';
    card.style.setProperty('--card-index', cardIndex);
    const isAutorDoPerfil = auth.currentUser && projeto.userId === auth.currentUser.uid;
    const autorDisplayTexto = isAutorDoPerfil ? 'Criado por você' : autorNome;
    const autorDisplayFoto = autorFotoUrl;
    const mostrarEdit = projeto.userId === perfilUserId && auth.currentUser && auth.currentUser.uid === perfilUserId && aba === 'projetos';
    let isLikedForDisplay = isProjectLikedByViewer;
    let isFavoritedForDisplay = isProjectFavoritedByViewer;

    if (aba === 'curtidos' && perfilUserId === currentUserId) {
        isLikedForDisplay = true;
    }
    if (aba === 'favoritos' && perfilUserId === currentUserId) {
        isFavoritedForDisplay = true;
    }

    card.innerHTML = `
        <div class="capa">
            <figure>
                <img src="${projeto.capaUrl}" alt="" class="thumbnail">
            </figure>
            <div class="thumbnail-overlay">
                <div class="project-overlay-content">
                    <div class="icons-column">
                       <div class="like ${isLikedForDisplay ? 'curtido' : ''}" 
     title="${isLikedForDisplay ? 'Descurtir' : 'Curtir'}" 
     style="cursor:pointer;" 
     data-projeto-id="${id}" 
     data-liked="${isLikedForDisplay ? 'true' : 'false'}"> 
    ${isLikedForDisplay ? `
        <svg width="25" height="25" viewBox="0 0 24 24" 
             fill="red" stroke="red" stroke-width="2" 
             stroke-linecap="round" stroke-linejoin="round" 
             class="feather feather-heart">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    ` : `
        <svg width="25" height="25" viewBox="-2 -2 28 28" 
             xmlns="http://www.w3.org/2000/svg" 
             class="feather feather-heart">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M10.2366 18.4731L18.35 10.3598L18.483 10.2267L18.4809 10.2246C20.6263 7.93881 20.5826 4.34605 18.35 2.11339C16.1173 -0.11928 12.5245 -0.16292 10.2387 1.98247L10.2366 1.98036L10.2366 1.98039L10.2366 1.98037L10.2345 1.98247C7.94862 -0.162927 4.35586 -0.119289 2.12319 2.11338C-0.109476 4.34605 -0.153114 7.93881 1.99228 10.2246L1.99017 10.2268L10.2365 18.4731L10.2366 18.4731L10.2366 18.4731Z"
                fill="none" stroke="#426AB2" />
        </svg>
    `}
</div>
                        <div class="favorite ${isFavoritedForDisplay ? 'favoritado' : ''}" title="${isFavoritedForDisplay ? 'Desfavoritar' : 'Favoritar'}" style="cursor:pointer;" data-projeto-id="${id}" data-favorited="${isFavoritedForDisplay ? 'true' : 'false'}">
                            ${isFavoritedForDisplay ? `
                                <svg width="25" height="25" viewBox="0 0 64 64" fill="#426AB2" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M30.051 45.6071L17.851 54.7401C17.2728 55.1729 16.5856 55.4363 15.8662 55.5008C15.1468 55.5652 14.4237 55.4282 13.7778 55.1049C13.1319 54.7817 12.5887 54.2851 12.209 53.6707C11.8293 53.0563 11.6281 52.3483 11.628 51.626V15.306C11.628 13.2423 12.4477 11.2631 13.9069 9.8037C15.3661 8.34432 17.3452 7.52431 19.409 7.52405H45.35C47.4137 7.52431 49.3929 8.34432 50.8521 9.8037C52.3112 11.2631 53.131 13.2423 53.131 15.306V51.625C53.1309 52.3473 52.9297 53.0553 52.55 53.6697C52.1703 54.2841 51.6271 54.7807 50.9812 55.1039C50.3353 55.4272 49.6122 55.5642 48.8928 55.4998C48.1734 55.4353 47.4862 55.1719 46.908 54.739L34.715 45.6071C34.0419 45.1031 33.2238 44.8308 32.383 44.8308C31.5422 44.8308 30.724 45.1031 30.051 45.6071V45.6071Z"
                                        stroke="#426AB2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            ` : `
                                <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M30.051 45.6071L17.851 54.7401C17.2728 55.1729 16.5856 55.4363 15.8662 55.5008C15.1468 55.5652 14.4237 55.4282 13.7778 55.1049C13.1319 54.7817 12.5887 54.2851 12.209 53.6707C11.8293 53.0563 11.6281 52.3483 11.628 51.626V15.306C11.628 13.2423 12.4477 11.2631 13.9069 9.8037C15.3661 8.34432 17.3452 7.52431 19.409 7.52405H45.35C47.4137 7.52431 49.3929 8.34432 50.8521 9.8037C52.3112 11.2631 53.131 13.2423 53.131 15.306V51.625C53.1309 52.3473 52.9297 53.0553 52.55 53.6697C52.1703 54.2841 51.6271 54.7807 50.9812 55.1039C50.3353 55.4272 49.6122 55.5642 48.8928 55.4998C48.1734 55.4353 47.4862 55.1719 46.908 54.739L34.715 45.6071C34.0419 45.1031 33.2238 44.8308 32.383 44.8308C31.5422 44.8308 30.724 45.1031 30.051 45.6071V45.6071Z"
                                        stroke="#426AB2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            `}
                        </div>
                        ${mostrarEdit ? `
                            <div class="edit" title="Editar" style="cursor:pointer;">
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                                </svg>
                            </div>
                            <div class="delete" title="Excluir" style="cursor:pointer;" data-projeto-id="${id}">
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                    <path d="M10 11v6"></path>
                                    <path d="M14 11v6"></path>
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 0 0 1 1 1v2"></path>
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                    <div class="project-title">
                        <h1>${projeto.titulo}</h1>
                    </div>
                </div>
            </div>
        </div>
        <a href="/perfil?id=${projeto.userId}" class="autor-link" style="text-decoration: none; color: inherit;">
            <div class="autor" style="display: flex; align-items: center; gap: 10px; padding: 10px;">
                <img src="${autorDisplayFoto}" alt="Foto do Autor" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                <h2 class="username">${autorDisplayTexto}</h2>
            </div>
        </a>
        <div class="project-stats" style="display: flex; gap: 10px; font-size: 14px; color: #fff; justify-content: flex-end; padding-right: 10px; padding-bottom: 10px;">
            <div class="likes" style="display: flex; align-items: center; gap: 3px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#5274D9" stroke="#5274D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="like-count">${curtidas}</span>
            </div>
            <div class="views" style="display: flex; align-items: center; gap: 3px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="size-6">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#5274D9" stroke="#5274D9"/>
                    <path fill="#5274D9" stroke="#5274D9" fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clip-rule="evenodd" />
                </svg>
                <span class="view-count">${visualizacoes}</span>
            </div>
            <div class="comments" style="display: flex; align-items: center; gap: 3px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill="#5274D9" stroke="#5274D9" fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clip-rule="evenodd" />
                </svg>
                <span class="comment-count">${comentarios}</span>
            </div>
        </div>
    `;

    const img = card.querySelector('.thumbnail');
    if (img) {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });

        if (img.complete) {
            img.classList.add('loaded');
        }
    }

    containerCard.appendChild(card);
    abas[aba].push(card);

    setupProjectListeners(id, card);
    return card;
}

function criarCardProposta(p, aba = 'projetos') {
    const tagsHtml = Array.isArray(p.tags) ? p.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    const fotoUrl = p.fotoAutorUrl || 'https://via.placeholder.com/40';
    const nomeAutor = p.nomeAutor || 'Nome não informado';
    const isDonoDoPerfil = perfilUserId === auth.currentUser?.uid;

    const card = document.createElement('div');
    card.className = 'proposta-card';
    card.style.display = 'none';
    card.dataset.propostaId = p.id;

    card.innerHTML = `
        <div class="head">
            <h3>${p.titulo || 'Sem título'}</h3>
            <div class="price">R$${p.precoMin || '-'} - R$${p.precoMax || '-'}</div>
        </div>
        <p class="criadoEm">Criado em ${formatarData(p.datacriacao)}</p>
        <div class="tags">${tagsHtml}</div>
        <p class="description">${p.descricao || ''}</p>
        <div class="client-footer">
            <div class="client">
                <img class="profilePic" src="${fotoUrl}" alt="${nomeAutor}">
                <span class="client-name">${nomeAutor}</span>
            </div>
            <div class="buttons">
                ${isDonoDoPerfil
            ? `<button class="candidatos" data-proposta-id="${p.id}">Candidatos</button>`
            : `<button class="enviar">Se candidatar</button>`
        }
            </div>
        </div>
    `;

    containerCard.appendChild(card);
    abas[aba].push(card);

    if (isDonoDoPerfil) {
        const candidatosButton = card.querySelector('.candidatos');
        if (candidatosButton) {
            candidatosButton.addEventListener('click', () => {
                abrirModalCandidatos(p.id);
            });
        }
    }
    return card;
}

function setupProjectListeners(projectId, cardElement) {
    if (activeListeners[projectId]) {
        activeListeners[projectId].forEach(listener => off(listener.ref, listener.eventType, listener.callback));
    }
    activeListeners[projectId] = [];

    const curtidasRef = ref(db, `Curtidas/${projectId}`);
    const comentariosRef = ref(db, `Comentarios/${projectId}`);
    const visualizacoesRef = ref(db, `Projetos/${projectId}/visualizacoes`);

    const curtidasCallback = onValue(curtidasRef, (snapshot) => {
        const curtidas = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        const likeCountSpan = cardElement.querySelector('.like-count');
        if (likeCountSpan) {
            likeCountSpan.textContent = curtidas;
        }
        if (modal.style.display === 'flex' && modal.dataset.currentProjectId === projectId) {
            const modalLikeCount = modalBody.querySelector('.like-count');
            if (modalLikeCount) {
                modalLikeCount.textContent = curtidas;
            }
        }
    });
    activeListeners[projectId].push({ ref: curtidasRef, eventType: 'value', callback: curtidasCallback });

    const comentariosCallback = onValue(comentariosRef, async (snapshot) => {
        const comentarios = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        const commentCountSpan = cardElement.querySelector('.comment-count');
        if (commentCountSpan) {
            commentCountSpan.textContent = comentarios;
        }
        if (modal.style.display === 'flex' && modal.dataset.currentProjectId === projectId) {
            const modalCommentCount = modalBody.querySelector('.comment-count');
            if (modalCommentCount) {
                modalCommentCount.textContent = comentarios;
            }
            const updatedComentarios = await obterComentariosDoProjeto(projectId);
            document.getElementById('comentariosProjeto').innerHTML = updatedComentarios.map(com => criarComentarioHTML(com)).join('');
        }
    });
    activeListeners[projectId].push({ ref: comentariosRef, eventType: 'value', callback: comentariosCallback });

    const visualizacoesCallback = onValue(visualizacoesRef, (snapshot) => {
        const visualizacoes = snapshot.exists() ? snapshot.val() : 0;
        const viewCountSpan = cardElement.querySelector('.view-count');
        if (viewCountSpan) {
            viewCountSpan.textContent = visualizacoes;
        }
        if (modal.style.display === 'flex' && modal.dataset.currentProjectId === projectId) {
            const modalViewCount = modalBody.querySelector('.view-count');
            if (modalViewCount) {
                modalViewCount.textContent = visualizacoes;
            }
        }
    });
    activeListeners[projectId].push({ ref: visualizacoesRef, eventType: 'value', callback: visualizacoesCallback });
}

function mostrarCards(tipo) {
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const botaoAtivo = [...tabButtons].find(btn => btn.dataset.tab === tipo);
    if (botaoAtivo) botaoAtivo.classList.add('active');

    containerCard.classList.remove('grid-propostas');

    if (tipo === 'projetos' && tipoUsuario === 'Contratante') {
        containerCard.classList.add('grid-propostas');
    }

    containerCard.querySelectorAll('.card_projeto, .proposta-card').forEach(card => card.style.display = 'none');

    containerCard.querySelectorAll('.mensagem-aba').forEach(el => el.remove());

    const cards = abas[tipo];

    if (!cards || cards.length === 0) {
        const msg = document.createElement('p');
        msg.className = 'mensagem-aba';
        msg.textContent = 'Ainda não há conteúdo nesta aba.';
        containerCard.appendChild(msg);
        contadorProjetos.textContent = '0';
    } else {
        cards.forEach(card => card.style.display = 'block');
        contadorProjetos.textContent = cards.length;
    }
}

async function detectarTipoUsuario(uid) {
    if (!uid) return null;
    const freelancerSnap = await get(ref(db, `Freelancer/${uid}`));
    if (freelancerSnap.exists()) return 'Freelancer';
    const contratanteSnap = await get(ref(db, `Contratante/${uid}`));
    if (contratanteSnap.exists()) return 'Contratante';
    return null;
}

async function incrementarVisualizacaoUnica(projetoId) {
    if (!auth.currentUser) {
        return;
    }

    const userId = auth.currentUser.uid;
    const visualizacaoUnicaRef = ref(db, `VisualizacoesUnicas/${projetoId}/${userId}`);
    const visualizacoesTotaisRef = ref(db, `Projetos/${projetoId}/visualizacoes`);

    try {
        const uniqueViewSnap = await get(visualizacaoUnicaRef);

        if (!uniqueViewSnap.exists()) {
            await set(visualizacaoUnicaRef, true);

            await runTransaction(visualizacoesTotaisRef, (currentVisualizacoes) => {
                const newVisualizacoes = (currentVisualizacoes || 0) + 1;
                return newVisualizacoes;
            });
        }
    } catch (error) {
        console.error("Erro ao registrar ou incrementar visualização única:", error);
    }
}

function criarCabecalhoProjetoHTML(projeto, autorNome, autorId) {
    return `
        <div class="modal-header">
            <div class="modal-titulo">
                <h1>${projeto.titulo || 'Sem Título'}</h1>
            </div>
            <div class="modal-creator">
                <p>Projeto criado por <a href="/perfil?id=${autorId}" class="user-name-modal">${autorNome || 'Desconhecido'}</a>.</p>
            </div>
        </div>
    `;
}

function criarComentarioHTML(comentario) {
    return `
        <div class="containerComentarios">
            <div class="user-info">
                <img src="${comentario.foto || 'https://via.placeholder.com/50'}" alt="Usuário">
                <div class="user-details">
                    <span class="user-name">${comentario.nome || 'Anônimo'}</span>
                    <span class="message-time">${comentario.tempo || 'há pouco'}</span>
                </div>
            </div>
            <div class="message-text">${comentario.texto || ''}</div>
        </div>
    `;
}

async function obterComentariosDoProjeto(projetoId) {
    const comentariosSnap = await get(ref(db, `Comentarios/${projetoId}`));
    const comentariosData = comentariosSnap.exists() ? comentariosSnap.val() : {};

    const comentariosArray = [];
    for (const comentarioId in comentariosData) {
        const comentario = comentariosData[comentarioId];
        let userSnap;
        let userData = {};

        userSnap = await get(ref(db, `Freelancer/${comentario.userId}`));
        if (userSnap.exists()) {
            userData = userSnap.val();
        } else {
            userSnap = await get(ref(db, `Contratante/${comentario.userId}`));
            if (userSnap.exists()) {
                userData = userSnap.val();
            }
        }

        comentariosArray.push({
            nome: userData.nome || 'Anônimo',
            foto: userData.foto_perfil || 'https://via.placeholder.com/50',
            texto: comentario.texto,
            timestamp: comentario.timestamp,
            tempo: formatarTempoComentario(comentario.timestamp)
        });
    }
    comentariosArray.sort((a, b) => b.timestamp - a.timestamp);
    return comentariosArray;
}

async function criarBlocoExtraProjetoHTML(projeto, autorData, comentarios) {
    const dataCriacao = new Date(projeto.dataCriacao).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    const tagsHTML = (projeto.tags && Array.isArray(projeto.tags))
        ? projeto.tags.map(tag => `<span class="tag-span">${tag}</span>`).join('')
        : '';

    const comentariosHTML = comentarios.map(com => criarComentarioHTML(com)).join('');

    let outrosProjetosHTML = '';
    const autorProjetosSnap = await get(ref(db, `Projetos`));
    if (autorProjetosSnap.exists()) {
        const todosProjetos = autorProjetosSnap.val();
        const projetosDoAutor = Object.entries(todosProjetos)
            .filter(([id, proj]) => proj.userId === autorData.id && id !== projeto.id)
            .slice(0, 6); // Limite de 6 projetos para o carrossel

        outrosProjetosHTML = projetosDoAutor.map(([id, proj]) => `
            <div class="carousel-item card-projeto" data-projeto-id="${id}" style="cursor: pointer;">
                <img src="${proj.capaUrl || 'https://via.placeholder.com/150'}" alt="${proj.titulo}" style="width:100%; height:100%; object-fit:cover; border-radius:3px;">
            </div>
        `).join('');
    }

    return `
    <div class="combined-section">
        <div class="section-infos">
            <div class="titulo-container">
                <h1 id="txtTituloTag">${projeto.titulo || 'Sem Título'}</h1>
            </div>
            <div id="modalTagsContainer" class="tags-container">
                ${tagsHTML}
            </div>
            <div class="data-container">
                <p id="data-criado" class="data-criado">criado em ${dataCriacao}</p>
            </div>
        </div>

        <div class="footer-section">
            <div class="footer-left">
                <div class="card-autor">
                    <div class="header-card-autor">
                        <div class="container-1">
                            <div class="header-card-autor-image">
                                <img src="${autorData.foto_perfil || 'https://via.placeholder.com/50'}" id="modalUserPhoto" alt="Profile pic">
                            </div>
                            <div class="header-card-autor-title">
                                <h1 id="modalAutor">${autorData.nome || 'Autor Desconhecido'}</h1>
                                <p id="modalTag">${autorData.tag || 'Não informado'}</p>
                            </div>
                        </div>
                        <div class="container-2">
                            <button class="button-container contactar" id="contactar">Contatar</button>
                            <a id="btnVerPerfil" href="/perfil?id=${autorData.id}"><button class="button-container">Ver Perfil</button></a>
                        </div>
                    </div>
                    <div class="outros-projetos">
                       
                        <div class="carousel-container">
                            <div class="carousel-track">
                                ${outrosProjetosHTML}
                            </div>
                            <button class="carousel-button prev">&#10094;</button>
                            <button class="carousel-button next">&#10095;</button>
                        </div>
                    </div>
                </div>
                <h3>comentarios</h3>
                <div class="message-card">
                <div class="input-box" style="margin-top: 20px;">
                    <input type="text" id="commentInput" placeholder="Escreva um comentário...">
                    <button id="btnEnviarComentario">Enviar</button>
                </div>
                <div id="comentariosProjeto" style="margin-top: 20px;">
                    ${comentariosHTML}
                </div>
                </div>
            </div>
        </div>
        </div>
    `;
}


async function deletarProjeto(projectId) {
    if (!auth.currentUser || auth.currentUser.uid !== perfilUserId) {
        alert('Você não tem permissão para deletar este projeto.');
        return;
    }

    const confirmacao = confirm('Tem certeza que deseja excluir este projeto? Esta ação é irreversível.');

    if (confirmacao) {
        try {
            await remove(ref(db, `Projetos/${projectId}`));
            await remove(ref(db, `componentesProjeto/${projectId}`));
            await remove(ref(db, `Curtidas/${projectId}`));
            await remove(ref(db, `Comentarios/${projectId}`));
            await remove(ref(db, `VisualizacoesUnicas/${projectId}`));
            await remove(ref(db, `Favoritos/${projectId}`));

            const cardParaRemover = document.querySelector(`.card_projeto[data-projeto-id="${projectId}"]`);
            if (cardParaRemover) {
                cardParaRemover.remove();
            }

            if (activeListeners[projectId]) {
                activeListeners[projectId].forEach(listener => off(listener.ref, listener.eventType, listener.callback));
                delete activeListeners[projectId];
            }

            abas.projetos = abas.projetos.filter(card => card.dataset.projetoId !== projectId);
            abas.curtidos = abas.curtidos.filter(card => card.dataset.projetoId !== projectId);
            abas.favoritos = abas.favoritos.filter(card => card.dataset.projetoId !== projectId);


            mostrarCards('projetos');

            alert('Projeto excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar o projeto:', error);
            alert('Ocorreu um erro ao excluir o projeto. Por favor, tente novamente.');
        }
    }
}

async function abrirModalProjeto(projetoId) {
    modal.style.display = 'none';
    modal.dataset.currentProjectId = '';
    bloquearScrollPagina();

    try {
        const projetoRef = ref(db, `Projetos/${projetoId}`);
        const projetoSnap = await get(projetoRef);

        if (!projetoSnap.exists()) {
            modalBody.innerHTML = '<p style="color: #ccc; text-align: center;">Projeto não encontrado.</p>';
            modal.style.display = 'flex';
            return;
        }

        const projetoData = { id: projetoId, ...projetoSnap.val() };
        const autorId = projetoData.userId;

        const [{ data: fetchedAutorData, type: autorTipo }, componentesSnap, comentarios] = await Promise.all([
            obterDadosUsuario(autorId),
            get(ref(db, `componentesProjeto/${projetoId}`)),
            obterComentariosDoProjeto(projetoId)
        ]);

        let autorData = {};
        if (fetchedAutorData) {
            autorData = { id: autorId, ...fetchedAutorData, tag: fetchedAutorData.tag || (autorTipo === 'Freelancer' ? 'Freelancer' : 'Contratante') };
        }

        const cabecalhoHTML = criarCabecalhoProjetoHTML(projetoData, autorData.nome, autorData.id);

        let componentesHTML = '';
        if (!componentesSnap.exists()) {
            componentesHTML = '<p style="color: #ccc; text-align: center;">Sem componentes para este projeto.</p>';
        } else {
            const componentes = Object.values(componentesSnap.val());
            componentes.sort((a, b) => a.ordem - b.ordem);
            for (const comp of componentes) {
                if (comp.tipo === 'imagem') {
                    componentesHTML += `<img src="${comp.conteudo}" alt="Imagem do projeto" class="componente-img" style="margin-bottom: 15px; border-radius: 6px; width: 100%; height: auto; display: block;">`;
                } else if (comp.tipo === 'texto') {
                    componentesHTML += `<div style="margin-bottom: 15px; color:#ddd; line-height: 1.6;">${comp.conteudo}</div>`;
                }
            }
        }

        const blocoExtraHTML = await criarBlocoExtraProjetoHTML(projetoData, autorData, comentarios);

        modalBody.innerHTML = `
    ${cabecalhoHTML}
    <div id="conteudoProjeto" style="padding: 20px;">
        ${componentesHTML}
    </div>
    <div id="blocoExtraProjeto" style="padding: 20px;">
        ${blocoExtraHTML}
    </div>
`;

        modal.style.display = 'flex';
        modal.dataset.currentProjectId = projetoId;

        const btnContatar = modalBody.querySelector('#contactar');
        if (btnContatar) {
            btnContatar.dataset.userId = autorData.id || '';
            btnContatar.dataset.nome = autorData.nome || '';
            btnContatar.dataset.avatar = autorData.foto_perfil || '';

            const novoBtnContatar = btnContatar.cloneNode(true);
            btnContatar.replaceWith(novoBtnContatar);

            novoBtnContatar.addEventListener('click', async () => {
                const authUser = auth.currentUser;
                if (!authUser) {
                    alert('Você precisa estar logado para contatar o autor.');
                    return;
                }

                const userIdLogado = authUser.uid;
                const userIdContato = novoBtnContatar.dataset.userId;
                const nomeContato = novoBtnContatar.dataset.nome;
                const avatarContato = novoBtnContatar.dataset.avatar;

                try {
                    const db = getDatabase();

                    const conversaLogadoRef = ref(db, `Conversas/${userIdLogado}/${userIdContato}`);
                    const conversaContatoRef = ref(db, `Conversas/${userIdContato}/${userIdLogado}`);

                    const [snapshotLogado, snapshotContato] = await Promise.all([
                        get(conversaLogadoRef),
                        get(conversaContatoRef)
                    ]);

                    if (snapshotLogado.exists() && snapshotContato.exists()) {
                        window.location.href = `/chat?user=${userIdContato}`;
                        return;
                    }

                    let dadosUserLogado = null;
                    const snapshotFreelancer = await get(ref(db, `Freelancer/${userIdLogado}`));
                    if (snapshotFreelancer.exists()) {
                        dadosUserLogado = snapshotFreelancer.val();
                    } else {
                        const snapshotContratante = await get(ref(db, `Contratante/${userIdLogado}`));
                        if (snapshotContratante.exists()) {
                            dadosUserLogado = snapshotContratante.val();
                        }
                    }

                    if (!dadosUserLogado) {
                        alert("Erro ao obter seus dados para criar a conversa.");
                        return;
                    }

                    const timestampAgora = Date.now();

                    await Promise.all([
                        set(conversaLogadoRef, {
                            nome: nomeContato,
                            avatar: avatarContato,
                            timestamp: timestampAgora
                        }),
                        set(conversaContatoRef, {
                            nome: dadosUserLogado.nome || '',
                            avatar: dadosUserLogado.foto_perfil || '',
                            timestamp: timestampAgora
                        })
                    ]);

                    const mensagensRef = ref(db, `Conversas/${userIdLogado}/${userIdContato}/mensagens`);
                    await push(mensagensRef, {
                        autor: userIdLogado,
                        texto: "Você iniciou uma conversa.",
                        timestamp: timestampAgora
                    });

                    alert("Contato salvo! Agora você será redirecionado ao chat.");
                    window.location.href = `/chat?user=${userIdContato}`;
                } catch (error) {
                    console.error("Erro ao salvar contato:", error);
                    alert("Erro ao salvar contato. Tente novamente mais tarde.");
                }
            });
        }


        const carouselContainer = modalBody.querySelector('.carousel-container');
        if (carouselContainer) {
            const carouselTrack = carouselContainer.querySelector('.carousel-track');
            const prevButton = carouselContainer.querySelector('.carousel-button.prev');
            const nextButton = carouselContainer.querySelector('.carousel-button.next');
            const carouselItems = carouselTrack.querySelectorAll('.carousel-item');

            let currentIndex = 0;
            const itemsPerView = Math.floor(carouselContainer.offsetWidth / carouselItems[0].offsetWidth);

            function updateCarousel() {

                if (currentIndex < 0) {
                    currentIndex = carouselItems.length - itemsPerView;
                } else if (currentIndex >= carouselItems.length - itemsPerView + 1) {
                    currentIndex = 0;
                }

                const itemWidth = carouselItems[0].offsetWidth + 10;
                carouselTrack.style.transform = `translateX(-${currentIndex * itemWidth}px)`;


                prevButton.style.display = (currentIndex === 0) ? 'none' : 'block';
                nextButton.style.display = (currentIndex >= carouselItems.length - itemsPerView) ? 'none' : 'block';
            }

            prevButton.addEventListener('click', () => {
                currentIndex--;
                updateCarousel();
            });

            nextButton.addEventListener('click', () => {
                currentIndex++;
                updateCarousel();
            });


            window.addEventListener('resize', updateCarousel);
            updateCarousel();
        }


        modalBody.querySelectorAll('.outros-projetos .card-projeto').forEach(otherProjectCard => {
            otherProjectCard.addEventListener('click', async (e) => {
                const otherProjectId = e.currentTarget.dataset.projetoId;
                if (otherProjectId) {
                    await abrirModalProjeto(otherProjectId);
                }
            });
        });

        const btnEnviarComentario = document.getElementById('btnEnviarComentario');
        if (btnEnviarComentario) {
            btnEnviarComentario.addEventListener('click', async () => {
                const commentInput = document.getElementById('commentInput');
                const commentText = commentInput.value.trim();
                if (commentText && auth.currentUser) {
                    const newCommentRef = push(ref(db, `Comentarios/${projetoId}`));
                    await set(newCommentRef, {
                        userId: auth.currentUser.uid,
                        texto: commentText,
                        timestamp: Date.now()
                    });
                    commentInput.value = '';
                } else {
                    alert('Por favor, escreva um comentário e esteja logado para comentar.');
                }
            });
        }

        await incrementarVisualizacaoUnica(projetoId);
        const cardElement = document.querySelector(`.card_projeto[data-projeto-id="${projetoId}"]`);
        if (cardElement) {
            setupProjectListeners(projetoId, cardElement);
        }

    } catch (error) {
        console.error("Erro ao carregar o projeto:", error);
        modalBody.innerHTML = `<p style="color: red; text-align: center;">Erro ao carregar o projeto: ${error.message}</p>`;
        modal.style.display = 'flex';
    }
}

containerCard.addEventListener('click', async (event) => {
    const likeButton = event.target.closest('.like');
    if (likeButton) {
        if (!auth.currentUser) {
            alert('Você precisa estar logado para curtir projetos!');
            return;
        }

        const projectId = likeButton.dataset.projetoId;
        const userId = auth.currentUser.uid;
        let isCurrentlyLiked = likeButton.dataset.liked === 'true';
        const curtidasRef = ref(db, `Curtidas/${projectId}/${userId}`);

        if (isCurrentlyLiked) {
            await set(curtidasRef, null);
            likeButton.dataset.liked = 'false';
            likeButton.classList.remove('curtido');
            likeButton.innerHTML = `
                <svg width="25" height="25" viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg" class="feather feather-heart">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M10.2366 18.4731L18.35 10.3598L18.483 10.2267L18.4809 10.2246C20.6263 7.93881 20.5826 4.34605 18.35 2.11339C16.1173 -0.11928 12.5245 -0.16292 10.2387 1.98247L10.2366 1.98036L10.2366 1.98039L10.2366 1.98037L10.2345 1.98247C7.94862 -0.162927 4.35586 -0.119289 2.12319 2.11338C-0.109476 4.34605 -0.153114 7.93881 1.99228 10.2246L1.99017 10.2268L10.2365 18.4731L10.2366 18.4731L10.2366 18.4731Z"
                        fill="none" stroke="black" />
                </svg>
            `;
            likeButton.title = 'Curtir';

            const index = abas.curtidos.findIndex(card => card.dataset.projetoId === projectId);
            if (index > -1) {
                abas.curtidos.splice(index, 1);
            }

        } else {
            await set(curtidasRef, true);
            likeButton.dataset.liked = 'true';
            likeButton.classList.add('curtido');
            likeButton.innerHTML = `
                <svg width="25" height="25" viewBox="0 0 24 24" fill="red" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            `;
            likeButton.title = 'Descurtir';

            const existingCardInLiked = abas.curtidos.find(card => card.dataset.projetoId === projectId);
            if (!existingCardInLiked) {
                const projetoSnap = await get(ref(db, `Projetos/${projectId}`));
                if (projetoSnap.exists()) {
                    const projetoData = projetoSnap.val();
                    const autorData = (await obterDadosUsuario(projetoData.userId)).data || {};
                    const visualizacoesSnap = await get(ref(db, `Projetos/${projectId}/visualizacoes`));
                    const visualizacoes = visualizacoesSnap.exists() ? visualizacoesSnap.val() : 0;
                    const curtidasCountSnap = await get(ref(db, `Curtidas/${projectId}`));
                    const curtidas = curtidasCountSnap.exists() ? Object.keys(curtidasCountSnap.val()).length : 0;
                    const comentariosCountSnap = await get(ref(db, `Comentarios/${projectId}`));
                    const comentarios = comentariosCountSnap.exists() ? Object.keys(comentariosCountSnap.val()).length : 0;

                    criarCardProjeto(projectId, projetoData, 'curtidos', currentUserId, true, autorData.nome, autorData.foto_perfil, visualizacoes, curtidas, comentarios, 0);
                }
            }
        }
        if (document.querySelector('.tab-button.active')?.dataset.tab === 'curtidos' && perfilUserId === userId) {
            mostrarCards('curtidos');
        }

        return;
    }
    const editButton = event.target.closest('.edit');
    if (editButton) {
        const cardProjeto = editButton.closest('.card_projeto');
        const projectIdToEdit = cardProjeto ? cardProjeto.dataset.projetoId : null;
        if (projectIdToEdit) {
            window.location.href = `/criarProjeto?editId=${projectIdToEdit}`;
        }
        return;
    }
    const deleteButton = event.target.closest('.delete');
    if (deleteButton) {
        const projectIdToDelete = deleteButton.dataset.projetoId;
        if (projectIdToDelete) {
            await deletarProjeto(projectIdToDelete);
        }
        return;
    }
    const favoriteButton = event.target.closest('.favorite');
    if (favoriteButton) {
        if (!auth.currentUser) {
            alert('Você precisa estar logado para favoritar projetos!');
            return;
        }

        const projectId = favoriteButton.dataset.projetoId;
        const userId = auth.currentUser.uid;
        let isCurrentlyFavorited = favoriteButton.dataset.favorited === 'true';
        const favoritosRef = ref(db, `Favoritos/${projectId}/${userId}`);

        if (isCurrentlyFavorited) {
            await set(favoritosRef, null);
            favoriteButton.dataset.favorited = 'false';
            favoriteButton.classList.remove('favoritado');
            favoriteButton.innerHTML = `
                <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M30.051 45.6071L17.851 54.7401C17.2728 55.1729 16.5856 55.4363 15.8662 55.5008C15.1468 55.5652 14.4237 55.4282 13.7778 55.1049C13.1319 54.7817 12.5887 54.2851 12.209 53.6707C11.8293 53.0563 11.6281 52.3483 11.628 51.626V15.306C11.628 13.2423 12.4477 11.2631 13.9069 9.8037C15.3661 8.34432 17.3452 7.52431 19.409 7.52405H45.35C47.4137 7.52431 49.3929 8.34432 50.8521 9.8037C52.3112 11.2631 53.131 13.2423 53.131 15.306V51.625C53.1309 52.3473 52.9297 53.0553 52.55 53.6697C52.1703 54.2841 51.6271 54.7807 50.9812 55.1039C50.3353 55.4272 49.6122 55.5642 48.8928 55.4998C48.1734 55.4353 47.4862 55.1719 46.908 54.739L34.715 45.6071C34.0419 45.1031 33.2238 44.8308 32.383 44.8308C31.5422 44.8308 30.724 45.1031 30.051 45.6071V45.6071Z"
                        stroke="#426AB2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
            `;
            favoriteButton.title = 'Favoritar';

            const index = abas.favoritos.findIndex(card => card.dataset.projetoId === projectId);
            if (index > -1) {
                abas.favoritos[index].remove();
                abas.favoritos.splice(index, 1);
            }

        } else {
            await set(favoritosRef, true);
            favoriteButton.dataset.favorited = 'true';
            favoriteButton.classList.add('favoritado');
            favoriteButton.innerHTML = `
                <svg width="25" height="25" viewBox="0 0 64 64" fill="#426AB2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.051 45.6071L17.851 54.7401C17.2728 55.1729 16.5856 55.4363 15.8662 55.5008C15.1468 55.5652 14.4237 55.4282 13.7778 55.1049C13.1319 54.7817 12.5887 54.2851 12.209 53.6707C11.8293 53.0563 11.6281 52.3483 11.628 51.626V15.306C11.628 13.2423 12.4477 11.2631 13.9069 9.8037C15.3661 8.34432 17.3452 7.52431 19.409 7.52405H45.35C47.4137 7.52431 49.3929 8.34432 50.8521 9.8037C52.3112 11.2631 53.131 13.2423 53.131 15.306V51.625C53.1309 52.3473 52.9297 53.0553 52.55 53.6697C52.1703 54.2841 51.6271 54.7807 50.9812 55.1039C50.3353 55.4272 49.6122 55.5642 48.8928 55.4998C48.1734 55.4353 47.4862 55.1719 46.908 54.739L34.715 45.6071C34.0419 45.1031 33.2238 44.8308 32.383 44.8308C31.5422 44.8308 30.724 45.1031 30.051 45.6071V45.6071Z"
                                        stroke="#426AB2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            `;
            favoriteButton.title = 'Desfavoritar';

            const existingCardInFavorited = abas.favoritos.find(card => card.dataset.projetoId === projectId);
            if (!existingCardInFavorited) {
                const projetoSnap = await get(ref(db, `Projetos/${projectId}`));
                if (projetoSnap.exists()) {
                    const projetoData = projetoSnap.val();
                    const autorData = (await obterDadosUsuario(projetoData.userId)).data || {};
                    const visualizacoesSnap = await get(ref(db, `Projetos/${projectId}/visualizacoes`));
                    const visualizacoes = visualizacoesSnap.exists() ? visualizacoesSnap.val() : 0;
                    const curtidasCountSnap = await get(ref(db, `Curtidas/${projectId}`));
                    const curtidas = curtidasCountSnap.exists() ? Object.keys(curtidasCountSnap.val()).length : 0;
                    const comentariosCountSnap = await get(ref(db, `Comentarios/${projectId}`));
                    const comentarios = comentariosCountSnap.exists() ? Object.keys(comentariosCountSnap.val()).length : 0;
                    const isLikedByViewer = todasCurtidas[projectId] && todasCurtidas[projectId][currentUserId];

                    criarCardProjeto(projectId, projetoData, 'favoritos', currentUserId, isLikedByViewer, autorData.nome, autorData.foto_perfil, visualizacoes, curtidas, comentarios, 0, true);
                }
            }
        }
        if (document.querySelector('.tab-button.active')?.dataset.tab === 'favoritos' && perfilUserId === userId) {
            mostrarCards('favoritos');
        }
        return;
    }

    const cardProjeto = event.target.closest('.card_projeto');
    if (cardProjeto) {
        const clickedElement = event.target;
        const isInteractiveElement = clickedElement.closest('.like') || clickedElement.closest('.edit') || clickedElement.closest('.delete') || clickedElement.closest('.autor-link');

        if (!isInteractiveElement) {
            const projetoId = cardProjeto.dataset.projetoId;
            if (projetoId) {
                await abrirModalProjeto(projetoId);
            }
        }
        return;
    }

    const propostaCard = event.target.closest('.proposta-card');
    if (propostaCard) {
        const clickedElement = event.target;
        const isInteractiveElement = clickedElement.closest('.candidatos') || clickedElement.closest('.enviar') || clickedElement.closest('.client');

        if (!isInteractiveElement) {

        }
        return;
    }
});


function detachAllListeners() {
    for (const projectId in activeListeners) {
        if (activeListeners.hasOwnProperty(projectId)) {
            activeListeners[projectId].forEach(listener => {
                off(listener.ref, listener.eventType, listener.callback);
            });
            delete activeListeners[projectId];
        }
    }
}

onAuthStateChanged(auth, async (user) => {
    detachAllListeners();

    const currentUserId = user?.uid || null;

    if (!perfilUserId) {
        containerCard.innerHTML = '<p>Nenhum perfil especificado na URL. Por favor, retorne à página inicial ou use um link válido.</p>';
        contadorProjetos.textContent = '0';
        return;
    }

    containerCard.innerHTML = '';
    abas.projetos = [];
    abas.curtidos = [];
    abas.favoritos = [];

    const [
        propostasSnap,
        projetosSnap,
        curtidasSnap,
        comentariosGlobaisSnap,
        favoritosSnap,
        tipoUsuario
    ] = await Promise.all([
        get(ref(db, 'Propostas')),
        get(ref(db, 'Projetos')),
        get(ref(db, 'Curtidas')),
        get(ref(db, 'Comentarios')),
        get(ref(db, 'Favoritos')),
        detectarTipoUsuario(perfilUserId)
    ]);

    if (!tipoUsuario) {
        containerCard.innerHTML = '<p>Tipo de usuário não encontrado para este ID.</p>';
        contadorProjetos.textContent = '0';
        return;
    }


    if (tipoUsuario === 'Contratante') {
        const labelProjetos = document.querySelector('.projetos-realizados p');
        if (labelProjetos) labelProjetos.textContent = 'Propostas realizadas';
    }

    tabButtons.forEach(btn => {
        if (btn.dataset.tab === 'projetos') {
            const span = btn.querySelector('span');
            if (span) span.textContent = tipoUsuario === 'Contratante' ? 'Propostas' : 'Projetos';
        }
    });

    const todosProjetos = projetosSnap.exists() ? projetosSnap.val() : {};
    const todasCurtidas = curtidasSnap.exists() ? curtidasSnap.val() : {};
    const todosComentarios = comentariosGlobaisSnap.exists() ? comentariosGlobaisSnap.val() : {};
    const todosFavoritos = favoritosSnap.exists() ? favoritosSnap.val() : {};

    const userIdsToFetch = new Set();
    Object.values(todosProjetos).forEach(proj => userIdsToFetch.add(proj.userId));
    if (perfilUserId) userIdsToFetch.add(perfilUserId);
    if (currentUserId) userIdsToFetch.add(currentUserId);

    const userPromises = Array.from(userIdsToFetch).map(userId => obterDadosUsuario(userId));
    const fetchedUsers = await Promise.all(userPromises);

    const usersData = {};
    fetchedUsers.forEach(({ data, type }, index) => {
        const userId = Array.from(userIdsToFetch)[index];
        if (data) {
            usersData[userId] = {
                nome: data.nome || 'Desconhecido',
                foto_perfil: data.foto_perfil || 'https://via.placeholder.com/50',
                tag: data.tag || (type === 'Freelancer' ? 'Freelancer' : 'Contratante'),
                tipo: type
            };
        }
    });

    let curtidosIndex = 0;
    Object.entries(todasCurtidas).forEach(([projetoId, usuariosQueCurtiram]) => {
        if (usuariosQueCurtiram[perfilUserId]) {
            const projeto = todosProjetos[projetoId];
            if (projeto) {
                const isLikedByViewer = todasCurtidas[projetoId] && todasCurtidas[projetoId][currentUserId];
                const isFavoritedByViewer = todosFavoritos[projetoId] && todosFavoritos[projetoId][currentUserId];
                const autorData = usersData[projeto.userId] || {};
                const visualizacoes = projeto.visualizacoes || 0;
                const curtidas = Object.keys(usuariosQueCurtiram).length;
                const comentarios = todosComentarios[projetoId] ? Object.keys(todosComentarios[projetoId]).length : 0;

                criarCardProjeto(projetoId, projeto, 'curtidos', currentUserId, isLikedByViewer, autorData.nome, autorData.foto_perfil, visualizacoes, curtidas, comentarios, curtidosIndex++, isFavoritedByViewer);
            }
        }
    });

    let favoritosIndex = 0;
    if (todosFavoritos) {
        Object.entries(todosFavoritos).forEach(([projetoId, usuariosQueFavoritaram]) => {
            if (usuariosQueFavoritaram[perfilUserId]) {
                const projeto = todosProjetos[projetoId];
                if (projeto) {
                    const isLikedByViewer = todasCurtidas[projetoId] && todasCurtidas[projetoId][currentUserId];
                    const isFavoritedByViewer = todosFavoritos[projetoId] && todosFavoritos[projetoId][currentUserId];
                    const autorData = usersData[projeto.userId] || {};
                    const visualizacoes = projeto.visualizacoes || 0;
                    const curtidas = todasCurtidas[projetoId] ? Object.keys(todasCurtidas[projetoId]).length : 0;
                    const comentarios = todosComentarios[projetoId] ? Object.keys(todosComentarios[projetoId]).length : 0;

                    criarCardProjeto(projetoId, projeto, 'favoritos', currentUserId, isLikedByViewer, autorData.nome, autorData.foto_perfil, visualizacoes, curtidas, comentarios, favoritosIndex++, isFavoritedByViewer);
                }
            }
        });
    }

    if (tipoUsuario === 'Contratante') {
        if (propostasSnap.exists()) {
            const propostas = propostasSnap.val();
            Object.entries(propostas).forEach(([propostaId, p]) => {
                if (p.autorId === perfilUserId) {
                    criarCardProposta({ ...p, id: propostaId }, 'projetos');
                }
            });
        }
    } else if (tipoUsuario === 'Freelancer') {
        if (projetosSnap.exists()) {
            let projetosIndex = 0;
            Object.entries(todosProjetos).forEach(([id, dados]) => {
                if (dados.userId === perfilUserId) {
                    const isLikedByViewer = todasCurtidas[id] && todasCurtidas[id][currentUserId];
                    const isFavoritedByViewer = todosFavoritos[id] && todosFavoritos[id][currentUserId];
                    const autorData = usersData[dados.userId] || {};
                    const visualizacoes = dados.visualizacoes || 0;
                    const curtidas = todasCurtidas[id] ? Object.keys(todasCurtidas[id]).length : 0;
                    const comentarios = todosComentarios[id] ? Object.keys(todosComentarios[id]).length : 0;

                    criarCardProjeto(id, dados, 'projetos', currentUserId, isLikedByViewer, autorData.nome, autorData.foto_perfil, visualizacoes, curtidas, comentarios, projetosIndex++, isFavoritedByViewer);
                }
            });
        }
    }

    mostrarCards('projetos');

    const quantidadePropostasFinalizadas = 10;

    let nivel = 0;
    let titulo = 'Desenvolvedor iniciante';

    if (quantidadePropostasFinalizadas >= 20) {
        nivel = 4;
        titulo = 'Profissional experiente';
    } else if (quantidadePropostasFinalizadas >= 10) {
        nivel = 3;
        titulo = 'Profissional em ascensão';
    } else if (quantidadePropostasFinalizadas >= 5) {
        nivel = 2;
        titulo = 'Aprendiz ativo';
    } else {
        nivel = 1;
        titulo = 'Desenvolvedor iniciante';
    }

    const blocos = document.querySelectorAll('.exp-blocks .exp');
    blocos.forEach(bloco => bloco.classList.remove('ativo'));

    for (let i = 0; i < nivel; i++) {
        setTimeout(() => {
            blocos[i].classList.add('ativo');
        }, i * 300);
    }

    const spanNivel = document.querySelector('.experiencia > span');
    if (spanNivel) {
        spanNivel.textContent = titulo;
    }
});


window.mostrarCards = mostrarCards;
window.abrirModalProjeto = abrirModalProjeto;
window.abrirModalCandidatos = abrirModalCandidatos;

document.addEventListener('DOMContentLoaded', () => {
    const modalEditar = document.getElementById('modal-editar');
    if (modalEditar) {
        modalEditar.style.display = 'none';

        if (modalEditar.classList.contains('open') || modalEditar.classList.contains('active')) {
            modalEditar.classList.remove('open', 'active');
        }
    }
});
function bloquearScrollPagina() {
    document.body.classList.add('modal-open');
}

function liberarScrollPagina() {
    document.body.classList.remove('modal-open');
}


window.addEventListener('beforeunload', detachAllListeners);