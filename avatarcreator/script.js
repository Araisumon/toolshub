// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Throttle utility
function throttle(func, limit) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= limit) {
            lastCall = now;
            func(...args);
        }
    };
}

// Avatar state
const avatarState = {
    gender: 'male',
    ethnicity: 'caucasian',
    eyeSize: 50,
    eyeColor: '#0000ff',
    expression: 'neutral',
    hairStyle: 'short',
    hairColor: '#000000',
    glasses: 'none',
    hat: 'none',
    clothing: 'tshirt',
    clothingColor: '#ffffff',
    facialHair: 'none',
    background: 'solid',
    bgColor: '#f5f7fa',
    customBg: null
};

// History for undo/redo
const history = [JSON.stringify(avatarState)];
let historyIndex = 0;
const maxHistory = 20;

// Header color palette
const headerColors = [
    '#4a6bff', // Blue
    '#2ecc71', // Green
    '#9b59b6', // Purple
    '#e67e22'  // Orange
];
let currentColorIndex = 0;

// Highlight state for avatar features
let highlightFeature = null;
let highlightTimeout = null;

// Animation state
let avatarAnimations = false;
let lastBlinkTime = 0;

// Last avatar state for optimization
let lastAvatarState = JSON.stringify(avatarState);

// Cached canvas context
let canvasCtx = null;

// Cached background image
let cachedBgImage = null;

