document.addEventListener("DOMContentLoaded", () => {
    const stepsSections = Array.from(document.querySelectorAll("section[class*='step-']"));
    const stepIndicators = Array.from(document.querySelectorAll(".steps-wizard .step"));
    const stepLines = Array.from(document.querySelectorAll(".steps-wizard .line"));

    let currentStep = 0;

    const showStep = (index) => {
        stepsSections.forEach((section, i) => {
            section.style.display = i === index ? "block" : "none";
        });

        stepIndicators.forEach((el, i) => {
            el.classList.remove("active", "completed");
            if (i < index) el.classList.add("completed");
            if (i === index) el.classList.add("active");
        });

        stepLines.forEach((line, i) => {
            if (i < index) {
                line.style.background = "linear-gradient(90deg, var(--primary), var(--base-70))";
            } else {
                line.style.background = "linear-gradient(90deg, var(--gray-50), var(--gray-75))";
            }
        });

        currentStep = index;
    };

    document.querySelectorAll("form button[type='submit']").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentStep < stepsSections.length - 1) {
                showStep(currentStep + 1);
            }
        });
    });

    document.querySelectorAll("form button.btn-secondary").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    });

    showStep(0);
});
