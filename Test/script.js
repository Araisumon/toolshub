// DOM Elements
const fileInputBtn = document.getElementById('fileInputBtn');
const fileInput = document.getElementById('fileInput');
const dropArea = document.getElementById('dropArea');
const compressionLevel = document.getElementById('compressionLevel');
const outputSection = document.getElementById('outputSection');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const googleDriveBtn = document.getElementById('googleDriveBtn');
const dropboxBtn = document.getElementById('dropboxBtn');
const formatSelect = document.getElementById('formatSelect');
const maxWidthInput = document.getElementById('maxWidth');
const maxHeightInput = document.getElementById('maxHeight');
const batchModeToggle = document.getElementById('batchMode');
const batchContainer = document.getElementById('batchContainer');
const batchList = document.getElementById('batchList');
const compressAllBtn = document.getElementById('compressAllBtn');
const clearBatchBtn = document.getElementById('clearBatchBtn');
const compressionStats = document.getElementById('compressionStats');
const qualityValue = document.getElementById('qualityValue');
const advancedSettings = document.getElementById('advancedSettings');
const toggleAdvanced = document.getElementById('toggleAdvanced');
const preserveMetadata = document.getElementById('preserveMetadata');
const aggressiveCompression = document.getElementById('aggressiveCompression');

// Global variables
let compressedImageBlob = null;
let originalFileName = '';
let originalFileExtension = '';
let compressionWorker = null;
let batchFiles = [];
let currentCompressionId = 0;
let compressionHistory = [];
let userSettings = {};

// Initialize Web Worker
function initWorker() {
    if (typeof Worker !== 'undefined') {
        // Use the advanced compression worker for better compression
        compressionWorker = new Worker('advanced-compression-worker.js');
        compressionWorker.onmessage = handleWorkerMessage;
        compressionWorker.onerror = handleWorkerError;
    } else {
        console.warn('Web Workers not supported, falling back to main thread');
    }
}

