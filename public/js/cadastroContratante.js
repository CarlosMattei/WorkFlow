import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAtfGyZc3SLzdK10zdq-ALyTyIs1s4qwQ",
    authDomain: "workflow-da28d.firebaseapp.com",
    projectId: "workflow-da28d",
    storageBucket: "workflow-da28d.firebasestorage.app",
    messagingSenderId: "939828605253",
    appId: "1:939828605253:web:0a286fe00f1c29ba614e2c",
    measurementId: "G-3LXB7BR5M1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const form = document.getElementById('formcontratante');
const inputEmail = document.getElementById('txtEmailContra');
const inputSenha = document.getElementById('txtSenhaContra');
const inputConfirmarSenha = document.getElementById('txtConfirmarSenhaContra');
const inputDataNascimento = document.getElementById('txtDataContra');
const inputDocumento = document.getElementById('documento');
const mensagemErro = document.getElementById('form-error');
const googleBtn = document.querySelector('.auth-link.google');
const githubBtn = document.querySelector('.auth-link.github');

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

function mostrarPopup(redirectUrl) {
    const popup = document.getElementById('popup');
    popup.classList.remove('popup-hidden');

    setTimeout(() => {
        popup.classList.add('popup-hidden');
        if (redirectUrl) window.location.href = redirectUrl;
    }, 2000);
}

async function registrarContratante(uid, userData) {
    await set(ref(database, `Contratante/${uid}`), userData);
    sessionStorage.setItem('primeirosPassosData', JSON.stringify(userData));
    mostrarPopup(`/contraPasso?userId=${uid}`);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();
    const confirmarSenha = inputConfirmarSenha.value.trim();
    const dataNascimento = inputDataNascimento.value;
    const documento = inputDocumento.value.replace(/\D/g, '');

    if (!email || !senha || !confirmarSenha || !dataNascimento) {
        mensagemErro.style.display = 'block';
        return;
    }

    if (senha !== confirmarSenha) {
        mensagemErro.style.display = 'block';
        mensagemErro.textContent = 'As senhas não coincidem';
        return;
    }

    if (!documento || (documento.length !== 11 && documento.length !== 14)) {
        mensagemErro.style.display = 'block';
        mensagemErro.textContent = 'Documento inválido. CPF deve ter 11 dígitos, CNPJ 14.';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const firebaseUser = userCredential.user;
        const uid = firebaseUser.uid;

        const userData = {
            email: email,
            dataNascimento: dataNascimento,
            dataCadastro: new Date().toISOString(),
            emailVerificado: false,
            tipoUsuario: 'contratante',
            documento: documento,
            Nome_usuario: null,
            Telefone: null,
            Biografia: null,
            Foto_perfil: null
        };

        await registrarContratante(uid, userData);

    } catch (error) {
        let errorMessage = 'Erro no cadastro: ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'Este email já está em uso.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Email inválido.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Senha muito fraca (mínimo 6 caracteres).';
                break;
            default:
                errorMessage += error.message;
        }
        mensagemErro.style.display = 'block';
        mensagemErro.textContent = errorMessage;
    }
});

async function cadastroSocialContratante(provider) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userId = user.uid;
        const dbRef = ref(database);
        const contratanteSnap = await get(child(dbRef, `Contratante/${userId}`));

        if (contratanteSnap.exists()) {
            alert("Conta já cadastrada. Por favor, faça login.");
            await signOut(auth);
            window.location.href = '/login';
            return;
        }

        const userData = {
            email: user.email,
            dataCadastro: new Date().toISOString(),
            emailVerificado: user.emailVerified || false,
            tipoUsuario: 'contratante',
            documento: null,
            Nome_usuario: user.displayName || null,
            Telefone: null,
            Biografia: null,
            Foto_perfil: user.photoURL || null
        };

        await registrarContratante(userId, userData);

    } catch (error) {
        console.error("Erro no cadastro social contratante:", error);
        alert("Erro ao cadastrar com login social. Tente novamente.");
    }
}

googleBtn.addEventListener('click', () => cadastroSocialContratante(googleProvider));
githubBtn.addEventListener('click', () => cadastroSocialContratante(githubProvider));

window.addEventListener('DOMContentLoaded', () => {
    const dados = JSON.parse(sessionStorage.getItem('primeirosPassosData'));
    if (dados) {
        document.getElementById('inputNome').value = dados.Nome_usuario || '';
        document.getElementById('inputEmail').value = dados.email || '';
        document.getElementById('inputFoto').src = dados.Foto_perfil || '/img/default.png';
    }
});
