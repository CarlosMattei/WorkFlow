function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateLogo(theme);
}

function updateLogo(theme) {
    const logoElements = document.querySelectorAll('.logo img');
    const logoElementsFooter = document.querySelectorAll('.logo-footer img');
    logoElements.forEach(logo => {
        if (theme === 'light') {
            logo.src = '/assets/image/logo-roxo.svg';
        } else {
            logo.src = '/assets/image/logoWorkFlow-nome.svg';
        }
    });

    logoElementsFooter.forEach(logo => {
        if (theme === 'light') {
            logo.src = '/assets/image/logoWorkFlow-nome-cinza.svg';
        } else {
            logo.src = '/assets/image/logoWorkFlow-nome.svg';
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateLogo(savedTheme);
}

// Carrega o tema assim que o arquivo for importado
loadTheme();