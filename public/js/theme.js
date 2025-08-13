function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateLogo(theme);
}

function updateLogo(theme) {
    const logoElements = document.querySelectorAll('.logo img');
    const logoElementsFooter = document.querySelectorAll('.logo-footer img');
    const logoElementsContainer = document.querySelectorAll('.logo-container img');

    logoElements.forEach(logo => {
        if (theme === 'light') {
            logo.src = '/assets/image/logo-roxo.svg';
        } else {
            logo.src = '/assets/image/logoWorkFlow-com-nome.svg';
        }
    });

    logoElementsFooter.forEach(logo => {
        if (theme === 'light') {
            logo.src = '/assets/image/logoWorkFlow-nome-cinza.svg';
        } else {
            logo.src = '/assets/image/logoWorkFlow-nome.svg';
        }
    });

    logoElementsContainer.forEach(logo => {
        if (theme === 'light') {
            logo.src = '/assets/image/logo-logo-roxo.svg';
        } else {
            logo.src = '/assets/image/logo.svg';
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateLogo(savedTheme);
}

// Carrega o tema assim que o arquivo for importado
loadTheme();