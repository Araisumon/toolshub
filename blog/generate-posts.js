#!/usr/bin/env node

/**
 * Node.js script to generate static HTML pages for each blog post
 * This creates individual post pages with proper meta tags for social sharing
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = "https://toolshub.cam";
const POSTS_FILE = "posts.json";
const OUTPUT_DIR = "posts";
const DEFAULT_IMAGE = "https://toolshub.cam/tools-illustration.webp";

// Read posts data
const postsData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// CSS from index.html (simplified for static pages)
const CSS = `
<style>
    :root {
        --primary-color: #4361ee;
        --secondary-color: #3a0ca3;
        --border-radius: 12px;
        --box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .theme-light { 
        --background-color: #ffffff; 
        --text-color: #212529; 
        --gray-color: #6c757d; 
        --card-background: #ffffff; 
        --hero-background: linear-gradient(135deg, #e6ebff 0%, #d8e0ff 100%); 
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background-color: var(--background-color);
        transition: var(--transition);
    }
    .container { 
        max-width: 1280px; 
        margin: 0 auto; 
        padding: 0 20px; 
    }

    header {
        background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
        color: white;
        padding: 15px 0;
        position: sticky;
        top: 0;
        z-index: 100;
    }
    .header-container { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
    }
    .brand { 
        font-size: 1.5rem; 
        font-weight: 700; 
        display: flex; 
        align-items: center; 
    }
    .brand i { 
        margin-right: 10px; 
        font-size: 1.8rem; 
    }
    .navbar ul { 
        display: flex; 
        list-style: none; 
        gap: 20px; 
    }
    .navbar a { 
        color: white; 
        text-decoration: none; 
        font-weight: 500; 
    }
    .navbar a:hover, .navbar a.active { 
        text-decoration: underline; 
    }

    .post-container {
        max-width: 800px;
        margin: 60px auto;
        padding: 0 20px;
    }

    .post-header {
        margin-bottom: 40px;
        text-align: center;
    }

    .post-title {
        font-size: 2.5rem;
        margin-bottom: 20px;
        color: var(--text-color);
    }

    .post-meta {
        display: flex;
        justify-content: center;
        gap: 20px;
        color: var(--gray-color);
        font-size: 0.9rem;
        margin-bottom: 30px;
        flex-wrap: wrap;
    }

    .post-category {
        background: #e0e7ff;
        color: #4361ee;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
    }

    .post-image {
        width: 100%;
        max-height: 500px;
        object-fit: cover;
        border-radius: var(--border-radius);
        margin-bottom: 30px;
        box-shadow: var(--box-shadow);
    }

    .post-content {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--text-color);
    }

    .post-content h1,
    .post-content h2,
    .post-content h3,
    .post-content h4 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: var(--text-color);
    }

    .post-content p {
        margin-bottom: 1.5rem;
    }

    .post-content img {
        max-width: 100%;
        height: auto;
        border-radius: var(--border-radius);
        margin: 1.5rem 0;
    }

    .post-content ul,
    .post-content ol {
        margin-left: 2rem;
        margin-bottom: 1.5rem;
    }

    .post-content li {
        margin-bottom: 0.5rem;
    }

    .post-content blockquote {
        border-left: 4px solid var(--primary-color);
        padding-left: 1.5rem;
        margin: 1.5rem 0;
        font-style: italic;
        color: var(--gray-color);
    }

    .post-content code {
        background: #f8f9fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
    }

    .post-content pre {
        background: #1a1a1a;
        color: #f8f9fa;
        padding: 1.5rem;
        border-radius: var(--border-radius);
        overflow-x: auto;
        margin: 1.5rem 0;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 40px;
        padding: 12px 24px;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        border-radius: var(--border-radius);
        font-weight: 600;
        transition: var(--transition);
    }

    .back-link:hover {
        background: var(--secondary-color);
        transform: translateY(-2px);
    }

    .share-buttons {
        display: flex;
        gap: 10px;
        margin: 30px 0;
        justify-content: center;
    }

    .share-btn {
        background: none;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .share-x { color: #000000; }
    .share-x:hover { background: #000000; color: white; }
    .share-facebook { color: #1877F2; }
    .share-facebook:hover { background: #1877F2; color: white; }
    .share-linkedin { color: #0A66C2; }
    .share-linkedin:hover { background: #0A66C2; color: white; }
    .share-whatsapp { color: #25D366; }
    .share-whatsapp:hover { background: #25D366; color: white; }

    .share-reddit { color: #FF4500; }
    .share-reddit:hover { background: #FF4500; color: white; }

    .share-telegram { color: #0088cc; }
    .share-telegram:hover { background: #0088cc; color: white; }

    .share-email { color: #6c757d; }
    .share-email:hover { background: #6c757d; color: white; }

    footer {
        background: #212529;
        color: #adb5bd;
        padding: 50px 0 20px;
        margin-top: 80px;
    }

    .footer-bottom {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
    }

    @media (max-width: 768px) {
        .post-title {
            font-size: 2rem;
        }
        
        .post-meta {
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .navbar ul {
            flex-direction: column;
        }
    }
</style>
`;

// HTML template for individual post pages
function generatePostHTML(post) {
    const postUrl = `${SITE_URL}/blog/posts/post-${post.id}.html`;
    const imageUrl = post.image || DEFAULT_IMAGE;
    const description = post.excerpt || post.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - ToolsHub Blog</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="ToolsHub Blog">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${postUrl}">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${postUrl}">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    ${CSS}
</head>
<body class="theme-light">
    <header>
        <div class="container header-container">
            <div class="brand">
                <i class="material-icons">build</i>
                <span>ToolsHub</span>
            </div>
            <nav class="navbar" id="navbar">
                <ul>
                    <li><a href="${SITE_URL}/#home">Home</a></li>
                    <li><a href="${SITE_URL}/#tools">Tools</a></li>
                    <li><a href="${SITE_URL}/#features">Features</a></li>
                    <li><a href="${SITE_URL}/blog" class="active">Blog</a></li>
                    <li><a href="${SITE_URL}/about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="post-container">
            <article>
                <div class="post-header">
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                        <span><i class="fas fa-clock"></i> ${Math.ceil(post.content.length / 1000)} min read</span>
                    </div>
                    
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">` : ''}
                </div>

                <div class="post-content">
                    ${post.content}
                </div>

                <div class="share-buttons">
                    <button class="share-btn share-x" onclick="shareOnTwitter()" title="Share on X">
                        <i class="fab fa-x-twitter"></i>
                    </button>
                    <button class="share-btn share-facebook" onclick="shareOnFacebook()" title="Share on Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="share-btn share-linkedin" onclick="shareOnLinkedIn()" title="Share on LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                    </button>
                    <button class="share-btn share-whatsapp" onclick="shareOnWhatsApp()" title="Share on WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-btn share-reddit" onclick="shareOnReddit()" title="Share on Reddit">
                        <i class="fab fa-reddit"></i>
                    </button>
                    <button class="share-btn share-telegram" onclick="shareOnTelegram()" title="Share on Telegram">
                        <i class="fab fa-telegram"></i>
                    </button>
                    <button class="share-btn share-email" onclick="shareOnEmail()" title="Share via Email">
                        <i class="fas fa-envelope"></i>
                    </button>
                </div>

                <a href="${SITE_URL}/blog" class="back-link">
                    <i class="fas fa-arrow-left"></i> Back to Blog
                </a>
            </article>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ToolsHub. All rights reserved.</p>
                <p>Made with <i class="fas fa-heart" style="color: #e74c3c;"></i> for the developer community</p>
            </div>
        </div>
    </footer>

    <script>
        // Share functions
        function shareOnTwitter() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("${post.title}");
            window.open(\`https://twitter.com/intent/tweet?url=\${url}&text=\${text}\`, '_blank');
        }

        function shareOnFacebook() {
            const url = encodeURIComponent(window.location.href);
            window.open(\`https://www.facebook.com/sharer/sharer.php?u=\${url}\`, '_blank');
        }

        function shareOnLinkedIn() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent("${post.title}");
            const summary = encodeURIComponent("${description}");
            window.open(\`https://www.linkedin.com/shareArticle?mini=true&url=\${url}&title=\${title}&summary=\${summary}\`, '_blank');
        }

        function shareOnWhatsApp() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("${post.title} - Check out this article!");
            window.open(\`https://wa.me/?text=\${text}%20\${url}\`, '_blank');
        }

        function shareOnReddit() {
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent("${post.title}");
            window.open(\`https://www.reddit.com/submit?url=\${url}&title=\${title}\`, '_blank');
        }

        function shareOnTelegram() {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent("${post.title} - Check out this article!");
            window.open(\`https://t.me/share/url?url=\${url}&text=\${text}\`, '_blank');
        }

        function shareOnEmail() {
            const url = window.location.href;
            const subject = encodeURIComponent("${post.title}");
            const body = encodeURIComponent(\`Check out this article: \${url}\`);
            window.open(\`mailto:?subject=\${subject}&body=\${body}\`, '_blank');
        }

        // Copy URL to clipboard
        function copyToClipboard() {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copied to clipboard!');
            });
        }

        // Theme toggle (simplified)
        function toggleTheme() {
            const body = document.body;
            if (body.classList.contains('theme-light')) {
                body.classList.remove('theme-light');
                body.classList.add('theme-dark');
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('theme-dark');
                body.classList.add('theme-light');
                localStorage.setItem('theme', 'light');
            }
        }

        // Apply saved theme on load
        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(\`theme-\${savedTheme}\`);
        });
    </script>
</body>
</html>`;
}

// Generate HTML files for each post
console.log(`Generating static pages for ${postsData.length} posts...`);

let generatedCount = 0;
postsData.forEach(post => {
    const html = generatePostHTML(post);
    const filename = `post-${post.id}.html`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, html);
    console.log(`✓ Created: ${filename}`);
    generatedCount++;
});

console.log(`\n✅ Successfully generated ${generatedCount} static post pages in the "${OUTPUT_DIR}/" directory.`);
console.log(`\nNext steps:`);
console.log(`1. Update the sharePost() function in index.html to use these static pages`);
console.log(`2. Test the generated pages by opening them in a browser`);
console.log(`3. Verify social media previews using tools like Facebook Sharing Debugger`);