// Translations
const translations = {
    en: {
        brand_name: 'Buzz',
        header_title: 'Custom Avatar Creator',
        home: 'Home',
        home_tooltip: 'Go to home page',
        color_cycle_tooltip: 'Change header color',
        language_toggle: 'EN',
        language_toggle_tooltip: 'Switch language',
        randomize: 'Randomize',
        randomize_tooltip: 'Randomize avatar features',
        reset: 'Reset',
        reset_tooltip: 'Reset to default avatar',
        undo: 'Undo',
        undo_tooltip: 'Undo last change',
        redo: 'Redo',
        redo_tooltip: 'Redo last change',
        save: 'Save',
        save_tooltip: 'Save your avatar',
        export_png: 'Export PNG',
        export_png_tooltip: 'Export avatar as PNG',
        share_x: 'Share on X',
        share_x_tooltip: 'Share your avatar on X',
        share_facebook: 'Share on FB',
        share_facebook_tooltip: 'Share your avatar on Facebook',
        animate_avatar: 'Animate',
        animate_avatar_tooltip: 'Toggle avatar animation',
        badges: 'Badges',
        badges_tooltip: 'View your earned badges',
        themes: 'Themes',
        superhero: 'Superhero',
        casual: 'Casual',
        base_features: 'Base Features',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        ethnicity: 'Ethnicity',
        caucasian: 'Caucasian',
        african: 'African',
        facial_features: 'Facial Features',
        eye_size: 'Eye Size',
        eye_color: 'Eye Color',
        expression: 'Expression',
        neutral: 'Neutral',
        happy: 'Happy',
        hair: 'Hair',
        hair_style: 'Hair Style',
        hair_color: 'Hair Color',
        short: 'Short',
        bald: 'Bald',
        accessories: 'Accessories',
        glasses: 'Glasses',
        hat: 'Hat',
        none: 'None',
        round: 'Round',
        square: 'Square',
        cap: 'Cap',
        beanie: 'Beanie',
        clothing: 'Clothing',
        shirt_style: 'Shirt Style',
        clothing_color: 'Clothing Color',
        tshirt: 'T-Shirt',
        jacket: 'Jacket',
        facial_hair: 'Facial Hair',
        stubble: 'Stubble',
        full: 'Full Beard',
        background: 'Background',
        background_type: 'Background Type',
        background_color: 'Background Color',
        upload_background: 'Upload Background',
        solid: 'Solid',
        custom: 'Custom',
        welcome_title: 'Welcome to Buzz Avatar Creator!',
        welcome_text: 'Design your unique avatar, animate it, share it, and earn badges!',
        badge_tracker_title: 'Your Badges',
        badge_progress: '{count}/9 Badges Earned',
        badge_first_save: 'First Avatar Saved!',
        badge_first_export: 'First Avatar Exported!',
        badge_custom_bg: 'Custom Background Used!',
        badge_randomizer: 'Randomizer Master!',
        badge_full_custom: 'Full Customization!',
        badge_accessories: 'Stylish Accessories!',
        badge_clothing: 'Fashion Forward!',
        badge_facial_hair: 'Beard Boss!',
        badge_theme: 'Theme Explorer!',
        instructions_slide_1: 'Customize Your Avatar',
        instructions_slide_1_text: 'Choose gender, hair, expressions, accessories, clothing, and themes to create a unique avatar!',
        instructions_slide_2: 'Save & Share',
        instructions_slide_2_text: 'Save your avatar or export it as a PNG to share on social media!',
        instructions_slide_3: 'Earn Badges',
        instructions_slide_3_text: 'Complete actions like saving or randomizing to earn badges!',
        prev: 'Previous',
        next: 'Next',
        dismiss: 'Dismiss',
        dismiss_tooltip: 'Hide instructions',
        save_success: 'Avatar saved successfully!',
        save_error: 'Failed to save avatar.',
        upload_invalid: 'Please upload a valid image.',
        upload_size: 'Image must be less than 2MB.',
        upload_error: 'Error uploading image.',
        export_success: 'Avatar exported successfully!',
        export_error: 'Failed to export avatar.'
    },
    es: {
        brand_name: 'Buzz',
        header_title: 'Creador de Avatares',
        home: 'Inicio',
        home_tooltip: 'Ir a la página principal',
        color_cycle_tooltip: 'Cambiar color del encabezado',
        language_toggle: 'ES',
        language_toggle_tooltip: 'Cambiar idioma',
        randomize: 'Aleatorizar',
        randomize_tooltip: 'Aleatorizar características del avatar',
        reset: 'Restablecer',
        reset_tooltip: 'Restablecer al avatar predeterminado',
        undo: 'Deshacer',
        undo_tooltip: 'Deshacer el último cambio',
        redo: 'Rehacer',
        redo_tooltip: 'Rehacer el último cambio',
        save: 'Guardar',
        save_tooltip: 'Guardar tu avatar',
        export_png: 'Exportar PNG',
        export_png_tooltip: 'Exportar avatar como PNG',
        share_x: 'Compartir en X',
        share_x_tooltip: 'Comparte tu avatar en X',
        share_facebook: 'Compartir en FB',
        share_facebook_tooltip: 'Comparte tu avatar en Facebook',
        animate_avatar: 'Animar',
        animate_avatar_tooltip: 'Activar/desactivar animación del avatar',
        badges: 'Insignias',
        badges_tooltip: 'Ver tus insignias ganadas',
        themes: 'Temas',
        superhero: 'Superhéroe',
        casual: 'Casual',
        base_features: 'Características Base',
        gender: 'Género',
        male: 'Masculino',
        female: 'Femenino',
        ethnicity: 'Etnia',
        caucasian: 'Caucásico',
        african: 'Africano',
        facial_features: 'Características Faciales',
        eye_size: 'Tamaño de Ojos',
        eye_color: 'Color de Ojos',
        expression: 'Expresión',
        neutral: 'Neutral',
        happy: 'Feliz',
        hair: 'Cabello',
        hair_style: 'Estilo de Cabello',
        hair_color: 'Color de Cabello',
        short: 'Corto',
        bald: 'Calvo',
        accessories: 'Accesorios',
        glasses: 'Gafas',
        hat: 'Sombrero',
        none: 'Ninguno',
        round: 'Redondas',
        square: 'Cuadradas',
        cap: 'Gorra',
        beanie: 'Gorro',
        clothing: 'Ropa',
        shirt_style: 'Estilo de Camisa',
        clothing_color: 'Color de Ropa',
        tshirt: 'Camiseta',
        jacket: 'Chaqueta',
        facial_hair: 'Vello Facial',
        stubble: 'Barba Corta',
        full: 'Barba Completa',
        background: 'Fondo',
        background_type: 'Tipo de Fondo',
        background_color: 'Color de Fondo',
        upload_background: 'Subir Fondo',
        solid: 'Sólido',
        custom: 'Personalizado',
        welcome_title: '¡Bienvenido al Creador de Avatares Buzz!',
        welcome_text: '¡Diseña tu avatar único, anímalo, compártelo y gana insignias!',
        badge_tracker_title: 'Tus Insignias',
        badge_progress: '{count}/9 Insignias Ganadas',
        badge_first_save: '¡Primer Avatar Guardado!',
        badge_first_export: '¡Primer Avatar Exportado!',
        badge_custom_bg: '¡Fondo Personalizado Usado!',
        badge_randomizer: '¡Maestro del Aleatorizador!',
        badge_full_custom: '¡Personalización Completa!',
        badge_accessories: '¡Accesorios Elegantes!',
        badge_clothing: '¡A la Moda!',
        badge_facial_hair: '¡Jefe de la Barba!',
        badge_theme: '¡Explorador de Temas!',
        instructions_slide_1: 'Personaliza Tu Avatar',
        instructions_slide_1_text: '¡Elige género, cabello, expresiones, accesorios, ropa y temas para crear un avatar único!',
        instructions_slide_2: 'Guarda y Comparte',
        instructions_slide_2_text: '¡Guarda tu avatar o expórtalo como PNG para compartir en redes sociales!',
        instructions_slide_3: 'Gana Insignias',
        instructions_slide_3_text: '¡Completa acciones como guardar o aleatorizar para ganar insignias!',
        prev: 'Anterior',
        next: 'Siguiente',
        dismiss: 'Cerrar',
        dismiss_tooltip: 'Ocultar instrucciones',
        save_success: '¡Avatar guardado con éxito!',
        save_error: 'No se pudo guardar el avatar.',
        upload_invalid: 'Por favor, sube una imagen válida.',
        upload_size: 'La imagen debe ser menor a 2MB.',
        upload_error: 'Error al subir la imagen.',
        export_success: '¡Avatar exportado con éxito!',
        export_error: 'No se pudo exportar el avatar.'
    }
};

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Header color cycle
const colorCycleBtn = document.getElementById('colorCycleBtn');
if (colorCycleBtn) {
    colorCycleBtn.addEventListener('click', () => {
        currentColorIndex = (currentColorIndex + 1) % headerColors.length;
        document.documentElement.style.setProperty('--primary-color', headerColors[currentColorIndex]);
        localStorage.setItem('headerColor', headerColors[currentColorIndex]);
    });
    const savedColor = localStorage.getItem('headerColor');
    if (savedColor && headerColors.includes(savedColor)) {
        currentColorIndex = headerColors.indexOf(savedColor);
        document.documentElement.style.setProperty('--primary-color', savedColor);
    }
}

