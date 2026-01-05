let swiper3D;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeaturedMovies();
    loadMarqueeText(); // TEXT FILE SE LOAD HOGA
    loadSocialLinks(); // TEXT FILE SE LOAD HOGA
    initDustCursor();
    initTiltEffect();
});

// --- RESTORED: MARQUEE TEXT (From marquee.txt) ---
async function loadMarqueeText() {
    try {
        const res = await fetch('marquee.txt');
        if(res.ok) {
            const text = await res.text();
            const el = document.getElementById('dynamic-marquee');
            if(el) el.innerHTML = `${text} • ${text} • ${text}`;
        }
    } catch (err) { console.log("Marquee Error"); }
}

// --- RESTORED: SOCIAL LINKS (From update link.txt) ---
async function loadSocialLinks() {
    try {
        const res = await fetch('update link.txt');
        if(res.ok) {
            const text = await res.text();
            const container = document.getElementById('dynamic-socials');
            if(!container) return;
            container.innerHTML = ''; // Clear old

            const regex = /@(.*?) \((.*?)\)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                const link = match[1].trim();
                const name = match[2].trim();
                
                // Icon Logic
                let iconUrl = 'https://cdn-icons-png.flaticon.com/512/1000/1000997.png';
                if(name.toLowerCase().includes('youtube')) iconUrl = 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
                if(name.toLowerCase().includes('insta')) iconUrl = 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png';
                if(name.toLowerCase().includes('tele')) iconUrl = 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png';

                // Creating Link with Correct Class
                const btn = document.createElement('a');
                btn.href = link;
                btn.target = "_blank";
                btn.className = 'dock-icon'; // YE CLASS SIZE CONTROL KAREGI
                btn.innerHTML = `<img src="${iconUrl}" alt="${name}">`;
                container.appendChild(btn);
            }
        }
    } catch (err) { console.log("Social Error"); }
}

// --- SLIDER VIDEO FILL FIX ---
function loadFeaturedMovies() {
    const wrapper = document.getElementById('featured-wrapper');
    wrapper.innerHTML = '';
    const myVideos = ['slidevideo1.mp4', 'slidevideo2.mp4', 'slidevideo3.mp4', 'slidevideo4.mp4', 'slidevideo5.mp4', 'slidevideo6.mp4', 'slidevideo7.mp4', 'slidevideo8.mp4'];
    myVideos.forEach(videoFile => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        // Object-fit cover CSS me handle hai
        slide.innerHTML = `<div class="movie-card-3d"><video class="card-bg-video" autoplay muted loop playsinline onerror="this.style.display='none'"><source src="${videoFile}" type="video/mp4"></video><div class="play-icon">▶</div></div>`;
        wrapper.appendChild(slide);
    });
    init3DSwiper();
}

// --- DUST CURSOR ---
function initDustCursor() {
    const canvas = document.getElementById('magic-cursor');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    const colors = ['#ffffff', '#00f7ff', '#bc13fe'];
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    window.addEventListener('mousemove', (e) => { for (let i = 0; i < 2; i++) particles.push(new Particle(e.clientX, e.clientY)); });
    class Particle {
        constructor(x, y) { this.x = x; this.y = y; this.size = Math.random() * 2 + 0.5; this.speedX = Math.random() - 0.5; this.speedY = Math.random() - 0.5; this.color = colors[Math.floor(Math.random() * colors.length)]; this.life = 80; this.opacity = 1; }
        update() { this.x += this.speedX; this.y += this.speedY; this.life--; this.opacity = this.life / 80; }
        draw() { ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    }
    function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); if (particles[i].life <= 0) { particles.splice(i, 1); i--; } } requestAnimationFrame(animate); }
    animate();
}

// --- TILT EFFECT ---
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const centerX = rect.width / 2; const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15; const rotateY = ((x - centerX) / centerX) * 15;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`; });
    });
}

// --- OTHER FUNCTIONS ---
let lastScrollY = window.scrollY;
const header = document.querySelector(".floating-header");
window.addEventListener("scroll", () => {
    if (header) {
        if (window.scrollY > lastScrollY && window.scrollY > 50) header.classList.add("header-hide");
        else header.classList.remove("header-hide");
        lastScrollY = window.scrollY;
    }
});
function init3DSwiper() { if(swiper3D) swiper3D.destroy(true, true); swiper3D = new Swiper(".my3DSwiper", { effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", initialSlide: 1, coverflowEffect: { rotate: 25, stretch: 0, depth: 150, modifier: 1, slideShadows: true } }); }
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