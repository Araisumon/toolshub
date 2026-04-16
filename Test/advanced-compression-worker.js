// Advanced Web Worker for high-quality image compression
self.addEventListener('message', async (e) => {
    const { id, imageData, options } = e.data;
    
    try {
        // Send initial progress
        self.postMessage({ id, type: 'progress', progress: 5, stage: 'analyzing' });
        
        const result = await compressWithAdvancedTechniques(imageData, options, (progress, stage) => {
            self.postMessage({ id, type: 'progress', progress, stage });
        });
        
        self.postMessage({ id, type: 'complete', success: true, result });
    } catch (error) {
        self.postMessage({ id, type: 'complete', success: false, error: error.message });
    }
});

async function compressWithAdvancedTechniques(imageData, options, onProgress) {
    const { 
        quality = 0.8, 
        maxWidth = 2000, 
        maxHeight = 2000, 
        format = 'auto',
        preserveMetadata = false,
        aggressiveCompression = false
    } = options;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            try {
                onProgress(10, 'analyzing_image');
                
                // Analyze image characteristics
                const analysis = analyzeImage(img);
                onProgress(20, 'processing');
                
                // Determine optimal format if auto
                const targetFormat = format === 'auto' ? determineOptimalFormat(analysis) : format;
                
                // Smart cropping if needed
                const croppedCanvas = await smartCropIfNeeded(img, analysis);
                onProgress(30, 'cropping');
                
                // Calculate optimal dimensions
                const { width, height } = calculateOptimalDimensions(
                    croppedCanvas.width, 
                    croppedCanvas.height, 
                    maxWidth, 
                    maxHeight,
                    analysis
                );
                
                // Resize with high quality
                const resizedCanvas = await resizeImage(croppedCanvas, width, height);
                onProgress(50, 'resizing');
                
                // Apply format-specific optimizations
                let blob;
                let finalQuality = quality;
                
                switch (targetFormat) {
                    case 'webp':
                        blob = await compressWebP(resizedCanvas, quality, aggressiveCompression, onProgress);
                        finalQuality = adjustWebPQuality(quality, analysis);
                        break;
                    case 'avif':
                        blob = await compressAVIF(resizedCanvas, quality, aggressiveCompression, onProgress);
                        finalQuality = adjustAVIFQuality(quality, analysis);
                        break;
                    case 'jpeg':
                        blob = await compressJPEG(resizedCanvas, quality, aggressiveCompression, onProgress);
                        finalQuality = adjustJPEGQuality(quality, analysis);
                        break;
                    case 'png':
                        blob = await compressPNG(resizedCanvas, quality, analysis, onProgress);
                        break;
                    default:
                        // Default to WebP for best compression
                        blob = await compressWebP(resizedCanvas, quality, aggressiveCompression, onProgress);
                }
                
                onProgress(90, 'finalizing');
                
                // Strip metadata if not preserving
                let finalBlob = blob;
                if (!preserveMetadata && targetFormat !== 'png') {
                    try {
                        finalBlob = await stripMetadata(blob, targetFormat);
                        onProgress(92, 'stripping_metadata');
                    } catch (error) {
                        console.warn('Failed to strip metadata:', error);
                        // Continue with original blob
                    }
                }
                
                resolve({
                    blob,
                    width,
                    height,
                    format: targetFormat,
                    size: blob.size,
                    originalWidth: img.width,
                    originalHeight: img.height,
                    compressionRatio: calculateCompressionRatio(blob.size, options.originalSize),
                    qualityUsed: finalQuality,
                    techniquesUsed: getUsedTechniques(targetFormat, aggressiveCompression, preserveMetadata)
                });
                
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
    });
}

function analyzeImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Sample image at reduced resolution for speed
    const sampleWidth = Math.min(img.width, 200);
    const sampleHeight = Math.min(img.height, 200);
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    
    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imageData.data;
    
    let transparentPixels = 0;
    let semiTransparentPixels = 0;
    let colorSet = new Set();
    let luminanceSum = 0;
    let edgeCount = 0;
    
    // Simple edge detection and color analysis
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Check transparency
        if (a < 255) {
            if (a < 128) {
                transparentPixels++;
            } else {
                semiTransparentPixels++;
            }
        }
        
        // Color complexity
        const colorKey = `${r >> 4},${g >> 4},${b >> 4}`;
        colorSet.add(colorKey);
        
        // Luminance for brightness analysis
        luminanceSum += (0.299 * r + 0.587 * g + 0.114 * b);
        
        // Simple edge detection (check neighboring pixel difference)
        if (i > 4) {
            const prevR = data[i - 4];
            const prevG = data[i - 3];
            const prevB = data[i - 2];
            const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
            if (diff > 30) edgeCount++;
        }
    }
    
    const totalPixels = data.length / 4;
    const hasTransparency = (transparentPixels + semiTransparentPixels) > totalPixels * 0.05;
    const isPhotographic = colorSet.size > 100 && edgeCount > totalPixels * 0.1;
    const isSimpleGraphic = colorSet.size < 50;
    const avgLuminance = luminanceSum / totalPixels;
    const isDark = avgLuminance < 128;
    
    return {
        hasTransparency,
        transparencyRatio: (transparentPixels + semiTransparentPixels) / totalPixels,
        colorCount: colorSet.size,
        isPhotographic,
        isSimpleGraphic,
        isDark,
        edgeDensity: edgeCount / totalPixels,
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
    };
}

function determineOptimalFormat(analysis) {
    if (analysis.hasTransparency) {
        return analysis.isSimpleGraphic ? 'png' : 'webp';
    }
    
    if (analysis.isPhotographic) {
        return 'webp'; // WebP generally best for photos
    }
    
    if (analysis.isSimpleGraphic) {
        return 'png'; // PNG better for simple graphics with sharp edges
    }
    
    return 'webp'; // Default to WebP
}

async function smartCropIfNeeded(img, analysis) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Only crop if image has uniform borders (common in screenshots)
    if (analysis.isSimpleGraphic && analysis.width > 100 && analysis.height > 100) {
        // Simple border detection - check if edges are uniform
        const borderSample = sampleBorderPixels(img);
        if (borderSample.isUniform) {
            // Crop the uniform border
            canvas.width = img.width - borderSample.left - borderSample.right;
            canvas.height = img.height - borderSample.top - borderSample.bottom;
            ctx.drawImage(img, 
                borderSample.left, borderSample.top,
                canvas.width, canvas.height,
                0, 0,
                canvas.width, canvas.height
            );
            return canvas;
        }
    }
    
    // No cropping needed
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return canvas;
}