// Language toggle
let currentLanguage = localStorage.getItem('language') || 'en';
const languageToggle = document.getElementById('languageToggle');

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        let text = translations[lang][key] || '';
        if (key === 'badge_progress') {
            const badgeCount = document.querySelectorAll('.badge-item.unlocked').length;
            text = text.replace('{count}', badgeCount);
        }
        el.textContent = text;
    });
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const key = el.dataset.tooltip;
        if (translations[lang][key]) {
            el.setAttribute('data-tooltip-content', translations[lang][key]);
        }
    });
    const animationToggleBtn = document.getElementById('animationToggleBtn');
    if (animationToggleBtn) {
        animationToggleBtn.innerHTML = `<i class="fas fa-${avatarAnimations ? 'pause' : 'play'}"></i> <span data-i18n="animate_avatar">${translations[lang].animate_avatar}</span>`;
    }
    if (languageToggle) {
        languageToggle.querySelector('span').textContent = lang.toUpperCase();
    }
    updateUIFromState();
    updateBadgeTracker();
}

if (languageToggle) {
    languageToggle.addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'es' : 'en'));
}

// Welcome message
const welcomeMessage = document.getElementById('welcomeMessage');
const dismissWelcome = document.getElementById('dismissWelcome');
if (dismissWelcome && welcomeMessage) {
    dismissWelcome.addEventListener('click', () => {
        welcomeMessage.style.display = 'none';
        localStorage.setItem('hideWelcome', 'true');
    });
    if (localStorage.getItem('hideWelcome') === 'true') {
        welcomeMessage.style.display = 'none';
    }
}

// Instructions carousel
const instructionsCarousel = document.getElementById('instructionsCarousel');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');
const carouselDots = document.querySelectorAll('.carousel-dot');
const carouselSlides = document.querySelectorAll('.carousel-slide');
let currentSlide = 0;
let carouselInterval = null;
let lastInteraction = Date.now();

function updateCarousel() {
    carouselSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    carouselDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startCarousel() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopCarousel();
    carouselInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastInteraction >= 10000) { // Restart after 10s inactivity
            currentSlide = (currentSlide + 1) % carouselSlides.length;
            updateCarousel();
        }
    }, 5000);
}

function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

if (prevSlideBtn && nextSlideBtn) {
    prevSlideBtn.addEventListener('click', () => {
        lastInteraction = Date.now();
        stopCarousel();
        currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
        updateCarousel();
        startCarousel();
    });
    nextSlideBtn.addEventListener('click', () => {
        lastInteraction = Date.now();
        stopCarousel();
        currentSlide = (currentSlide + 1) % carouselSlides.length;
        updateCarousel();
        startCarousel();
    });
}

carouselDots.forEach(dot => {
    dot.addEventListener('click', () => {
        lastInteraction = Date.now();
        stopCarousel();
        currentSlide = parseInt(dot.dataset.slide);
        updateCarousel();
        startCarousel();
    });
});

const dismissInstructions = document.getElementById('dismissInstructions');
if (dismissInstructions && instructionsCarousel) {
    dismissInstructions.addEventListener('click', () => {
        instructionsCarousel.style.display = 'none';
        stopCarousel();
        localStorage.setItem('hideInstructions', 'true');
        let viewCount = parseInt(sessionStorage.getItem('instructionViews') || '0') + 1;
        sessionStorage.setItem('instructionViews', viewCount.toString());
    });
    // Check localStorage and sessionStorage for visibility
    const viewCount = parseInt(sessionStorage.getItem('instructionViews') || '0');
    if (localStorage.getItem('hideInstructions') === 'true' || viewCount >= 3) {
        instructionsCarousel.style.display = 'none';
    } else {
        startCarousel();
        // Accessibility for carousel controls
        if (prevSlideBtn) {
            prevSlideBtn.setAttribute('aria-label', translations[currentLanguage].prev);
        }
        if (nextSlideBtn) {
            nextSlideBtn.setAttribute('aria-label', translations[currentLanguage].next);
        }
        carouselDots.forEach((dot, index) => {
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        });
        if (dismissInstructions) {
            dismissInstructions.setAttribute('aria-label', translations[currentLanguage].dismiss_tooltip);
        }
    }
}

