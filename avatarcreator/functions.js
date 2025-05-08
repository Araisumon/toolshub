/**
 * functions.js
 * Advanced functions to enhance the avatar creator website with immersive, interactive, and traffic-boosting features.
 * Integrates with existing index.html and styles.css.
 */

// Load external libraries (Three.js for 3D, Socket.IO for real-time collaboration)
const threeScript = document.createElement('script');
threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
document.head.appendChild(threeScript);

const socketScript = document.createElement('script');
socketScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.1/socket.io.min.js';
document.head.appendChild(socketScript);

// Wait for DOM and external scripts to load
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Font Awesome is loaded for icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Function 1: 3D Avatar Preview with WebGL
    // Replaces 2D canvas with a 3D model using Three.js
    const avatarCanvas = document.getElementById('avatarCanvas');
    if (avatarCanvas && typeof THREE !== 'undefined') {
        avatarCanvas.innerHTML = ''; // Clear 2D canvas content
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: avatarCanvas, alpha: true });
        renderer.setSize(300, 300);

        // Simple 3D head model (placeholder, replace with actual model)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x4a6bff });
        const head = new THREE.Mesh(geometry, material);
        scene.add(head);

        camera.position.z = 2;

        // Animation loop for 3D rendering
        function animate() {
            requestAnimationFrame(animate);
            head.rotation.y += 0.01; // Auto-rotate for effect
            renderer.render(scene, camera);
        }
        animate();

        // Interactive rotation on drag
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        avatarCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        });
        avatarCanvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.offsetX - previousMousePosition.x,
                    y: e.offsetY - previousMousePosition.y
                };
                head.rotation.y += deltaMove.x * 0.01;
                head.rotation.x += deltaMove.y * 0.01;
                previousMousePosition = { x: e.offsetX, y: e.offsetY };
            }
        });
        avatarCanvas.addEventListener('mouseup', () => { isDragging = false; });
        avatarCanvas.addEventListener('mouseleave', () => { isDragging = false; });
    }

    // Function 2: AI-Powered Style Suggestions
    // Suggests customization options based on user inputs (simulated with simple logic)
    const suggestButton = document.createElement('button');
    suggestButton.className = 'action-btn suggest-btn';
    suggestButton.innerHTML = '<i class="fas fa-magic"></i> Suggest Style';
    suggestButton.addEventListener('click', () => {
        const customizationSections = document.querySelectorAll('.customization-section');
        const suggestions = {
            hair: ['Curly', 'Straight', 'Wavy'],
            color: ['#ff0000', '#00ff00', '#0000ff'],
            accessory: ['Glasses', 'Hat', 'None']
        };

        customizationSections.forEach(section => {
            const inputs = section.querySelectorAll('input, button, select');
            const sectionType = section.dataset.type || 'hair'; // Assume data-type attribute exists
            if (suggestions[sectionType]) {
                const randomOption = suggestions[sectionType][Math.floor(Math.random() * suggestions[sectionType].length)];
                inputs.forEach(input => {
                    if (input.type === 'button' && input.textContent === randomOption) {
                        input.click();
                    } else if (input.type === 'color' && randomOption.startsWith('#')) {
                        input.value = randomOption;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            }
        });

        // Add sparkle effect on suggestion
        const customizationPanel = document.querySelector('.customization-panel');
        addSparkleEffect(customizationPanel);
    });

    // Append suggest button to avatar actions
    const avatarActions = document.querySelector('.avatar-actions');
    if (avatarActions) {
        avatarActions.appendChild(suggestButton);
    }

    // Function 3: Real-Time Collaboration Mode
    // Allows multiple users to collaborate on an avatar using WebSockets
    if (typeof io !== 'undefined') {
        const socket = io('https://your-socket-server.com'); // Replace with your Socket.IO server
        const collabButton = document.createElement('button');
        collabButton.className = 'action-btn collab-btn';
        collabButton.innerHTML = '<i class="fas fa-users"></i> Collaborate';
        collabButton.addEventListener('click', () => {
            const roomId = prompt('Enter a collaboration room ID:');
            if (roomId) {
                socket.emit('joinRoom', roomId);
                alert(`Joined collaboration room ${roomId}!`);

                // Listen for customization updates from other users
                socket.on('updateCustomization', (data) => {
                    const { sectionType, option } = data;
                    const section = document.querySelector(`.customization-section[data-type="${sectionType}"]`);
                    if (section) {
                        const inputs = section.querySelectorAll('input, button, select');
                        inputs.forEach(input => {
                            if (input.type === 'button' && input.textContent === option) {
                                input.click();
                            } else if (input.type === 'color' && option.startsWith('#')) {
                                input.value = option;
                                input.dispatchEvent(new Event('change'));
                            }
                        });
                    }
                });
            }
        });

        // Broadcast customization changes to other users
        document.querySelectorAll('.customization-section').forEach(section => {
            const inputs = section.querySelectorAll('input, button, select');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    const sectionType = section.dataset.type || 'hair';
                    const option = input.value || input.textContent;
                    socket.emit('updateCustomization', { roomId: socket.roomId, sectionType, option });
                });
            });
        });

        if (avatarActions) {
            avatarActions.appendChild(collabButton);
        }
    }

    // Function 4: Dynamic Background Customization
    // Allows users to customize the avatar's background with gradients or images
    const bgButton = document.createElement('button');
    bgButton.className = 'action-btn bg-btn';
    bgButton.innerHTML = '<i class="fas fa-image"></i> Change Background';
    bgButton.addEventListener('click', () => {
        const bgOptions = document.createElement('div');
        bgOptions.className = 'bg-options';
        bgOptions.innerHTML = `
            <div class="bg-option gradient" data-bg="linear-gradient(45deg, #4a6bff, #fad0e0)">Gradient</div>
            <label class="bg-option upload">
                Upload Image
                <input type="file" accept="image/*" style="display: none;">
            </label>
        `;
        document.body.appendChild(bgOptions);

        // Handle gradient selection
        bgOptions.querySelector('.gradient').addEventListener('click', () => {
            avatarCanvas.style.background = 'linear-gradient(45deg, #4a6bff, #fad0e0)';
            bgOptions.remove();
        });

        // Handle image upload
        const uploadInput = bgOptions.querySelector('input[type="file"]');
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarCanvas.style.background = `url(${event.target.result})`;
                    avatarCanvas.style.backgroundSize = 'cover';
                    bgOptions.remove();
                };
                reader.readAsDataURL(file);
            }
        });

        // Remove options on click outside
        document.addEventListener('click', (e) => {
            if (!bgOptions.contains(e.target) && e.target !== bgButton) {
                bgOptions.remove();
            }
        }, { once: true });
    });

    if (avatarActions) {
        avatarActions.appendChild(bgButton);
    }

    // Function 5: User Analytics Dashboard
    // Displays user creation history and engagement stats
    const dashboardButton = document.createElement('button');
    dashboardButton.className = 'action-btn dashboard-btn';
    dashboardButton.innerHTML = '<i class="fas fa-chart-bar"></i> My Dashboard';
    dashboardButton.addEventListener('click', () => {
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        dashboard.innerHTML = `
            <h2>Your Creation Stats</h2>
            <p>Avatars Created: <span>${localStorage.getItem('avatarCount') || 0}</span></p>
            <p>Badges Earned: <span>${document.querySelectorAll('.badge-item.unlocked').length}</span></p>
            <p>Time Spent: <span>${Math.round((localStorage.getItem('timeSpent') || 0) / 60)} minutes</span></p>
            <button class="dismiss-btn">Close</button>
        `;
        document.body.appendChild(dashboard);
        dashboard.querySelector('.dismiss-btn').addEventListener('click', () => dashboard.remove());

        // Track time spent
        const startTime = Date.now();
        const updateTime = () => {
            const timeSpent = (localStorage.getItem('timeSpent') || 0) + (Date.now() - startTime);
            localStorage.setItem('timeSpent', timeSpent);
            setTimeout(updateTime, 1000);
        };
        updateTime();
    });

    if (avatarActions) {
        avatarActions.appendChild(dashboardButton);
    }

    // Helper function to add sparkle effect (reused from previous implementation)
    function addSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * element.offsetWidth}px`;
        sparkle.style.top = `${Math.random() * element.offsetHeight}px`;
        element.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    // Existing functions (Live Preview Animation, Social Sharing, Progress Bar, Downloadable Avatar, SEO Meta Tags)
    // Live Preview Animation (updated for 3D)
    if (avatarCanvas) {
        avatarCanvas.addEventListener('mouseenter', () => {
            avatarCanvas.classList.add('hover-rotate');
        });
        avatarCanvas.addEventListener('mouseleave', () => {
            avatarCanvas.classList.remove('hover-rotate');
        });
    }

    // Social Sharing Buttons
    const shareButton = document.createElement('button');
    shareButton.className = 'action-btn share-btn';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Share Avatar';
    shareButton.setAttribute('data-tooltip', 'Share your creation!');
    shareButton.addEventListener('click', () => {
        const shareUrl = window.location.href;
        const shareText = encodeURIComponent('Check out my custom 3D avatar created on this awesome site!');
        const shareOptions = `
            <div class="share-options">
                <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" class="share-link twitter">
                    <i class="fab fa-twitter"></i> Twitter
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" class="share-link facebook">
                    <i class="fab fa-facebook-f"></i> Facebook
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" class="share-link linkedin">
                    <i class="fab fa-linkedin-in"></i> LinkedIn
                </a>
            </div>
        `;
        const shareContainer = document.createElement('div');
        shareContainer.innerHTML = shareOptions;
        document.body.appendChild(shareContainer);
        setTimeout(() => shareContainer.remove(), 5000);
        document.addEventListener('click', (e) => {
            if (!shareContainer.contains(e.target) && e.target !== shareButton) {
                shareContainer.remove();
            }
        }, { once: true });
    });

    if (avatarActions) {
        avatarActions.appendChild(shareButton);
    }

    // Gamified Progress Bar
    const customizationSections = document.querySelectorAll('.customization-section');
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
        <div class="progress-fill" style="width: 0%"></div>
        <span class="progress-text">0% Complete</span>
    `;
    const customizationPanel = document.querySelector('.customization-panel');
    if (customizationPanel && customizationSections.length > 0) {
        customizationPanel.prepend(progressBar);
        const totalSteps = customizationSections.length;
        let completedSteps = 0;
        customizationSections.forEach(section => {
            const inputs = section.querySelectorAll('input, button, select');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    if (!section.classList.contains('interacted')) {
                        section.classList.add('interacted');
                        completedSteps++;
                        const progressPercent = Math.round((completedSteps / totalSteps) * 100);
                        const progressFill = progressBar.querySelector('.progress-fill');
                        const progressText = progressBar.querySelector('.progress-text');
                        progressFill.style.width = `${progressPercent}%`;
                        progressText.textContent = `${progressPercent}% Complete`;
                        addSparkleEffect(progressBar);
                    }
                });
            });
        });
    }

    // Downloadable Avatar Option
    const downloadButton = document.createElement('button');
    downloadButton.className = 'action-btn download-btn';
    downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Avatar';
    downloadButton.addEventListener('click', () => {
        if (avatarCanvas) {
            const link = document.createElement('a');
            link.download = 'custom-avatar.png';
            link.href = avatarCanvas.toDataURL('image/png');
            link.click();
        }
    });

    if (avatarActions) {
        avatarActions.appendChild(downloadButton);
    }

    // SEO-Optimized Meta Tags
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Create and customize your unique 3D avatar with our interactive tool. Collaborate, share, and download your creations!';
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = '3D avatar creator, customize avatar, interactive avatar tool, real-time collaboration, AI avatar suggestions';
    document.head.appendChild(metaKeywords);

    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = 'Create Your Custom 3D Avatar';
    document.head.appendChild(ogTitle);

    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.content = 'Design a unique 3D avatar with real-time collaboration and AI suggestions!';
    document.head.appendChild(ogDescription);

    const ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.content = 'https://yourwebsite.com/assets/3d-avatar-preview.jpg'; // Replace with actual image URL
    document.head.appendChild(ogImage);
});