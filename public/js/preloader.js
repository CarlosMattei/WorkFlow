document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    
    // Esconde o preloader quando a página estiver carregada
    window.addEventListener('load', function() {
        // Adiciona um atraso de 2 segundos
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500); // Aguarda a animação de fade out terminar
        }, 1500); // Delay de 2 segundos
    });
});