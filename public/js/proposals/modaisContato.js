const checkboxes = {
    contatoEmail: "modalEmail",
    contatoWhatsapp: "modalWhatsapp",
    contatLinkedin: "modalLinkedin",
    contatGithub: "modalGithub",
    contatoOutro: "modalOutro"
};

Object.keys(checkboxes).forEach(id => {
    const checkbox = document.getElementById(id);
    const modalId = checkboxes[id];
    const modal = document.getElementById(modalId);

    if (checkbox) {
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                modal.style.display = "flex";
            } else {
                modal.style.display = "none";
            }
        });
    }
});

document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-modal");
        const modal = document.getElementById(modalId);
        const checkboxId = Object.keys(checkboxes).find(
            key => checkboxes[key] === modalId
        );
        document.getElementById(checkboxId).checked = false;
        modal.style.display = "none";
    });
});

document.querySelectorAll(".confirm").forEach(btn => {
    btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-modal");
        const modal = document.getElementById(modalId);

        const checkboxId = Object.keys(checkboxes).find(
            key => checkboxes[key] === modalId
        );

        if (checkboxId) {
            document.getElementById(checkboxId).checked = true;
        }

        modal.style.display = "none";
    });
});

window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach(modal => {
        if (e.target === modal) {
            modal.style.display = "none";
            const checkboxId = Object.keys(checkboxes).find(
                key => checkboxes[key] === modal.id
            );
            document.getElementById(checkboxId).checked = false;
        }
    })
})