// Badge tracker
const badgesBtn = document.getElementById('badgesBtn');
const badgeTracker = document.getElementById('badgeTracker');
const closeBadgeTracker = document.getElementById('closeBadgeTracker');

function updateBadgeTracker() {
    const badgeItems = document.querySelectorAll('.badge-item');
    let earnedCount = 0;
    badgeItems.forEach(item => {
        const badgeKey = item.dataset.badge;
        const isUnlocked = localStorage.getItem(`badge_${badgeKey}`) === 'true';
        item.classList.toggle('unlocked', isUnlocked);
        if (isUnlocked) earnedCount++;
    });
    const badgeProgress = document.getElementById('badgeProgress');
    if (badgeProgress) {
        badgeProgress.textContent = translations[currentLanguage].badge_progress.replace('{count}', earnedCount);
    }
}

if (badgesBtn && badgeTracker && closeBadgeTracker) {
    badgesBtn.addEventListener('click', () => {
        updateBadgeTracker();
        badgeTracker.style.display = 'block';
    });
    closeBadgeTracker.addEventListener('click', () => {
        badgeTracker.style.display = 'none';
    });
}

// Sparkle animation
function createSparkle() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sparkleContainer = document.querySelector('.sparkle-container');
    if (!sparkleContainer) return;

    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    const size = Math.random() * 4 + 4;
    const x = Math.random() * 280 + 10;
    const y = Math.random() * 280 + 10;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
    sparkleContainer.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
}

const triggerSparkles = throttle((count = 5) => {
    for (let i = 0; i < count; i++) {
        setTimeout(createSparkle, i * 100);
    }
}, 1000);

// Initial sparkles on load
setTimeout(() => triggerSparkles(3), 1000);
setInterval(() => triggerSparkles(2), 3000);

// Badges
function awardBadge(badgeKey) {
    if (localStorage.getItem(`badge_${badgeKey}`)) return;
    localStorage.setItem(`badge_${badgeKey}`, 'true');
    updateBadgeTracker();
}

// History management
function saveState() {
    history.splice(historyIndex + 1);
    history.push(JSON.stringify(avatarState, null, 2));
    historyIndex++;
    if (history.length > maxHistory) {
        history.shift();
        historyIndex--;
    }
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        Object.assign(avatarState, JSON.parse(history[historyIndex]));
        highlightFeature = null;
        updateUIFromState();
        updateAvatar();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        Object.assign(avatarState, JSON.parse(history[historyIndex]));
        highlightFeature = null;
        updateUIFromState();
        updateAvatar();
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn && redoBtn) {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
    }
}

// Theme presets
function applyTheme(theme) {
    const themes = {
        superhero: {
            gender: 'male',
            ethnicity: 'caucasian',
            eyeSize: 60,
            eyeColor: '#0000ff',
            expression: 'happy',
            hairStyle: 'short',
            hairColor: '#000000',
            glasses: 'square',
            hat: 'cap',
            clothing: 'jacket',
            clothingColor: '#ff0000',
            facialHair: 'stubble',
            background: 'solid',
            bgColor: '#4a6bff',
            customBg: null
        },
        casual: {
            gender: 'female',
            ethnicity: 'african',
            eyeSize: 50,
            eyeColor: '#8b4513',
            expression: 'neutral',
            hairStyle: 'short',
            hairColor: '#a67c52',
            glasses: 'none',
            hat: 'beanie',
            clothing: 'tshirt',
            clothingColor: '#ffffff',
            facialHair: 'none',
            background: 'solid',
            bgColor: '#f5f7fa',
            customBg: null
        }
    };

    if (!themes[theme]) {
        console.error(`Invalid theme: ${theme}`);
        return;
    }

    Object.assign(avatarState, themes[theme]);
    highlightFeature = null;
    saveState();
    updateUIFromState();
    updateAvatar();
    awardBadge('badge_theme');
}

