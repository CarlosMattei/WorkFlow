const cards = document.querySelectorAll('.card_projeto');

cards.forEach(card => {
    card.addEventListener('click', () => {
        document.getElementById('modal').style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Correção aqui
    });
});

const modal = document.getElementById('modal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCLosebtnIsland = document.getElementById('modalCloseBtnIsland')
const floatingIsland = document.getElementById('floatingIsland');
const commentBtn = document.getElementById('commentBtn');
const likeBtn = document.getElementById('likeBtn');

// Função para fechar o modal
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restaura o scroll ao fechar
    resetIslandVisibility(); // Resetar visibilidade da island
}

// Função para rolar até a seção de comentários
function scrollToComments() {
    const commentSection = document.getElementById('commentInput');
    if (commentSection) {
        commentSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        commentSection.focus();
    }
}

// Função para atualizar informações da island
function updateIslandInfo(projectData) {
    const islandUserPhoto = document.getElementById('islandUserPhoto');
    const islandProjectTitle = document.getElementById('islandProjectTitle');
    const islandCreatorSpan = document.getElementById('islandCreatorSpan');
    
    if (projectData.userPhoto) {
        islandUserPhoto.src = projectData.userPhoto;
    }
    if (projectData.title) {
        islandProjectTitle.textContent = projectData.title;
    }
    if (projectData.creatorName) {
        islandCreatorSpan.textContent = projectData.creatorName;
    }
}

// Fechar ao clicar no overlay
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Fechar ao clicar no botão
modalCloseBtn.addEventListener('click', closeModal);
modalCLosebtnIsland.addEventListener('click', closeModal)
// Botão de comentar
commentBtn.addEventListener('click', scrollToComments);

// Botão de like (placeholder - pode ser integrado com o sistema existente)
likeBtn.addEventListener('click', () => {
    likeBtn.classList.toggle('liked');
    // Aqui você pode adicionar a lógica para curtir/descurtir
});

// Fechar com a tecla ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});

// Função para controlar visibilidade da island baseada no scroll
function handleIslandVisibility() {
    const modal = document.getElementById('modal');
    const floatingIsland = document.getElementById('floatingIsland');
    
    if (!modal || !floatingIsland) return;
    
    // Encontrar o elemento do título do projeto
    const modalHeader = modal.querySelector('.modal-header');
    if (!modalHeader) return;
    
    const headerBottom = modalHeader.getBoundingClientRect().bottom;
    const scrollTop = modal.scrollTop || document.documentElement.scrollTop;
    
    // Mostrar island quando passar do título (header)
    if (headerBottom < 80) { // 80px de margem do topo
        floatingIsland.classList.add('visible');
    } else {
        floatingIsland.classList.remove('visible');
    }
}

// Adicionar listener de scroll ao modal
function setupIslandScrollListener() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('scroll', handleIslandVisibility);
        // Também escutar scroll da janela para casos onde o modal não tem scroll próprio
        window.addEventListener('scroll', handleIslandVisibility);
    }
}

// Função para resetar a island quando o modal é fechado
function resetIslandVisibility() {
    const floatingIsland = document.getElementById('floatingIsland');
    if (floatingIsland) {
        floatingIsland.classList.remove('visible');
    }
}

// Expor função para ser usada por outros scripts
window.updateIslandInfo = updateIslandInfo;
window.setupIslandScrollListener = setupIslandScrollListener;
window.resetIslandVisibility = resetIslandVisibility;

// Configurar listener quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', setupIslandScrollListener);

