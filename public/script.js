let scene, camera, renderer, objects = [];
let mouseX = 0, mouseY = 0;
let swiper3D;

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    checkAuth();
    loadFeaturedMovies();
    loadShowcase(); // ✅ FIXED TEXT LOADING
    loadMarqueeText();
    loadSocialLinks();
    initMagneticButtons();
    initCustomCursor();
    initScrollZoom();

    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 1000);
    }, 2000);
});

// ✅ LOAD SHOWCASE (Fix: Loading Real Text)
async function loadShowcase() {
    const container = document.getElementById('showcase-container');
    const colors = ['#00f7ff', '#ff0055', '#bc13fe', '#00ff00']; // Neon Colors
    
    // 4 Files Load
    for(let i=1; i<=4; i++) {
        try {
            // 1. Fetch Text File (image/1.txt)
            const txtRes = await fetch(`image/${i}.txt`);
            let desc = "Loading description...";
            if(txtRes.ok) desc = await txtRes.text(); // असली टेक्स्ट
            
            const imgSrc = `image/image${i}.jpg`; // असली इमेज
            const color = colors[i-1];

            const row = document.createElement('div');
            row.className = `showcase-row ${i % 2 === 0 ? 'reverse' : ''}`;
            row.style.setProperty('--neon-color', color);
            
            row.innerHTML = `
                <div class="showcase-img-box">
                    <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/300x450'">
                </div>
                <div class="showcase-text">
                    <h2 style="color:${color}">FEATURE ${i}</h2>
                    <p>${desc}</p>
                </div>
            `;
            container.appendChild(row);

        } catch(e) { console.log('Error loading item', i); }
    }

    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.showcase-row').forEach(row => observer.observe(row));
}

// 3D Background Logic
function initThreeJS() {
    const container = document.getElementById('threejs-canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.002);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x222222); scene.add(ambientLight);
    const blueLight = new THREE.PointLight(0x00f7ff, 2, 100); blueLight.position.set(30, 30, 30); scene.add(blueLight);
    const pinkLight = new THREE.PointLight(0xff0055, 2, 100); pinkLight.position.set(-30, -30, 20); scene.add(pinkLight);

    const materialGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.1, transmission: 0.2, clearcoat: 1.0 });

    const diamond = new THREE.Mesh(new THREE.IcosahedronGeometry(8, 0), materialGlass); diamond.position.set(0, 5, -10); scene.add(diamond); objects.push(diamond);
    const pyramid = new THREE.Mesh(new THREE.TetrahedronGeometry(6, 0), materialGlass); pyramid.position.set(-30, 15, -20); scene.add(pyramid); objects.push(pyramid);
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(5, 1.5, 100, 16), materialGlass); torus.position.set(30, -10, -15); scene.add(torus); objects.push(torus);

    for(let i=0; i<40; i++) {
        const geo = Math.random() > 0.5 ? new THREE.OctahedronGeometry(1) : new THREE.SphereGeometry(0.5, 16, 16);
        const mesh = new THREE.Mesh(geo, materialGlass);
        mesh.position.set((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*80);
        scene.add(mesh); objects.push(mesh);
    }

    document.addEventListener('mousemove', (e) => { mouseX = (e.clientX - window.innerWidth / 2) / 100; mouseY = (e.clientY - window.innerHeight / 2) / 100; });
    window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    objects.forEach((obj, i) => { obj.rotation.x += 0.003; obj.rotation.y += 0.004; obj.position.y += Math.sin(Date.now() * 0.001 + i) * 0.04; });
    renderer.render(scene, camera);
}

function initScrollZoom() {
    const hero = document.getElementById('hero-section');
    window.addEventListener('scroll', () => {
        let scroll = window.scrollY;
        if(scroll < 400) {
            hero.style.transform = `scale(${1 - scroll/1000})`;
            hero.style.filter = `blur(${scroll/20}px)`;
            hero.style.opacity = `${1 - scroll/500}`;
        }
    });
}