// Event listeners
document.addEventListener('click', (e) => {
    const item = e.target.closest('.option-item');
    if (item) {
        const category = item.dataset.category;
        const value = item.dataset.value;
        if (category && value) {
            item.parentNode.querySelectorAll('.option-item').forEach(s => s.classList.remove('active', 'ripple'));
            item.classList.add('active', 'ripple');
            setTimeout(() => item.classList.remove('ripple'), 500);
            if (category === 'theme') {
                applyTheme(value);
            } else {
                avatarState[category] = value;
                if (category === 'gender' && value === 'female') {
                    avatarState.facialHair = 'none';
                }
                highlightFeature = category === 'hairStyle' || category === 'hairColor' ? 'hair' :
                                 category === 'eyeSize' || category === 'expression' || category === 'eyeColor' ? 'eyes' :
                                 category === 'glasses' || category === 'hat' ? 'accessories' :
                                 category === 'clothing' || category === 'clothingColor' ? 'clothing' :
                                 category === 'facialHair' ? 'facialHair' : null;
                saveState();
                updateUIFromState();
                updateAvatar();
                toggleBackgroundSections();
                if (category === 'glasses' && value !== 'none' || category === 'hat' && value !== 'none') {
                    awardBadge('badge_accessories');
                }
                if (category === 'clothing' || category === 'clothingColor') {
                    awardBadge('badge_clothing');
                }
                if (category === 'facialHair' && value !== 'none') {
                    awardBadge('badge_facial_hair');
                }
                if (Object.keys(avatarState).every(key => avatarState[key] !== initialAvatarState[key])) {
                    awardBadge('badge_full_custom');
                }
            }
        }
    }

    const color = e.target.closest('.color-option');
    if (color) {
        const category = color.dataset.category;
        const value = color.dataset.value;
        if (category && value) {
            color.parentNode.querySelectorAll('.color-option').forEach(s => s.classList.remove('active', 'ripple'));
            color.classList.add('active', 'ripple');
            setTimeout(() => color.classList.remove('ripple'), 500);
            avatarState[category] = value;
            highlightFeature = category === 'hairColor' ? 'hair' :
                             category === 'eyeColor' ? 'eyes' :
                             category === 'clothingColor' ? 'clothing' : null;
            saveState();
            updateAvatar();
            if (category === 'clothingColor') {
                awardBadge('badge_clothing');
            }
            if (Object.keys(avatarState).every(key => avatarState[key] !== initialAvatarState[key])) {
                awardBadge('badge_full_custom');
            }
        }
    }
});

// Keyboard support for option items
document.addEventListener('keydown', (e) => {
    const item = e.target.closest('.option-item, .color-option, .carousel-dot');
    if (item && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        item.click();
    }
});

// Slider
const eyeSizeSlider = document.getElementById('eyeSizeSlider');
const eyeSizeValue = document.getElementById('eyeSizeValue');
if (eyeSizeSlider && eyeSizeValue) {
    eyeSizeSlider.addEventListener('input', debounce(() => {
        avatarState.eyeSize = parseInt(eyeSizeSlider.value);
        eyeSizeValue.textContent = `${avatarState.eyeSize}%`;
        highlightFeature = 'eyes';
        saveState();
        updateAvatar();
        if (Object.keys(avatarState).every(key => avatarState[key] !== initialAvatarState[key])) {
            awardBadge('badge_full_custom');
        }
    }, 50));
}

// Initial avatar state for full customization badge
const initialAvatarState = JSON.parse(JSON.stringify(avatarState));

// Buttons
const randomizeBtn = document.getElementById('randomizeBtn');
if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
        avatarState.gender = ['male', 'female'][Math.floor(Math.random() * 2)];
        avatarState.ethnicity = ['caucasian', 'african'][Math.floor(Math.random() * 2)];
        avatarState.eyeSize = Math.floor(Math.random() * 61) + 20;
        avatarState.eyeColor = ['#0000ff', '#8b4513', '#008000'][Math.floor(Math.random() * 3)];
        avatarState.expression = ['neutral', 'happy'][Math.floor(Math.random() * 2)];
        avatarState.hairStyle = ['short', 'bald'][Math.floor(Math.random() * 2)];
        avatarState.hairColor = ['#000000', '#a67c52'][Math.floor(Math.random() * 2)];
        avatarState.glasses = ['none', 'round', 'square'][Math.floor(Math.random() * 3)];
        avatarState.hat = ['none', 'cap', 'beanie'][Math.floor(Math.random() * 3)];
        avatarState.clothing = ['tshirt', 'jacket'][Math.floor(Math.random() * 2)];
        avatarState.clothingColor = ['#ffffff', '#ff0000', '#000000'][Math.floor(Math.random() * 3)];
        avatarState.facialHair = avatarState.gender === 'male' ? ['none', 'stubble', 'full'][Math.floor(Math.random() * 3)] : 'none';
        avatarState.background = ['solid', 'custom'][Math.floor(Math.random() * 2)];
        avatarState.bgColor = ['#f5f7fa', '#4a6bff'][Math.floor(Math.random() * 2)];
        avatarState.customBg = null;
        highlightFeature = null;
        saveState();
        updateUIFromState();
        updateAvatar();
        awardBadge('badge_randomizer');
    });
}

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        Object.assign(avatarState, {
            gender: 'male',
            ethnicity: 'caucasian',
            eyeSize: 50,
            eyeColor: '#0000ff',
            expression: 'neutral',
            hairStyle: 'short',
            hairColor: '#000000',
            glasses: 'none',
            hat: 'none',
            clothing: 'tshirt',
            clothingColor: '#ffffff',
            facialHair: 'none',
            background: 'solid',
            bgColor: '#f5f7fa',
            customBg: null
        });
        highlightFeature = null;
        saveState();
        updateUIFromState();
        updateAvatar();
    });
}

