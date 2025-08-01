import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const tagsWrapper = document.getElementById('tagsWrapper');
const tagsFinal = document.getElementById('tagsFinal');
let selectedTags = [];

function atualizarTagsFinal() {
    tagsFinal.value = selectedTags.join(',');
}

function criarTagComId(id, texto) {
    const tagEl = document.createElement('div');
    tagEl.textContent = texto;
    tagEl.classList.add('tag');
    tagEl.style.padding = '4px 10px';
    tagEl.style.margin = '2px';
    tagEl.style.borderRadius = '15px';
    tagEl.style.backgroundColor = '#404040';
    tagEl.style.color = '#D9D9D9';
    tagEl.style.cursor = 'pointer';
    tagEl.style.userSelect = 'none';

    tagEl.addEventListener('click', () => {
        const idx = selectedTags.indexOf(id);
        if (idx === -1) {
            if (selectedTags.length >= 5) {
                alert('Você só pode selecionar até 5 tags.');
                return;
            }
            selectedTags.push(id);
            tagEl.style.backgroundColor = '#3C38A6';
            tagEl.style.boxShadow = '0 0 6px #3C38A6';
        } else {
            selectedTags.splice(idx, 1);
            tagEl.style.backgroundColor = '#404040';
            tagEl.style.boxShadow = 'none';
        }
        atualizarTagsFinal();
    });

    return tagEl;
}

async function carregarCategorias() {
    const db = getDatabase();
    const categoriasRef = ref(db, 'Categoria');
    const snapshot = await get(categoriasRef);

    if (snapshot.exists()) {
        const categorias = snapshot.val();
        Object.entries(categorias).forEach(([id, categoria]) => {
            const tagEl = criarTagComId(id, categoria.nome); 
            tagsWrapper.appendChild(tagEl);
        });
    } else {
        console.warn('Nenhuma categoria encontrada no Firebase.');
    }
}

carregarCategorias();
