// ============================
// 1. PÉTALOS FLOTANTES
// ============================
function createPetals() {
    const container = document.getElementById('petals-container');
    const emojis = ['🌸', '🌺', '🌷', '🌹', '🌸', '🌼'];
    for (let i = 0; i < 28; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        petal.style.left = Math.random() * 100 + '%';
        petal.style.fontSize = (1 + Math.random() * 1.8) + 'rem';
        petal.style.animationDuration = (12 + Math.random() * 28) + 's';
        petal.style.animationDelay = (Math.random() * 20) + 's';
        container.appendChild(petal);
    }
}
createPetals();

// ============================
// 2. DIBUJO DE LIRIOS EN CANVAS
// ============================
const canvas = document.getElementById('lilyCanvas');
const ctx = canvas.getContext('2d');
const progressFill = document.getElementById('progressFill');

// Ajustar resolución del canvas
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    // Redibujar si ya hay algo
    if (window._lilyProgress !== undefined) {
        drawLilies(window._lilyProgress);
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Dibujar un lirio en posición (x, y) con tamaño y color
function drawLily(cx, cy, size, color1, color2, rotation = 0) {
    const petals = 6;
    const petalLength = size * 0.9;
    const petalWidth = size * 0.35;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * petalLength * 0.7;
        const y = Math.sin(angle) * petalLength * 0.7;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Pétalo con degradado
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, petalWidth);
        grad.addColorStop(0, color1);
        grad.addColorStop(0.7, color2);
        grad.addColorStop(1, 'rgba(200,100,120,0.2)');

        ctx.beginPath();
        ctx.ellipse(0, 0, petalWidth, petalLength * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowColor = 'rgba(150,60,80,0.15)';
        ctx.shadowBlur = 10;

        // Detalle de nervadura
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(180,80,100,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -petalLength * 0.3);
        ctx.quadraticCurveTo(petalWidth * 0.3, 0, 0, petalLength * 0.3);
        ctx.stroke();

        ctx.restore();
    }

    // Centro del lirio
    const gradCenter = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
    gradCenter.addColorStop(0, '#ffeb3b');
    gradCenter.addColorStop(0.5, '#f9a825');
    gradCenter.addColorStop(1, '#e65100');
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = gradCenter;
    ctx.fill();

    // Estambres
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = size * 0.2;
        const sx = Math.cos(a) * r;
        const sy = Math.sin(a) * r;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = '#bf8f3a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e6a53a';
        ctx.fill();
    }

    ctx.restore();
}

// Dibujar todos los lirios según el progreso (0 a 1)
function drawLilies(progress) {
    window._lilyProgress = progress;
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // Fondo suave
    const bgGrad = ctx.createRadialGradient(w * 0.4, h * 0.3, 0, w * 0.4, h * 0.3, w * 0.8);
    bgGrad.addColorStop(0, '#fce8e6');
    bgGrad.addColorStop(1, '#f5d6d0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Dibujar lirios según progreso
    // 3 lirios principales que aparecen gradualmente
    const lilies = [
        { x: w * 0.25, y: h * 0.6, size: 55, color1: '#f8bbd0', color2: '#f06292', rot: 0.2 },
        { x: w * 0.5, y: h * 0.45, size: 70, color1: '#f48fb1', color2: '#ec407a', rot: -0.3 },
        { x: w * 0.75, y: h * 0.65, size: 50, color1: '#fce4ec', color2: '#e91e63', rot: 0.5 },
        { x: w * 0.35, y: h * 0.3, size: 40, color1: '#f8bbd0', color2: '#d81b60', rot: 0.8 },
        { x: w * 0.65, y: h * 0.3, size: 38, color1: '#fce4ec', color2: '#f06292', rot: -0.6 },
    ];

    // Calcular cuántos lirios dibujar según progreso
    const totalLilies = lilies.length;
    const showCount = Math.min(totalLilies, Math.floor(progress * totalLilies) + 1);

    // Dibujar hojas verdes (solo si hay progreso)
    if (progress > 0.1) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (progress - 0.1) * 2);
        for (let i = 0; i < 6; i++) {
            const lx = w * (0.1 + i * 0.16);
            const ly = h * (0.7 + Math.sin(i * 1.2) * 0.08);
            ctx.beginPath();
            ctx.ellipse(lx, ly, 18, 8, i * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? '#66bb6a' : '#81c784';
            ctx.fill();
        }
        ctx.restore();
    }

    // Dibujar lirios
    for (let i = 0; i < showCount && i < lilies.length; i++) {
        const l = lilies[i];
        const alpha = Math.min(1, (progress - i / totalLilies) * 2);
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);
        drawLily(l.x, l.y, l.size, l.color1, l.color2, l.rot);
        ctx.restore();
    }

    // Brillo final
    if (progress > 0.9) {
        ctx.save();
        ctx.globalAlpha = (progress - 0.9) * 6;
        const gradGlow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.4);
        gradGlow.addColorStop(0, 'rgba(255,200,210,0.2)');
        gradGlow.addColorStop(1, 'rgba(255,200,210,0)');
        ctx.fillStyle = gradGlow;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

// ============================
// 3. ANIMACIÓN DE DIBUJO Y TRANSICIÓN
// ============================
let progress = 0;
const sectionLilies = document.getElementById('lilies-section');
const sectionMessage = document.getElementById('message-section');

function animateLilies() {
    if (progress < 1) {
        progress += 0.008;
        if (progress > 1) progress = 1;
        drawLilies(progress);
        progressFill.style.width = (progress * 100) + '%';
        requestAnimationFrame(animateLilies);
    } else {
        // Mostrar mensaje
        setTimeout(() => {
            sectionLilies.classList.add('hidden');
            sectionMessage.classList.remove('hidden');
            initCarousel();
        }, 600);
    }
}

// Iniciar animación después de un pequeño delay
setTimeout(animateLilies, 800);

// ============================
// 4. CARRUSEL
// ============================
let currentSlide = 0;
let totalSlides = 0;
let carouselInterval = null;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;

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

    // Actualizar dots
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
function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    stopAutoPlay();
}

function drag(e) {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 30) {
        if (diff > 0) {
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide + 1);
        }
        isDragging = false;
    }
}

function endDrag() {
    isDragging = false;
    startAutoPlay();
}

// Drag táctil
function startDragTouch(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    stopAutoPlay();
}

function dragTouch(e) {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    if (Math.abs(diff) > 30) {
        if (diff > 0) {
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide + 1);
        }
        isDragging = false;
    }
}

// ============================
// 5. EFECTO DE CORAZONES FLOTANTES AL FINAL
// ============================
// (Opcional) Añadir algunos corazones en la sección de mensaje
setInterval(() => {
    const msgSection = document.getElementById('message-section');
    if (!msgSection.classList.contains('hidden')) {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.cssText = `
                    position: fixed;
                    font-size: ${1 + Math.random() * 1.5}rem;
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    pointer-events: none;
                    z-index: 5;
                    animation: floatPetal ${8 + Math.random() * 12}s linear forwards;
                    opacity: 0.4;
                `;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 12000);
    }
}, 2000);