function loadFeaturedMovies() {
    const wrapper = document.getElementById('featured-wrapper');
    const myVideos = ['slidevideo1.mp4', 'slidevideo2.mp4', 'slidevideo3.mp4', 'slidevideo4.mp4', 'slidevideo5.mp4', 'slidevideo6.mp4', 'slidevideo7.mp4', 'slidevideo8.mp4'];
    myVideos.forEach((videoFile) => {
        const slide = document.createElement('div'); slide.className = 'swiper-slide';
        slide.innerHTML = `<div class="movie-card-3d"><video class="card-bg-video" autoplay muted loop playsinline><source src="${videoFile}" type="video/mp4"></video></div>`;
        wrapper.appendChild(slide);
    });
    if(swiper3D) swiper3D.destroy(true, true);
    swiper3D = new Swiper(".my3DSwiper", { effect: "coverflow", grabCursor: true, centeredSlides: true, slidesPerView: "auto", initialSlide: 1, coverflowEffect: { rotate: 25, stretch: 0, depth: 100, modifier: 1, slideShadows: true } });
}

// Standard Utils
function initMagneticButtons() { document.querySelectorAll('.magnetic-btn, .magnetic-card').forEach(btn => { btn.addEventListener('mousemove', (e) => { const rect = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - rect.left - rect.width/2)*0.3}px, ${(e.clientY - rect.top - rect.height/2)*0.3}px)`; }); btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; }); }); }
function initCustomCursor() { const dot = document.querySelector('.cursor-dot'), outline = document.querySelector('.cursor-outline'); window.addEventListener("mousemove", (e) => { dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`; outline.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" }); }); }
document.addEventListener('mouseover', (e) => { const card = e.target.closest('.magnetic-card'); if(card) { const v = card.querySelector('video'); if(v) v.play(); } });
document.addEventListener('mouseout', (e) => { const card = e.target.closest('.magnetic-card'); if(card) { const v = card.querySelector('video'); if(v) { v.pause(); v.currentTime = 0; } } });
async function loadSocialLinks() { try { const res = await fetch('update link.txt'); if(res.ok) { const text = await res.text(); const container = document.getElementById('dynamic-socials'); if(!container) return; container.innerHTML = ''; const regex = /@(.*?) \((.*?)\)/g; let match; while ((match = regex.exec(text)) !== null) { const btn = document.createElement('a'); btn.href = match[1].trim(); btn.target = "_blank"; btn.className = 'dock-icon'; let icon = 'ri-link'; if(match[2].toLowerCase().includes('youtube')) icon = 'ri-youtube-fill'; if(match[2].toLowerCase().includes('insta')) icon = 'ri-instagram-line'; if(match[2].toLowerCase().includes('tele')) icon = 'ri-telegram-fill'; btn.innerHTML = `<i class="${icon}"></i>`; container.appendChild(btn); } } } catch (err) {} }
async function loadMarqueeText() { try { const res = await fetch('marquee.txt'); if(res.ok) { const text = await res.text(); const el = document.getElementById('dynamic-marquee'); if(el) el.innerHTML = `${text} • ${text} • ${text}`; } } catch (err) {} }
function toggleSearch() { document.getElementById('search-box').style.display = (document.getElementById('search-box').style.display === 'block') ? 'none' : 'block'; }
function toggleAdminPanel() { document.getElementById('admin-panel').style.display = (document.getElementById('admin-panel').style.display === 'block') ? 'none' : 'block'; }
function checkAuth() { fetch('/api/auth/status').then(res => res.json()).then(data => { if (data.isAdmin) document.getElementById('admin-trigger').style.display = 'block'; }); }
function filterMovies() { const input = document.getElementById('movie-search').value.toLowerCase(); const slides = document.querySelectorAll('.swiper-slide'); if(input === "") { slides.forEach(slide => slide.style.display = 'block'); swiper3D.update(); return; } slides.forEach(slide => { const videoSrc = slide.querySelector('source').src.toLowerCase(); slide.style.display = (videoSrc.includes(input)) ? 'block' : 'none'; }); swiper3D.update(); }
async function uploadFile() { const fileInput = document.getElementById('file-input'); const categorySelect = document.getElementById('category-select'); const status = document.getElementById('upload-status'); if (!fileInput.files[0] || !categorySelect.value) { alert("Select file!"); return; } const formData = new FormData(); formData.append('videoFile', fileInput.files[0]); formData.append('category', categorySelect.value); status.innerText = "Uploading..."; try { const res = await fetch('/api/upload', { method: 'POST', body: formData }); if (res.ok) status.innerText = "Done!"; else status.innerText = "Error"; } catch (err) { status.innerText = "Failed"; } }