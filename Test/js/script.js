// Global variables
let posts = [];
let currentUser = null;
const categories = ["Technology", "Finance & Trading", "Lifestyle", "Creative & Cultural", "Business & Marketing"];

// Theme management
let currentTheme = localStorage.getItem('buzzBlogTheme') || 'light';

// Apply saved theme on page load
function applyTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle')?.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    } else {
        document.body.classList.remove('dark-theme');
        document.getElementById('theme-toggle')?.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }
}

// Toggle theme function
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('buzzBlogTheme', currentTheme);
    applyTheme();
}

// Navigation functions
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

// Utility functions
function wordCount(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function truncateText(text, limit) {
    const words = text.split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Encryption functions for user authentication
function encryptPassword(password) {
    // Simple encryption for demo purposes
    // In a real app, use a proper hashing library
    return btoa(password.split('').reverse().join(''));
}

function checkPassword(password, hash) {
    return encryptPassword(password) === hash;
}

// Local storage functions
function saveData() {
    localStorage.setItem('buzzBlogPosts', JSON.stringify(posts));
}

function loadData() {
    try {
        const savedPosts = localStorage.getItem('buzzBlogPosts');
        let parsedPosts = null;

        if (savedPosts) {
            try {
                // Attempt to parse the saved posts
                parsedPosts = JSON.parse(savedPosts);
            } catch (e) {
                console.error("Error parsing posts from localStorage:", e);
                // If parsing fails, log error and ensure we fall back to sample data
                // Optionally, one might want to clear the corrupted item:
                // localStorage.removeItem('buzzBlogPosts');
                parsedPosts = null; 
            }
        }

        // Check if parsing was successful and resulted in an array
        if (parsedPosts && Array.isArray(parsedPosts)) {
            posts = parsedPosts;
        } else {
            // If no saved posts, parsing failed, or data wasn't an array, load sample posts
            if (savedPosts && !(parsedPosts && Array.isArray(parsedPosts))) {
                // This condition means there was something in localStorage but it was invalid
                console.log("Invalid data found in localStorage. Loading sample posts instead.");
            } else if (!savedPosts) {
                // This means localStorage was empty
                console.log("No posts found in localStorage. Loading sample posts.");
            }
            
            posts = [
                {
                    id: 'sample1',
                    title: 'Welcome to Buzz Blog',
                    image: 'https://source.unsplash.com/random/800x600/?blog',
                    content: 'Welcome to Buzz Blog! This is a sample post to demonstrate the functionality of this blog platform. Here you can share your thoughts, ideas, and stories with the world. The platform includes features like liking, disliking, and sharing posts. You can also read more about a post by clicking the "Read More" button if the post is longer than 100 words. We hope you enjoy using Buzz Blog!',
                    likes: 5,
                    dislikes: 1,
                    date: new Date().toISOString(),
                    category: 'Technology'
                },
                {
                    id: 'sample2',
                    title: 'Getting Started with Blogging',
                    image: 'https://source.unsplash.com/random/800x600/?writing',
                    content: 'Blogging is a great way to share your thoughts and connect with people around the world. To get started with blogging, you need to choose a niche that you are passionate about. This could be anything from technology to cooking, travel, or personal development. Once you have chosen your niche, start creating content that provides value to your readers. Be consistent with your posting schedule and engage with your audience through comments and social media. Remember, the key to successful blogging is authenticity and providing value to your readers. Happy blogging!',
                    likes: 10,
                    dislikes: 2,
                    date: new Date().toISOString(),
                    category: 'Business & Marketing'
                }
            ];
            saveData(); // Save the fresh sample data (or re-save if it was corrupt)
        }
        
        // Always hide loading message when data loading completes
        hideLoadingMessage();
    } catch (e) {
        console.error('Critical loading error:', e);
    } finally {
        hideLoadingMessage();
    }
    // No need for fallback timeout here as we already have one in the DOMContentLoaded event
}

// User authentication
const adminUser = {
    username: 'Admin',
    passwordHash: encryptPassword('454@356##8hkP')
};

function login(username, password) {
    if (username === adminUser.username && checkPassword(password, adminUser.passwordHash)) {
        currentUser = adminUser;
        localStorage.setItem('buzzBlogUser', JSON.stringify({ username: adminUser.username }));
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('buzzBlogUser');
    window.location.href = 'index.html';
}

function checkLoggedIn() {
    const user = localStorage.getItem('buzzBlogUser');
    if (user) {
        currentUser = JSON.parse(user);
        return true;
    }
    return false;
}

// Featured Posts Rendering
function renderFeaturedPosts() {
    const featuredPostsContainer = document.getElementById('featured-posts');
    if (!featuredPostsContainer) return;

    featuredPostsContainer.innerHTML = '';

    // For now, let's feature the first 3 posts if available, or posts marked as featured
    // In a real scenario, you might have a flag like `post.isFeatured`
    const featured = posts.slice(0, 3); // Simple selection for now

    if (featured.length === 0) {
        featuredPostsContainer.innerHTML = '<p>No featured posts at the moment.</p>';
        return;
    }

    featured.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'featured-post-card'; // A different class for styling
        postElement.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="featured-post-image">
            <div class="featured-post-content">
                <h3 class="featured-post-title">${post.title}</h3>
                <p class="featured-post-summary">${truncateText(post.content, 20)}</p>
                <a href="index.html?id=${post.id}" class="read-more-btn">Read More</a>
            </div>
        `;
        featuredPostsContainer.appendChild(postElement);
    });
}

// Blog post rendering
// Removed view switcher functionality since we're only using compact view





// Blog post rendering
function renderPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    if (!blogPostsContainer) return;

    blogPostsContainer.innerHTML = '';

    if (posts.length === 0) {
        blogPostsContainer.innerHTML = '<div class="no-posts">No posts available. Check back later!</div>';
        return;
    }
    
    // Get active category filter
    const activeCategory = sessionStorage.getItem('activeBlogCategory') || 'all';
    const activeSort = sessionStorage.getItem('activeBlogSort') || 'latest';
    
    // Sort posts by selected sort
    let sortedPosts = [...posts];
    if (activeSort === 'latest') {
        sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (activeSort === 'oldest') {
        sortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (activeSort === 'popular') {
        sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    
    // Filter by category if not 'all'
    let filteredPosts = sortedPosts;
    if (activeCategory !== 'all') {
        filteredPosts = sortedPosts.filter(post => post.category === activeCategory);
        if (filteredPosts.length === 0) {
            blogPostsContainer.innerHTML = `<div class="no-posts">No posts available in the "${activeCategory}" category.</div>`;
            return;
        }
    }

    filteredPosts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'blog-post';
        postElement.id = `post-${post.id}`;
        postElement.setAttribute('data-id', post.id);

        // Create a small thumbnail version of the image for the header
        const thumbnailHtml = post.image ? 
            `<img src="${post.image}" alt="${post.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">` : '';

        postElement.innerHTML = `
            <div class="post-header">
                ${thumbnailHtml}
                <div class="post-header-content">
                    <h2 class="post-title">${post.title}</h2>
                    <div class="post-category"><span class="category-tag">${post.category || 'Uncategorized'}</span></div>
                </div>
                <div class="expand-indicator"><i class="fas fa-chevron-down"></i></div>
            </div>
            <div class="post-expanded-content">
                <img src="${post.image}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <div class="post-text">${post.content}</div>
                    <div class="post-actions">
                        <div class="like-buttons">
                            <button class="like-btn" title="Like this post" data-id="${post.id}">
                                <i class="fas fa-thumbs-up"></i> <span>${post.likes || 0}</span>
                            </button>
                            <button class="dislike-btn" title="Dislike this post" data-id="${post.id}">
                                <i class="fas fa-thumbs-down"></i> <span>${post.dislikes || 0}</span>
                            </button>
                        </div>
                        <button class="share-btn" title="Share this post" data-id="${post.id}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        blogPostsContainer.appendChild(postElement);
    });

    // Add event listeners for like, dislike, and share buttons
    addPostActionListeners();
    
    // Add event listeners for post expansion
    addPostExpansionListeners();
    
    // Hide loading message after rendering
    hideLoadingMessage();
}

// Add event listeners for search


function addPostActionListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering post expansion
            const postId = this.getAttribute('data-id');
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.likes = (post.likes || 0) + 1;
                this.querySelector('span').textContent = post.likes;
                saveData();
            }
        });
    });

    // Dislike buttons
    document.querySelectorAll('.dislike-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering post expansion
            const postId = this.getAttribute('data-id');
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.dislikes = (post.dislikes || 0) + 1;
                this.querySelector('span').textContent = post.dislikes;
                saveData();
            }
        });
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering post expansion
            const postId = this.getAttribute('data-id');
            const post = posts.find(p => p.id === postId);
            if (post) {
                if (navigator.share) {
                    navigator.share({
                        title: post.title,
                        text: truncateText(post.content, 30),
                        url: `${window.location.origin}/index.html?id=${post.id}`
                    }).catch(err => {
                        console.error('Share failed:', err);
                        fallbackShare(post);
                    });
                } else {
                    fallbackShare(post);
                }
            }
        });
    });
}

