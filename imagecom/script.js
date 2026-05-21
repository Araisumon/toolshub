// ============================================================
// Buzz Image Compressor — script.js
// Features: dimension resize, WebP output, memory-safe URLs,
//           real per-file progress, before/after comparison slider,
//           target file size mode (binary search), SVG optimization,
//           bulk ZIP download, smart presets, zoom & pan,
//           mobile-friendly toast notifications
// ============================================================

// ── Toast Notification System (mobile-friendly) ─────────────
function initToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

const toastContainer = initToastContainer();

function showToast(message, type) {
    const t = type || 'info';
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + t;

    let icon = 'info';
    if (t === 'success') icon = 'check_circle';
    else if (t === 'error') icon = 'error';
    else if (t === 'warning') icon = 'warning';

    toast.innerHTML = '<i class="material-icons toast-icon">' + icon + '</i><span>' + message + '</span>';
    toastContainer.appendChild(toast);

    // Auto-remove after animation completes
    setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3100);
}

// ── DOM Elements ────────────────────────────────────────────
const themeToggle   = document.getElementById('themeToggle');
const themeIcon     = document.getElementById('themeIcon');
const body          = document.body;
const backToTop     = document.getElementById('backToTop');
const dropArea      = document.getElementById('dropArea');
const fileInput     = document.getElementById('fileInput');
const fileInputBtn  = document.getElementById('fileInputBtn');
const resetBtn      = document.getElementById('resetBtn');
const historyBtn    = document.getElementById('historyBtn');

const compressionLevel = document.getElementById('compressionLevel');
const resizeWidth      = document.getElementById('resizeWidth');
const resizeHeight     = document.getElementById('resizeHeight');
const aspectLockBtn    = document.getElementById('aspectLockBtn');
const outputFormat     = document.getElementById('outputFormat');
const qualityPreview   = document.getElementById('qualityPreview');
const svgOptimize      = document.getElementById('svgOptimize');
const downloadZipBtn   = document.getElementById('downloadZipBtn');

// Compression mode elements
const compressionModeRadios = document.getElementsByName('compressionMode');
const qualityGroup    = document.getElementById('qualityGroup');
const targetSizeGroup = document.getElementById('targetSizeGroup');
const targetSizeKB    = document.getElementById('targetSizeKB');

const progressContainer = document.getElementById('progressContainer');
const progressBar       = document.getElementById('progressBar');
const progressText      = document.getElementById('progressText');
const progressDetail    = document.getElementById('progressDetail');
const outputSection     = document.getElementById('outputSection');
const imageContainer    = document.getElementById('imageContainer');
const thumbnailStrip    = document.getElementById('thumbnailStrip');
const thumbnailList     = document.getElementById('thumbnailList');

const totalImagesEl   = document.getElementById('totalImages');
const totalSizeSavedEl = document.getElementById('totalSizeSaved');

// ── State ───────────────────────────────────────────────────
const objectURLs = [];          // Track all blob URLs for cleanup
let compressionStats = JSON.parse(localStorage.getItem('compressionStats')) || { totalImages: 0, totalSizeSaved: 0 };
let compressionHistory = JSON.parse(localStorage.getItem('compressionHistory')) || [];
let compressedResults = [];     // Store { blob, name, mime } for ZIP download
let processedFileNames = new Set(); // Track unique files per session to avoid stats double-count on live preview

// ── Utility: Object URL tracking ────────────────────────────
function trackURL(url) {
    objectURLs.push(url);
    return url;
}

function revokeAllURLs() {
    objectURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e) {} });
    objectURLs.length = 0;
}

// ── Utility: Format file size ───────────────────────────────
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ── Utility: Debounce ───────────────────────────────────────
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ── Utility: Check if image file ────────────────────────────
function isImageFile(file) {
    const accepted = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp', 'image/avif'];
    return file && accepted.includes(file.type);
}

// ── Utility: Get current compression mode ───────────────────
function getCompressionMode() {
    for (const radio of compressionModeRadios) {
        if (radio.checked) return radio.value;
    }
    return 'quality';
}

// ── Theme Toggle ────────────────────────────────────────────
(function initTheme() {
    const saved = localStorage.getItem('theme');

    // Determine initial theme: manual override > system preference > light
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
            body.classList.add('dark-mode');
            themeToggle.setAttribute('aria-pressed', 'true');
            themeIcon.textContent = 'dark_mode';
        } else {
            document.documentElement.classList.remove('dark-mode');
            body.classList.remove('dark-mode');
            themeToggle.setAttribute('aria-pressed', 'false');
            themeIcon.textContent = 'light_mode';
        }
    }

    if (saved !== null) {
        // Manual override exists
        applyTheme(saved === 'dark-mode');
    } else {
        // No manual override — follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
        // Listen for system preference changes only when user hasn't manually chosen
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === null) {
                applyTheme(e.matches);
            }
        });
    }

    themeToggle.addEventListener('click', () => {
        const isDark = !body.classList.contains('dark-mode');
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light');
    });
})();

// ── Back to Top ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Drag & Drop (Desktop) ───────────────────────────────────
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
});

