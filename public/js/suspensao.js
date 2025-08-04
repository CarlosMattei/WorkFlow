import {
    getDatabase, ref, get, onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const freelancerRef = ref(db, `Freelancer/${user.uid}`);
    const contratanteRef = ref(db, `Contratante/${user.uid}`);

    onValue(freelancerRef, (snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            if (userData.suspended && window.location.pathname !== '/suspensao') {
                window.location.href = "/suspensao";
            }

            if (!userData.suspended && window.location.pathname === '/suspensao') {
                window.location.href = "/";
            }
        }
    });

    onValue(contratanteRef, (snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            if (userData.suspended && window.location.pathname !== '/suspensao') {
                window.location.href = "/suspensao";
            }

            if (!userData.suspended && window.location.pathname === '/suspensao') {
                window.location.href = "/";
            }
        }
    });
});
