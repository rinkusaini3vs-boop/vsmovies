let swiper3D;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeaturedMovies();
    loadMarqueeText();
    loadSocialLinks();
    initPremiumCursor(); 
    initParallaxEffect(); // NEW PARALLAX FUNCTION
    initTiltEffect();
});

// --- 1. INTERACTIVE PARALLAX (Mouse & Gyroscope) ---
function initParallaxEffect() {
    const layer1 = document.querySelector('.layer-1');
    const layer2 = document.querySelector('.layer-2');
    const nebula = document.querySelector('.nebula-layer');

    // Mouse Move Effect
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        // Layers move at different speeds for 3D depth
        if(layer1) layer1.style.transform = `translate(${x}px, ${y}px)`;
        if(layer2) layer2.style.transform = `translate(${x * 2}px, ${y * 2}px)`;
        if(nebula) nebula.style.transform = `translate(calc(-50% + ${x * 0.5}px), calc(-50% + ${y * 0.5}px))`;
    });

    // Mobile Gyroscope Effect
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (event) => {
            const tiltX = event.gamma; // Left/Right tilt
            const tiltY = event.beta;  // Front/Back tilt
            
            if(Math.abs(tiltX) < 90 && Math.abs(tiltY) < 90) {
                const moveX = tiltX * 0.5;
                const moveY = (tiltY - 45) * 0.5;
                
                if(layer1) layer1.style.transform = `translate(${moveX}px, ${moveY}px)`;
                if(layer2) layer2.style.transform = `translate(${moveX * 1.5}px, ${moveY * 1.5}px)`;
            }
        }, true);
    }
}

// --- 2. PREMIUM CURSOR ---
function initPremiumCursor() {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        // Instant Dot
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        // Smooth Outline
        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });
    
    // Hover Effects
    document.querySelectorAll('a, button, .bento-card, .header-icon').forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.width = '60px';
            outline.style.height = '60px';
            outline.style.backgroundColor = 'rgba(255,255,255,0.1)';
            outline.style.borderColor = 'transparent';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.width = '40px';
            outline.style.height = '40px';
            outline.style.backgroundColor = 'transparent';
            outline.style.borderColor = 'rgba(255,255,255,0.5)';
        });
    });
}

// --- 3. SOCIAL ICONS (Remix Icons Injection) ---
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
                
                // Icon Mapping
                let iconClass = 'ri-link';
                if(name.includes('youtube')) iconClass = 'ri-youtube-fill';
                if(name.includes('insta')) iconClass = 'ri-instagram-fill';
                if(name.includes('tele')) iconClass = 'ri-telegram-fill';

                const btn = document.createElement('a');
                btn.href = link;
                btn.target = "_blank";
                btn.className = 'dock-icon';
                // Using Remix Icon class instead of Image
                btn.innerHTML = `<i class="${iconClass}"></i>`;
                container.appendChild(btn);
            }
        }
    } catch (err) {}
}

// --- OTHER FUNCTIONS (Slider, Search etc) ---
function loadFeaturedMovies() {
    const wrapper = document.getElementById('featured-wrapper');
    wrapper.innerHTML = '';
    const myVideos = ['slidevideo1.mp4', 'slidevideo2.mp4', 'slidevideo3.mp4', 'slidevideo4.mp4', 'slidevideo5.mp4', 'slidevideo6.mp4', 'slidevideo7.mp4', 'slidevideo8.mp4'];
    myVideos.forEach(videoFile => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<div class="movie-card-3d"><video class="card-bg-video" autoplay muted loop playsinline onerror="this.style.display='none'"><source src="${videoFile}" type="video/mp4"></video><div class="play-icon"><i class="ri-play-circle-fill"></i></div></div>`;
        wrapper.appendChild(slide);
    });
    init3DSwiper();
}

function init3DSwiper() {
    if(swiper3D) swiper3D.destroy(true, true);
    swiper3D = new Swiper(".my3DSwiper", {
        effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", initialSlide: 1,
        coverflowEffect: { rotate: 25, stretch: 0, depth: 150, modifier: 1, slideShadows: true },
        pagination: { el: ".swiper-pagination", clickable: true }
    });
}

function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15; // Increased tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            // Apply Transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            
            // Move Icon
            const icon = card.querySelector('.card-icon-wrapper');
            if(icon) icon.style.transform = `translateZ(50px)`;
        });
        card.addEventListener('mouseleave', () => { 
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
            const icon = card.querySelector('.card-icon-wrapper');
            if(icon) icon.style.transform = `translateZ(0)`;
        });
    });
}

// Utils
function toggleSearch() { document.getElementById('search-box').style.display = (document.getElementById('search-box').style.display === 'flex') ? 'none' : 'flex'; }
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