const undoBtn = document.getElementById('undoBtn');
if (undoBtn) undoBtn.addEventListener('click', undo);

const redoBtn = document.getElementById('redoBtn');
if (redoBtn) redoBtn.addEventListener('click', redo);

const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        try {
            saveBtn.classList.add('saving');
            setTimeout(() => {
                localStorage.setItem('savedAvatar', JSON.stringify(avatarState));
                saveBtn.classList.remove('saving');
                alert(translations[currentLanguage].save_success);
                awardBadge('badge_first_save');
            }, 1000);
        } catch (error) {
            console.error('Save error:', error);
            saveBtn.classList.remove('saving');
            alert(translations[currentLanguage].save_error);
        }
    });
}

const exportPng = document.getElementById('exportPng');
if (exportPng) {
    exportPng.addEventListener('click', () => {
        showLoading();
        setTimeout(() => {
            try {
                const canvas = document.getElementById('avatarCanvas');
                if (!canvas) throw new Error('Canvas not found');
                const link = document.createElement('a');
                link.download = 'avatar.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                hideLoading();
                alert(translations[currentLanguage].export_success);
                awardBadge('badge_first_export');
            } catch (error) {
                console.error('Export error:', error);
                hideLoading();
                alert(translations[currentLanguage].export_error);
            }
        }, 500);
    });
}

const shareXBtn = document.getElementById('shareXBtn');
if (shareXBtn) {
    shareXBtn.addEventListener('click', () => {
        const text = encodeURIComponent('Check out my Buzz avatar! Create yours at https://example.com/avatar-creator');
        const url = `https://x.com/intent/tweet?text=${text}&url=https://example.com/avatar-creator`;
        window.open(url, '_blank');
    });
}

const shareFacebookBtn = document.getElementById('shareFacebookBtn');
if (shareFacebookBtn) {
    shareFacebookBtn.addEventListener('click', () => {
        const url = encodeURIComponent('https://example.com/avatar-creator');
        const quote = encodeURIComponent('Check out my Buzz avatar! Create yours now!');
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
        window.open(fbUrl, '_blank');
    });
}

const animationToggleBtn = document.getElementById('animationToggleBtn');
if (animationToggleBtn) {
    animationToggleBtn.addEventListener('click', () => {
        avatarAnimations = !avatarAnimations;
        animationToggleBtn.innerHTML = `<i class="fas fa-${avatarAnimations ? 'pause' : 'play'}"></i> <span data-i18n="animate_avatar">${translations[currentLanguage].animate_avatar}</span>`;
        if (avatarAnimations) {
            lastBlinkTime = Date.now();
            requestAnimationFrame(blinkAvatar);
        }
    });
}

const customBgUpload = document.getElementById('customBgUpload');
if (customBgUpload) {
    customBgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert(translations[currentLanguage].upload_invalid);
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert(translations[currentLanguage].upload_size);
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarState.customBg = event.target.result;
            cachedBgImage = null;
            saveState();
            updateAvatar();
            awardBadge('badge_custom_bg');
        };
        reader.onerror = () => alert(translations[currentLanguage].upload_error);
        reader.readAsDataURL(file);
    });
}

// UI updates
function updateUIFromState() {
    document.querySelectorAll('.option-item').forEach(item => {
        const category = item.dataset.category;
        const value = item.dataset.value;
        if (category && value) {
            item.classList.toggle('active', avatarState[category] === value);
            if (category === 'facialHair' && avatarState.gender === 'female') {
                item.classList.add('disabled');
                item.setAttribute('aria-disabled', 'true');
                item.tabIndex = -1;
            } else {
                item.classList.remove('disabled');
                item.removeAttribute('aria-disabled');
                item.tabIndex = 0;
            }
        }
    });

    document.querySelectorAll('.color-option').forEach(item => {
        const category = item.dataset.category;
        const value = item.dataset.value;
        if (category && value) {
            item.classList.toggle('active', avatarState[category] === value);
            const colorName = {
                '#0000ff': 'Blue',
                '#8b4513': 'Brown',
                '#008000': 'Green',
                '#000000': 'Black',
                '#a67c52': 'Brown',
                '#ffffff': 'White',
                '#ff0000': 'Red',
                '#f5f7fa': 'Light Gray',
                '#4a6bff': 'Blue'
            }[value] || 'Unknown';
            const categoryName = {
                eyeColor: 'eye color',
                hairColor: 'hair color',
                clothingColor: 'clothing color',
                bgColor: 'background color'
            }[category] || category;
            item.setAttribute('aria-label', `${colorName} ${categoryName}`);
        }
    });

    if (eyeSizeSlider && eyeSizeValue) {
        eyeSizeSlider.value = avatarState.eyeSize;
        eyeSizeValue.textContent = `${avatarState.eyeSize}%`;
    }

    toggleBackgroundSections();
}

