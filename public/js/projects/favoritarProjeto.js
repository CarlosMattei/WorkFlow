import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

export function iconeFavorito(projetoId, svg) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid
            const favoritarRef = ref(db, `Favoritos/${projetoId}/${userId}`)

            get(favoritarRef).then(snapshot => {
                const path = svg.querySelector('path')
                if (snapshot.exists()) {
                    remove(favoritarRef)
                    path.classList.remove('favoritado')
                    svg.classList.add('animar-desfavorito')

                    setTimeout(() => {
                        svg.classList.remove('animar-desfavorito')
                    }, 400)
                }
                else {
                    set(favoritarRef, true)
                    path.classList.add('favoritado')
                    svg.classList.add('animar-favorito')
                    setTimeout(() => {
                        svg.classList.remove('animar-favorito')
                    }, 400)
                }
            })
        }
    })
}