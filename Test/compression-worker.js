// Web Worker for image compression with performance optimizations
self.addEventListener('message', async (e) => {
    const { id, imageData, options, originalSize } = e.data;
    
    try {
        // Send progress update
        self.postMessage({ id, type: 'progress', progress: 10 });
        
        const result = await compressImage(imageData, options, (progress) => {
            self.postMessage({ id, type: 'progress', progress: 10 + progress * 0.8 });
        });
        
        self.postMessage({ id, type: 'complete', success: true, result });
    } catch (error) {
        self.postMessage({ id, type: 'complete', success: false, error: error.message });
    }
});

async function compressImage(imageData, options, onProgress) {
    const { 
        quality = 0.8, 
        maxWidth = 2000, 
        maxHeight = 2000, 
        format = 'original',
        intelligentCompression = true
    } = options;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            try {
                if (onProgress) onProgress(20);
                
                // Calculate optimal dimensions
                let { width, height, shouldResize } = calculateOptimalDimensions(
                    img.width, 
                    img.height, 
                    maxWidth, 
                    maxHeight,
                    intelligentCompression
                );
                
                // Analyze image for intelligent compression if enabled
                let compressionSettings = { quality };
                if (intelligentCompression) {
                    compressionSettings = adjustCompressionForImage(img, width, height, quality, format);
                }
                
                if (onProgress) onProgress(40);
                
                // Use progressive downscaling for very large images
                const canvas = await createOptimizedCanvas(img, width, height, shouldResize);
                
                if (onProgress) onProgress(70);
                
                // Determine output format
                const outputFormat = getOutputFormat(format, img);
                const mimeType = getMimeType(outputFormat);
                
                // Compress with format-specific optimizations
                const blob = await compressToFormat(
                    canvas, 
                    mimeType, 
                    compressionSettings, 
                    outputFormat
                );
                
                if (onProgress) onProgress(90);
                
                resolve({
                    blob,
                    width: canvas.width,
                    height: canvas.height,
                    format: outputFormat,
                    size: blob.size,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    compressionRatio: calculateCompressionRatio(blob.size, options.originalSize)
                });
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
    });
}

function calculateOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight, intelligentCompression) {
    let width = originalWidth;
    let height = originalHeight;
    let shouldResize = false;
    
    // For very large images, use more aggressive downscaling
    const megaPixels = (originalWidth * originalHeight) / 1000000;
    
    // Adjust max dimensions based on image size for performance
    let effectiveMaxWidth = maxWidth;
    let effectiveMaxHeight = maxHeight;
    
    if (megaPixels > 10) { // Very large image (>10MP)
        effectiveMaxWidth = Math.min(maxWidth, 1600);
        effectiveMaxHeight = Math.min(maxHeight, 1600);
    } else if (megaPixels > 5) { // Large image (>5MP)
        effectiveMaxWidth = Math.min(maxWidth, 2000);
        effectiveMaxHeight = Math.min(maxHeight, 2000);
    }
    
    // Check if resizing is needed
    if (width > effectiveMaxWidth || height > effectiveMaxHeight) {
        const ratio = Math.min(effectiveMaxWidth / width, effectiveMaxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
        shouldResize = true;
    }
    
    // Ensure dimensions are even numbers (better for some codecs)
    width = width - (width % 2);
    height = height - (height % 2);
    
    // Ensure minimum dimensions
    width = Math.max(width, 2);
    height = Math.max(height, 2);
    
    return { width, height, shouldResize };
}

async function createOptimizedCanvas(img, targetWidth, targetHeight, shouldResize) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for JPEG
    
    if (!shouldResize || (img.width <= targetWidth && img.height <= targetHeight)) {
        // No resizing needed or image is smaller than target
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        return canvas;
    }
    
    // Progressive downscaling for better quality and performance
    let currentWidth = img.width;
    let currentHeight = img.height;
    
    // Create temporary canvas for intermediate steps
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = currentWidth;
    tempCanvas.height = currentHeight;
    tempCtx.drawImage(img, 0, 0);
    
    // Downscale in steps (halve each time until close to target)
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
        currentWidth = Math.floor(currentWidth / 2);
        currentHeight = Math.floor(currentHeight / 2);
        
        const stepCanvas = document.createElement('canvas');
        stepCanvas.width = currentWidth;
        stepCanvas.height = currentHeight;
        const stepCtx = stepCanvas.getContext('2d');
        
        // Use high-quality scaling for intermediate steps
        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = 'high';
        stepCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 
                          0, 0, currentWidth, currentHeight);
        
        tempCanvas = stepCanvas;
    }
    
    // Final draw to target canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 
                  0, 0, targetWidth, targetHeight);
    
    return canvas;
}

