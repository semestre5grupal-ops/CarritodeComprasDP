// carousel.js - Lógica del carrusel de fondo del Hero
export function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const btnPrev = document.getElementById('btn-prev-slide');
    const btnNext = document.getElementById('btn-next-slide');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, 5000); // 5 segundos
    }

    function stopAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            nextSlide();
            startAutoPlay(); // Reiniciar el temporizador al interactuar
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            prevSlide();
            startAutoPlay();
        });
    }

    // Opcional: pausar si el usuario tiene el ratón encima o está interactuando
    const carouselContainer = document.getElementById('hero-carousel');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // Iniciar
    startAutoPlay();
}