// Add post expansion functionality
function addPostExpansionListeners() {
    document.querySelectorAll('.blog-post .post-header').forEach(header => {
        header.addEventListener('click', function(e) {
            // Prevent event from bubbling up
            e.stopPropagation();
            
            // Get the parent post element
            const post = this.closest('.blog-post');
            
            // Toggle expanded class
            post.classList.toggle('expanded');
            
            // Update the expand indicator icon
            const indicator = this.querySelector('.expand-indicator i');
            if (post.classList.contains('expanded')) {
                indicator.classList.remove('fa-chevron-down');
                indicator.classList.add('fa-chevron-up');
            } else {
                indicator.classList.remove('fa-chevron-up');
                indicator.classList.add('fa-chevron-down');
            }
        });
    });
    
    // Prevent clicks inside the expanded content from toggling the post
    document.querySelectorAll('.blog-post .post-expanded-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

function fallbackShare(post) {
    // Fallback for browsers that don't support navigator.share
    const shareUrl = `${window.location.origin}/index.html?id=${post.id}`;
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = shareUrl;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert(`Link copied to clipboard: ${shareUrl}`);
}

// Category functions
function renderCategoryNav() {
    const categoryNav = document.getElementById('category-nav');
    if (!categoryNav) return;
    
    const activeCategory = sessionStorage.getItem('activeBlogCategory') || 'all';
    const activeSort = sessionStorage.getItem('activeBlogSort') || 'latest';
    
    categoryNav.innerHTML = '';
    // Add 'All' category
    const allCategoryLink = document.createElement('a');
    allCategoryLink.href = '#';
    allCategoryLink.className = `category-link ${activeCategory === 'all' ? 'active' : ''}`;
    allCategoryLink.textContent = 'All';
    allCategoryLink.setAttribute('data-category', 'all');
    categoryNav.appendChild(allCategoryLink);
    
    // Add each category
    categories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = '#';
        categoryLink.className = `category-link ${activeCategory === category ? 'active' : ''}`;
        categoryLink.textContent = category;
        categoryLink.setAttribute('data-category', category);
        categoryNav.appendChild(categoryLink);
    });
    
    // Sorting controls
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-controls';
    sortContainer.innerHTML = `
        <label>Sort by: </label>
        <select id="sort-select">
            <option value="latest" ${activeSort === 'latest' ? 'selected' : ''}>Latest</option>
            <option value="popular" ${activeSort === 'popular' ? 'selected' : ''}>Popular</option>
            <option value="oldest" ${activeSort === 'oldest' ? 'selected' : ''}>Oldest</option>
        </select>
    `;
    categoryNav.appendChild(sortContainer);
    
    // Add event listeners
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            sessionStorage.setItem('activeBlogCategory', category);
            // Re-render posts
            renderPosts();
            // Update active class
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.getElementById('sort-select').addEventListener('change', function(e) {
        sessionStorage.setItem('activeBlogSort', this.value);
        renderPosts();
    });
}