// ── Touch-based upload guidance for mobile ──────────────────
(function initMobileDrop() {
    if (!('ontouchstart' in window)) return;
    var shown = false;
    dropArea.addEventListener('touchstart', function () {
        if (!shown) {
            showToast('Tap "Select from Computer" to pick images', 'info');
            shown = true;
        }
    }, { passive: true });
})();

// ── File Input Button ───────────────────────────────────────
fileInputBtn.addEventListener('click', () => fileInput.click());

// ── Image Resize: Width × Height with Aspect-Ratio Lock ──────
let aspectRatioLocked = true;
let lastNaturalWidth = null;
let lastNaturalHeight = null;

// Track original image dimensions for aspect-ratio calculation
function captureNaturalDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            lastNaturalWidth = img.naturalWidth;
            lastNaturalHeight = img.naturalHeight;
            URL.revokeObjectURL(img.src);
            resolve({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.onerror = () => resolve({ w: null, h: null });
        img.src = URL.createObjectURL(file);
    });
}

resizeWidth.addEventListener('input', () => {
    if (!aspectRatioLocked || !lastNaturalWidth || !lastNaturalHeight) return;
    const w = parseInt(resizeWidth.value, 10);
    if (!w || w <= 0) {
        resizeHeight.value = '';
        return;
    }
    const ratio = lastNaturalHeight / lastNaturalWidth;
    resizeHeight.value = Math.round(w * ratio);
});

resizeHeight.addEventListener('input', () => {
    if (!aspectRatioLocked || !lastNaturalWidth || !lastNaturalHeight) return;
    const h = parseInt(resizeHeight.value, 10);
    if (!h || h <= 0) {
        resizeWidth.value = '';
        return;
    }
    const ratio = lastNaturalWidth / lastNaturalHeight;
    resizeWidth.value = Math.round(h * ratio);
});

aspectLockBtn.addEventListener('click', () => {
    aspectRatioLocked = !aspectRatioLocked;
    aspectLockBtn.setAttribute('aria-pressed', aspectRatioLocked.toString());
    if (aspectRatioLocked) {
        aspectLockBtn.innerHTML = '<i class="material-icons">link</i>';
        aspectLockBtn.setAttribute('data-tooltip', 'Aspect ratio locked — changing one dimension auto-adjusts the other');
    } else {
        aspectLockBtn.innerHTML = '<i class="material-icons">link_off</i>';
        aspectLockBtn.setAttribute('data-tooltip', 'Aspect ratio unlocked — set width and height independently');
    }
});

// ── Live Stats Counter ───────────────────────────────────────
const liveTotalImagesEl  = document.getElementById('liveTotalImages');
const liveTotalSavedEl   = document.getElementById('liveTotalSaved');
const liveSessionCountEl = document.getElementById('liveSessionCount');
let sessionCompressCount = 0;

function updateLiveStats() {
    if (liveTotalImagesEl) liveTotalImagesEl.textContent = compressionStats.totalImages.toLocaleString();
    if (liveTotalSavedEl) liveTotalSavedEl.textContent = formatFileSize(compressionStats.totalSizeSaved * 1024);
    if (liveSessionCountEl) liveSessionCountEl.textContent = sessionCompressCount;
}
updateLiveStats();

// ── Compression Mode Toggle ─────────────────────────────────
compressionModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'quality') {
            qualityGroup.classList.remove('hidden');
            targetSizeGroup.classList.add('hidden');
        } else {
            qualityGroup.classList.add('hidden');
            targetSizeGroup.classList.remove('hidden');
        }
        // Re-process if live preview is on
        if (qualityPreview.checked && fileInput.files.length > 0) {
            processFiles(fileInput.files);
        }
    });
});

// ── Smart Preset Buttons ────────────────────────────────────
const presetBtns = document.querySelectorAll('.preset-btn');
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Highlight active preset
        presetBtns.forEach(b => b.classList.remove('preset-active'));
        btn.classList.add('preset-active');

        const preset = btn.getAttribute('data-preset');
        switch (preset) {
            case 'best':
                compressionLevel.value = 90;
                break;
            case 'balanced':
                compressionLevel.value = 50;
                break;
            case 'smallest':
                compressionLevel.value = 10;
                break;
            case 'auto':
                // Auto-detect: analyze first file's format and determine a smart quality
                if (fileInput.files.length > 0) {
                    const firstFile = fileInput.files[0];
                    if (firstFile.type === 'image/png' || firstFile.type === 'image/svg+xml') {
                        compressionLevel.value = 70; // lossless-like, moderate compression
                    } else if (firstFile.type === 'image/webp') {
                        compressionLevel.value = 60;
                    } else if (firstFile.type === 'image/gif') {
                        compressionLevel.value = 50;
                    } else {
                        compressionLevel.value = 65; // JPEG default
                    }
                    if (outputFormat.value === 'original') {
                        // Recommend WebP for auto mode
                        outputFormat.value = 'image/webp';
                    }
                } else {
                    compressionLevel.value = 65;
                }
                break;
        }

        // If live preview is on or files are already loaded, re-process
        if (fileInput.files.length > 0) {
            processFiles(fileInput.files);
        }
    });
});

