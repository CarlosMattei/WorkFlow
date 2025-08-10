import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

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
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    const db = getDatabase(app);
    const auth = getAuth();

    const sections = document.querySelectorAll('.content section');
    const stepButtons = document.querySelectorAll('.steps div');
    const nextButton = document.querySelector('.buttonProximo .btn-primary');
    const backButtonList = document.querySelectorAll('.btn-secondary');
    const createProposalButton = document.querySelector('.buttonsContinuarVoltar .btn-primary');
    
    let currentStep = 0;

    function updateSteps() {
        sections.forEach((section, index) => {
            section.style.display = index === currentStep ? 'block' : 'none';
        });

        stepButtons.forEach((btn, index) => {
            if (index <= currentStep) {
                btn.classList.add('bg-tertiary');
                btn.classList.remove('bg-gray');
            } else {
                btn.classList.add('bg-gray');
                btn.classList.remove('bg-tertiary');
            }
        });
    }

    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (currentStep === 0) {
            const title = document.getElementById('title').value.trim();
            const category = document.getElementById('category').value;
            const description = document.getElementById('description').value.trim();
            const priceMin = document.getElementById('price-min').value.trim();
            const priceMax = document.getElementById('price-max').value.trim();

            if (!title || !category || !description || !priceMin || !priceMax) {
                alert('Por favor, preencha todos os campos da Etapa 1.');
                return;
            }
            
            const min = parseFloat(priceMin.replace(',', '.'));
            const max = parseFloat(priceMax.replace(',', '.'));
            
            if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
                alert('Por favor, insira valores numéricos para o preço.');
                return;
            }
            if (min > max) {
                alert('O preço mínimo não pode ser maior que o preço máximo.');
                return;
            }
        }

        if (currentStep < sections.length - 1) {
            currentStep++;
            updateSteps();
        }
    });

    backButtonList.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                updateSteps();
            }
        });
    });

    createProposalButton.addEventListener('click', (e) => {
        e.preventDefault();

        const titulo = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const precoMin = document.getElementById('price-min').value;
        const precoMax = document.getElementById('price-max').value;
        const contatoChat = document.getElementById('contatoChat').checked;
        const contatoEmail = document.getElementById('contatoEmail').checked;
        const contatoWhatsapp = document.getElementById('contatoWhatsapp').checked;
        const contatoLinkedin = document.getElementById('contatLinkedin').checked;
        const contatoGithub = document.getElementById('contatGithub').checked;
        const contatoOutro = document.getElementById('contatoOutro').checked;
        const tempoDeProposta = document.getElementById('tempoDeProposta').value;
        const menoresDeIdade = document.getElementById('menoresDeIdade').checked;
        
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para criar a proposta.');
            return;
        }

        const uid = user.uid;
        get(ref(db, `Contratante/${uid}`)).then(snapshot => {
            if (!snapshot.exists()) {
                alert('Dados do contratante não encontrados.');
                return;
            }

            const dadosUsuario = snapshot.val();
            
            const novaProposta = {
                titulo: titulo,
                descricao: description,
                precoMin: parseFloat(precoMin.replace(',', '.')),
                precoMax: parseFloat(precoMax.replace(',', '.')),
                meiosDeContato: {
                    chat: contatoChat,
                    email: contatoEmail,
                    whatsapp: contatoWhatsapp,
                    linkedin: contatoLinkedin,
                    github: contatoGithub,
                    outro: contatoOutro
                },
                tempoDeProposta: tempoDeProposta,
                menoresDeIdade: menoresDeIdade,
                datacriacao: new Date().toISOString(),
                autorId: uid,
                nomeAutor: dadosUsuario.nome || "Nome não informado",
                fotoAutorUrl: dadosUsuario.foto_perfil || "",
                tags: [category]
            };

            const propostasRef = ref(db, 'Propostas');
            push(propostasRef, novaProposta)
                .then(() => {
                    alert('Proposta criada com sucesso!');
                })
                .catch(error => {
                    console.error("Erro ao salvar proposta:", error);
                    alert('Erro ao criar proposta.');
                });
        });
    });

    updateSteps();
});