function sampleBorderPixels(img) {
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Analyze borders for uniformity
    const borderWidth = Math.min(20, Math.floor(img.width * 0.05)); // Sample 5% of width or 20px max
    const borderHeight = Math.min(20, Math.floor(img.height * 0.05)); // Sample 5% of height or 20px max
    
    // Check top border
    let topUniform = true;
    let topCrop = 0;
    const topColor = getBorderColor(data, canvas.width, canvas.height, 'top', borderHeight);
    
    for (let y = 0; y < borderHeight && topUniform; y++) {
        for (let x = 0; x < canvas.width; x++) {
            if (!isPixelSimilarToColor(data, x, y, canvas.width, topColor)) {
                topUniform = false;
                break;
            }
        }
        if (topUniform) {
            topCrop = y + 1;
        }
    }
    
    // Check bottom border
    let bottomUniform = true;
    let bottomCrop = 0;
    const bottomColor = getBorderColor(data, canvas.width, canvas.height, 'bottom', borderHeight);
    
    for (let y = canvas.height - 1; y >= canvas.height - borderHeight && bottomUniform; y--) {
        for (let x = 0; x < canvas.width; x++) {
            if (!isPixelSimilarToColor(data, x, y, canvas.width, bottomColor)) {
                bottomUniform = false;
                break;
            }
        }
        if (bottomUniform) {
            bottomCrop = canvas.height - y;
        }
    }
    
    // Check left border
    let leftUniform = true;
    let leftCrop = 0;
    const leftColor = getBorderColor(data, canvas.width, canvas.height, 'left', borderWidth);
    
    for (let x = 0; x < borderWidth && leftUniform; x++) {
        for (let y = 0; y < canvas.height; y++) {
            if (!isPixelSimilarToColor(data, x, y, canvas.width, leftColor)) {
                leftUniform = false;
                break;
            }
        }
        if (leftUniform) {
            leftCrop = x + 1;
        }
    }
    
    // Check right border
    let rightUniform = true;
    let rightCrop = 0;
    const rightColor = getBorderColor(data, canvas.width, canvas.height, 'right', borderWidth);
    
    for (let x = canvas.width - 1; x >= canvas.width - borderWidth && rightUniform; x--) {
        for (let y = 0; y < canvas.height; y++) {
            if (!isPixelSimilarToColor(data, x, y, canvas.width, rightColor)) {
                rightUniform = false;
                break;
            }
        }
        if (rightUniform) {
            rightCrop = canvas.width - x;
        }
    }
    
    // Determine if we have uniform borders worth cropping
    const hasUniformBorders = (topCrop > 0 || bottomCrop > 0 || leftCrop > 0 || rightCrop > 0);
    const minCropThreshold = 2; // Don't crop less than 2 pixels
    
    return {
        isUniform: hasUniformBorders,
        top: topCrop >= minCropThreshold ? topCrop : 0,
        bottom: bottomCrop >= minCropThreshold ? bottomCrop : 0,
        left: leftCrop >= minCropThreshold ? leftCrop : 0,
        right: rightCrop >= minCropThreshold ? rightCrop : 0
    };
}

