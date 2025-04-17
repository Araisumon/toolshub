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

// Global variables
let compressedImageBlob = null;
let originalFileName = '';
let originalFileExtension = '';

// Event Listeners
fileInputBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('drop', handleDrop);
downloadBtn.addEventListener('click', downloadCompressedImage);
googleDriveBtn.addEventListener('click', () => alert('Google Drive integration would require API setup'));
dropboxBtn.addEventListener('click', () => alert('Dropbox integration would require API setup'));

// Functions
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && isImageFile(file)) {
        processImageFile(file);
    } else {
        alert('Please select a valid image file (JPG, PNG, SVG, or GIF).');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.borderColor = 'var(--primary-color)';
    dropArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.style.borderColor = 'var(--gray-color)';
    dropArea.style.backgroundColor = 'transparent';

    const file = e.dataTransfer.files[0];
    if (file && isImageFile(file)) {
        processImageFile(file);
    } else {
        alert('Please upload a valid image file (JPG, PNG, SVG, or GIF).');
    }
}

function isImageFile(file) {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
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
        simulateProgress();
        
        // Compress image after a small delay to show progress
        setTimeout(() => {
            compressImage(file);
        }, 500);
    };
    reader.readAsDataURL(file);
}

function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) {
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
    }, 100);
}

function compressImage(file) {
    const quality = 1 - (compressionLevel.value / 100);
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions if needed (for very large images)
            let width = img.width;
            let height = img.height;
            const maxDimension = 2000; // Max width or height
            
            if (width > height && width > maxDimension) {
                height *= maxDimension / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width *= maxDimension / height;
                height = maxDimension;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // For SVG, we don't need to compress as it's already vector
            if (originalFileExtension === 'svg') {
                compressedImageBlob = file;
                displayCompressedImage(file);
                return;
            }
            
            // For GIF, we can't compress with canvas, so we'll just use the original
            if (originalFileExtension === 'gif') {
                compressedImageBlob = file;
                displayCompressedImage(file);
                return;
            }
            
            // For JPG/PNG, we can compress
            canvas.toBlob((blob) => {
                compressedImageBlob = blob;
                displayCompressedImage(blob);
                
                // Complete progress bar
                progressBar.style.width = '100%';
                progressText.textContent = 'Compression complete!';
            }, file.type, quality);
        };
        
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

function displayCompressedImage(blob) {
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
    
    const url = URL.createObjectURL(compressedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalFileName.split('.')[0]}.${originalFileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}