// ── Manual slider change → clear preset highlight ───────────
compressionLevel.addEventListener('input', () => {
    presetBtns.forEach(b => b.classList.remove('preset-active'));
});

// ── Share Buttons ───────────────────────────────────────────
(function initShare() {
    const shareUrl = window.location.href;
    const shareMsg = 'Check out Buzz - a free tool to compress images online!';
    document.getElementById('shareTwitter').href   = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}&url=${encodeURIComponent(shareUrl)}`;
    document.getElementById('shareFacebook').href  = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    document.getElementById('shareLinkedIn').href  = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareMsg)}`;
    document.getElementById('shareWhatsApp').href  = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg + ' ' + shareUrl)}`;
    document.getElementById('shareEmail').href     = `mailto:?subject=${encodeURIComponent('Buzz Image Compressor')}&body=${encodeURIComponent(shareMsg + ' ' + shareUrl)}`;
})();

// ── Stats Display ───────────────────────────────────────────
function updateStatsDisplay() {
    totalImagesEl.textContent = compressionStats.totalImages;
    totalSizeSavedEl.textContent = formatFileSize(compressionStats.totalSizeSaved * 1024); // stored as KB
    updateLiveStats();
}
updateStatsDisplay();

// ── Reset ───────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
    revokeAllURLs();
    clearThumbnails();
    currentFileList = null;
    processedFileNames = new Set();
    fileInput.value = '';
    compressionLevel.value = 50;
    resizeWidth.value = '';
    resizeHeight.value = '';
    lastNaturalWidth = null;
    lastNaturalHeight = null;
    outputFormat.value = 'original';
    qualityPreview.checked = false;
    svgOptimize.checked = false;
    targetSizeKB.value = 100;
    // Reset mode to quality
    compressionModeRadios[0].checked = true;
    qualityGroup.classList.remove('hidden');
    targetSizeGroup.classList.add('hidden');
    // Clear preset active state
    presetBtns.forEach(b => b.classList.remove('preset-active'));
    // Clear results
    compressedResults = [];
    downloadZipBtn.disabled = true;
    progressContainer.style.display = 'none';
    outputSection.style.display = 'none';
    imageContainer.innerHTML = '';
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    progressText.textContent = 'Compressing images...';
    progressDetail.textContent = '';
});

// ── SVG Optimization (inline, no external library needed) ───
function optimizeSVG(svgText) {
    // Remove comments
    svgText = svgText.replace(/<!--[\s\S]*?-->/g, '');
    // Remove XML declarations and doctypes
    svgText = svgText.replace(/<\?xml[^>]*\?>/gi, '');
    svgText = svgText.replace(/<!DOCTYPE[^>]*>/gi, '');
    // Remove metadata, title, desc tags (but keep content inside)
    svgText = svgText.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    svgText = svgText.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
    svgText = svgText.replace(/<desc[^>]*>[\s\S]*?<\/desc>/gi, '');
    // Remove editor/namespace attributes
    svgText = svgText.replace(/\s*(xmlns:[\w]+=["'][^"']*["'])/gi, '');
    svgText = svgText.replace(/\s*(sodipodi:[^=]+=["'][^"']*["'])/gi, '');
    svgText = svgText.replace(/\s*(inkscape:[^=]+=["'][^"']*["'])/gi, '');
    svgText = svgText.replace(/\s*(xml:space=["'][^"']*["'])/gi, '');
    // Collapse whitespace between tags
    svgText = svgText.replace(/>\s+</g, '><');
    // Trim leading/trailing whitespace
    svgText = svgText.trim();
    return svgText;
}

// ── Safe base64 encoding that avoids call stack overflow ────
function stringToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const CHUNK = 0x8000; // 32768 bytes per chunk — safe for String.fromCharCode
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

// ── Convert Blob to AVIF via Canvas ─────────────────────────
function convertBlobToAvif(sourceBlob, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(sourceBlob);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((avifBlob) => {
                if (avifBlob) {
                    resolve(avifBlob);
                } else {
                    // AVIF encoding not supported — fallback to WebP
                    canvas.toBlob((webpBlob) => {
                        if (webpBlob) {
                            resolve(webpBlob);
                        } else {
                            reject(new Error('AVIF and WebP encoding not supported'));
                        }
                    }, 'image/webp', quality);
                }
            }, 'image/avif', quality);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for AVIF conversion'));
        };
        img.src = url;
    });
}

// ── Build Compressor Options ────────────────────────────────
function buildCompressorOptions(file, qualityOverride) {
    const quality = qualityOverride !== undefined ? qualityOverride : (1 - (compressionLevel.value / 100));
    const w = parseInt(resizeWidth.value, 10) || undefined;
    const h = parseInt(resizeHeight.value, 10) || undefined;
    const fmt = outputFormat.value;

    const opts = {
        quality: quality,
        strict: true,                    // Ensure output is always smaller
    };

    // If either width or height is set, configure resize
    if (w || h) {
        opts.maxWidth = w;
        opts.maxHeight = h;
        opts.resize = 'contain';         // Fit within specified dimensions
    }

    // AVIF is not directly supported by Compressor.js — use original type
    // and post-convert via canvas. Set a flag so compressFile() knows to convert.
    if (fmt === 'image/avif') {
        opts.mimeType = file.type;
        opts._needsAvifPost = true;
    } else if (fmt === 'original') {
        opts.mimeType = file.type;
    } else if (fmt !== file.type) {
        opts.mimeType = fmt;
        opts.convertTypes = [file.type];
        opts.convertSize = 0;
    } else {
        opts.mimeType = fmt;
    }

    return opts;
}

// ── Binary Search: Find quality for target file size ────────
function findQualityForTarget(file, targetBytes, maxIterations, progressCallback) {
    return new Promise((resolve) => {
        // Early exit: file already smaller than or equal to target
        if (file.size <= targetBytes) {
            resolve({ quality: 0.95, size: file.size, skipped: true });
            return;
        }

        let lo = 0.01;
        let hi = 1.0;
        let bestQuality = 0.5;
        let bestSize = Infinity;
        let iterations = 0;
        const maxIter = maxIterations || 12;

        // Smart initial guess based on target-to-original ratio
        // Ratio < 0.3 → start lower (more compression needed)
        // Ratio > 0.7 → start higher (less compression needed)
        const ratio = targetBytes / file.size;
        const initialQ = Math.max(0.01, Math.min(1.0, ratio * 1.2));

        function tryQuality(q) {
            iterations++;
            if (progressCallback) {
                progressCallback(iterations, maxIter, q);
            }

            const opts = buildCompressorOptions(file, q);
            new Compressor(file, {
                ...opts,
                success(result) {
                    const size = result.size;

                    if (Math.abs(size - targetBytes) < Math.abs(bestSize - targetBytes)) {
                        bestSize = size;
                        bestQuality = q;
                    }

                    // Converged: within 2% relative error OR within 1 KB absolute error
                    const relError = Math.abs(size - targetBytes) / targetBytes;
                    const absError = Math.abs(size - targetBytes);
                    if (iterations >= maxIter || relError < 0.02 || absError < 1024) {
                        resolve({ quality: bestQuality, size: bestSize });
                    } else {
                        if (size > targetBytes) {
                            hi = q;
                        } else {
                            lo = q;
                        }
                        const nextQ = (lo + hi) / 2;
                        tryQuality(nextQ);
                    }
                },
                error(err) {
                    console.error('Binary search compression error:', err);
                    if (bestSize === Infinity) {
                        // No successful compression at all — fall back
                        resolve({ quality: 0.5, size: file.size, failed: true });
                    } else {
                        resolve({ quality: bestQuality, size: bestSize });
                    }
                },
            });
        }

        tryQuality(initialQ);
    });
}

// ── Create Comparison Slider DOM ────────────────────────────
function createComparisonBox(file, index) {
    const originalSizeKB = file.size / 1024;
    const originalURL = trackURL(URL.createObjectURL(file));

    const box = document.createElement('div');
    box.className = 'comparison-box';

    box.innerHTML = `
        <div class="comparison-header">
            <h3>Image ${index + 1}: ${file.name}</h3>
            <span class="comparison-badge">Original: ${originalSizeKB.toFixed(1)} KB</span>
        </div>
        <div class="comparison-slider-wrapper">
            <div class="zoom-controls">
                <button class="zoom-btn" data-action="zoom-in" data-tooltip="Zoom In" aria-label="Zoom in"><i class="material-icons">zoom_in</i></button>
                <button class="zoom-btn" data-action="zoom-out" data-tooltip="Zoom Out" aria-label="Zoom out"><i class="material-icons">zoom_out</i></button>
                <button class="zoom-btn" data-action="zoom-reset" data-tooltip="Reset Zoom" aria-label="Reset zoom"><i class="material-icons">zoom_out_map</i></button>
                <span class="zoom-level-display">100%</span>
            </div>
            <div class="zoom-pan-container">
                <img-comparison-slider class="comparison-slider" hover="hover" value="50" aria-label="Before and after comparison">
                    <img slot="first" src="${originalURL}" alt="Original image" class="comparison-img">
                    <img slot="second" src="" alt="Compressed image" class="comparison-img compressed-comparison-img">
                </img-comparison-slider>
            </div>
        </div>
        <div class="comparison-info">
            <div class="compression-result">
                <span class="result-label">Compressed:</span>
                <span class="compressed-size">Processing...</span>
            </div>
            <div class="compression-result">
                <span class="result-label">Saved:</span>
                <span class="saved-amount" style="display:none;">-</span>
                <span class="saved-percent" style="display:none;"></span>
            </div>
            <button class="download-btn single-dl-btn" data-tooltip="Download this compressed image" aria-label="Download compressed image" disabled>
                <i class="material-icons" style="vertical-align: middle; margin-right: 5px;">download</i>
                Download
            </button>
        </div>
    `;

    // ── Zoom & Pan Logic ───────────────────────────────────────
    setupZoomPan(box);

    return { box, originalSizeKB, originalURL };
}

// ── Zoom & Pan Setup ─────────────────────────────────────────
// Uses scoped listeners: mousemove/mouseup added on mousedown and removed on mouseup = zero leak
function setupZoomPan(box) {
    const panContainer = box.querySelector('.zoom-pan-container');
    const zoomBtns = box.querySelectorAll('.zoom-btn');
    const zoomLevelDisplay = box.querySelector('.zoom-level-display');

    let scale = 1;
    let panX = 0, panY = 0;
    let isPanning = false;
    let startX = 0, startY = 0;

    function updateTransform() {
        panContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        panContainer.style.transformOrigin = 'center center';
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = Math.round(scale * 100) + '%';
        }
    }

    zoomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action === 'zoom-in') {
                scale = Math.min(scale * 1.25, 5);
            } else if (action === 'zoom-out') {
                scale = Math.max(scale / 1.25, 0.25);
            } else if (action === 'zoom-reset') {
                scale = 1;
                panX = 0;
                panY = 0;
            }
            updateTransform();
        });
    });

    // Wheel zoom
    panContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(scale * delta, 0.25), 5);
        updateTransform();
    }, { passive: false });

    // Drag pan (mouse) — window listeners added on-demand, removed on release
    panContainer.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        panContainer.style.cursor = 'grabbing';

        function onMouseMove(ev) {
            if (!isPanning) return;
            panX = ev.clientX - startX;
            panY = ev.clientY - startY;
            updateTransform();
        }
        function onMouseUp() {
            isPanning = false;
            panContainer.style.cursor = scale > 1 ? 'grab' : 'default';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    // Touch pan for mobile
    let touchStartDist = 0;
    let lastTouchScale = scale;
    let lastTouchPanX = panX, lastTouchPanY = panY;

    panContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && scale > 1) {
            isPanning = true;
            startX = e.touches[0].clientX - panX;
            startY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
            isPanning = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDist = Math.hypot(dx, dy);
            lastTouchScale = scale;
            lastTouchPanX = panX;
            lastTouchPanY = panY;
        }
    }, { passive: false });

    panContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isPanning) {
            panX = e.touches[0].clientX - startX;
            panY = e.touches[0].clientY - startY;
            updateTransform();
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            if (touchStartDist > 0) {
                scale = Math.min(Math.max(lastTouchScale * (dist / touchStartDist), 0.25), 5);
                updateTransform();
            }
        }
    }, { passive: false });

    panContainer.addEventListener('touchend', () => {
        isPanning = false;
    });

    // Double-click to reset
    panContainer.addEventListener('dblclick', () => {
        scale = 1;
        panX = 0;
        panY = 0;
        updateTransform();
    });
}

// ── Compress Single File ────────────────────────────────────
function compressFile(file, index, totalFiles, resolveAll) {
    const { box, originalSizeKB, originalURL } = createComparisonBox(file, index);
    imageContainer.appendChild(box);

    const mode = getCompressionMode();

    // Update progress detail with current file name
    progressDetail.textContent = `Compressing: ${file.name} (${formatFileSize(file.size)})`;

    // ── Shared result handler (handles AVIF post-conversion) ──
    function handleResult(resultBlob, needsAvif) {
        if (needsAvif) {
            progressDetail.textContent = `Converting to AVIF: ${file.name}`;
            const quality = mode === 'target'
                ? undefined  // quality already baked in via binary search
                : (1 - (compressionLevel.value / 100));
            convertBlobToAvif(resultBlob, quality).then((avifBlob) => {
                finalizeResult(avifBlob);
            }).catch((err) => {
                console.error('AVIF conversion failed, using compressed result:', err);
                showToast('AVIF conversion not supported in this browser. Using compressed original format instead.', 'warning');
                finalizeResult(resultBlob);
            });
        } else {
            finalizeResult(resultBlob);
        }
    }

    function finalizeResult(resultBlob) {
        const compressedSizeKB = resultBlob.size / 1024;
        const savedKB = originalSizeKB - compressedSizeKB;
        const savedPercent = originalSizeKB > 0 ? ((savedKB / originalSizeKB) * 100).toFixed(1) : 0;
        const reader = new FileReader();
        reader.onload = (event) => {
            finalizeCompression(box, file, resultBlob, event.target.result, originalSizeKB, compressedSizeKB, savedKB, savedPercent, index, resolveAll);
        };
        reader.readAsDataURL(resultBlob);
    }

    // ── SVG Optimization Path ────────────────────────────────
    if (file.type === 'image/svg+xml' && svgOptimize.checked) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const optimized = optimizeSVG(e.target.result);
            const blob = new Blob([optimized], { type: 'image/svg+xml' });
            const compressedSizeKB = blob.size / 1024;
            const savedKB = originalSizeKB - compressedSizeKB;
            const savedPercent = originalSizeKB > 0 ? ((savedKB / originalSizeKB) * 100).toFixed(1) : 0;

            // Safe chunked base64 encoding (avoids call stack overflow)
            const dataUrl = 'data:image/svg+xml;base64,' + stringToBase64(optimized);
            finalizeCompression(box, file, blob, dataUrl, originalSizeKB, compressedSizeKB, savedKB, savedPercent, index, resolveAll);
        };
        reader.readAsText(file);
        return;
    }

    // ── Target File Size Mode (Binary Search) ────────────────
    if (mode === 'target') {
        const targetKB = parseFloat(targetSizeKB.value) || 100;
        const targetBytes = targetKB * 1024;

        findQualityForTarget(file, targetBytes, 12, function(iter, maxIter, q) {
            progressDetail.textContent =
                `Finding optimal quality for: ${file.name} ` +
                `(target: ${targetKB} KB) — iteration ${iter}/${maxIter}`;
        }).then(({ quality, size, skipped, failed }) => {
            // File already smaller than target — compress lightly and ship
            if (skipped) {
                progressDetail.textContent = `File already ≤ ${targetKB} KB. Light compression for: ${file.name}`;
            } else if (failed) {
                box.querySelector('.compressed-size').textContent =
                    `Could not reach ${targetKB} KB — try a higher target`;
                resolveAll(index);
                return;
            } else {
                progressDetail.textContent =
                    `Best quality found (${Math.round(quality * 100)}%). Compressing: ${file.name}...`;
            }

            const opts = buildCompressorOptions(file, quality);
            const needsAvif = opts._needsAvifPost || false;
            delete opts._needsAvifPost;

            new Compressor(file, {
                ...opts,
                success(result) {
                    handleResult(result, needsAvif);
                },
                error(err) {
                    console.error('Compression error:', err);
                    box.querySelector('.compressed-size').textContent = 'Compression failed';
                    resolveAll(index);
                },
            });
        });
        return;
    }

    // ── Quality Slider Mode (default) ────────────────────────
    const opts = buildCompressorOptions(file);
    const needsAvif = opts._needsAvifPost || false;
    delete opts._needsAvifPost;

    new Compressor(file, {
        ...opts,
        success(result) {
            handleResult(result, needsAvif);
        },
        error(err) {
            console.error('Compression error:', err);
            box.querySelector('.compressed-size').textContent = 'Compression failed';
            resolveAll(index);
        },
    });
}

// ── Finalize Compression (shared across all modes) ──────────
function finalizeCompression(box, file, resultBlob, dataUrl, originalSizeKB, compressedSizeKB, savedKB, savedPercent, index, resolveAll) {
    const compressedImg = box.querySelector('.compressed-comparison-img');
    const compressedSizeEl = box.querySelector('.compressed-size');
    const downloadBtn = box.querySelector('.single-dl-btn');
    const savedAmountEl = box.querySelector('.saved-amount');
    const savedPercentEl = box.querySelector('.saved-percent');
    const badge = box.querySelector('.comparison-badge');

    // Update comparison slider second image
    if (compressedImg) {
        compressedImg.src = dataUrl;
    }

    compressedSizeEl.textContent = compressedSizeKB.toFixed(2) + ' KB';
    badge.textContent = `Original: ${originalSizeKB.toFixed(1)} KB → Compressed: ${compressedSizeKB.toFixed(1)} KB`;

    if (savedKB > 0) {
        savedAmountEl.style.display = 'inline';
        savedPercentEl.style.display = 'inline';
        savedAmountEl.textContent = formatFileSize(savedKB * 1024);
        savedPercentEl.textContent = '(' + savedPercent + '%)';
        savedAmountEl.style.color = 'var(--success-color, #4bb543)';
        savedPercentEl.style.color = 'var(--success-color, #4bb543)';
    } else {
        savedAmountEl.style.display = 'inline';
        savedPercentEl.style.display = 'inline';
        savedAmountEl.textContent = '0 KB';
        savedPercentEl.textContent = '(0%)';
        savedAmountEl.style.color = 'var(--danger-color, #f44336)';
        savedPercentEl.style.color = 'var(--danger-color, #f44336)';
    }

    // Attach download handler ONCE per box — use a flag to avoid listener accumulation
    if (!downloadBtn.dataset.listenerAttached) {
        downloadBtn.dataset.listenerAttached = '1';
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            const dlUrl = URL.createObjectURL(resultBlob);
            let ext = file.name.split('.').pop();
            const mime = resultBlob.type || file.type;
            if (mime === 'image/webp') ext = 'webp';
            else if (mime === 'image/jpeg') ext = 'jpg';
            else if (mime === 'image/png') ext = 'png';
            else if (mime === 'image/avif') ext = 'avif';
            else if (mime === 'image/svg+xml') ext = 'svg';
            const baseName = file.name.replace(/\.[^.]+$/, '');
            link.href = dlUrl;
            link.download = `compressed-${baseName}.${ext}`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
        });
    }

    // Update the download button to reference the latest blob
    // (We store the blob on the box element so the click handler always gets the latest)
    box._latestBlob = resultBlob;
    box._latestFileName = file.name;
    // Override the download listener to use latest blob each time
    if (downloadBtn.dataset.listenerAttached === '1') {
        // Replace the old click handler by cloning the button
        const newBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
        newBtn.disabled = false;
        newBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            const blob = box._latestBlob;
            const fname = box._latestFileName;
            const dlUrl = URL.createObjectURL(blob);
            let ext = fname.split('.').pop();
            const mime = blob.type || file.type;
            if (mime === 'image/webp') ext = 'webp';
            else if (mime === 'image/jpeg') ext = 'jpg';
            else if (mime === 'image/png') ext = 'png';
            else if (mime === 'image/avif') ext = 'avif';
            else if (mime === 'image/svg+xml') ext = 'svg';
            const baseName = fname.replace(/\.[^.]+$/, '');
            link.href = dlUrl;
            link.download = `compressed-${baseName}.${ext}`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
        });
        newBtn.dataset.listenerAttached = '1';
    }

    // Store for ZIP download
    compressedResults.push({
        blob: resultBlob,
        name: file.name,
        mime: resultBlob.type || file.type,
    });
    downloadZipBtn.disabled = compressedResults.length === 0;

    // Update stats — only count unique files per session to avoid double-count on live preview
    const fileKey = file.name + '|' + file.size;
    if (!processedFileNames.has(fileKey)) {
        processedFileNames.add(fileKey);
        compressionStats.totalImages++;
        compressionStats.totalSizeSaved += Math.max(0, savedKB);
        sessionCompressCount++;
        localStorage.setItem('compressionStats', JSON.stringify(compressionStats));
        updateStatsDisplay();
    }

    // Update history — read original file as data URL so it survives object URL revocation
    const origReader = new FileReader();
    origReader.onload = (e) => {
        compressionHistory.push({
            originalSrc: e.target.result,
            compressedSrc: dataUrl,
            originalSize: originalSizeKB,
            compressedSize: compressedSizeKB,
            savedPercent: savedPercent,
            timestamp: Date.now(),
        });
        compressionHistory = compressionHistory.slice(-20);
        localStorage.setItem('compressionHistory', JSON.stringify(compressionHistory));
    };
    origReader.readAsDataURL(file);

    resolveAll(index);
}

// ── Thumbnail Management ─────────────────────────────────────
let thumbnailBlobURLs = [];

function clearThumbnails() {
    thumbnailBlobURLs.forEach(url => { try { URL.revokeObjectURL(url); } catch(e) {} });
    thumbnailBlobURLs = [];
    thumbnailList.innerHTML = '';
    thumbnailStrip.style.display = 'none';
}

function buildThumbnails(files) {
    clearThumbnails();
    if (files.length === 0) return;

    Array.from(files).forEach((file, i) => {
        if (!isImageFile(file)) return;

        const url = URL.createObjectURL(file);
        thumbnailBlobURLs.push(url);

        const item = document.createElement('div');
        item.className = 'thumbnail-item';
        item.innerHTML = `
            <img src="${url}" alt="${file.name}" class="thumbnail-img" loading="lazy">
            <button class="thumbnail-remove" data-index="${i}" aria-label="Remove ${file.name}">&times;</button>
            <span class="thumbnail-name">${file.name}</span>
        `;

        // Remove handler
        item.querySelector('.thumbnail-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFileByIndex(i);
        });

        thumbnailList.appendChild(item);
    });

    thumbnailStrip.style.display = files.length > 0 ? 'block' : 'none';
}

// We track the original FileList via a DataTransfer to allow removal
let currentFileList = null;

function removeFileByIndex(index) {
    if (!currentFileList) return;
    const dt = new DataTransfer();
    Array.from(currentFileList).forEach((f, i) => {
        if (i !== index) dt.items.add(f);
    });
    currentFileList = dt.files;
    fileInput.files = dt.files;
    buildThumbnails(dt.files);
    // Re-process automatically if quality preview is on
    if (qualityPreview.checked && dt.files.length > 0) {
        processFiles(dt.files);
    }
}

// ── Process All Files ───────────────────────────────────────
function processFiles(files) {
    // Clean up previous URLs
    revokeAllURLs();
    imageContainer.innerHTML = '';
    compressedResults = [];
    processedFileNames = new Set();
    downloadZipBtn.disabled = true;

    // Build thumbnails
    buildThumbnails(files);

    // Capture first image's natural dimensions for aspect-ratio lock
    if (files.length > 0) {
        captureNaturalDimensions(files[0]);
    }

    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    progressText.textContent = 'Compressing images...';
    progressDetail.textContent = '';
    outputSection.style.display = 'block';

    const totalFiles = files.length;
    let completed = 0;

    // Filter valid files
    const validFiles = Array.from(files).filter(f => {
        if (!isImageFile(f)) {
            showToast('Unsupported file type: ' + f.name, 'warning');
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) {
        progressContainer.style.display = 'none';
        outputSection.style.display = 'none';
        return;
    }

    // Create a promise-based tracker for all files
    const promises = validFiles.map((file, i) => {
        return new Promise(resolve => {
            compressFile(file, i, validFiles.length, (idx) => {
                completed++;
                const pct = (completed / validFiles.length) * 100;
                progressBar.style.width = `${pct}%`;
                progressBar.setAttribute('aria-valuenow', Math.round(pct));

                if (completed === validFiles.length) {
                    progressText.textContent = 'Compression complete!';
                    progressDetail.textContent = validFiles.length + ' image(s) processed';
                    showToast(validFiles.length + ' image(s) compressed successfully!', 'success');
                    setTimeout(function () {
                        progressContainer.style.display = 'none';
                    }, 1500);
                } else {
                    progressDetail.textContent = `Completed ${completed} of ${validFiles.length}`;
                }
                resolve();
            });
        });
    });

    return Promise.all(promises);
}

// ── File Input Change Handler ───────────────────────────────
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    currentFileList = files;
    processFiles(files);
});

// ── Live Quality Preview (debounced) ────────────────────────
const debouncedPreview = debounce(() => {
    if (qualityPreview.checked && fileInput.files.length > 0) {
        processFiles(fileInput.files);
    }
}, 400);

compressionLevel.addEventListener('input', debouncedPreview);
resizeWidth.addEventListener('input', debouncedPreview);
resizeHeight.addEventListener('input', debouncedPreview);
outputFormat.addEventListener('change', () => {
    if (qualityPreview.checked && fileInput.files.length > 0) {
        processFiles(fileInput.files);
    }
});
svgOptimize.addEventListener('change', () => {
    if (qualityPreview.checked && fileInput.files.length > 0) {
        processFiles(fileInput.files);
    }
});
targetSizeKB.addEventListener('input', debouncedPreview);

// ── Bulk ZIP Download ───────────────────────────────────────
downloadZipBtn.addEventListener('click', async () => {
    if (compressedResults.length === 0) return;

    downloadZipBtn.disabled = true;
    downloadZipBtn.innerHTML = '<i class="material-icons" style="vertical-align: middle; margin-right: 5px;">hourglass_top</i> Creating ZIP...';

    try {
        const zip = new JSZip();
        const folder = zip.folder('compressed-images');

        compressedResults.forEach((item, i) => {
            let ext = item.name.split('.').pop();
            if (item.mime === 'image/webp') ext = 'webp';
            else if (item.mime === 'image/jpeg') ext = 'jpg';
            else if (item.mime === 'image/png') ext = 'png';
            else if (item.mime === 'image/avif') ext = 'avif';
            else if (item.mime === 'image/svg+xml') ext = 'svg';
            const baseName = item.name.replace(/\.[^.]+$/, '');
            folder.file(`compressed-${baseName}.${ext}`, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = 'compressed-images.zip';
        link.click();
        setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);
    } catch (err) {
        console.error('ZIP creation error:', err);
        showToast('Failed to create ZIP file. Try downloading images individually.', 'error');
    }

    downloadZipBtn.disabled = false;
    downloadZipBtn.innerHTML = '<i class="material-icons" style="vertical-align: middle; margin-right: 5px;">folder_zip</i> Download All as ZIP';
});

// ── History Button ──────────────────────────────────────────
// Note: We do NOT call revokeAllURLs() here — history data URLs are permanent
// and current session results should be preserved.
historyBtn.addEventListener('click', () => {
    imageContainer.innerHTML = '';
    compressedResults = [];
    downloadZipBtn.disabled = true;

    if (compressionHistory.length === 0) {
        imageContainer.innerHTML = '<p class="text-center" style="padding:20px;color:var(--secondary);">No compression history yet. Compress some images first!</p>';
        outputSection.style.display = 'block';
        return;
    }

    compressionHistory.slice().reverse().forEach((item, index) => {
        const box = document.createElement('div');
        box.className = 'comparison-box';
        const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown';
        box.innerHTML = `
            <div class="comparison-header">
                <h3>History #${compressionHistory.length - index}</h3>
                <span class="comparison-badge">${dateStr}</span>
            </div>
            <div class="comparison-slider-wrapper">
                <div class="zoom-controls">
                    <button class="zoom-btn" data-action="zoom-in" data-tooltip="Zoom In" aria-label="Zoom in"><i class="material-icons">zoom_in</i></button>
                    <button class="zoom-btn" data-action="zoom-out" data-tooltip="Zoom Out" aria-label="Zoom out"><i class="material-icons">zoom_out</i></button>
                    <button class="zoom-btn" data-action="zoom-reset" data-tooltip="Reset Zoom" aria-label="Reset zoom"><i class="material-icons">zoom_out_map</i></button>
                    <span class="zoom-level-display">100%</span>
                </div>
                <div class="zoom-pan-container">
                    <img-comparison-slider class="comparison-slider" hover="hover" value="50" aria-label="Before and after comparison">
                        <img slot="first" src="${item.originalSrc}" alt="Original image" class="comparison-img">
                        <img slot="second" src="${item.compressedSrc}" alt="Compressed image" class="comparison-img">
                    </img-comparison-slider>
                </div>
            </div>
            <div class="comparison-info">
                <div class="compression-result">
                    <span class="result-label">Original:</span>
                    <span>${item.originalSize.toFixed(2)} KB</span>
                </div>
                <div class="compression-result">
                    <span class="result-label">Compressed:</span>
                    <span>${item.compressedSize.toFixed(2)} KB</span>
                </div>
                <div class="compression-result">
                    <span class="result-label">Saved:</span>
                    <span style="color:var(--success-color);">${item.savedPercent || 0}%</span>
                </div>
            </div>
        `;
        imageContainer.appendChild(box);
        // Enable zoom/pan on history view too
        setupZoomPan(box);
    });

    outputSection.style.display = 'block';
    outputSection.scrollIntoView({ behavior: 'smooth' });
});