// Settings and History Management
function loadSettings() {
    try {
        const saved = localStorage.getItem('imageCompressorSettings');
        if (saved) {
            userSettings = JSON.parse(saved);
            
            // Apply settings to UI
            if (compressionLevel && userSettings.compressionLevel !== undefined) {
                compressionLevel.value = userSettings.compressionLevel;
                updateQualityDisplay();
            }
            
            if (formatSelect && userSettings.outputFormat) {
                formatSelect.value = userSettings.outputFormat;
            }
            
            if (maxWidthInput && userSettings.maxWidth !== undefined) {
                maxWidthInput.value = userSettings.maxWidth;
            }
            
            if (maxHeightInput && userSettings.maxHeight !== undefined) {
                maxHeightInput.value = userSettings.maxHeight;
            }
            
            if (batchModeToggle && userSettings.batchMode !== undefined) {
                batchModeToggle.checked = userSettings.batchMode;
                toggleBatchMode();
            }
            
            const intelligentCompression = document.getElementById('intelligentCompression');
            if (intelligentCompression && userSettings.intelligentCompression !== undefined) {
                intelligentCompression.checked = userSettings.intelligentCompression;
            }
            
            const qualityPreview = document.getElementById('qualityPreview');
            if (qualityPreview && userSettings.qualityPreview !== undefined) {
                qualityPreview.checked = userSettings.qualityPreview;
            }
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

function saveSettings() {
    try {
        userSettings = {
            compressionLevel: compressionLevel ? parseInt(compressionLevel.value) : 50,
            outputFormat: formatSelect ? formatSelect.value : 'original',
            maxWidth: maxWidthInput ? parseInt(maxWidthInput.value) || 2000 : 2000,
            maxHeight: maxHeightInput ? parseInt(maxHeightInput.value) || 2000 : 2000,
            batchMode: batchModeToggle ? batchModeToggle.checked : false,
            intelligentCompression: document.getElementById('intelligentCompression') ?
                document.getElementById('intelligentCompression').checked : true,
            qualityPreview: document.getElementById('qualityPreview') ?
                document.getElementById('qualityPreview').checked : false,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('imageCompressorSettings', JSON.stringify(userSettings));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('imageCompressorHistory');
        if (saved) {
            compressionHistory = JSON.parse(saved);
            // Limit history to last 20 items
            if (compressionHistory.length > 20) {
                compressionHistory = compressionHistory.slice(-20);
            }
        }
    } catch (error) {
        console.error('Failed to load history:', error);
        compressionHistory = [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem('imageCompressorHistory', JSON.stringify(compressionHistory));
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

function addToHistory(originalFile, compressedResult, metadata) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        originalName: originalFile.name,
        originalSize: originalFile.size,
        compressedSize: compressedResult.size,
        format: metadata.format || 'unknown',
        dimensions: metadata.width + 'x' + metadata.height,
        compressionRatio: originalFile.size > 0 ?
            ((originalFile.size - compressedResult.size) / originalFile.size * 100).toFixed(1) + '%' : '0%',
        previewUrl: URL.createObjectURL(compressedResult)
    };
    
    compressionHistory.unshift(historyItem);
    
    // Limit history size
    if (compressionHistory.length > 20) {
        // Revoke URLs of removed items to free memory
        const removed = compressionHistory.slice(20);
        removed.forEach(item => {
            if (item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
        });
        compressionHistory = compressionHistory.slice(0, 20);
    }
    
    saveHistory();
    updateHistoryUI();
}

function updateHistoryUI() {
    // This would update a history panel if it exists
    const historyPanel = document.getElementById('historyPanel');
    if (!historyPanel) return;
    
    historyPanel.innerHTML = '';
    
    compressionHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-preview">
                <img src="${item.previewUrl}" alt="${item.originalName}">
            </div>
            <div class="history-details">
                <div class="history-name">${item.originalName}</div>
                <div class="history-stats">
                    <span>${formatFileSize(item.originalSize)} → ${formatFileSize(item.compressedSize)}</span>
                    <span>${item.compressionRatio} saved</span>
                </div>
                <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
            <button class="history-download" onclick="downloadHistoryItem('${item.id}')">
                <i class="material-icons">download</i>
            </button>
        `;
        historyPanel.appendChild(historyItem);
    });
}

function downloadHistoryItem(id) {
    const item = compressionHistory.find(i => i.id === id);
    if (!item) return;
    
    // This would need to reconstruct the blob from storage
    // For now, we'll just show a message
    alert(`Downloading ${item.originalName} - this feature would need additional implementation`);
}

// Update global stats
function updateGlobalStats(originalSize, compressedSize) {
    let stats = JSON.parse(localStorage.getItem('compressionStats')) || {
        totalImages: 0,
        totalSizeSaved: 0
    };
    
    stats.totalImages++;
    stats.totalSizeSaved += (originalSize - compressedSize) / 1024; // KB
    
    localStorage.setItem('compressionStats', JSON.stringify(stats));
    
    // Update UI if elements exist
    const totalImagesEl = document.getElementById('totalImages');
    const totalSizeSavedEl = document.getElementById('totalSizeSaved');
    
    if (totalImagesEl) {
        totalImagesEl.textContent = stats.totalImages;
    }
    
    if (totalSizeSavedEl) {
        totalSizeSavedEl.textContent = stats.totalSizeSaved.toFixed(2) + ' KB';
    }
}

// Event Listeners
fileInputBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('drop', handleDrop);
downloadBtn.addEventListener('click', downloadCompressedImage);
googleDriveBtn.addEventListener('click', () => alert('Google Drive integration would require API setup'));
dropboxBtn.addEventListener('click', () => alert('Dropbox integration would require API setup'));

// New event listeners for enhanced features
if (compressionLevel) {
    compressionLevel.addEventListener('input', updateQualityDisplay);
}

if (formatSelect) {
    formatSelect.addEventListener('change', updateFormatSettings);
}

if (batchModeToggle) {
    batchModeToggle.addEventListener('change', toggleBatchMode);
}

if (compressAllBtn) {
    compressAllBtn.addEventListener('click', compressBatch);
}

if (clearBatchBtn) {
    clearBatchBtn.addEventListener('click', clearBatch);
}

if (toggleAdvanced) {
    toggleAdvanced.addEventListener('click', () => {
        const isHidden = advancedSettings.style.display === 'none';
        advancedSettings.style.display = isHidden ? 'block' : 'none';
        toggleAdvanced.textContent = isHidden ? 'Hide Advanced Settings' : 'Show Advanced Settings';
    });
}

// Initialize
initWorker();
loadSettings();
loadHistory();
updateQualityDisplay();

// Add event listeners for saving settings
if (compressionLevel) {
    compressionLevel.addEventListener('change', saveSettings);
}

if (formatSelect) {
    formatSelect.addEventListener('change', saveSettings);
}

if (maxWidthInput) {
    maxWidthInput.addEventListener('change', saveSettings);
}

if (maxHeightInput) {
    maxHeightInput.addEventListener('change', saveSettings);
}

if (batchModeToggle) {
    batchModeToggle.addEventListener('change', saveSettings);
}

const intelligentCompression = document.getElementById('intelligentCompression');
if (intelligentCompression) {
    intelligentCompression.addEventListener('change', saveSettings);
}

const qualityPreview = document.getElementById('qualityPreview');
if (qualityPreview) {
    qualityPreview.addEventListener('change', saveSettings);
}

// Auto-save settings periodically
setInterval(saveSettings, 30000); // Save every 30 seconds

// Functions
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (batchModeToggle && batchModeToggle.checked) {
        addToBatch(files);
    } else {
        if (files.length > 0 && isImageFile(files[0])) {
            processImageFile(files[0]);
        } else {
            alert('Please select a valid image file (JPG, PNG, SVG, GIF, or WebP).');
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files);
    if (batchModeToggle && batchModeToggle.checked) {
        addToBatch(files);
    } else {
        if (files.length > 0 && isImageFile(files[0])) {
            processImageFile(files[0]);
        } else {
            alert('Please upload a valid image file (JPG, PNG, SVG, GIF, or WebP).');
        }
    }
}

function isImageFile(file) {
    const acceptedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/svg+xml', 
        'image/gif',
        'image/webp',
        'image/avif'
    ];
    return file && acceptedTypes.includes(file.type);
}

function processImageFile(file) {
    originalFileName = file.name;
    originalFileExtension = file.name.split('.').pop().toLowerCase();
    
    // Display original image
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        
        // Show progress bar
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = 'Analyzing image...';
        
        // Start compression
        compressImageWithWorker(file, e.target.result);
    };
    reader.readAsDataURL(file);
}

function compressImageWithWorker(file, imageData) {
    const compressionId = ++currentCompressionId;
    
    // Store original file for later reference
    storeOriginalFile(compressionId, file);
    
    const intelligentCompression = document.getElementById('intelligentCompression');
    const options = {
        quality: 1 - (compressionLevel.value / 100),
        maxWidth: maxWidthInput ? parseInt(maxWidthInput.value) || 2000 : 2000,
        maxHeight: maxHeightInput ? parseInt(maxHeightInput.value) || 2000 : 2000,
        format: formatSelect ? formatSelect.value : 'original',
        preserveMetadata: preserveMetadata ? preserveMetadata.checked : true,
        aggressiveCompression: aggressiveCompression ? aggressiveCompression.checked : false,
        originalSize: file.size
    };
    
    // Update progress
    progressBar.style.width = '10%';
    progressText.textContent = 'Starting compression...';
    
    if (compressionWorker) {
        compressionWorker.postMessage({
            id: compressionId,
            imageData,
            options
        });
    } else {
        // Fallback to main thread compression
        fallbackCompress(file, options, compressionId);
    }
}

function handleWorkerMessage(e) {
    const { id, type, success, result, error, progress } = e.data;
    
    if (type === 'progress') {
        // Update progress bar
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Compressing... ${Math.floor(progress)}%`;
        return;
    }
    
    if (type === 'complete') {
        if (success) {
            progressBar.style.width = '100%';
            progressText.textContent = 'Compression complete!';
            
            compressedImageBlob = result.blob;
            displayCompressedImage(result.blob, result);
            
            // Update compression stats
            if (compressionStats) {
                const originalSizeBytes = getOriginalSize();
                const compressionRatio = originalSizeBytes > 0 ?
                    ((originalSizeBytes - result.size) / originalSizeBytes * 100).toFixed(1) : 0;
                
                compressionStats.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Compression Ratio:</span>
                        <span class="stat-value">${compressionRatio}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">New Dimensions:</span>
                        <span class="stat-value">${result.width} × ${result.height}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Format:</span>
                        <span class="stat-value">${result.format.toUpperCase()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Original Size:</span>
                        <span class="stat-value">${result.originalWidth} × ${result.originalHeight}</span>
                    </div>
                `;
            }
            
            // Add to history and update stats
            // We need the original file reference here - we'll need to store it
            const originalFile = getOriginalFileById(id);
            if (originalFile) {
                addToHistory(originalFile, result.blob, {
                    width: result.width,
                    height: result.height,
                    format: result.format
                });
                updateGlobalStats(originalFile.size, result.size);
            }
            
        } else {
            progressText.textContent = `Error: ${error}`;
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 2000);
        }
    }
}

// Helper to track original files by compression ID
const originalFilesMap = new Map();

function storeOriginalFile(id, file) {
    originalFilesMap.set(id, file);
}

function getOriginalFileById(id) {
    return originalFilesMap.get(id);
}

function handleWorkerError(error) {
    console.error('Worker error:', error);
    progressText.textContent = 'Worker error, falling back to main thread';
}

function fallbackCompress(file, options, compressionId) {
    // Simple fallback compression using canvas
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate dimensions
            let width = img.width;
            let height = img.height;
            const maxWidth = options.maxWidth || 2000;
            const maxHeight = options.maxHeight || 2000;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Determine format
            let mimeType = 'image/jpeg';
            if (options.format === 'png') {
                mimeType = 'image/png';
            } else if (options.format === 'webp') {
                mimeType = 'image/webp';
            }
            
            canvas.toBlob((blob) => {
                handleWorkerMessage({
                    data: {
                        id: compressionId,
                        success: true,
                        result: {
                            blob,
                            width,
                            height,
                            format: options.format,
                            size: blob.size
                        }
                    }
                });
            }, mimeType, options.quality);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function displayCompressedImage(blob, metadata = {}) {
    const reader = new FileReader();
    reader.onload = function(e) {
        compressedImage.src = e.target.result;
        compressedSize.textContent = formatFileSize(blob.size);
        
        // Hide progress bar and show output
        setTimeout(() => {
            progressContainer.style.display = 'none';
            outputSection.style.display = 'block';
            
            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    };
    reader.readAsDataURL(blob);
}

function downloadCompressedImage() {
    if (!compressedImageBlob) return;
    
    const format = formatSelect ? formatSelect.value : originalFileExtension;
    const extension = format === 'original' ? originalFileExtension : format;
    const url = URL.createObjectURL(compressedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalFileName.split('.')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Batch processing functions
function toggleBatchMode() {
    if (batchModeToggle.checked) {
        batchContainer.style.display = 'block';
        fileInput.multiple = true;
    } else {
        batchContainer.style.display = 'none';
        fileInput.multiple = false;
        clearBatch();
    }
}

function addToBatch(files) {
    const imageFiles = files.filter(isImageFile);
    
    if (imageFiles.length === 0) {
        alert('No valid image files found. Please select JPG, PNG, SVG, GIF, or WebP files.');
        return;
    }
    
    imageFiles.forEach(file => {
        const fileId = Date.now() + Math.random();
        batchFiles.push({
            id: fileId,
            file,
            status: 'pending'
        });
        
        const listItem = document.createElement('div');
        listItem.className = 'batch-item';
        listItem.innerHTML = `
            <span class="batch-filename">${file.name}</span>
            <span class="batch-size">${formatFileSize(file.size)}</span>
            <span class="batch-status" data-id="${fileId}">Pending</span>
            <button class="batch-remove" onclick="removeFromBatch('${fileId}')">×</button>
        `;
        batchList.appendChild(listItem);
    });
    
    updateBatchUI();
}

function removeFromBatch(fileId) {
    batchFiles = batchFiles.filter(item => item.id !== fileId);
    const item = document.querySelector(`.batch-status[data-id="${fileId}"]`);
    if (item) {
        item.closest('.batch-item').remove();
    }
    updateBatchUI();
}

function clearBatch() {
    batchFiles = [];
    batchList.innerHTML = '';
    updateBatchUI();
}

function updateBatchUI() {
    const pendingCount = batchFiles.filter(f => f.status === 'pending').length;
    const processingCount = batchFiles.filter(f => f.status === 'processing').length;
    const completedCount = batchFiles.filter(f => f.status === 'completed').length;
    
    if (compressAllBtn) {
        compressAllBtn.disabled = pendingCount === 0;
        compressAllBtn.textContent = `Compress All (${pendingCount})`;
    }
    
    if (clearBatchBtn) {
        clearBatchBtn.disabled = batchFiles.length === 0;
    }
}

function compressBatch() {
    if (batchFiles.length === 0) return;
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = `Processing ${batchFiles.length} images...`;
    
    // Process each file sequentially
    processNextBatchItem(0);
}

function processNextBatchItem(index) {
    if (index >= batchFiles.length) {
        progressBar.style.width = '100%';
        progressText.textContent = 'Batch compression complete!';
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);
        return;
    }
    
    const item = batchFiles[index];
    item.status = 'processing';
    updateBatchItemStatus(item.id, 'processing');
    
    const progress = ((index + 1) / batchFiles.length * 100).toFixed(1);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Processing ${index + 1} of ${batchFiles.length}: ${item.file.name}`;
    
    // Simulate processing for now (would integrate with worker)
    setTimeout(() => {
        item.status = 'completed';
        updateBatchItemStatus(item.id, 'completed');
        processNextBatchItem(index + 1);
    }, 500);
}

function updateBatchItemStatus(fileId, status) {
    const statusElement = document.querySelector(`.batch-status[data-id="${fileId}"]`);
    if (statusElement) {
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `batch-status batch-status-${status}`;
    }
}

// Helper functions
function updateQualityDisplay() {
    if (qualityValue) {
        const quality = 100 - compressionLevel.value;
        qualityValue.textContent = `${quality}%`;
    }
}

function updateFormatSettings() {
    const format = formatSelect.value;
    // Could enable/disable certain options based on format
}

function getOriginalSize() {
    const sizeText = originalSize.textContent;
    // Parse size from text like "2.5 MB"
    // Simplified implementation
    return 0; // Would implement proper parsing
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Make functions available globally for inline event handlers
window.removeFromBatch = removeFromBatch;