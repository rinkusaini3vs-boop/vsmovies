let swiper3D;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeaturedMovies();
    loadSocialLinks();
    initSpotlightEffect(); // ACETERNITY SPOTLIGHT
});

// --- 1. ACETERNITY SPOTLIGHT EFFECT ---
function initSpotlightEffect() {
    // 1. Body Background Spotlight
    const bodySpotlight = document.querySelector('.spotlight-overlay');
    window.addEventListener('mousemove', (e) => {
        bodySpotlight.style.setProperty('--x', `${e.clientX}px`);
        bodySpotlight.style.setProperty('--y', `${e.clientY}px`);
        
        // Custom Cursor
        const dot = document.querySelector('.cursor-dot');
        if(dot) {
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
        }
    });

    // 2. Card Border Spotlight
    const cards = document.querySelectorAll('.bento-card');
    document.getElementById('card-container').onmousemove = e => {
        for(const card of cards) {
            const rect = card.getBoundingClientRect(),
                  x = e.clientX - rect.left,
                  y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        };
    }
}

// --- STANDARD FUNCTIONS ---
async function loadSocialLinks() {
    try {
        const res = await fetch('update link.txt');
        if(res.ok) {
            const text = await res.text();
            const container = document.getElementById('dynamic-socials');
            if(!container) return;
            container.innerHTML = ''; 
            const regex = /@(.*?) \((.*?)\)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const link = match[1].trim();
                const name = match[2].trim().toLowerCase();
                let iconClass = 'ri-link';
                if(name.includes('youtube')) iconClass = 'ri-youtube-fill';
                if(name.includes('insta')) iconClass = 'ri-instagram-line';
                if(name.includes('tele')) iconClass = 'ri-telegram-fill';

                const btn = document.createElement('a');
                btn.href = link; btn.target = "_blank"; btn.className = 'dock-icon';
                btn.innerHTML = `<i class="${iconClass}"></i>`;
                container.appendChild(btn);
            }
        }
    } catch (err) {}
}

function loadFeaturedMovies() {
    const wrapper = document.getElementById('featured-wrapper');
    wrapper.innerHTML = '';
    const myVideos = ['slidevideo1.mp4', 'slidevideo2.mp4', 'slidevideo3.mp4', 'slidevideo4.mp4', 'slidevideo5.mp4', 'slidevideo6.mp4', 'slidevideo7.mp4', 'slidevideo8.mp4'];
    myVideos.forEach(videoFile => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<div class="movie-card-3d"><video class="card-bg-video" autoplay muted loop playsinline onerror="this.style.display='none'"><source src="${videoFile}" type="video/mp4"></video></div>`;
        wrapper.appendChild(slide);
    });
    init3DSwiper();
}

function init3DSwiper() {
    if(swiper3D) swiper3D.destroy(true, true);
    swiper3D = new Swiper(".my3DSwiper", {
        effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", initialSlide: 1,
        coverflowEffect: { rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: false },
        autoplay: { delay: 3000 }
    });
}

function toggleSearch() { document.getElementById('search-box').style.display = (document.getElementById('search-box').style.display === 'block') ? 'none' : 'block'; }
function toggleAdminPanel() { document.getElementById('admin-panel').style.display = (document.getElementById('admin-panel').style.display === 'block') ? 'none' : 'block'; }
function checkAuth() { fetch('/api/auth/status').then(res => res.json()).then(data => { if (data.isAdmin) document.getElementById('admin-trigger').style.display = 'block'; }); }
function filterMovies() {
    const input = document.getElementById('movie-search').value.toLowerCase();
    const slides = document.querySelectorAll('.swiper-slide');
    if(input === "") { slides.forEach(slide => slide.style.display = 'block'); swiper3D.update(); return; }
    slides.forEach(slide => {
        const videoSrc = slide.querySelector('source').src.toLowerCase();
        slide.style.display = (videoSrc.includes(input)) ? 'block' : 'none';
    });
    swiper3D.update();
}
async function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const categorySelect = document.getElementById('category-select');
    const status = document.getElementById('upload-status');
    if (!fileInput.files[0] || !categorySelect.value) { alert("Select file!"); return; }
    const formData = new FormData();
    formData.append('videoFile', fileInput.files[0]);
    formData.append('category', categorySelect.value);
    status.innerText = "Uploading..."; 
    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) status.innerText = "Done!"; else status.innerText = "Error";
    } catch (err) { status.innerText = "Failed"; }
}