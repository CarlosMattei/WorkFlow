import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let firebaseApp;
try {
    firebaseApp = getApp();
} catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
}

const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

const footerLogado = document.querySelector('.footer')
const footerNaoLogado = document.querySelector('.site-footer')

onAuthStateChanged(auth, (user) => {
    if(user){
        footerLogado.style.display = 'flex'
        footerNaoLogado.style.display = 'none'
    }
    else{
        footerLogado.style.display = 'none'
        footerNaoLogado.style.display = 'flex'
    }
})