// Admin panel functions
// Image handling functions
function handleImageUpload() {
    // Toggle between URL and file upload tabs
    const urlTab = document.getElementById('url-tab');
    const uploadTab = document.getElementById('upload-tab');
    const urlInput = document.getElementById('url-input');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    
    if (urlTab && uploadTab) {
        urlTab.addEventListener('click', function() {
            urlTab.classList.add('active');
            uploadTab.classList.remove('active');
            urlInput.classList.add('active');
            fileInput.classList.remove('active');
        });
        
        uploadTab.addEventListener('click', function() {
            uploadTab.classList.add('active');
            urlTab.classList.remove('active');
            fileInput.classList.add('active');
            urlInput.classList.remove('active');
        });
    }
    
    // Preview image from URL
    const imageUrlInput = document.getElementById('image');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
            if (this.value) {
                imagePreview.innerHTML = `<img src="${this.value}" alt="Preview">`;
            } else {
                imagePreview.innerHTML = '';
            }
        });
    }
    
    // Preview and process uploaded image
    const imageFileInput = document.getElementById('image-file');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// Convert file to base64
function getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function renderAdminPanel() {
    const adminContainer = document.getElementById('admin-container');
    if (!adminContainer) return;

    if (!checkLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Populate category dropdown
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    // Setup image upload functionality
    handleImageUpload();

    // Render post form
    const postForm = document.getElementById('post-form');
    if (postForm) {
        const postIdInput = document.getElementById('post-id');
        const editMode = postIdInput && postIdInput.value;

        postForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // Determine which image source to use
            let imageSource = formData.get('image');
            const imageFile = document.getElementById('image-file').files[0];
            const isUploadTab = document.getElementById('upload-tab').classList.contains('active');
            
            // If using file upload and a file is selected, convert to base64
            if (isUploadTab && imageFile) {
                try {
                    imageSource = await getBase64FromFile(imageFile);
                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('Failed to process the image. Please try again.');
                    return;
                }
            }
            
            // Validate that we have an image
            if (!imageSource) {
                alert('Please provide an image URL or upload an image file.');
                return;
            }
            
            const postData = {
                title: formData.get('title'),
                image: imageSource,
                content: formData.get('content'),
                category: formData.get('category')
            };

            if (editMode) {
                // Update existing post
                const postId = formData.get('post-id');
                const postIndex = posts.findIndex(p => p.id === postId);
                if (postIndex !== -1) {
                    posts[postIndex] = {
                        ...posts[postIndex],
                        ...postData,
                        lastEdited: new Date().toISOString()
                    };
                }
            } else {
                // Create new post
                const newPost = {
                    id: generateId(),
                    ...postData,
                    likes: 0,
                    dislikes: 0,
                    date: new Date().toISOString(),
                    category: postData.category || categories[0] // Default to first category if not specified
                };
                posts.push(newPost);
            }

            saveData();
            renderPostList();
            this.reset();
            document.getElementById('image-preview').innerHTML = '';
            if (editMode) {
                // Reset form to create mode
                postIdInput.value = '';
                document.getElementById('form-title').textContent = 'Create New Post';
                document.getElementById('submit-btn').textContent = 'Create Post';
            }
        });
    }

    // Render post list
    renderPostList();
}

