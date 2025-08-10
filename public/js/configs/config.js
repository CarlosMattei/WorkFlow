import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import { getAuth, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

const userEmailSpan = document.getElementById('user-email');
const btnAlterarSenha = document.querySelector('.btnAlterarSenha');
const modal = document.getElementById('modalSenha');
const closeBtn = modal.querySelector('.close-btn');
const salvarBtn = document.getElementById('salvarSenhaBtn');
const cancelarBtn = document.getElementById('cancelarSenhaBtn');
const novaSenhaInput = document.getElementById('novaSenhaInput');

document.querySelectorAll('.toggle-visibility').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            button.title = 'Ocultar senha';
            button.querySelector('ion-icon').name = 'eye-off-outline';
        } else {
            input.type = 'password';
            button.title = 'Mostrar senha';
            button.querySelector('ion-icon').name = 'eye-outline';
        }
    });
});

btnAlterarSenha.addEventListener('click', () => {
    novaSenhaInput.value = ''
    modal.style.display = 'flex'
    novaSenhaInput.focus()
})
function fecharModal() {
    modal.style.display = 'none'
}
closeBtn.addEventListener('click', fecharModal)
cancelarBtn.addEventListener('click', fecharModal)

salvarBtn.addEventListener('click', async () => {
    const user = auth.currentUser
    const novaSenha = novaSenhaInput.value.trim()

    if (!user) {
        alert('nenhum usuario logado')
        fecharModal()
        return
    }
    if (novaSenha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres')
        novaSenhaInput.focus()
        return
    }
    try {
        await updatePassword(user, novaSenha)
        alert('Senha alterada com sucesso!')
        fecharModal()
    }
    catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            alert('Por segurança, faça login novamente para alterar a senha.');
            window.location.href = '/login'
        } else {
            alert('Erro ao alterar a senha: ' + error.message);
        }
    }
    window.addEventListener('click', e => {
        if(e.target === modal){
            fecharModal()
        }
    })
})
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailSpan.textContent = user.email
    }
})