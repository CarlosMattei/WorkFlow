import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAtfGyZc3SLzdK10zdq-ALyTyIs1s4qwQ",
    authDomain: "workflow-da28d.firebaseapp.com",
    databaseURL: "https://workflow-da28d-default-rtdb.firebaseio.com",
    projectId: "workflow-da28d",
    storageBucket: "workflow-da28d.appspot.com",
    messagingSenderId: "939828605253",
    appId: "1:939828605253:web:0a286fe00f1c29ba614e2c",
    measurementId: "G-3LXB7BR5M1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);


const style = document.createElement("style");
style.textContent = `
  .circulo {
    opacity: 0;
    transform: translateY(-50px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .circulo.entrando {
    opacity: 1;
    transform: translateY(0);
  }
  .circulo.saindo {
    opacity: 0;
    transform: translateY(50px);
  }

  .circulo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;
document.head.appendChild(style);
const circulos = document.querySelectorAll(".circulo");
let imagens = [];

async function carregarFotosDoFirebase() {
    const snapshot = await get(ref(db, "Freelancer"));
    if (snapshot.exists()) {
        const data = snapshot.val();
        imagens = Object.values(data)
            .map(f => f.foto_perfil)
            .filter(url => !!url);
    }
}

function carregarImagensAleatorias() {
    if (imagens.length < 3) return;

    let escolhidas = [];
    while (escolhidas.length < 3) {
        const img = imagens[Math.floor(Math.random() * imagens.length)];
        if (!escolhidas.includes(img)) {
            escolhidas.push(img);
        }
    }

    circulos.forEach((div, i) => {
        div.classList.remove("entrando");
        setTimeout(() => {
            div.classList.add("saindo");
        }, i * 150);
    });

    setTimeout(() => {
        circulos.forEach((div, i) => {
            div.innerHTML = `<img src="${escolhidas[i]}">`;

            div.classList.remove("saindo");

            void div.offsetWidth;

            setTimeout(() => {
                div.classList.add("entrando");
            }, i * 150);
        });
    }, 600);
}

(async () => {
    await carregarFotosDoFirebase();
    carregarImagensAleatorias();
    setInterval(carregarImagensAleatorias, 5000);
})();