function renderPostList() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = '';

    if (posts.length === 0) {
        postList.innerHTML = '<div class="no-posts">No posts available. Create your first post!</div>';
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
            <div class="post-item-info">
                <div class="post-item-title">${post.title}</div>
                <div class="post-item-category">${post.category || 'Uncategorized'}</div>
            </div>
            <div class="post-item-actions">
                <button class="admin-btn edit-btn" data-id="${post.id}" title="Edit this post">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn danger delete-btn" data-id="${post.id}" title="Delete this post">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        postList.appendChild(postItem);
    });

    // Add event listeners for edit and delete buttons
    addAdminActionListeners();
}

function addAdminActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            const post = posts.find(p => p.id === postId);
            if (post) {
                // Fill form with post data
                document.getElementById('post-id').value = post.id;
                document.getElementById('title').value = post.title;
                document.getElementById('content').value = post.content;
                
                // Handle image based on source type
                const imageUrl = post.image;
                const isBase64 = imageUrl.startsWith('data:image');
                
                // Set the appropriate tab active
                if (isBase64) {
                    // It's an uploaded image
                    document.getElementById('upload-tab').click();
                } else {
                    // It's a URL
                    document.getElementById('url-tab').click();
                    document.getElementById('image').value = imageUrl;
                }
                
                // Show image preview
                document.getElementById('image-preview').innerHTML = `<img src="${imageUrl}" alt="Preview">`;
                
                // Set category dropdown
                const categorySelect = document.getElementById('category');
                if (categorySelect) {
                    categorySelect.value = post.category || categories[0];
                }
                
                document.getElementById('form-title').textContent = 'Edit Post';
                document.getElementById('submit-btn').textContent = 'Update Post';
                // Scroll to form
                document.getElementById('post-form').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this post?')) {
                const postId = this.getAttribute('data-id');
                posts = posts.filter(p => p.id !== postId);
                saveData();
                renderPostList();
            }
        });
    });
}

