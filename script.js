// ============================
// 1. CONFIGURACIÓN DE THREE.JS
// ============================
let scene, camera, renderer, material, mesh;
let progress = 0;
let isComplete = false;
let poemIndex = 0;
let startTime = Date.now();

// Poemas y textos románticos
const poems = [
    { text: '🌷 "En el jardín de mi corazón, tú eres la flor más hermosa"', delay: 1 },
    { text: '🌸 "Cada latido es un poema que escribo pensando en ti"', delay: 3 },
    { text: '🌺 "Tu amor es la luz que ilumina mis días más oscuros"', delay: 5 },
    { text: '🌹 "Eres el sueño del que nunca quiero despertar"', delay: 7 },
    { text: '💖 "Contigo, cada momento es una obra de arte"', delay: 9 },
    { text: '✨ "Tu sonrisa es el sol que hace florecer mi alma"', delay: 11 },
    { text: '💝 "6 meses de magia, infinitos más por descubrir"', delay: 13 }
];

// ============================
// 2. INICIALIZAR THREE.JS
// ============================
function init() {
    const container = document.querySelector('.container');
    const canvas = document.getElementById('canvas');
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0a12);

    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Obtener el shader
    const fragmentShader = document.getElementById('fragmentShader').textContent;

    // Uniformes
    const uniforms = {
        u_ratio: { value: width / height },
        u_cursor: { value: new THREE.Vector2(0.5, 0.5) },
        u_stop_time: { value: 0.0 },
        u_clean: { value: 0.0 },
        u_stop_randomizer: { value: new THREE.Vector2(0.0, 0.0) },
        u_progress: { value: 0.0 }
    };

    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Event listeners
    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    document.getElementById('cleanBtn').addEventListener('click', cleanScreen);

    // Iniciar animación
    animate();

    // Iniciar textos
    setTimeout(() => {
        showNextPoem();
    }, 1000);
}

// ============================
// 3. ANIMACIÓN PRINCIPAL
// ============================
let lastTime = 0;

function animate(time = 0) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    // Actualizar tiempo
    const elapsed = (Date.now() - startTime) / 1000;
    material.uniforms.u_stop_time.value = elapsed * 0.3;

    // Actualizar progreso (solo si no está completo)
    if (!isComplete && progress < 1) {
        progress += delta * 0.045; // Velocidad de dibujo
        if (progress > 1) {
            progress = 1;
            isComplete = true;
            // Mostrar mensaje final después de un delay
            setTimeout(showFinalMessage, 1500);
        }
        material.uniforms.u_progress.value = progress;
        document.getElementById('progressFill').style.width = (progress * 100) + '%';
        document.getElementById('progressPercent').textContent = Math.round(progress * 100) + '%';
    }

    // Actualizar randomizer para efecto de parpadeo
    material.uniforms.u_stop_randomizer.value = new THREE.Vector2(
        Math.sin(elapsed * 0.7) * 0.5 + 0.5,
        Math.cos(elapsed * 0.5) * 0.5 + 0.5
    );

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// ============================
// 4. SISTEMA DE POEMAS
// ============================
let currentPoemTimeout = null;

function showNextPoem() {
    if (poemIndex >= poems.length || isComplete) return;

    const poem = poems[poemIndex];
    const poemText = document.getElementById('poemText');
    
    poemText.textContent = poem.text;
    poemText.classList.add('show');
    
    // Programar siguiente poema
    const nextDelay = poem.delay * 1000 + 2000;
    currentPoemTimeout = setTimeout(() => {
        poemText.classList.remove('show');
        poemIndex++;
        setTimeout(showNextPoem, 1000);
    }, nextDelay);
}

// ============================
// 5. MENSAJE FINAL Y CARRUSEL
// ============================
function showFinalMessage() {
    const section = document.getElementById('messageSection');
    section.classList.add('visible');
    
    // Iniciar carrusel
    initCarousel();
    
    // Corazones flotantes
    createFloatingHearts();
}

// ============================
// 6. CARRUSEL
// ============================
let currentSlide = 0;
let totalSlides = 0;
let carouselInterval = null;
let isDragging = false;
let startX = 0;

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;
    const dotsContainer = document.getElementById('dotsContainer');

    // Crear dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    // Botones
    document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentSlide - 1));
    document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentSlide + 1));

    // Touch / drag
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDragTouch);
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', dragTouch);
    track.addEventListener('mouseup', endDrag);
    track.addEventListener('touchend', endDrag);

    // Auto-play
    startAutoPlay();

    // Pausar auto-play al interactuar
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    track.addEventListener('touchstart', stopAutoPlay);
    track.addEventListener('touchend', startAutoPlay);

    updateCarousel();
}

function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function startAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 3500);
}

function stopAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Drag con mouse
function startDrag(e) { isDragging = true; startX = e.clientX; stopAutoPlay(); }
function drag(e) {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 30) {
        goToSlide(diff > 0 ? currentSlide - 1 : currentSlide + 1);
        isDragging = false;
    }
}
function endDrag() { isDragging = false; startAutoPlay(); }

function startDragTouch(e) { isDragging = true; startX = e.touches[0].clientX; stopAutoPlay(); }
function dragTouch(e) {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 30) {
        goToSlide(diff > 0 ? currentSlide - 1 : currentSlide + 1);
        isDragging = false;
    }
}

// ============================
// 7. CORAZONES FLOTANTES
// ============================
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const emojis = ['❤️', '💕', '💗', '💖', '💝', '💘'];
    
    setInterval(() => {
        if (!document.getElementById('messageSection').classList.contains('visible')) return;
        
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
        heart.style.animationDuration = (8 + Math.random() * 12) + 's';
        heart.style.animationDelay = (Math.random() * 3) + 's';
        
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 15000);
    }, 1000);
}

// ============================
// 8. EVENTOS DEL CANVAS
// ============================
function onMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    material.uniforms.u_cursor.value.set(x, y);
}

function onClick(event) {
    // Efecto de "polen" al hacer clic
    const rect = event.target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    
    // Crear un efecto visual con partículas (opcional)
}

function cleanScreen() {
    if (isComplete) {
        progress = 0;
        isComplete = false;
        startTime = Date.now();
        poemIndex = 0;
        document.getElementById('messageSection').classList.remove('visible');
        document.getElementById('poemText').classList.remove('show');
        
        if (currentPoemTimeout) {
            clearTimeout(currentPoemTimeout);
            currentPoemTimeout = null;
        }
        
        setTimeout(() => {
            showNextPoem();
        }, 1000);
    }
}

// ============================
// 9. REDIMENSIONAR
// ============================
function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    material.uniforms.u_ratio.value = width / height;
}

// ============================
// 10. INICIAR
// ============================
document.addEventListener('DOMContentLoaded', init);
