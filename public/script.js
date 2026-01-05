let swiper3D;

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedMovies();
    initPremiumCursor();
});

/* ================= FEATURED MOVIES ================= */
function loadFeaturedMovies() {
    const wrapper = document.getElementById('featured-wrapper');
    wrapper.innerHTML = '';

    const videos = [
        'slidevideo1.mp4',
        'slidevideo2.mp4',
        'slidevideo3.mp4',
        'slidevideo4.mp4'
    ];

    videos.forEach(video => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        slide.innerHTML = `
            <video class="card-bg-video" autoplay muted loop playsinline>
                <source src="${video}" type="video/mp4">
            </video>
            <div class="play-icon">
                <i data-lucide="play-circle" class="play-lucide"></i>
            </div>
        `;

        wrapper.appendChild(slide);
    });

    lucide.createIcons();
    init3DSwiper();
}

/* ================= SWIPER ================= */
function init3DSwiper() {
    if (swiper3D) swiper3D.destroy(true, true);

    swiper3D = new Swiper(".my3DSwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 30,
            stretch: 0,
            depth: 180,
            modifier: 1,
            slideShadows: true,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        }
    });
}

/* ================= PREMIUM CURSOR ================= */
function initPremiumCursor() {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    window.addEventListener("mousemove", e => {
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";

        outline.animate({
            left: e.clientX + "px",
            top: e.clientY + "px"
        }, { duration: 400, fill: "forwards" });
    });
}
