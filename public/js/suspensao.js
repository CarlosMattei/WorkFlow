import {
    getDatabase, ref, get, onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const db = getDatabase();
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/";
        return;
    }

    const userRef = ref(db, `Freelancer/${user.uid}`);

    onValue(userRef, (snapshot) => {
        if (!snapshot.exists()) {
            window.location.href = "/";
            return;
        }

        const userData = snapshot.val();

        if (userData.suspended && window.location.pathname !== '/suspensao') {
            window.location.href = "/suspensao";
        }

        if (!userData.suspended && window.location.pathname === '/suspensao') {
            window.location.href = "/"; 
        }
    });
});