// Login page functions
function renderLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    if (checkLoggedIn()) {
        window.location.href = 'admin.html';
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (login(username, password)) {
            window.location.href = 'admin.html';
        } else {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.display = 'block';
        }
    });
}

// Single post page functions
function renderSinglePost() {
    const postContainer = document.getElementById('post-container');
    const blogPostsContainer = document.getElementById('blog-posts');
    const backToHomeLink = document.querySelector('.back-to-home');

    if (!postContainer || !blogPostsContainer || !backToHomeLink) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        // No post ID, ensure main blog view is shown
        blogPostsContainer.style.display = 'block';
        postContainer.style.display = 'none';
        backToHomeLink.style.display = 'none';
        document.title = 'Buzz Blog'; // Reset title
        renderPosts(); // Render the list of posts
        renderFeaturedPosts();
        return;
    }

    const post = posts.find(p => p.id === postId);

    if (!post) {
        postContainer.innerHTML = '<div class="no-posts">Post not found.</div>';
        blogPostsContainer.style.display = 'none';
        postContainer.style.display = 'block';
        backToHomeLink.style.display = 'block';
        document.title = 'Post Not Found - Buzz Blog';
        return;
    }

    // Display single post view
    blogPostsContainer.style.display = 'none';
    postContainer.style.display = 'block';
    backToHomeLink.style.display = 'block';
    document.title = `${post.title} - Buzz Blog`; // Update page title

    postContainer.innerHTML = `
        <article class="blog-post full-post">
            <h1 class="post-title">${post.title}</h1>
            <div class="post-meta">
                <span>${new Date(post.date).toLocaleDateString()}</span> | 
                <span class="category-tag">${post.category || 'Uncategorized'}</span>
            </div>
            <img src="${post.image}" alt="${post.title}" class="post-image-full">
            <div class="post-content-full">${post.content}</div>
            <div class="post-actions-full">
                <div class="like-buttons">
                    <button class="like-btn" title="Like this post" data-id="${post.id}">
                        <i class="fas fa-thumbs-up"></i> <span>${post.likes || 0}</span>
                    </button>
                    <button class="dislike-btn" title="Dislike this post" data-id="${post.id}">
                        <i class="fas fa-thumbs-down"></i> <span>${post.dislikes || 0}</span>
                    </button>
                </div>
                <button class="share-btn" title="Share this post" data-id="${post.id}">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </article>
        <div id="related-posts-container">
            <h3>Related Posts</h3>
            <div id="related-posts" class="related-posts-grid"></div>
        </div>
    `;

    // Add event listeners for like, dislike, and share buttons
    addPostActionListeners();

    // Render related posts
    if (post.category) {
        renderRelatedPosts(post.id, post.category);
    } else {
        renderRelatedPosts(post.id, null); 
    }
    hideLoadingMessage(); // Ensure loading message is hidden
}

