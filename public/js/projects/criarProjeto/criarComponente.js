import { salvarProjetoFirebase } from "./salvarProjetoBanco.js";
import { supabase } from "./salvarImagensSupabase.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export let capaUrlGlobal = null
document.addEventListener('DOMContentLoaded', () => {
    const cardComponents = document.querySelectorAll('.cardComponent');
    const contentProject = document.querySelector('.contentProject');

    const modal = document.getElementById('modalComponentes');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('close');
    const projetoVazio = document.querySelector('.projetoVazio');
    const addButton = document.querySelector('#addComponent button');
    const buttonOpen = document.getElementById("addComponent");
    const buttonClose = closeModalBtn;
    const overlay = modalOverlay;

    const btnCancelar = document.getElementById('btnCancelar');
    const btnFinalizarProjeto = document.getElementById('btnSalvarFinal');

    const btnSalvar = document.getElementById('btnSalvar');
    const modalSalvarProjeto = document.getElementById('modalSalvarProjeto');
    const overlaySalvar = document.getElementById('overlaySalvar');
    const btnFecharModalFinal = document.getElementById('btnFecharModalFinal');
    const uploadContainer = document.getElementById('uploadContainer');
    const inputCapa = document.getElementById('capaFinal');
    const previewCapa = document.getElementById('previewCapa');


    btnSalvar.addEventListener('click', () => {
        modalSalvarProjeto.showModal();
        overlaySalvar.classList.add('active');
        setTimeout(() => modalSalvarProjeto.classList.add('open'), 10);
    });

    function fecharModalSalvarProjeto() {
        modalSalvarProjeto.classList.remove('open');
        modalSalvarProjeto.classList.add('closing');
        overlaySalvar.classList.remove('active');
        setTimeout(() => {
            modalSalvarProjeto.classList.remove('closing');
            modalSalvarProjeto.close();
        }, 300);
    }

    btnFecharModalFinal.addEventListener('click', fecharModalSalvarProjeto);
    overlaySalvar.addEventListener('click', fecharModalSalvarProjeto);

    uploadContainer.addEventListener('click', () => inputCapa.click());

    inputCapa.addEventListener('change', async () => {
        const file = inputCapa.files[0]

        if (!file) return

        try {
            const filePath = `projetos/${Date.now()}_${file.name}`

            const { data, error } = await supabase.storage
                .from('imagensprojeto')
                .upload(filePath, file)

            if (error) throw error;

            const { data: publicUrlData } = supabase
                .storage
                .from('imagensprojeto')
                .getPublicUrl(filePath)

            capaUrlGlobal = publicUrlData.publicUrl

            previewCapa.src = capaUrlGlobal;
            previewCapa.style.display = 'block';
            uploadContainer.querySelector('ion-icon').style.display = 'none';
            uploadContainer.querySelector('p').style.display = 'none';
            console.log('Imagem capa enviada com sucesso:', capaUrlGlobal);

        }
        catch (error) {
            console.error('Erro ao enviar imagem de capa:', error);
            alert('Erro ao enviar a imagem de capa.');
            capaUrlGlobal = null;
        }
    });

    const modalSucesso = document.getElementById('modalSucesso');
    btnFinalizarProjeto.addEventListener('click', async () => {
        try {
            await salvarProjetoFirebase(editId);
            fecharModalSalvarProjeto();
            modalSucesso.classList.remove('hidden');
            setTimeout(() => {
                modalSucesso.classList.add('hidden');
                window.location.href = '/';
            }, 2500);

        } catch (error) {
            console.error('Erro ao salvar projeto', error);
            alert('Erro ao salvar projeto');
        }
    });

    btnCancelar.addEventListener('click', () => window.location.href = '/');


    buttonOpen.onclick = function () {
        modal.showModal();
        overlay.classList.add("active");
        setTimeout(() => modal.classList.add("open"), 10);
    };

    function closeModal() {
        modal.classList.remove("open");
        modal.classList.add("closing");
        overlay.classList.remove("active");
        setTimeout(() => {
            modal.classList.remove("closing");
            modal.close();
        }, 300);
    }

    buttonClose.onclick = closeModal;
    overlay.onclick = closeModal;

    modal.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeModal();
    });

    new Sortable(contentProject, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        chosenClass: 'sortable-chosen',
        handle: '.drag-handle'
    });

    function verificarProjetoVazio() {
        const temComponentes = contentProject.querySelectorAll('.Ptext, .PTitulo, .Pimage, .Pcores').length > 0;
        projetoVazio.style.display = temComponentes ? 'none' : 'block';
    }

    cardComponents.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.component;
            let html = '';

            switch (type) {
                case 'texto':
                    html = `
            <div class="Ptext componente-removivel w-full" data-tipo="texto"  style="position: relative;">
              <button class="btn-remover" title="Remover componente">&times;</button>
              <span class="drag-handle">≡</span>
              <p class="text-lg">Novo texto adicionado ao projeto.</p>
            </div>`;
                    break;
                case 'titulo':
                    html = `
            <div class="PTitulo pd-y-3 w-full componente-removivel" data-tipo="titulo" style="position: relative;">
              <button class="btn-remover" title="Remover componente">&times;</button>
              <span class="drag-handle">≡</span>
              <h1 class="text-3xl text-white mg-0">Novo Título</h1>
            </div>`;
                    break;
                case 'imagem':
                    html = `
            <div class="Pimage w-full componente-removivel" data-tipo="imagem" style="position: relative;">
              <button class="btn-remover" title="Remover componente">&times;</button>
              <span class="drag-handle">≡</span>
              <img src="assets/image/createproject/Imagem.jpg" alt="Imagem adicionada" style="width: 100%;">
            </div>`;
                    break;
                case 'paleta':
                    html = `
            <div class="componente-removivel w-full" data-tipo="paleta" style="position: relative;">
              <button class="btn-remover" title="Remover componente">&times;</button>
              <span class="drag-handle" title="Ordenar componente">≡</span>
              <div class="PTitulo pd-y-3 w-full">
                <h1 class="text-3xl text-white mg-0">Cores do Projeto</h1>
              </div>
              <div class="Pcores pd-y-3 w-full">
                <div class="paleta-cores flex flex-row flex-wrap gap-3 mg-b-2">
                  ${gerarBlocoCor('#3498db')}
                  ${gerarBlocoCor('#e74c3c')}
                </div>
                <div class="row flex flex-row gap-3 mg-b-2">
                  <button class="btn btn-gray w-full btn-add-cor">Adicionar mais cores</button>
                </div>
              </div>
            </div>`;
                    break;
            }

            contentProject.insertAdjacentHTML('beforeend', html);
            const componentes = contentProject.querySelectorAll('.componente-removivel');
            const novaComp = componentes[componentes.length - 1];

            novaComp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            novaComp.classList.add('highlight');

            if (type === 'texto') configurarEdicaoTexto(novaComp.querySelector('p'));
            if (type === 'titulo') configurarEdicaoTitulo(novaComp.querySelector('h1'));
            if (type === 'imagem') configurarEdicaoImagem(novaComp.querySelector('img'));
            if (type === 'paleta') {
                const coresContainer = novaComp.querySelector('.paleta-cores');

                coresContainer.querySelectorAll('.cor-editavel').forEach(configurarCorIndividual);

                const btnAddCor = novaComp.querySelector('.btn-add-cor');
                btnAddCor.addEventListener('click', () => {
                    const novaCorHTML = gerarBlocoCor('#888888');
                    coresContainer.insertAdjacentHTML('beforeend', novaCorHTML);
                    const novaCor = coresContainer.lastElementChild;
                    configurarCorIndividual(novaCor);
                });

                new Sortable(coresContainer, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    handle: '.drag-handle-cor'
                });
            }

            setTimeout(() => novaComp.classList.remove('highlight'), 2000);
            verificarProjetoVazio();
            closeModal();

            const btnRemover = novaComp.querySelector('.btn-remover');
            btnRemover.addEventListener('click', () => {
                novaComp.remove();
                verificarProjetoVazio();
            });
        });
    });


    function AtivarModoEdicaoTexto(pElement) {
        const textoAtual = pElement.textContent;
        const textArea = document.createElement('textarea');
        textArea.className = 'text-lg';
        textArea.value = textoAtual;
        textArea.style.width = '100%';
        textArea.style.minHeight = '80px';

        pElement.replaceWith(textArea);
        textArea.focus();

        function salvarEdicao() {
            const novoTexto = textArea.value.trim();
            const novoP = document.createElement('p');
            novoP.className = 'text-lg';
            novoP.textContent = novoTexto || 'Texto Vazio';
            textArea.replaceWith(novoP);
            configurarEdicaoTexto(novoP);
        }

        textArea.addEventListener('blur', salvarEdicao);
        textArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textArea.blur();
            }
        });
    }

    function configurarEdicaoTexto(pElement) {
        pElement.addEventListener('dblclick', () => AtivarModoEdicaoTexto(pElement));
    }


    function ativarEdicaoTitulo(h1Element) {
        const textoAtual = h1Element.textContent;
        const input = document.createElement('input');
        input.value = textoAtual;

        input.className = 'text-3xl mg-0';
        input.style.width = '100%';
        input.style.backgroundColor = '#1e1e1e';
        input.style.color = 'white';
        input.style.border = '1px solid #555';
        input.style.borderRadius = '4px';
        input.style.padding = '8px';

        h1Element.replaceWith(input);
        input.focus();

        function salvarEdicao() {
            const novoTexto = input.value.trim();
            const novoH1 = document.createElement('h1');
            novoH1.className = 'text-3xl mg-0';
            novoH1.textContent = novoTexto || 'Título vazio';
            input.replaceWith(novoH1);
            configurarEdicaoTitulo(novoH1);
        }

        input.addEventListener('blur', salvarEdicao);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
        });
    }

    function configurarEdicaoTitulo(h1Element) {
        h1Element.addEventListener('dblclick', () => ativarEdicaoTitulo(h1Element));
    }


    function configurarEdicaoImagem(imgElement) {
        imgElement.addEventListener('dblclick', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.addEventListener('change', async () => {
                const file = input.files[0];
                if (file) {
                    try {
                        const timestamp = Date.now();
                        const fileName = `imagem_${timestamp}.${file.name.split('.').pop()}`;

                        const { data, error } = await supabase.storage
                            .from('imagensprojeto')
                            .upload(fileName, file);

                        if (error) {
                            console.error('Erro ao enviar imagem para Supabase:', error);
                            alert("Erro ao enviar imagem.");
                            return;
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from('imagensprojeto')
                            .getPublicUrl(fileName);

                        const urlPublica = publicUrlData.publicUrl;
                        imgElement.src = urlPublica;

                    } catch (e) {
                        console.error("Erro inesperado:", e);
                        alert("Erro inesperado ao processar a imagem.");
                    }
                }
            });

            document.body.appendChild(input);
            input.click();
            input.remove();
        });
    }


    function gerarBlocoCor(hex) {
        return `
    <div class="color cor-editavel  flex justify-start items-end pd-2 rounded-lg" data-cor="${hex}" 
         style="background-color: ${hex}; height: 150px; width: calc(50% - 12px); position: relative;">
        <button class="btn-remover-cor" style="
            position: absolute;
            top: 5px;
            right: 5px;
            background: #F84241;
            border: none;
            color: white;
            border-radius: 3px;
            width: 24px;
            height: 24px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        " title="Remover cor">&times;</button>
        <span class="drag-handle-cor" style="
            position: absolute;
            top: 5px;
            left: 5px;
            background: #30BFA5;
            color: white;
            border-radius: 3px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            cursor: move;
        " title="Ordenar cor">≡</span>
        <input type="color" value="${hex}" class="input-cor" style="
            position: absolute;
            bottom: 5px;
            left: 5px;
            opacity: 0;
            width: 24px;
            height: 24px;
            cursor: pointer;
        ">
        <h1 class="colorCode text-xl font-medium mg-0">${hex}</h1>
    </div>`;
    }

    function configurarCorIndividual(bloco) {
        const removerBtn = bloco.querySelector('.btn-remover-cor');
        const dragHandle = bloco.querySelector('.drag-handle-cor');
        const inputCor = bloco.querySelector('.input-cor');
        const label = bloco.querySelector('.colorCode');

        bloco.addEventListener('mouseenter', () => {
            removerBtn.style.opacity = '1';
            dragHandle.style.opacity = '1';
            removerBtn.style.pointerEvents = 'auto';
        });
        bloco.addEventListener('mouseleave', () => {
            removerBtn.style.opacity = '0';
            dragHandle.style.opacity = '0';
            removerBtn.style.pointerEvents = 'none';
        });

        removerBtn.addEventListener('click', () => {
            bloco.remove();
        });

        inputCor.addEventListener('input', () => {
            const novaCor = inputCor.value;
            bloco.style.backgroundColor = novaCor;
            bloco.setAttribute('data-cor', novaCor)
            label.textContent = novaCor;
        });

        bloco.addEventListener('dblclick', () => inputCor.click());
    }

    const tagsInput = document.getElementById('tagsInput');
    const tagsWrapper = document.getElementById('tagsWrapper');
    const tagsFinal = document.getElementById('tagsFinal');
    let tags = [];


    verificarProjetoVazio();

    function obterEditIdDaUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('editId');
    }

    async function carregarProjetoExistente(editId) {
        const db = getDatabase();

        try {
            const projetoRef = ref(db, `Projetos/${editId}`);
            const projetoSnap = await get(projetoRef);

            if (!projetoSnap.exists()) {
                console.warn("Projeto não encontrado");
                return;
            }

            const dadosProjeto = projetoSnap.val();

            if (dadosProjeto.titulo) {
                document.getElementById('tituloFinal').value = dadosProjeto.titulo;
            }

            if (dadosProjeto.tags) {
                tags = dadosProjeto.tags
                renderTags()
            }

            if (dadosProjeto.capaUrl) {
                capaUrlGlobal = dadosProjeto.capaUrl;
                const capaPreview = document.getElementById('previewCapa');
                const uploadIcon = uploadContainer.querySelector('ion-icon');
                const uploadText = uploadContainer.querySelector('p');
                if (capaPreview) capaPreview.src = dadosProjeto.capaUrl;
                if (uploadIcon) uploadIcon.style.display = 'none';
                if (uploadText) uploadText.style.display = 'none';
                capaPreview.style.display = 'block';
            }

            const componentesRef = ref(db, `componentesProjeto/${editId}`);
            const componentesSnap = await get(componentesRef);

            if (!componentesSnap.exists()) {
                console.warn("Sem componentes no projeto.");
                return;
            }

            const componentes = componentesSnap.val();
            const indicesOrdenados = Object.keys(componentes).sort((a, b) => a - b);

            for (const index of indicesOrdenados) {
                const { tipo, conteudo } = componentes[index];

                let html = '';

                switch (tipo) {
                    case 'texto':
                        html = `
                    <div class="Ptext componente-removivel w-full" data-tipo="texto" style="position: relative;">
                        <button class="btn-remover" title="Remover componente">&times;</button>
                        <span class="drag-handle">≡</span>
                        <p class="text-lg">${conteudo}</p>
                    </div>`;
                        break;
                    case 'titulo':
                        html = `
                    <div class="PTitulo pd-y-3 w-full componente-removivel" data-tipo="titulo" style="position: relative;">
                        <button class="btn-remover" title="Remover componente">&times;</button>
                        <span class="drag-handle">≡</span>
                        <h1 class="text-3xl text-white mg-0">${conteudo}</h1>
                    </div>`;
                        break;
                    case 'imagem':
                        html = `
                    <div class="Pimage w-full componente-removivel" data-tipo="imagem" style="position: relative;">
                        <button class="btn-remover" title="Remover componente">&times;</button>
                        <span class="drag-handle">≡</span>
                        <img src="${conteudo}" alt="Imagem adicionada" style="width: 100%;">
                    </div>`;
                        break;
                    case 'paleta':
                        html = `
                    <div class="componente-removivel w-full" data-tipo="paleta" style="position: relative;">
                        <button class="btn-remover" title="Remover componente">&times;</button>
                        <span class="drag-handle" title="Ordenar componente">≡</span>
                        <div class="PTitulo pd-y-3 w-full">
                            <h1 class="text-3xl text-white mg-0">Cores do Projeto</h1>
                        </div>
                        <div class="Pcores pd-y-3 w-full">
                            <div class="paleta-cores flex flex-row flex-wrap gap-3 mg-b-2">
                                ${conteudo.map(cor => gerarBlocoCor(cor)).join('')}
                            </div>
                            <div class="row flex flex-row gap-3 mg-b-2">
                                <button class="btn btn-gray w-full btn-add-cor">Adicionar mais cores</button>
                            </div>
                        </div>
                    </div>`;
                        break;
                    default:
                        console.warn("Tipo de componente desconhecido:", tipo);
                        continue;
                }

                contentProject.insertAdjacentHTML('beforeend', html);

                const novoComponente = contentProject.lastElementChild;

                if (tipo === 'texto') configurarEdicaoTexto(novoComponente.querySelector('p'));
                if (tipo === 'titulo') configurarEdicaoTitulo(novoComponente.querySelector('h1'));
                if (tipo === 'imagem') configurarEdicaoImagem(novoComponente.querySelector('img'));
                if (tipo === 'paleta') {
                    const coresContainer = novoComponente.querySelector('.paleta-cores');

                    coresContainer.querySelectorAll('.cor-editavel').forEach(configurarCorIndividual);

                    const btnAddCor = novoComponente.querySelector('.btn-add-cor');
                    btnAddCor.addEventListener('click', () => {
                        const novaCorHTML = gerarBlocoCor('#888888');
                        coresContainer.insertAdjacentHTML('beforeend', novaCorHTML);
                        const novaCor = coresContainer.lastElementChild;
                        configurarCorIndividual(novaCor);
                    });

                    new Sortable(coresContainer, {
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        handle: '.drag-handle-cor'
                    });
                }

                const btnRemover = novoComponente.querySelector('.btn-remover');
                btnRemover.addEventListener('click', () => {
                    novoComponente.remove();
                    verificarProjetoVazio();
                });
            }

        } catch (error) {
            console.error("Erro ao carregar projeto existente:", error);
        }
        verificarProjetoVazio()
    }

    const editId = obterEditIdDaUrl();
    if (editId) {
        carregarProjetoExistente(editId);
    }
});