function toggleBackgroundSections() {
    const bgColorSection = document.getElementById('bgColorSection');
    const customBgSection = document.getElementById('customBgSection');
    if (bgColorSection && customBgSection) {
        bgColorSection.style.display = avatarState.background === 'solid' ? 'block' : 'none';
        customBgSection.style.display = avatarState.background === 'custom' ? 'block' : 'none';
    }
}

// Loading spinner
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'block';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}

// Highlight management
function clearHighlightAfter(ms) {
    if (highlightTimeout) clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
        highlightFeature = null;
        updateAvatar();
    }, ms);
}

// Canvas rendering
function updateAvatar() {
    const currentState = JSON.stringify(avatarState);
    if (currentState === lastAvatarState && !avatarAnimations) return;
    lastAvatarState = currentState;

    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return;

    canvas.classList.add('pulse');
    setTimeout(() => canvas.classList.remove('pulse'), 500);
    triggerSparkles(3);

    canvasCtx = canvasCtx || canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (avatarState.background === 'custom' && avatarState.customBg) {
        if (cachedBgImage) {
            canvasCtx.drawImage(cachedBgImage, 0, 0, canvas.width, canvas.height);
            drawAvatar(canvasCtx);
        } else {
            const img = new Image();
            img.src = avatarState.customBg;
            img.onload = () => {
                cachedBgImage = img;
                canvasCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                drawAvatar(canvasCtx);
            };
            img.onerror = () => {
                canvasCtx.fillStyle = avatarState.bgColor;
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                drawAvatar(canvasCtx);
            };
        }
    } else {
        canvasCtx.fillStyle = avatarState.bgColor;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        drawAvatar(canvasCtx);
    }
}