// Old renderSinglePost function to be replaced by the one above
/*
function renderSinglePost() {
    const postContainer = document.getElementById('post-container');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<div class="error-message">Post not found</div>';
        return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
        postContainer.innerHTML = '<div class="error-message">Post not found</div>';
        return;
    }

    postContainer.innerHTML = `
        <article class="blog-post full-post">
            <img src="${post.image}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <h1 class="post-title">${post.title}</h1>
                <div class="post-category"><span class="category-tag">${post.category || 'Uncategorized'}</span></div>
                <div class="post-text">${post.content}</div>
                <div class="post-actions">
                    <div class="like-buttons">
                        <button class="like-btn" title="Like this post" data-id="${post.id}">
                            <i class="fas fa-thumbs-up"></i> <span>${post.likes || 0}</span>
                        </button>
                        <button class="dislike-btn" title="Dislike this post" data-id="${post.id}">
                            <i class="fas fa-thumbs-down"></i> <span>${post.dislikes || 0}</span>
                        </button>
                    </div>
                    <button class="share-btn" title="Share this post" data-id="${post.id}">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        </article>
    `;

    // Add event listeners for like, dislike, and share buttons
    addPostActionListeners();
}

// Old renderSinglePost function to be replaced by the one above
/*
function renderSinglePost() {
    const postContainer = document.getElementById('post-container');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<div class="error-message">Post not found</div>';
        return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
        postContainer.innerHTML = '<div class="error-message">Post not found</div>';
        return;
    }

    postContainer.innerHTML = `
        <article class="blog-post full-post">
            <img src="${post.image}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <h1 class="post-title">${post.title}</h1>
                <div class="post-category"><span class="category-tag">${post.category || 'Uncategorized'}</span></div>
                <div class="post-text">${post.content}</div>
                <div class="post-actions">
                    <div class="like-buttons">
                        <button class="like-btn" title="Like this post" data-id="${post.id}">
                            <i class="fas fa-thumbs-up"></i> <span>${post.likes || 0}</span>
                        </button>
                        <button class="dislike-btn" title="Dislike this post" data-id="${post.id}">
                            <i class="fas fa-thumbs-down"></i> <span>${post.dislikes || 0}</span>
                        </button>
                    </div>
                    <button class="share-btn" title="Share this post" data-id="${post.id}">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
        </article>
    `;

    // Add event listeners for like, dislike, and share buttons
    addPostActionListeners();
}
*/

