document.addEventListener("DOMContentLoaded", () => {
    const steps = Array.from(document.querySelectorAll("section"));
    const stepIndicators = [
        document.querySelector(".step-1"),
        document.querySelector(".step-2"),
        document.querySelector(".step-3")
    ];

    let currentStep = 0;

    steps.forEach((step, index) => {
        step.style.display = index === currentStep ? "block" : "none";
    });

    const updateStepIndicator = (index) => {
        stepIndicators.forEach((el, i) => {
            if (i <= index) {
                el.classList.add("bg-tertiary");
                el.classList.remove("bg-gray");
            } else {
                el.classList.remove("bg-tertiary");
                el.classList.add("bg-gray");
            }
        });
    };

    updateStepIndicator(currentStep);

    const changeStep = (direction) => {
        const nextStep = currentStep + direction;
        if (nextStep < 0 || nextStep >= steps.length) return;

        steps[currentStep].style.display = "none";
        steps[nextStep].style.display = "block";
        currentStep = nextStep;

        updateStepIndicator(currentStep);
    };

    document.querySelectorAll("form button[type='submit']").forEach((btn, index) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            changeStep(1);
        });
    });

    document.querySelectorAll("form button.btn-secondary").forEach((btn, index) => {
        btn.addEventListener("click", () => {
            changeStep(-1);
        });
    });
});