function drawAvatar(ctx, isBlinking = false) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const skinTones = {
        caucasian: '#f4d4bc',
        african: '#8d5524'
    };

    if (highlightFeature === 'clothing') {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(w / 2 - 80, h / 2 + 50, 160, 100);
        ctx.stroke();
        clearHighlightAfter(1000);
    }
    ctx.fillStyle = avatarState.clothingColor;
    ctx.beginPath();
    if (avatarState.clothing === 'tshirt') {
        ctx.rect(w / 2 - 80, h / 2 + 50, 160, 80);
        ctx.fill();
        ctx.fillRect(w / 2 - 100, h / 2 + 50, 20, 40);
        ctx.fillRect(w / 2 + 80, h / 2 + 50, 20, 40);
    } else if (avatarState.clothing === 'jacket') {
        ctx.rect(w / 2 - 80, h / 2 + 50, 160, 100);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 40, h / 2 + 50);
        ctx.lineTo(w / 2, h / 2 + 30);
        ctx.lineTo(w / 2 + 40, h / 2 + 50);
        ctx.fill();
    }

    ctx.fillStyle = skinTones[avatarState.ethnicity] || '#f4d4bc';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 80, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    if (avatarState.gender === 'male' && avatarState.facialHair !== 'none') {
        if (highlightFeature === 'facialHair') {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(w / 2 - 50, h / 2 + 20, 100, 50);
            ctx.stroke();
            clearHighlightAfter(1000);
        }
        ctx.fillStyle = avatarState.hairColor;
        ctx.beginPath();
        if (avatarState.facialHair === 'stubble') {
            ctx.fillRect(w / 2 - 40, h / 2 + 30, 80, 20);
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else if (avatarState.facialHair === 'full') {
            ctx.fillRect(w / 2 - 50, h / 2 + 20, 100, 50);
        }
    }

    const eyeSize = avatarState.eyeSize / 4;
    if (highlightFeature === 'eyes') {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2 - 40, h / 2 - 20, eyeSize + 2, 0, Math.PI * 2);
        ctx.arc(w / 2 + 40, h / 2 - 20, eyeSize + 2, 0, Math.PI * 2);
        ctx.stroke();
        clearHighlightAfter(1000);
    }

    if (isBlinking && avatarAnimations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ctx.fillStyle = skinTones[avatarState.ethnicity] || '#f4d4bc';
        ctx.beginPath();
        ctx.ellipse(w / 2 - 40, h / 2 - 20, eyeSize, eyeSize / 4, 0, 0, Math.PI * 2);
        ctx.ellipse(w / 2 + 40, h / 2 - 20, eyeSize, eyeSize / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(w / 2 - 40, h / 2 - 20, eyeSize, eyeSize, 0, 0, Math.PI * 2);
        ctx.ellipse(w / 2 + 40, h / 2 - 20, eyeSize, eyeSize, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = avatarState.eyeColor;
        ctx.beginPath();
        ctx.arc(w / 2 - 40, h / 2 - 20, eyeSize / 2, 0, Math.PI * 2);
        ctx.arc(w / 2 + 40, h / 2 - 20, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = avatarState.hairColor;
    ctx.beginPath();
    const eyebrowY = h / 2 - 40;
    ctx.rect(w / 2 - 50, eyebrowY, 20, 5);
    ctx.rect(w / 2 + 30, eyebrowY, 20, 5);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (avatarState.expression === 'happy') {
        ctx.arc(w / 2, h / 2 + 30, 30, 0, Math.PI);
    } else {
        ctx.moveTo(w / 2 - 30, h / 2 + 20);
        ctx.lineTo(w / 2 + 30, h / 2 + 20);
    }
    ctx.stroke();

    if (avatarState.hat !== 'none') {
        if (highlightFeature === 'accessories') {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2 - 60, 85, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();
            clearHighlightAfter(1000);
        }
        ctx.fillStyle = avatarState.hat === 'cap' ? '#0000ff' : '#ff0000';
        ctx.beginPath();
        if (avatarState.hat === 'cap') {
            ctx.arc(w / 2, h / 2 - 60, 80, Math.PI * 0.2, Math.PI * 0.8);
            ctx.fill();
            ctx.fillRect(w / 2 - 40, h / 2 - 80, 80, 20);
        } else if (avatarState.hat === 'beanie') {
            ctx.arc(w / 2, h / 2 - 60, 80, Math.PI * 0.2, Math.PI * 0.8);
            ctx.fill();
            ctx.fillRect(w / 2 - 20, h / 2 - 100, 40, 20);
        }
    }

    if (avatarState.hairStyle !== 'bald') {
        if (highlightFeature === 'hair') {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2 - 60, 85, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();
            clearHighlightAfter(1000);
        }
        ctx.fillStyle = avatarState.hairColor;
        ctx.beginPath();
        if (avatarState.hairStyle === 'short') {
            ctx.arc(w / 2, h / 2 - 60, 80, Math.PI * 0.2, Math.PI * 0.8);
            ctx.fill();
        }
    }

    if (avatarState.glasses !== 'none') {
        if (highlightFeature === 'accessories') {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(w / 2 - 50, h / 2 - 30, 100, 20);
            ctx.stroke();
            clearHighlightAfter(1000);
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (avatarState.glasses === 'round') {
            ctx.arc(w / 2 - 40, h / 2 - 20, 15, 0, Math.PI * 2);
            ctx.arc(w / 2 + 40, h / 2 - 20, 15, 0, Math.PI * 2);
        } else if (avatarState.glasses === 'square') {
            ctx.rect(w / 2 - 55, h / 2 - 35, 30, 30);
            ctx.rect(w / 2 + 25, h / 2 - 35, 30, 30);
        }
        ctx.moveTo(w / 2 - 25, h / 2 - 20);
        ctx.lineTo(w / 2 + 25, h / 2 - 20);
        ctx.stroke();
    }

    if (avatarState.gender === 'female') {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(w / 2 - 80, h / 2 + 20, 5, 0, Math.PI * 2);
        ctx.arc(w / 2 + 80, h / 2 + 20, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function blinkAvatar(timestamp) {
    if (!avatarAnimations || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elapsed = timestamp - lastBlinkTime;
    const blinkInterval = Math.random() * 2000 + 3000;
    let isBlinking = false;

    if (elapsed > blinkInterval) {
        isBlinking = true;
        setTimeout(() => {
            lastBlinkTime = timestamp;
            isBlinking = false;
            updateAvatar();
        }, 200);
    }

    if (isBlinking) {
        const canvas = document.getElementById('avatarCanvas');
        if (canvas && canvasCtx) {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            if (avatarState.background === 'custom' && avatarState.customBg) {
                if (cachedBgImage) {
                    canvasCtx.drawImage(cachedBgImage, 0, 0, canvas.width, canvas.height);
                    drawAvatar(canvasCtx, isBlinking);
                } else {
                    const img = new Image();
                    img.src = avatarState.customBg;
                    img.onload = () => {
                        cachedBgImage = img;
                        canvasCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        drawAvatar(canvasCtx, isBlinking);
                    };
                    img.onerror = () => {
                        canvasCtx.fillStyle = avatarState.bgColor;
                        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                        drawAvatar(canvasCtx, isBlinking);
                    };
                }
            } else {
                canvasCtx.fillStyle = avatarState.bgColor;
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                drawAvatar(canvasCtx, isBlinking);
            }
        }
    }

    if (avatarAnimations) {
        requestAnimationFrame(blinkAvatar);
    }
}

function init() {
    const savedAvatar = localStorage.getItem('savedAvatar');
    if (savedAvatar) {
        try {
            Object.assign(avatarState, JSON.parse(savedAvatar));
            history[0] = JSON.stringify(avatarState);
        } catch (error) {
            console.error('Failed to load saved avatar:', error);
        }
    }

    setLanguage(currentLanguage);
    updateUIFromState();
    updateAvatar();
    updateBadgeTracker();
}

init();