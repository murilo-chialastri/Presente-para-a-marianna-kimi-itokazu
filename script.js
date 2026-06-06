// ===== ESTADO GLOBAL =====
var currentSlide = 0;
var totalSlides   = 0;
var letterOpen    = false;
var isDragging    = false;
var dragStartX    = 0;
var dragCurrentX  = 0;
var dragStartTranslate = 0;

// Nomes aceitos no login (em minúsculas)
var VALID_NAMES = [
    'marianna kimi itokazu',
    'marianna kimi',
    'marianna'
];

// ===== LOGIN =====

function handleLogin() {
    var input    = document.getElementById('name-input');
    var errorMsg = document.getElementById('login-error');
    var value    = input.value.trim().toLowerCase();

    if (VALID_NAMES.indexOf(value) !== -1) {
        revealMainContent();
    } else {
        showLoginError(input, errorMsg);
    }
}

function revealMainContent() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-content').classList.remove('hidden');
    initApp();
}

function showLoginError(input, errorMsg) {
    errorMsg.classList.remove('hidden');
    input.value = '';
    input.classList.remove('shake');
    void input.offsetWidth; // reinicia a animação
    input.classList.add('shake');
    setTimeout(function() {
        input.classList.remove('shake');
    }, 500);
}

function handleLoginKeypress(event) {
    if (event.key === 'Enter') {
        handleLogin();
    }
}

// ===== TEMAS =====

function switchTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
}

function setupThemeSwitcher() {
    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            switchTheme(btn.getAttribute('data-theme'));
        });
    });
}

// ===== CARTA =====

function toggleLetter() {
    var letterContent = document.getElementById('letter-content');
    var letterBtn     = document.getElementById('letter-btn');
    letterOpen = !letterOpen;

    if (letterOpen) {
        letterContent.classList.remove('hidden');
        letterBtn.textContent = 'Fechar a carta 💌';
    } else {
        letterContent.classList.add('hidden');
        letterBtn.textContent = 'Clique para abrir 💌';
    }
}

function setupLetter() {
    document.getElementById('letter-btn').addEventListener('click', toggleLetter);
}

// ===== CARROSSEL =====

function getItemWidth() {
    return document.getElementById('carousel-wrapper').clientWidth;
}

function setCarouselItemWidths() {
    var width = getItemWidth();
    document.querySelectorAll('.carousel-item').forEach(function(item) {
        item.style.width = width + 'px';
    });
}

function buildCarouselDots() {
    var container = document.getElementById('carousel-dots');
    container.innerHTML = '';

    for (var i = 0; i < totalSlides; i++) {
        var dot = document.createElement('button');
        dot.className   = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Foto ' + (i + 1));
        dot.dataset.index = String(i);
        dot.addEventListener('click', function() {
            goToSlide(parseInt(this.dataset.index));
        });
        container.appendChild(dot);
    }
}

function updateDots() {
    document.querySelectorAll('.dot').forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    var carousel = document.getElementById('carousel');
    carousel.style.transform = 'translateX(-' + (currentSlide * getItemWidth()) + 'px)';
    updateDots();
}

function finalizeDrag(diffX) {
    var carousel = document.getElementById('carousel');
    carousel.classList.remove('is-dragging');
    carousel.style.transition = '';

    if (diffX > 55) {
        goToSlide(currentSlide + 1);
    } else if (diffX < -55) {
        goToSlide(currentSlide - 1);
    } else {
        goToSlide(currentSlide);
    }
}

function setupCarouselTouch() {
    var carousel = document.getElementById('carousel');

    carousel.addEventListener('touchstart', function(e) {
        dragStartX      = e.touches[0].clientX;
        dragCurrentX    = dragStartX;
        dragStartTranslate = currentSlide * getItemWidth();
        isDragging      = true;
    }, { passive: true });

    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        dragCurrentX = e.touches[0].clientX;
        var diffX = Math.abs(dragStartX - dragCurrentX);
        var diffY = Math.abs(e.touches[0].clientY - e.changedTouches[0].clientY);
        if (diffY > diffX && diffX < 10) return; // scroll vertical tem prioridade no início
        e.preventDefault();
        var offset = dragStartX - dragCurrentX;
        carousel.classList.add('is-dragging');
        carousel.style.transform = 'translateX(-' + (dragStartTranslate + offset) + 'px)';
    }, { passive: false });

    carousel.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        finalizeDrag(dragStartX - dragCurrentX);
    });

    carousel.addEventListener('touchcancel', function() {
        if (!isDragging) return;
        isDragging = false;
        goToSlide(currentSlide);
    });
}

function setupCarouselMouse() {
    var carousel = document.getElementById('carousel');

    carousel.addEventListener('mousedown', function(e) {
        dragStartX      = e.clientX;
        dragCurrentX    = e.clientX;
        dragStartTranslate = currentSlide * getItemWidth();
        isDragging      = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        dragCurrentX  = e.clientX;
        var offset    = dragStartX - dragCurrentX;
        var carousel  = document.getElementById('carousel');
        carousel.classList.add('is-dragging');
        carousel.style.transform = 'translateX(-' + (dragStartTranslate + offset) + 'px)';
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        finalizeDrag(dragStartX - dragCurrentX);
    });
}

function initCarousel() {
    var items  = document.querySelectorAll('.carousel-item');
    totalSlides   = items.length;
    currentSlide  = 0;

    setCarouselItemWidths();
    buildCarouselDots();
    setupCarouselTouch();
    setupCarouselMouse();

    window.addEventListener('resize', function() {
        setCarouselItemWidths();
        goToSlide(currentSlide);
    });
}

// ===== LINHA DO TEMPO =====

function initTimeline() {
    var items = document.querySelectorAll('.timeline-item');

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.20 });

    items.forEach(function(item) {
        observer.observe(item);
    });
}

// ===== INICIALIZAÇÃO =====

function initApp() {
    setupThemeSwitcher();
    setupLetter();
    initCarousel();
    initTimeline();
}

// ===== PONTO DE ENTRADA =====

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('name-input').addEventListener('keypress', handleLoginKeypress);
});