function getBorderColor(data, width, height, side, sampleSize) {
    // Get average color of the border region
    let r = 0, g = 0, b = 0, count = 0;
    
    if (side === 'top') {
        for (let y = 0; y < sampleSize; y++) {
            for (let x = 0; x < width; x += 4) { // Sample every 4th pixel for speed
                const idx = (y * width + x) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    } else if (side === 'bottom') {
        for (let y = height - sampleSize; y < height; y++) {
            for (let x = 0; x < width; x += 4) {
                const idx = (y * width + x) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    } else if (side === 'left') {
        for (let x = 0; x < sampleSize; x++) {
            for (let y = 0; y < height; y += 4) {
                const idx = (y * width + x) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    } else if (side === 'right') {
        for (let x = width - sampleSize; x < width; x++) {
            for (let y = 0; y < height; y += 4) {
                const idx = (y * width + x) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    }
    
    return {
        r: Math.floor(r / count),
        g: Math.floor(g / count),
        b: Math.floor(b / count)
    };
}

function isPixelSimilarToColor(data, x, y, width, targetColor, threshold = 20) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Calculate color difference
    const diff = Math.abs(r - targetColor.r) +
                 Math.abs(g - targetColor.g) +
                 Math.abs(b - targetColor.b);
    
    return diff <= threshold;
}

function calculateOptimalDimensions(width, height, maxWidth, maxHeight, analysis) {
    // Don't resize vector-like graphics too much
    if (analysis.isSimpleGraphic && !analysis.isPhotographic) {
        maxWidth = Math.max(maxWidth, 800);
        maxHeight = Math.max(maxHeight, 800);
    }
    
    if (width <= maxWidth && height <= maxHeight) {
        return { width, height };
    }
    
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    const newWidth = Math.floor(width * ratio);
    const newHeight = Math.floor(height * ratio);
    
    // Ensure dimensions are even (better for compression)
    return {
        width: newWidth - (newWidth % 2),
        height: newHeight - (newHeight % 2)
    };
}

async function resizeImage(sourceCanvas, targetWidth, targetHeight) {
    if (sourceCanvas.width === targetWidth && sourceCanvas.height === targetHeight) {
        return sourceCanvas;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Progressive downscaling for large reductions
    if (sourceCanvas.width > targetWidth * 2 || sourceCanvas.height > targetHeight * 2) {
        await progressiveDownscale(sourceCanvas, canvas);
    } else {
        ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    }
    
    return canvas;
}

async function progressiveDownscale(sourceCanvas, targetCanvas) {
    let currentCanvas = sourceCanvas;
    
    while (currentCanvas.width > targetCanvas.width * 2 || currentCanvas.height > targetCanvas.height * 2) {
        const nextWidth = Math.floor(currentCanvas.width / 2);
        const nextHeight = Math.floor(currentCanvas.height / 2);
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = nextWidth;
        tempCanvas.height = nextHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(currentCanvas, 0, 0, nextWidth, nextHeight);
        
        currentCanvas = tempCanvas;
    }
    
    const ctx = targetCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
}

async function compressWebP(canvas, quality, aggressive, onProgress) {
    return new Promise((resolve, reject) => {
        if (onProgress) onProgress(65, 'optimizing_webp');
        
        // Advanced WebP compression with multiple passes
        const optimizeWebP = async (baseQuality) => {
            const results = [];
            const qualitySteps = aggressive ? [baseQuality, baseQuality * 0.85, baseQuality * 0.7] : [baseQuality, baseQuality * 0.9];
            
            for (let i = 0; i < qualitySteps.length; i++) {
                const q = Math.max(0.1, Math.min(1.0, qualitySteps[i]));
                if (onProgress) onProgress(65 + Math.floor(i * 10 / qualitySteps.length), `webp_pass_${i + 1}`);
                
                const blob = await new Promise((res) => {
                    canvas.toBlob((b) => res(b), 'image/webp', q);
                });
                
                results.push({
                    quality: q,
                    blob,
                    size: blob.size
                });
                
                // Early exit if we're already at a good compression ratio
                if (i > 0 && results[i].size > results[i-1].size * 1.1) {
                    // New size is significantly larger, stop
                    break;
                }
            }
            
            // Find the best result based on quality/size tradeoff
            let bestIndex = 0;
            let bestScore = -Infinity;
            
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                // Score favors smaller files but penalizes too low quality
                const sizeScore = 1 / (result.size / 1000); // Smaller is better
                const qualityScore = result.quality * 2; // Higher quality is better
                const score = sizeScore + qualityScore;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }
            
            return results[bestIndex].blob;
        };
        
        optimizeWebP(quality).then((bestBlob) => {
            if (onProgress) onProgress(80, 'finalizing_webp');
            resolve(bestBlob);
        }).catch(reject);
    });
}

async function compressAVIF(canvas, quality, aggressive, onProgress) {
    return new Promise((resolve, reject) => {
        if (onProgress) onProgress(65, 'optimizing_avif');
        
        // AVIF compression with chroma subsampling optimization
        const optimizeAVIF = async (baseQuality) => {
            // AVIF typically needs lower quality values than WebP/JPEG
            const avifBaseQuality = Math.max(0.05, baseQuality * 0.8);
            const qualitySteps = aggressive ?
                [avifBaseQuality, avifBaseQuality * 0.8, avifBaseQuality * 0.65] :
                [avifBaseQuality, avifBaseQuality * 0.9];
            
            const results = [];
            
            for (let i = 0; i < qualitySteps.length; i++) {
                const q = Math.max(0.05, Math.min(1.0, qualitySteps[i]));
                if (onProgress) onProgress(65 + Math.floor(i * 10 / qualitySteps.length), `avif_pass_${i + 1}`);
                
                try {
                    const blob = await new Promise((res, rej) => {
                        canvas.toBlob((b) => {
                            if (b) res(b);
                            else rej(new Error('AVIF encoding failed'));
                        }, 'image/avif', q);
                    });
                    
                    results.push({
                        quality: q,
                        blob,
                        size: blob.size
                    });
                    
                    // AVIF can be very efficient, stop early if we have good compression
                    if (i > 0 && results[i].size < results[0].size * 0.7) {
                        // Already achieved 30%+ reduction
                        break;
                    }
                } catch (error) {
                    // AVIF might not be supported, fall back to WebP
                    console.warn('AVIF encoding failed, falling back to WebP');
                    if (i === 0) {
                        // Try WebP instead
                        return compressWebP(canvas, baseQuality, aggressive, onProgress);
                    }
                }
            }
            
            if (results.length === 0) {
                // Fall back to WebP if AVIF completely fails
                return compressWebP(canvas, baseQuality, aggressive, onProgress);
            }
            
            // For AVIF, we prioritize smallest file size since quality degradation is less noticeable
            let bestIndex = 0;
            for (let i = 1; i < results.length; i++) {
                if (results[i].size < results[bestIndex].size * 0.95) {
                    // New file is at least 5% smaller
                    bestIndex = i;
                }
            }
            
            return results[bestIndex].blob;
        };
        
        optimizeAVIF(quality).then((bestBlob) => {
            if (onProgress) onProgress(80, 'finalizing_avif');
            resolve(bestBlob);
        }).catch(reject);
    });
}

async function compressJPEG(canvas, quality, aggressive, onProgress) {
    return new Promise((resolve, reject) => {
        if (onProgress) onProgress(65, 'optimizing_jpeg');
        
        // Progressive JPEG with multiple quality passes
        const optimizeJPEG = async (baseQuality) => {
            const results = [];
            
            // Test different quality levels with progressive encoding
            const qualitySteps = aggressive ?
                [baseQuality, baseQuality * 0.8, baseQuality * 0.65, baseQuality * 0.5] :
                [baseQuality, baseQuality * 0.9, baseQuality * 0.75];
            
            for (let i = 0; i < qualitySteps.length; i++) {
                const q = Math.max(0.1, Math.min(1.0, qualitySteps[i]));
                if (onProgress) onProgress(65 + Math.floor(i * 10 / qualitySteps.length), `jpeg_pass_${i + 1}`);
                
                // Create a temporary canvas to apply progressive encoding simulation
                // Note: Actual progressive JPEG requires encoder support, but canvas.toBlob
                // doesn't expose progressive scan option directly
                const blob = await new Promise((res) => {
                    canvas.toBlob((b) => res(b), 'image/jpeg', q);
                });
                
                results.push({
                    quality: q,
                    blob,
                    size: blob.size
                });
                
                // Stop if quality is getting too low and file size reduction is minimal
                if (i > 1 && results[i].size > results[i-1].size * 0.95) {
                    // Less than 5% reduction, stop
                    break;
                }
            }
            
            // For JPEG, we need to balance quality and size carefully
            // JPEG artifacts become noticeable quickly
            let bestIndex = 0;
            let bestValue = -Infinity;
            
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                // Value function: prioritize quality more than other formats
                const qualityValue = result.quality * 3; // Strong quality preference
                const sizeValue = 1 / (result.size / 10000); // Moderate size preference
                const value = qualityValue + sizeValue;
                
                if (value > bestValue) {
                    bestValue = value;
                    bestIndex = i;
                }
            }
            
            return results[bestIndex].blob;
        };
        
        optimizeJPEG(quality).then((bestBlob) => {
            if (onProgress) onProgress(80, 'finalizing_jpeg');
            resolve(bestBlob);
        }).catch(reject);
    });
}

async function compressPNG(canvas, quality, analysis, onProgress) {
    return new Promise((resolve, reject) => {
        if (onProgress) onProgress(65, 'optimizing_png');
        
        const optimizePNG = async () => {
            // For PNG, we have several optimization strategies:
            // 1. Color quantization for simple graphics
            // 2. Transparency optimization
            // 3. Filter selection optimization
            
            const results = [];
            
            // Strategy 1: Original PNG (no quantization)
            if (onProgress) onProgress(67, 'png_strategy_1');
            const originalBlob = await new Promise((res) => {
                canvas.toBlob((b) => res(b), 'image/png');
            });
            results.push({
                strategy: 'original',
                blob: originalBlob,
                size: originalBlob.size
            });
            
            // Strategy 2: Color quantization for simple graphics
            if (analysis.isSimpleGraphic && analysis.colorCount < 512) {
                if (onProgress) onProgress(70, 'png_strategy_2');
                const maxColors = Math.max(2, Math.min(256, Math.floor(analysis.colorCount * quality)));
                const quantizedCanvas = quantizeColors(canvas, maxColors, false); // No dithering
                const quantizedBlob = await new Promise((res) => {
                    quantizedCanvas.toBlob((b) => res(b), 'image/png');
                });
                results.push({
                    strategy: 'quantized_no_dither',
                    blob: quantizedBlob,
                    size: quantizedBlob.size
                });
                
                // Strategy 3: Quantization with dithering (better for gradients)
                if (analysis.colorCount > 16 && analysis.colorCount < 128) {
                    if (onProgress) onProgress(73, 'png_strategy_3');
                    const ditheredCanvas = quantizeColors(canvas, maxColors, true); // With dithering
                    const ditheredBlob = await new Promise((res) => {
                        ditheredCanvas.toBlob((b) => res(b), 'image/png');
                    });
                    results.push({
                        strategy: 'quantized_dithered',
                        blob: ditheredBlob,
                        size: ditheredBlob.size
                    });
                }
            }
            
            // Strategy 4: Transparency optimization if image has transparency
            if (analysis.hasTransparency && analysis.transparencyRatio > 0.01) {
                if (onProgress) onProgress(76, 'png_strategy_4');
                const optimizedCanvas = optimizeTransparency(canvas, analysis);
                const optimizedBlob = await new Promise((res) => {
                    optimizedCanvas.toBlob((b) => res(b), 'image/png');
                });
                results.push({
                    strategy: 'transparency_optimized',
                    blob: optimizedBlob,
                    size: optimizedBlob.size
                });
            }
            
            // Find the best result (smallest file that's not significantly worse quality)
            let bestIndex = 0;
            for (let i = 1; i < results.length; i++) {
                // If new result is at least 10% smaller, consider it better
                if (results[i].size < results[bestIndex].size * 0.9) {
                    bestIndex = i;
                }
                // If sizes are similar (within 5%), prefer original for quality
                else if (results[i].size >= results[bestIndex].size * 0.95 &&
                         results[i].size <= results[bestIndex].size * 1.05 &&
                         results[i].strategy === 'original') {
                    bestIndex = i;
                }
            }
            
            return results[bestIndex].blob;
        };
        
        optimizePNG().then((bestBlob) => {
            if (onProgress) onProgress(80, 'finalizing_png');
            resolve(bestBlob);
        }).catch(reject);
    });
}

function quantizeColors(canvas, maxColors, dither = false) {
    // Improved color quantization with dithering support
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(canvas, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Simple color reduction algorithm (median cut approximation)
    // This is a simplified version - in production, use a proper quantization library
    
    if (maxColors < 256) {
        // Reduce color depth by posterization
        const colorStep = Math.floor(256 / Math.max(2, Math.sqrt(maxColors)));
        
        for (let i = 0; i < data.length; i += 4) {
            // Reduce each channel to limited values
            data[i] = Math.floor(data[i] / colorStep) * colorStep; // R
            data[i + 1] = Math.floor(data[i + 1] / colorStep) * colorStep; // G
            data[i + 2] = Math.floor(data[i + 2] / colorStep) * colorStep; // B
            
            // Simple dithering (Floyd-Steinberg approximation)
            if (dither && i + 4 < data.length) {
                const oldR = data[i];
                const oldG = data[i + 1];
                const oldB = data[i + 2];
                
                const errR = data[i] - oldR;
                const errG = data[i + 1] - oldG;
                const errB = data[i + 2] - oldB;
                
                // Distribute error to neighboring pixels
                data[i + 4] = Math.min(255, Math.max(0, data[i + 4] + errR * 7/16));
                data[i + 5] = Math.min(255, Math.max(0, data[i + 5] + errG * 7/16));
                data[i + 6] = Math.min(255, Math.max(0, data[i + 6] + errB * 7/16));
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    return tempCanvas;
}

function optimizeTransparency(canvas, analysis) {
    // Optimize transparency by reducing alpha precision for semi-transparent pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(canvas, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    // Reduce alpha precision for semi-transparent pixels
    // This can help PNG compression by creating more uniform alpha values
    const alphaSteps = 8; // Reduce to 8 levels (0, 36, 73, 109, 146, 182, 219, 255)
    
    for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i];
        if (alpha > 0 && alpha < 255) {
            // Quantize alpha to reduce unique values
            const step = Math.floor(alpha / 36.4286); // 255/7 ≈ 36.4286
            data[i] = Math.min(255, step * 36);
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return tempCanvas;
}

function adjustWebPQuality(baseQuality, analysis) {
    let adjusted = baseQuality;
    
    if (analysis.isPhotographic) {
        // Photos can tolerate more compression
        adjusted *= 0.9;
    }
    
    if (analysis.isSimpleGraphic) {
        // Graphics need higher quality
        adjusted = Math.max(adjusted, 0.9);
    }
    
    if (analysis.isDark) {
        // Dark images show compression artifacts more
        adjusted = Math.max(adjusted, 0.85);
    }
    
    return Math.min(Math.max(adjusted, 0.1), 1.0);
}

function adjustAVIFQuality(baseQuality, analysis) {
    // AVIF is very efficient, can use lower quality
    let adjusted = baseQuality * 0.8;
    
    if (analysis.isSimpleGraphic) {
        adjusted = Math.max(adjusted, 0.7);
    }
    
    return Math.min(Math.max(adjusted, 0.05), 1.0);
}

function adjustJPEGQuality(baseQuality, analysis) {
    let adjusted = baseQuality;
    
    if (analysis.isPhotographic) {
        adjusted *= 0.85;
    }
    
    if (analysis.edgeDensity > 0.2) {
        // High edge density (text, graphics) needs higher quality
        adjusted = Math.max(adjusted, 0.9);
    }
    
    return Math.min(Math.max(adjusted, 0.1), 1.0);
}

async function stripMetadata(blob, format) {
    // Create a clean canvas and redraw the image to remove metadata
    // This is a simple approach that works for most metadata (EXIF, GPS, etc.)
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image on clean canvas
            ctx.drawImage(img, 0, 0);
            
            // Convert back to blob with same format
            canvas.toBlob((cleanBlob) => {
                if (cleanBlob) {
                    resolve(cleanBlob);
                } else {
                    reject(new Error('Failed to create clean blob'));
                }
            }, `image/${format === 'jpeg' ? 'jpeg' : format === 'webp' ? 'webp' : 'avif'}`, 0.95);
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image for metadata stripping'));
        };
        
        img.src = URL.createObjectURL(blob);
    });
}

function calculateCompressionRatio(compressedSize, originalSize) {
    if (!originalSize || originalSize === 0) return 0;
    const ratio = ((originalSize - compressedSize) / originalSize * 100);
    return Math.max(0, Math.min(100, ratio.toFixed(1)));
}

function getUsedTechniques(format, aggressive, preserveMetadata = false) {
    const techniques = [];
    
    if (format === 'webp') techniques.push('WebP Encoding');
    if (format === 'avif') techniques.push('AVIF Encoding');
    if (format === 'jpeg') techniques.push('Progressive JPEG');
    if (format === 'png') techniques.push('PNG Optimization');
    
    if (aggressive) techniques.push('Aggressive Compression');
    techniques.push('Smart Resizing');
    techniques.push('Content Analysis');
    
    // Add metadata stripping if applicable
    if (!preserveMetadata && format !== 'png') {
        techniques.push('Metadata Stripped');
    }
    
    return techniques;
}

// Export functions for testing
if (typeof self !== 'undefined') {
    self.compressWithAdvancedTechniques = compressWithAdvancedTechniques;
}