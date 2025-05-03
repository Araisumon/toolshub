document.addEventListener('DOMContentLoaded', function() {
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.setAttribute('data-theme', 
            body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    // File Upload Handling
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const inputSize = document.getElementById('inputSize');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('conversionProgress');
    const progressText = document.getElementById('progressText');

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    async function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            
            // Validate file type
            if (!file.type.includes('pdf')) {
                alert('Please select a PDF file');
                return;
            }

            // Display file size
            inputSize.textContent = formatFileSize(file.size);
            
            // Set default output filename
            const customFilename = document.getElementById('customFilename');
            if (!customFilename.value) {
                customFilename.value = file.name.replace('.pdf', '');
            }

            // Preview file
            await previewFile(file);

            // Enable convert button
            convertBtn.disabled = false;
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function previewFile(file) {
        try {
            const previewElement = document.getElementById('pdfPreview');
            previewElement.innerHTML = '<div class="loading">Loading preview...</div>';
    
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            // Get the first page
            const page = await pdf.getPage(1);
            
            // Calculate scale to fit the preview window
            const previewWidth = previewElement.clientWidth;
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = previewWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });
    
            // Prepare canvas for rendering
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
    
            // Render PDF page to canvas
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            previewElement.innerHTML = '';
            previewElement.appendChild(canvas);
        } catch (error) {
            console.error('Preview error:', error);
            previewElement.innerHTML = 
                '<div class="error">Error loading preview. Please ensure the file is a valid PDF.</div>';
        }
    }

    // Convert Button Handler
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = true;

    // Convert Button Handler
    convertBtn.addEventListener('click', async () => {
        const files = fileInput.files;
        if (!files.length) {
            alert('Please select a PDF file first');
            return;
        }

        const outputFormat = document.getElementById('outputFormat').value;
        const ocrEnabled = document.getElementById('ocrEnabled').checked;
        const preserveLinks = document.getElementById('preserveLinks').checked;
        const customFilename = document.getElementById('customFilename').value || files[0].name.replace('.pdf', '');

        try {
            convertBtn.disabled = true;
            progressContainer.style.display = 'block';

            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            let textContent = '';
            let links = [];
            let images = [];

            // Extract text, links, and images from each page
            for (let i = 1; i <= numPages; i++) {
                const progress = Math.round((i / numPages) * 50);
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                try {
                    if (ocrEnabled) {
                        const result = await Tesseract.recognize(canvas);
                        textContent += result.data.text + '\n\n';
                    } else {
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => ({
                            text: item.str,
                            fontSize: Math.abs(item.transform[0]) || 12,
                            fontFamily: item.fontName || 'Arial'
                        }));

                        // Group text by style
                        let currentParagraph = [];
                        let currentStyle = null;

                        pageText.forEach(item => {
                            if (!currentStyle || 
                                Math.abs(currentStyle.fontSize - item.fontSize) > 0.1 || 
                                currentStyle.fontFamily !== item.fontFamily) {
                                if (currentParagraph.length > 0) {
                                    textContent += currentParagraph.join(' ') + '\n\n';
                                    currentParagraph = [];
                                }
                                currentStyle = {
                                    fontSize: item.fontSize,
                                    fontFamily: item.fontFamily
                                };
                            }
                            currentParagraph.push(item.text);
                        });

                        if (currentParagraph.length > 0) {
                            textContent += currentParagraph.join(' ') + '\n\n';
                        }
                    }

                    // Extract images safely
                    if (page.objs) {
                        const operatorList = await page.getOperatorList();
                        for (let j = 0; j < operatorList.fnArray.length; j++) {
                            if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                                try {
                                    const imgData = await page.objs.get(operatorList.argsArray[j][0]);
                                    if (imgData && imgData.data && imgData.data.buffer) {
                                        images.push({
                                            data: imgData,
                                            width: Math.min(imgData.width || 300, 800),
                                            height: Math.min(imgData.height || 300, 800)
                                        });
                                    }
                                } catch (imgError) {
                                    console.warn('Image extraction error:', imgError);
                                }
                            }
                        }
                    }

                    if (preserveLinks) {
                        const annotations = await page.getAnnotations();
                        links = links.concat(
                            annotations.filter(a => a.subtype === 'Link' && (a.url || a.unsafeUrl))
                        );
                    }
                } catch (pageError) {
                    console.warn(`Error processing page ${i}:`, pageError);
                }
            }

            // Create document based on output format
            let outputBlob;
            const progress = 75;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;

            switch (outputFormat) {
                case 'docx': {
                    // REMOVED MISPLACED SCRIPT TAGS FROM HERE
                    try {
                        // Ensure docx library is loaded - THIS CHECK IS CORRECT
                        if (typeof window.docx === 'undefined') {
                            throw new Error('DOCX library not loaded. Please check your internet connection and reload the page.');
                        }

                        const doc = new window.docx.Document({
                            sections: [{
                                properties: {
                                    page: {
                                        margin: {
                                            top: 1440,
                                            right: 1440,
                                            bottom: 1440,
                                            left: 1440
                                        }
                                    }
                                },
                                children: []
                            }]
                        });

                        // Split content into paragraphs and remove empty ones
                        const paragraphs = textContent.split('\n\n')
                            .map(text => text.trim())
                            .filter(text => text.length > 0);

                        // Add paragraphs with proper formatting
                        paragraphs.forEach(text => {
                            doc.addParagraph(
                                new window.docx.Paragraph({
                                    children: [
                                        new window.docx.TextRun({
                                            text: text,
                                            size: 24,
                                            font: "Arial"
                                        })
                                    ],
                                    spacing: {
                                        before: 200,
                                        after: 200,
                                        line: 360
                                    },
                                    alignment: window.docx.AlignmentType.JUSTIFIED
                                })
                            );
                        });

                        // Add images safely
                        for (const img of images) {
                            try {
                                if (img.data && img.data.data && img.data.data.buffer) {
                                    const imageBuffer = new Uint8Array(img.data.data.buffer);
                                    doc.addParagraph(
                                        new window.docx.Paragraph({
                                            children: [
                                                new window.docx.ImageRun({
                                                    data: imageBuffer,
                                                    transformation: {
                                                        width: img.width,
                                                        height: img.height
                                                    }
                                                })
                                            ],
                                            spacing: {
                                                before: 200,
                                                after: 200
                                            }
                                        })
                                    );
                                }
                            } catch (imgError) {
                                console.warn('Image insertion error:', imgError);
                            }
                        }

                        // Add hyperlinks safely
                        if (preserveLinks && links.length > 0) {
                            links.forEach(link => {
                                if (link.url || link.unsafeUrl) {
                                    try {
                                        doc.addParagraph(
                                            new window.docx.Paragraph({
                                                children: [
                                                    new window.docx.ExternalHyperlink({
                                                        children: [
                                                            new window.docx.TextRun({
                                                                text: link.url || link.unsafeUrl,
                                                                style: "Hyperlink",
                                                                color: "0000FF",
                                                                underline: {
                                                                    type: window.docx.UnderlineType.SINGLE
                                                                }
                                                            })
                                                        ],
                                                        link: link.url || link.unsafeUrl
                                                    })
                                                ],
                                                spacing: {
                                                    before: 200,
                                                    after: 200
                                                }
                                            })
                                        );
                                    } catch (linkError) {
                                        console.warn('Hyperlink insertion error:', linkError);
                                    }
                                }
                            });
                        }

                        outputBlob = await window.docx.Packer.toBlob(doc);
                    } catch (docxError) {
                        throw new Error(`DOCX creation failed: ${docxError.message}`);
                    }
                    break;
                }
                case 'doc':
                case 'txt': {
                    try {
                        let content = textContent;
                        if (preserveLinks && links.length > 0) {
                            content += '\n\nHyperlinks:\n';
                            links.forEach(link => {
                                if (link.url || link.unsafeUrl) {
                                    content += `${link.url || link.unsafeUrl}\n`;
                                }
                            });
                        }
                        outputBlob = new Blob([content], { 
                            type: outputFormat === 'doc' ? 'application/msword' : 'text/plain' 
                        });
                    } catch (textError) {
                        throw new Error(`Text document creation failed: ${textError.message}`);
                    }
                    break;
                }
            }

            if (!outputBlob) {
                throw new Error('Failed to create output document');
            }

            // Update output size
            document.getElementById('outputSize').textContent = formatFileSize(outputBlob.size);

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(outputBlob);
            downloadLink.download = `${customFilename}.${outputFormat}`;

            // Complete progress
            progressBar.style.width = '100%';
            progressText.textContent = '100%';

            // Trigger download
            downloadLink.click();
            
            alert('Conversion completed! Your file is being downloaded.');
        } catch (error) {
            console.error('Conversion error:', error);
            alert(`Error during conversion: ${error.message || 'Please try again.'}`);
        } finally {
            convertBtn.disabled = false;
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
        }
    });

    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.social-icons a');
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            let shareUrl;

            switch (true) {
                case button.title.includes('Facebook'):
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case button.title.includes('Twitter'):
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case button.title.includes('LinkedIn'):
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                    break;
                case button.title.includes('Email'):
                    shareUrl = `mailto:?subject=${title}&body=${url}`;
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // Reset Button Handler
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        document.getElementById('inputSize').textContent = '0 KB';
        document.getElementById('outputSize').textContent = '0 KB';
        document.getElementById('pdfPreview').innerHTML = '';
        document.getElementById('customFilename').value = '';
        document.getElementById('ocrEnabled').checked = false;
        document.getElementById('preserveLinks').checked = true;
        convertBtn.disabled = true;
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    });

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});