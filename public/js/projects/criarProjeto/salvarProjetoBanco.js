import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set,get, update ,serverTimestamp, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { capaUrlGlobal } from "./criarComponente.js";


function pegarCoresDaPaleta() {
    const cores = []
    const blocos = document.querySelectorAll('.paleta-cores .cor-editavel')
    blocos.forEach(bloco => {
        const cor = bloco.getAttribute('data-cor')
        if (cor) cores.push(cor)
    })
    return cores

}
async function pegarDataCriacao(projectId) {
    const db = getDatabase();
    const projetoRef = ref(db, `Projetos/${projectId}`);
    const snapshot = await get(projetoRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return data.dataCriacao || null;
    }
    return null;
}

export async function salvarProjetoFirebase(editId = null) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        alert('Usuário não autenticado!');
        return;
    }
    const userId = user.uid;

    const titulo = document.getElementById('tituloFinal').value.trim();
    const tagsInput = document.getElementById('tagsFinal').value.trim();
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    if (!titulo || !tags || !capaUrlGlobal) {
        alert('Preencha todos os campos e selecione uma imagem de capa!');
        return;
    }

    const db = getDatabase();
    let projectId = editId;

    let dataCriacao = null;
    if (projectId) {
        dataCriacao = await pegarDataCriacao(projectId);
    } else {
        const projetosRef = ref(db, 'Projetos');
        const novoProjetoRef = push(projetosRef);
        projectId = novoProjetoRef.key;
        dataCriacao = new Date().toISOString();
    }

    const projetoData = {
        userId,
        titulo,
        tags,
        capaUrl: capaUrlGlobal,
        dataCriacao,               
        dataAtualizacao: new Date().toISOString()
    };

    await update(ref(db, `Projetos/${projectId}`), projetoData);

    await remove(ref(db, `componentesProjeto/${projectId}`));

    const componentes = document.querySelectorAll('#contentProject > div');
    let index = 0;

    for (const componente of componentes) {
        const tipo = componente.getAttribute('data-tipo');
        let conteudo;

        try {
            if (tipo === 'texto') {
                const p = componente.querySelector('p');
                conteudo = p?.textContent.trim() || '';
            } else if (tipo === 'titulo') {
                const h1 = componente.querySelector('h1');
                conteudo = h1?.textContent.trim() || '';
            } else if (tipo === 'imagem') {
                const img = componente.querySelector('img');
                conteudo = img?.src || '';
            } else if (tipo === 'paleta') {
                conteudo = pegarCoresDaPaleta();
            }
            else if (tipo === 'galeria'){
                const galeria = componente.querySelector('.galeria-imagens')
                const gridType = galeria.getAttribute('data-gridtype')

                const slots = []

                galeria.querySelectorAll('.slot-imagem').forEach(div => {
                    const id = div.style.gridArea || div.getAttribute('data-slot') || null
                    const img = div.querySelector('img')?.src || null
                    slots.push({id, img})
                })
                conteudo = {gridType, slots}
            }

            if (!conteudo || (Array.isArray(conteudo) && conteudo.length === 0)) {
                console.warn('Conteúdo vazio, pulando componente.');
                continue;
            }

            const componenteData = {
                projectId,
                tipo,
                conteudo
            };

            await set(ref(db, `componentesProjeto/${projectId}/${index}`), componenteData);
            index++;
        } catch (error) {
            console.error(`Erro ao processar componente do tipo ${tipo}:`, error);
            continue;
        }
    }

    return projectId;
}