// Related Posts Rendering
function renderRelatedPosts(currentPostId, currentPostCategory) {
    const relatedPostsContainer = document.getElementById('related-posts');
    if (!relatedPostsContainer) return;

    relatedPostsContainer.innerHTML = '';

    // Filter posts by the same category, excluding the current post
    let related = posts.filter(post => post.category === currentPostCategory && post.id !== currentPostId);

    // If not enough related posts in the same category, get other recent posts
    if (related.length < 3) {
        const otherPosts = posts.filter(post => post.id !== currentPostId && post.category !== currentPostCategory)
                                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest
        related = [...related, ...otherPosts.slice(0, 3 - related.length)];
    }

    // Limit to 3 related posts
    related = related.slice(0, 3);

    if (related.length === 0) {
        // relatedPostsContainer.innerHTML = '<p>No related posts found.</p>'; // Keep it clean if no related posts
        const relatedPostsSection = document.getElementById('related-posts-container');
        if(relatedPostsSection) relatedPostsSection.style.display = 'none';
        return;
    } else {
        const relatedPostsSection = document.getElementById('related-posts-container');
        if(relatedPostsSection) relatedPostsSection.style.display = 'block';
    }

    related.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'related-post-card'; // A different class for styling
        postElement.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="related-post-image">
            <div class="related-post-content">
                <h4 class="related-post-title">${post.title}</h4>
                <a href="index.html?id=${post.id}" class="read-more-btn">Read More</a>
            </div>
        `;
        relatedPostsContainer.appendChild(postElement);
    });
}

// Function to hide loading message
function hideLoadingMessage() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Add advanced search functionality
function initAdvancedSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchTitle = document.getElementById('search-title');
    const searchContent = document.getElementById('search-content');
    const searchCategory = document.getElementById('search-category');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderPosts(); // Show all posts if search is empty
            return;
        }
        
        // Get search options
        const inTitle = searchTitle.checked;
        const inContent = searchContent.checked;
        const inCategory = searchCategory.checked;
        
        // Filter posts based on search options
        const filteredPosts = posts.filter(post => {
            let match = false;
            
            if (inTitle && post.title.toLowerCase().includes(searchTerm)) {
                match = true;
            }
            
            if (inContent && post.content.toLowerCase().includes(searchTerm)) {
                match = true;
            }
            
            if (inCategory && post.category && post.category.toLowerCase().includes(searchTerm)) {
                match = true;
            }
            
            return match;
        });
        
        renderFilteredPosts(filteredPosts, searchTerm);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add clear search with Escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                renderPosts(); // Show all posts
            }
        });
    }
}

function renderFilteredPosts(filteredPosts, searchTerm) {
    const blogPostsContainer = document.getElementById('blog-posts');
    if (!blogPostsContainer) return;
    
    blogPostsContainer.innerHTML = '';
    
    if (filteredPosts.length === 0) {
        blogPostsContainer.innerHTML = `<div class="no-posts">No posts found matching "${searchTerm}".</div>`;
        return;
    }
    
    // Add a search results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';
    resultsHeader.innerHTML = `<h3>Found ${filteredPosts.length} results for "${searchTerm}"</h3>
                              <button id="clear-search" class="clear-search-btn">Clear Search</button>`;
    blogPostsContainer.appendChild(resultsHeader);
    
    // Render the filtered posts using the existing post rendering logic
    filteredPosts.forEach(post => {
        // Use your existing post rendering code here
        const postElement = document.createElement('article');
        postElement.className = 'blog-post';
        postElement.id = `post-${post.id}`;
        postElement.setAttribute('data-id', post.id);

        // Create a small thumbnail version of the image for the header
        const thumbnailHtml = post.image ? 
            `<img src="${post.image}" alt="${post.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">` : '';

        postElement.innerHTML = `
            <div class="post-header">
                ${thumbnailHtml}
                <div class="post-header-content">
                    <h2 class="post-title">${post.title}</h2>
                    <div class="post-category"><span class="category-tag">${post.category || 'Uncategorized'}</span></div>
                </div>
                <div class="expand-indicator"><i class="fas fa-chevron-down"></i></div>
            </div>
            <div class="post-expanded-content">
                <img src="${post.image}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <div class="post-text">${post.content}</div>
                    <div class="post-actions">
                        <div class="like-buttons">
                            <button class="like-btn" title="Like this post" data-id="${post.id}">
                                <i class="fas fa-thumbs-up"></i> <span>${post.likes || 0}</span>
                            </button>
                            <button class="dislike-btn" title="Dislike this post" data-id="${post.id}">
                                <i class="fas fa-thumbs-down"></i> <span>${post.dislikes || 0}</span>
                            </button>
                        </div>
                        <button class="share-btn" title="Share this post" data-id="${post.id}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        blogPostsContainer.appendChild(postElement);
    });
    
    // Add event listeners for post actions
    addPostActionListeners();
    
    // Add event listeners for post expansion
    addPostExpansionListeners();
    
    // Add event listener to clear search
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            renderPosts(); // Render all posts again
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading message after a maximum timeout (failsafe)
    setTimeout(hideLoadingMessage, 5000);
    
    // Apply theme on page load
    applyTheme();
    
    // Load data from local storage
    loadData();

    // Check which page we're on and render accordingly
    const currentPath = window.location.pathname;
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (currentPath.includes('admin.html')) {
        renderAdminPanel();
    } else if (currentPath.includes('login.html')) {
        renderLoginForm();
    } else if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/blog/')) { // Covers index.html and root
        renderCategoryNav();
        if (postId) {
            renderSinglePost(); // Handles showing single post and hiding blog list
        } else {
            // Home page / Blog list view
            document.getElementById('blog-posts').style.display = 'block';
            document.getElementById('post-container').style.display = 'none';
            const backToHomeLink = document.querySelector('.back-to-home');
            if(backToHomeLink) backToHomeLink.style.display = 'none';
            renderFeaturedPosts();
            renderPosts();
        }
    } else {
        // Fallback for any other paths, could be an error page or redirect to home
        // For now, assume it's the home page if no other condition met
        renderCategoryNav();
        renderFeaturedPosts();
        renderPosts();
    }
    
    // Ensure loading message is hidden after all rendering is complete
    hideLoadingMessage();

    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Set up navigation buttons
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    const backToBottomBtn = document.getElementById('back-to-bottom');
    if (backToBottomBtn) {
        backToBottomBtn.addEventListener('click', scrollToBottom);
    }
    
    // Set up theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Initialize dynamic header
    initDynamicHeader();
    
    // Initialize advanced search functionality
    // initAdvancedSearch(); // Replaced by addSearchListeners
    
});