function adjustCompressionForImage(img, width, height, baseQuality, format) {
    // Analyze image characteristics for intelligent compression
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(img.width, 100); // Sample at lower resolution for speed
    canvas.height = Math.min(img.height, 100);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let transparencyCount = 0;
    let colorComplexity = 0;
    const colorSet = new Set();
    
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 255) transparencyCount++;
        
        // Simple color complexity measure
        const colorKey = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`;
        colorSet.add(colorKey);
    }
    
    const hasTransparency = transparencyCount > (data.length / 4) * 0.1; // >10% transparent pixels
    const colorCount = colorSet.size;
    const isComplex = colorCount > 100; // Arbitrary threshold
    
    // Adjust quality based on image characteristics
    let adjustedQuality = baseQuality;
    
    if (format === 'png' || format === 'webp') {
        if (hasTransparency) {
            // PNG/WebP with transparency - preserve quality
            adjustedQuality = Math.max(baseQuality, 0.9);
        } else if (!isComplex) {
            // Simple images can be compressed more
            adjustedQuality = Math.min(baseQuality, 0.7);
        }
    } else if (format === 'jpeg') {
        if (!isComplex) {
            // Simple JPEG images can have lower quality
            adjustedQuality = Math.min(baseQuality, 0.7);
        }
    }
    
    return {
        quality: adjustedQuality,
        hasTransparency,
        colorCount,
        isComplex
    };
}

function getOutputFormat(requestedFormat, img) {
    if (requestedFormat === 'original') {
        // Determine from image type or default to webp for better compression
        return 'webp';
    }
    return requestedFormat;
}

function getMimeType(format) {
    switch (format) {
        case 'webp': return 'image/webp';
        case 'png': return 'image/png';
        case 'jpeg': return 'image/jpeg';
        case 'avif': return 'image/avif';
        default: return 'image/webp';
    }
}

async function compressToFormat(canvas, mimeType, settings, format) {
    return new Promise((resolve, reject) => {
        const quality = settings.quality || 0.8;
        
        // Format-specific optimizations
        if (mimeType === 'image/png') {
            // PNG compression - we can't control quality directly
            canvas.toBlob(resolve, mimeType);
        } else if (mimeType === 'image/avif') {
            // AVIF supports quality parameter
            canvas.toBlob(resolve, mimeType, quality);
        } else {
            // JPEG or WebP
            canvas.toBlob(resolve, mimeType, quality);
        }
        
        // Fallback with timeout
        setTimeout(() => {
            if (mimeType === 'image/webp' || mimeType === 'image/avif') {
                // Fallback to JPEG if modern format fails
                canvas.toBlob(resolve, 'image/jpeg', quality);
            } else {
                reject(new Error('Compression timeout'));
            }
        }, 10000);
    });
}

function calculateCompressionRatio(compressedSize, originalSize) {
    if (!originalSize || originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
}

// Utility function to estimate file size
function estimateFileSize(width, height, format, quality) {
    const pixels = width * height;
    let bytesPerPixel;
    
    switch (format) {
        case 'jpeg':
            bytesPerPixel = 0.5 * quality; // Rough estimate
            break;
        case 'png':
            bytesPerPixel = hasTransparency ? 4 : 2;
            break;
        case 'webp':
            bytesPerPixel = 0.3 * quality;
            break;
        case 'avif':
            bytesPerPixel = 0.2 * quality;
            break;
        default:
            bytesPerPixel = 1;
    }
    
    return Math.floor(pixels * bytesPerPixel);
}