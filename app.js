/* app.js - ToolsHub Premium Landing Page Logic & Mini-Tools */

// Complete, Scraped Tools Database from toolshub.cam
const TOOLS_DB = [
    // Blog & Tech Guides
    {
        id: "blog-privacy",
        title: "Why Browser-Local Processing is the Future of Web Privacy",
        category: "blog",
        badge: "Security",
        icon: "fa-solid fa-shield-cat",
        link: "#",
        keywords: ["privacy", "security", "client-side", "local processing", "data safety"],
        date: "May 20, 2026",
        description: "Discover how modern client-side APIs are making it possible to convert files, compile code, and generate security certificates directly on user hardware, bypassing the need for cloud servers completely.",
        content: `<p>In the early days of the web, server-side processing was the default architectural paradigm. If you wanted to compress an image, merge two documents, or parse a syntax tree, your browser had to bundle that data, upload it over the network to a remote cloud server, wait for a worker instance to execute the utility script, and download the resulting file. This architecture is not only bandwidth-heavy, but it also creates deep privacy and security vulnerabilities.</p>
<h3>The Shift to Client-Side Execution</h3>
<p>With the release of modern HTML5 capabilities, browser sandboxing, and high-performance compilation targets (like WebAssembly and V8 Engine optimization), the browser has transformed into a highly efficient environment for local computation. We can now write utility scripts that execute entirely on client CPU threads, bypassing the network layer entirely.</p>
<blockquote>
    "Browser-local processing means your files and credentials never traverse the internet. Absolute security is guaranteed because the data never leaves your device."
</blockquote>
<h3>Key Technical Advantages</h3>
<ul>
    <li><strong>Zero Server Storage:</strong> Since data is kept in memory structures, there is no threat of server database breaches exposing sensitive intellectual property or files.</li>
    <li><strong>Latency Reductions:</strong> Bypassing the upload and download cycles means processing times are limited only by your device's native CPU cores.</li>
    <li><strong>Offline Functionality:</strong> Once the static page and JS bundles are cached by your browser, these utility tools can run without an internet connection.</li>
</ul>
<p>At ToolsHub, our ultimate goal is to move 100% of standard web utility tools into browser-local environments. The future of the internet is decentralized, private, and localized.</p>`
    },
    {
        id: "blog-webp",
        title: "How to Optimize WebP Image Formats for Fast Site Performance",
        category: "blog",
        badge: "SEO",
        icon: "fa-solid fa-file-image",
        link: "#",
        keywords: ["webp", "image optimization", "compression", "speed", "seo"],
        date: "May 14, 2026",
        description: "Struggling with slow page loading times? Learn how to configure your compression rates, remove metadata tags, and leverage client-side converters to compress PNG/JPG files to WebP instantly.",
        content: `<p>Page loading speed is one of the most critical factors in modern Search Engine Optimization (SEO) and user experience. Study after study shows that if a page takes more than 3 seconds to load on mobile, over 50% of visitors will bounce. Images are almost always the biggest culprit behind bloated payloads.</p>
<h3>Enter WebP: Next-Gen Image Compression</h3>
<p>Developed by Google, the WebP format offers superior lossless and lossy compression for images on the web. Using predictive coding, WebP creates files that are on average 26% smaller in size compared to PNGs and 25-34% smaller than equivalent JPEG files, while maintaining identical visual fidelity.</p>
<h3>Optimization Best Practices</h3>
<ol>
    <li><strong>Discard Metadata:</strong> Camera profiles, geotags, and editing history can account for up to 10% of a raw image's file size. Ensure your converter removes EXIF data during compilation.</li>
    <li><strong>Target 75-80% Quality:</strong> For most web layouts, a quality factor of 75-80% provides the optimal sweet spot between image crispness and small file sizes.</li>
    <li><strong>Client-Side Processing:</strong> Using standard HTML5 Canvas APIs, you can draw a JPEG/PNG image locally in-browser and export it as an optimized WebP format image dynamically.</li>
</ol>
<p>By leveraging local tools like the ToolsHub Image Converter, you can prepare all of your asset directories in WebP format without wasting hours uploading assets to remote portals.</p>`
    },
    {
        id: "blog-base64",
        title: "Base64 Encoding vs Encryption: Understanding the Difference",
        category: "blog",
        badge: "Developer",
        icon: "fa-solid fa-code",
        link: "#",
        keywords: ["base64", "encryption", "obfuscation", "security", "encoding"],
        date: "Apr 28, 2026",
        description: "Many developers confuse Base64 obfuscation with military-grade encryption. We break down the structural differences, parsing pipelines, and ideal use cases for both standards.",
        content: `<p>A common point of confusion among junior web developers is the difference between encoding and encryption. It is not uncommon to see codebases that attempt to "protect" user credentials by simply converting plain text to Base64 strings. In this guide, we break down why this is an unsafe practice.</p>
<h3>What is Base64 Encoding?</h3>
<p>Base64 is a binary-to-text encoding scheme. It takes raw binary data and represents it using a set of 64 printable ASCII characters (A-Z, a-z, 0-9, +, /, and padding =). Its primary purpose is transmission integrity—it ensures data is not corrupted when sent over networks or text-based protocols (like email headers or JSON objects) that might misinterpret raw binary streams. Anyone can reverse a Base64 string back to its original value instantly with no key required (using commands like \`atob\` in JS).</p>
<h3>What is Encryption?</h3>
<p>Encryption, on the other hand, is a mathematical mechanism designed to hide the meaning of data. It transforms plaintext into ciphertext using a specific algorithm (like AES-256) and a cryptographic key. Without the key, it is mathematically impossible to reverse the ciphertext back to plaintext. It is built strictly for security and access authorization, rather than data transmission compatibility.</p>
<blockquote>
    "Encoding formatting secures data against corruption during transfer. Cryptographic encryption secures data against unauthorized viewing."
</blockquote>
<h3>Ideal Use Cases</h3>
<ul>
    <li><strong>Base64:</strong> Inline images in CSS files, transmitting file attachments inside JSON payloads, formatting binary headers.</li>
    <li><strong>Encryption:</strong> Protecting user passwords (using hashing algorithms like bcrypt), securing data payloads (AES-GCM), and HTTPS network tunnels (TLS/SSL).</li>
</ul>`
    },
    {
        id: "blog-pdf",
        title: "The Ultimate Guide to PDF Compression without Quality Loss",
        category: "blog",
        badge: "Productivity",
        icon: "fa-solid fa-file-zipper",
        link: "#",
        keywords: ["pdf", "compression", "optimize pdf", "document quality", "file size"],
        date: "Apr 11, 2026",
        description: "Need to email a large report but blocked by file attachment size limits? Explore our guide on dpi ratios, embedded fonts, and how browser compressors optimize PDF layout layers.",
        content: `<p>PDF documents are the universal standard for corporate brochures, manuals, and reports. However, because they are designed to support high-fidelity print layouts, they often contain heavy embedded assets that make them too large for email attachments or fast web browsing downloads.</p>
<h3>The Anatomy of PDF Bloat</h3>
<p>A typical high-resolution PDF contains three primary elements that contribute to its size: high-dpi raster images (often 300+ DPI designed for physical printing), uncompressed vector paths, and fully embedded fonts (which include weights and character subsets you might not even use).</p>
<h3>How PDF Compression Works</h3>
<ol>
    <li><strong>Image Downsampling:</strong> Reducing image resolution from 300 DPI to 150 or 72 DPI (which is standard for screen display) significantly reduces storage.</li>
    <li><strong>Font Subsetting:</strong> Stripping unused glyphs from embedded font files so that only the characters actually present in the text are stored.</li>
    <li><strong>Object Streams Compress:</strong> Compiling structural layout objects (margins, borders, tables) into compressed streams using deflate algorithms.</li>
</ol>
<p>Using local utilities like the ToolsHub PDF Compressor, you can adjust these compression parameters inside your browser context using modules like pdf-lib, reducing your PDF files by up to 80% without sacrificing text readability.</p>`
    },
    // PDF & Document Tools
    {
        id: "pdf-merger",
        title: "PDF Merger",
        category: "pdf",
        description: "Combine multiple PDF files into a single document in your desired order.",
        icon: "fa-solid fa-file-pdf",
        link: "/pdfmerger/",
        keywords: ["pdf merge", "combine pdf", "join pdf", "concatenate pdf"],
        badge: "popular"
    },
    {
        id: "pdf-split",
        title: "PDF Split",
        category: "pdf",
        description: "Extract specific pages or split a PDF into separate files easily.",
        icon: "fa-solid fa-scissors",
        link: "/pdfsplit/",
        keywords: ["pdf split", "extract pages", "cut pdf", "divide pdf"]
    },
    {
        id: "pdf-compressor",
        title: "PDF Compressor",
        category: "pdf",
        description: "Reduce PDF file size while keeping maximum document quality.",
        icon: "fa-solid fa-file-zipper",
        link: "/pdfcom/",
        keywords: ["pdf compress", "shrink pdf", "pdf size reducer", "smaller pdf"],
        badge: "popular"
    },
    {
        id: "jpg-png-to-pdf",
        title: "JPG/PNG to PDF Converter",
        category: "pdf",
        description: "Convert JPG, PNG, and other images to PDF format instantly.",
        icon: "fa-solid fa-image-portrait",
        link: "/jpgpngtopdf/",
        keywords: ["jpg to pdf", "png to pdf", "convert images to pdf", "picture to pdf"]
    },
    {
        id: "pdf-to-images",
        title: "PDF to Images",
        category: "pdf",
        description: "Extract all images or convert PDF pages into high-quality JPGs.",
        icon: "fa-solid fa-file-image",
        link: "/pdftoimages/",
        keywords: ["pdf to jpg", "pdf to png", "extract images from pdf", "pdf converter"]
    },
    {
        id: "word-to-pdf",
        title: "Word to PDF",
        category: "pdf",
        description: "Convert Word DOCX files to professional PDF documents online.",
        icon: "fa-solid fa-file-word",
        link: "/wordtopdf/",
        keywords: ["word to pdf", "doc to pdf", "docx to pdf", "convert word to pdf"]
    },
    {
        id: "excel-to-pdf",
        title: "Excel to PDF",
        category: "pdf",
        description: "Convert Excel spreadsheet files to PDF format directly in your browser.",
        icon: "fa-solid fa-file-excel",
        link: "/exceltopdf/",
        keywords: ["excel to pdf", "xls to pdf", "xlsx to pdf", "spreadsheet to pdf"]
    },

    // Image & Graphic Tools
    {
        id: "image-compressor",
        title: "Image Compressor",
        category: "image",
        description: "Compress JPEG, PNG, and WebP images locally in-browser without quality loss.",
        icon: "fa-solid fa-compress",
        link: "/imagecom/",
        keywords: ["compress image", "shrink photo", "png compressor", "jpeg size reducer"],
        badge: "popular"
    },
    {
        id: "image-converter",
        title: "Image Converter",
        category: "image",
        description: "Convert images to different formats like PNG, JPG, WebP, BMP, and GIF.",
        icon: "fa-solid fa-shuffle",
        link: "/imagecon/",
        keywords: ["image converter", "convert image", "change format"]
    },
    {
        id: "image-resizer",
        title: "Image Resizer",
        category: "image",
        description: "Crop and resize images to custom dimensions (px or percentage).",
        icon: "fa-solid fa-crop-simple",
        link: "/imageresizer/",
        keywords: ["resize image", "crop image", "image dimensions", "scale photo"]
    },
    {
        id: "image-viewer",
        title: "Image Viewer",
        category: "image",
        description: "Inspect images, zoom in/out, view color metadata, and rotate photos.",
        icon: "fa-solid fa-eye",
        link: "/imageview/",
        keywords: ["image viewer", "inspect image", "view photo"]
    },
    {
        id: "avatar-creator",
        title: "Custom Avatar Creator",
        category: "image",
        description: "Generate customized profile pictures and digital avatars for social media.",
        icon: "fa-solid fa-user-gear",
        link: "/avatarcreator/",
        keywords: ["avatar generator", "profile picture maker", "pixel avatar", "custom avatar"],
        badge: "new"
    },
    {
        id: "favicon-generator",
        title: "Favicon Generator",
        category: "image",
        description: "Convert images to .ico files or build multi-size favicons for websites.",
        icon: "fa-solid fa-circle-nodes",
        link: "/favicongen/",
        keywords: ["favicon generator", "ico converter", "generate favicon", "website icon"]
    },
    {
        id: "color-palette-generator",
        title: "Color Palette Generator",
        category: "image",
        description: "Generate matching color schemes, view hex values, and export palettes.",
        icon: "fa-solid fa-palette",
        link: "/colorpalettegen/",
        keywords: ["color palette", "color schemes", "design colors", "hex generator"]
    },
    {
        id: "gradient-generator",
        title: "Gradient Generator",
        category: "image",
        description: "Create beautiful linear and radial gradients and get clean CSS codes.",
        icon: "fa-solid fa-brush",
        link: "/gradientgen/",
        keywords: ["css gradient", "gradient generator", "gradient colors", "radial gradient"]
    },
    {
        id: "color-picker",
        title: "Color Picker",
        category: "image",
        description: "Select colors from an interactive palette, convert between HEX, RGB, HSL, and CMYK formats.",
        icon: "fa-solid fa-eye-dropper",
        link: "/ColorP/",
        keywords: ["color picker", "hex color", "rgb converter", "hsl selector", "eyedropper"],
        badge: "popular"
    },

    // Developer & Security Tools
    {
        id: "json-formatter",
        title: "JSON Formatter & Validator",
        category: "dev",
        description: "Prettify, format, parse, and validate JSON data instantly with error highlights.",
        icon: "fa-solid fa-code",
        link: "/jsonformatter/",
        keywords: ["json format", "json validate", "prettify json", "json parser"],
        badge: "popular"
    },
    {
        id: "base64-codec",
        title: "Base64 Encoder Decoder",
        category: "dev",
        description: "Encode text or images to Base64 strings or decode them back to plain format.",
        icon: "fa-solid fa-arrow-right-arrow-left",
        link: "/Base64ED/",
        keywords: ["base64 decode", "base64 encode", "base64 decoder", "b64"]
    },
    {
        id: "url-codec",
        title: "URL Encoder/Decoder",
        category: "dev",
        description: "Encode strings into URL-safe formats or decode URL query strings.",
        icon: "fa-solid fa-link-slash",
        link: "/urlencodedecode/",
        keywords: ["url encode", "url decode", "percent encoding", "decode url"]
    },
    {
        id: "robots-generator",
        title: "Robots.txt Generator",
        category: "dev",
        description: "Generate SEO-friendly robots.txt files for search engine crawlers.",
        icon: "fa-solid fa-robot",
        link: "/robotstxt/",
        keywords: ["robots.txt", "generate robots", "seo robots", "crawler instructions"]
    },
    {
        id: "meta-generator",
        title: "Meta Tag Generator",
        category: "dev",
        description: "Build custom title, description, and OpenGraph social meta tags easily.",
        icon: "fa-solid fa-tags",
        link: "/metatags/",
        keywords: ["meta tags", "seo meta", "opengraph generator", "twitter card generator"]
    },
    {
        id: "ip-location",
        title: "IP Location Finder",
        category: "dev",
        description: "Look up details, ISP, location, and timezone for any IP address.",
        icon: "fa-solid fa-location-crosshairs",
        link: "/iplocationfinder/",
        keywords: ["ip address lookup", "my ip", "ip geolocation", "find ip location"],
        badge: "popular"
    },
    {
        id: "file-encryptor",
        title: "File Encryptor/Decryptor",
        category: "dev",
        description: "Secure your files using client-side AES encryption and passwords.",
        icon: "fa-solid fa-shield-halved",
        link: "/fileencryptor/",
        keywords: ["file encryption", "aes encrypt", "decrypt files", "file lock"]
    },

    // Writing & Text Tools
    {
        id: "word-counter",
        title: "Word & Character Counter",
        category: "text",
        description: "Count words, characters, sentences, paragraphs, and reading times in real-time.",
        icon: "fa-solid fa-list-ol",
        link: "/WordChaCou/",
        keywords: ["word count", "character counter", "text length", "letters count"],
        badge: "popular"
    },
    {
        id: "case-converter",
        title: "Text Case Converter",
        category: "text",
        description: "Convert any text into UPPERCASE, lowercase, Title Case, or Sentence Case.",
        icon: "fa-solid fa-font",
        link: "/TextCC/",
        keywords: ["case converter", "uppercase", "lowercase", "capitalise text"]
    },
    {
        id: "markdown-html",
        title: "Markdown to HTML Converter",
        category: "text",
        description: "Convert markdown syntax to clean HTML markup tags.",
        icon: "fa-brands fa-markdown",
        link: "/MarkdowntoHTMLC/",
        keywords: ["markdown to html", "md to html", "convert markdown", "render markdown"]
    },
    {
        id: "lorem-ipsum",
        title: "Lorem Ipsum Generator",
        category: "text",
        description: "Generate placeholder text paragraphs, sentences, or words for your mockups.",
        icon: "fa-solid fa-paragraph",
        link: "/loremipsumgen/",
        keywords: ["lorem ipsum", "dummy text", "placeholder generator", "fill text"]
    },
    {
        id: "digital-sign",
        title: "Digital Signature Creator",
        category: "text",
        description: "Draw your digital signature on canvas and download it as a PNG file.",
        icon: "fa-solid fa-signature",
        link: "/digitalsign/",
        keywords: ["digital signature", "sign document", "draw signature", "e-sign"],
        badge: "new"
    },

    // Calculators & Converters
    {
        id: "gpa-calc",
        title: "GPA Calculator",
        category: "calc",
        description: "Calculate your high school or college GPA based on letter grades and credits.",
        icon: "fa-solid fa-graduation-cap",
        link: "/gpacalc/",
        keywords: ["gpa calculator", "grade point average", "calculate gpa", "semester gpa"]
    },
    {
        id: "loan-calc",
        title: "Loan Calculator",
        category: "calc",
        description: "Estimate monthly loan repayments, total interest paid, and amortization charts.",
        icon: "fa-solid fa-calculator",
        link: "/loancalc/",
        keywords: ["loan calculator", "mortgage calculator", "emi calculator", "interest rate"]
    },
    {
        id: "percentage-calc",
        title: "Percentage Calculator",
        category: "calc",
        description: "Solve basic percentage math problems, increases, decreases, and fractions.",
        icon: "fa-solid fa-percent",
        link: "/percentagecalc/",
        keywords: ["percentage calculator", "calculate percent", "discount calculator", "percent ratio"]
    },
    {
        id: "grade-calc",
        title: "Grade Calculator",
        category: "calc",
        description: "Calculate what grade you need on your final exam to pass or get an A.",
        icon: "fa-solid fa-pen-nib",
        link: "/gradecalc/",
        keywords: ["grade calculator", "final exam score", "weighted grade", "course grade"]
    },
    {
        id: "unit-converter",
        title: "Unit Converter",
        category: "calc",
        description: "Convert units of length, weight, volume, temperature, speed, and time.",
        icon: "fa-solid fa-arrows-spin",
        link: "/unitconverter/",
        keywords: ["unit converter", "metric imperial", "inch to cm", "kg to lbs"]
    },
    {
        id: "budget-calculator",
        title: "Budget Calculator",
        category: "calc",
        description: "Track monthly earnings, split expenses, and plan budgets effectively.",
        icon: "fa-solid fa-wallet",
        link: "/budgetcalc/",
        keywords: ["budget planner", "expense tracker", "money calculator", "split expenses"]
    },
    {
        id: "calorie-calculator",
        title: "Calorie Calculator",
        category: "calc",
        description: "Calculate daily caloric intake goals based on activity level and health parameters.",
        icon: "fa-solid fa-apple-whole",
        link: "/caloriecalc/",
        keywords: ["calorie calculator", "diet goals", "calorie count", "health stats"]
    },
    {
        id: "age-calc",
        title: "Age Calculator",
        category: "calc",
        description: "Find your precise age in years, months, weeks, days, and hours.",
        icon: "fa-solid fa-cake-candles",
        link: "/agecalc/",
        keywords: ["age calculator", "precise age", "birthday tracker"]
    },
    {
        id: "datetime-calc",
        title: "Date & Time Calculator",
        category: "calc",
        description: "Add or subtract days from a date or calculate time duration between dates.",
        icon: "fa-solid fa-calendar-day",
        link: "/datetimecalc/",
        keywords: ["date calculator", "time calculator", "add days", "date difference"]
    },

    // Productivity & Fun Tools
    {
        id: "password-generator",
        title: "Password Generator",
        category: "fun",
        description: "Generate highly secure random passwords locally in-browser with custom rules.",
        icon: "fa-solid fa-key",
        link: "/passwordgen/",
        keywords: ["password generator", "secure password", "random key maker", "strong credentials"],
        badge: "popular"
    },
    {
        id: "qr-generator",
        title: "QR Code Generator",
        category: "fun",
        description: "Create customizable QR codes for links, text, emails, or Wi-Fi configurations.",
        icon: "fa-solid fa-qrcode",
        link: "/QRCodeG/",
        keywords: ["qr generator", "create qr code", "barcode maker", "quick response"],
        badge: "popular"
    },
    {
        id: "pomodoro-timer",
        title: "Pomodoro Timer",
        category: "fun",
        description: "A custom 25/5 focus timer that loops to boost productivity and workflow.",
        icon: "fa-solid fa-clock-rotate-left",
        link: "/pomodorotimer/",
        keywords: ["pomodoro timer", "work timer", "focus clock", "productivity stopwatch"]
    },
    {
        id: "typing-tester",
        title: "Typing Speed Tester",
        category: "fun",
        description: "Test your Words Per Minute (WPM) speed and accuracy with real-time feedback.",
        icon: "fa-solid fa-keyboard",
        link: "/TypingSpeedT/",
        keywords: ["typing test", "wpm tester", "typing speed", "keyboard skills"]
    },
    {
        id: "baby-names",
        title: "Baby's Name Generator",
        category: "fun",
        description: "Find random, popular, or modern baby names with origin details and meanings.",
        icon: "fa-solid fa-baby",
        link: "/babynames/",
        keywords: ["baby names", "random name generator", "boy girl names", "name meanings"]
    },
    {
        id: "forex-clock",
        title: "Forex Trading Clock",
        category: "fun",
        description: "Track live operational hours for global currency markets (London, NY, Tokyo).",
        icon: "fa-solid fa-globe",
        link: "/ForexTC/",
        keywords: ["forex market hours", "trading sessions", "nyse clock", "forex time"]
    },
    {
        id: "random-quote",
        title: "Random Quote Generator",
        category: "fun",
        description: "Get inspirational wisdom from famous authors and philosophers.",
        icon: "fa-solid fa-quote-left",
        link: "/RandomQG/",
        keywords: ["quote generator", "inspirational quote", "wisdom daily"]
    },
    {
        id: "meme-generator",
        title: "Meme Generator",
        category: "fun",
        description: "Upload images, write custom text, and download your funny memes.",
        icon: "fa-solid fa-masks-theater",
        link: "/memegen/",
        keywords: ["meme generator", "make meme", "caption text", "custom memes"]
    }
];

// Environment check: Detect if running inside a Chrome Extension pop-up context
const isExtension = (window.chrome && chrome.runtime && chrome.runtime.id);

// App State
let state = {
    searchQuery: "",
    activeCategory: "all",
    bookmarkedIds: JSON.parse(localStorage.getItem("toolshub_bookmarks")) || [],
    theme: localStorage.getItem("toolshub_theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
};

// DOM References
const toolsGrid = document.getElementById("tools-grid");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear");
const categoryPills = document.querySelectorAll(".category-pill");
const emptyState = document.getElementById("empty-state");
const bookmarksBar = document.getElementById("bookmarks-bar");
const bookmarksCount = document.getElementById("bookmarks-count");
const bookmarksClearBtn = document.getElementById("bookmarks-clear");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleBtnMobile = document.getElementById("theme-toggle-mobile");
const bottomNavItems = document.querySelectorAll(".bottom-nav-item");

// Embedded widgets references
const interactiveTabs = document.querySelectorAll(".interactive-tab-btn");
const widgetPanes = document.querySelectorAll(".widget-pane");

/* --- Theme Management --- */
function applyTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    state.theme = themeName;
    localStorage.setItem("toolshub_theme", themeName);
    
    // Update theme toggle icons
    const icon = themeToggleBtn.querySelector("i");
    const label = themeToggleBtn.querySelector("span");
    const iconMobile = themeToggleBtnMobile ? themeToggleBtnMobile.querySelector("i") : null;
    
    if (themeName === "dark") {
        if (icon) icon.className = "fa-solid fa-sun";
        if (label) label.textContent = "Light";
        if (iconMobile) iconMobile.className = "fa-solid fa-sun";
    } else {
        if (icon) icon.className = "fa-solid fa-moon";
        if (label) label.textContent = "Dark";
        if (iconMobile) iconMobile.className = "fa-solid fa-moon";
    }
}

themeToggleBtn.addEventListener("click", () => {
    applyTheme(state.theme === "light" ? "dark" : "light");
});

if (themeToggleBtnMobile) {
    themeToggleBtnMobile.addEventListener("click", () => {
        applyTheme(state.theme === "light" ? "dark" : "light");
    });
}

// Initialise Theme
applyTheme(state.theme);

/* --- Tools Rendering & Filters --- */
function renderTools() {
    if (!toolsGrid) return;
    toolsGrid.innerHTML = "";
    
    // Filter logic
    let filteredTools = TOOLS_DB.filter(tool => {
        // Exclude blog articles from the Explore section and searches on all non-blog pages
        if (state.activeCategory !== "blog" && tool.category === "blog") {
            return false;
        }

        // Category Filter
        if (state.activeCategory === "favorites") {
            if (!state.bookmarkedIds.includes(tool.id)) return false;
        } else if (state.activeCategory !== "all" && tool.category !== state.activeCategory) {
            return false;
        }
        
        // Search Filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase().trim();
            const titleMatch = tool.title.toLowerCase().includes(query);
            const descMatch = tool.description.toLowerCase().includes(query);
            const keywordMatch = tool.keywords.some(kw => kw.toLowerCase().includes(query));
            return titleMatch || descMatch || keywordMatch;
        }
        
        return true;
    });

    // Handle Bookmarks Alert display
    const favCount = state.bookmarkedIds.length;
    if (bookmarksBar) {
        if (favCount > 0) {
            bookmarksBar.style.display = "flex";
            if (bookmarksCount) bookmarksCount.textContent = `${favCount} tool${favCount > 1 ? 's' : ''}`;
        } else {
            bookmarksBar.style.display = "none";
            if (state.activeCategory === "favorites") {
                // Reset to 'all' if user was viewing empty favorites
                state.activeCategory = "all";
                updateCategoryActiveUI("all");
                renderTools();
                return;
            }
        }
    }
    
    // Update count labels
    if (resultsCount) resultsCount.textContent = `Showing ${filteredTools.length} tools`;
    
    if (filteredTools.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        toolsGrid.style.display = "none";
    } else {
        if (emptyState) emptyState.style.display = "none";
        toolsGrid.style.display = "grid";
        
        filteredTools.forEach(tool => {
            const isBookmarked = state.bookmarkedIds.includes(tool.id);
            const badgeHTML = tool.badge ? `<span class="card-badge" style="background-color: ${tool.badge === 'new' ? 'var(--accent)' : 'var(--primary)'}; color: #ffffff;">${tool.badge}</span>` : `<span class="card-badge">${tool.category}</span>`;
            
            const card = document.createElement("div");
            card.className = "tool-card";
            card.setAttribute("data-id", tool.id);
            
            // Navigate directly to the real path on card click
            card.addEventListener("click", (e) => {
                // If clicked star bookmark, do not trigger navigation
                if (e.target.closest(".bookmark-btn")) return;
                
                if (tool.category === "blog") {
                    openBlogModal(tool.id);
                    return;
                }
                
                // If the tool has custom interactive preview on page (like password gen or qr gen), scroll to it.
                // Otherwise navigate to the path.
                const isEmbedded = (tool.id === "password-generator" || tool.id === "qr-generator" || tool.id === "word-counter");
                
                if (isEmbedded) {
                    document.getElementById("interactive-section").scrollIntoView({ behavior: 'smooth' });
                    let widgetTabId = "tab-password";
                    if (tool.id === "qr-generator") widgetTabId = "tab-qr";
                    if (tool.id === "word-counter") widgetTabId = "tab-word";
                    
                    const targetTabBtn = document.getElementById(widgetTabId);
                    if (targetTabBtn) targetTabBtn.click();
                } else {
                    // Hybrid extension behavior: open in new tab if inside Chrome extension, otherwise redirect normally
                    if (isExtension) {
                        window.open("https://toolshub.cam" + tool.link, "_blank");
                    } else {
                        window.location.href = tool.link;
                    }
                }
            });
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="tool-icon-wrapper">
                        <i class="${tool.icon}"></i>
                    </div>
                    <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" title="Add to Favorites" aria-label="Bookmark">
                        <i class="${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                    </button>
                </div>
                <div class="card-body">
                    <h3>${tool.title}</h3>
                    <p>${tool.description}</p>
                </div>
                <div class="card-footer">
                    ${badgeHTML}
                    <span class="arrow-link">${tool.category === 'blog' ? 'Read Article' : 'Open'} <i class="fa-solid fa-arrow-right-long"></i></span>
                </div>
            `;
            
            // Setup bookmark event listener
            const bookmarkBtn = card.querySelector(".bookmark-btn");
            bookmarkBtn.addEventListener("click", () => {
                toggleBookmark(tool.id);
            });
            
            toolsGrid.appendChild(card);
        });
    }
}

// Bookmark toggler
function toggleBookmark(id) {
    const index = state.bookmarkedIds.indexOf(id);
    if (index === -1) {
        state.bookmarkedIds.push(id);
    } else {
        state.bookmarkedIds.splice(index, 1);
    }
    localStorage.setItem("toolshub_bookmarks", JSON.stringify(state.bookmarkedIds));
    renderTools();
}

// Clear bookmarks handler
if (bookmarksClearBtn) {
    bookmarksClearBtn.addEventListener("click", () => {
        state.bookmarkedIds = [];
        localStorage.removeItem("toolshub_bookmarks");
        renderTools();
    });
}

// Update UI state for active categories
function updateCategoryActiveUI(categoryVal) {
    categoryPills.forEach(pill => {
        if (pill.getAttribute("data-category") === categoryVal) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });
    
    bottomNavItems.forEach(item => {
        if (item.getAttribute("data-category") === categoryVal) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// Category selectors (desktop pills)
categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
        const cat = pill.getAttribute("data-category");
        state.activeCategory = cat;
        updateCategoryActiveUI(cat);
        renderTools();
    });
});

// Bottom navigation items (mobile bottom bar)
bottomNavItems.forEach(item => {
    item.addEventListener("click", () => {
        const action = item.getAttribute("data-action");
        if (action === "theme") {
            applyTheme(state.theme === "light" ? "dark" : "light");
            return;
        }
        
        const cat = item.getAttribute("data-category");
        if (cat) {
            state.activeCategory = cat;
            updateCategoryActiveUI(cat);
            renderTools();
            
            // Scroll smoothly to search/tools section
            document.getElementById("search-section").scrollIntoView({ behavior: 'smooth' });
        } else if (action === "widget") {
            document.getElementById("interactive-section").scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/* --- Search Logic --- */
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        
        if (state.searchQuery.trim().length > 0) {
            if (searchClearBtn) searchClearBtn.style.display = "flex";
        } else {
            if (searchClearBtn) searchClearBtn.style.display = "none";
        }
        
        renderTools();
    });
}

if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
        if (searchInput) {
            searchInput.value = "";
            state.searchQuery = "";
            searchClearBtn.style.display = "none";
            searchInput.focus();
        }
        renderTools();
    });
}

// Quick tag buttons in Hero
document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const term = btn.getAttribute("data-term");
        if (searchInput) {
            searchInput.value = term;
            state.searchQuery = term;
            if (searchClearBtn) searchClearBtn.style.display = "flex";
        }
        renderTools();
        document.getElementById("search-section").scrollIntoView({ behavior: 'smooth' });
    });
});

/* --- Embedded Mini-Tools Widgets Navigation --- */
interactiveTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        interactiveTabs.forEach(t => t.classList.remove("active"));
        widgetPanes.forEach(p => p.classList.remove("active"));
        
        tab.classList.add("active");
        const paneId = tab.getAttribute("data-pane");
        const targetPane = document.getElementById(paneId);
        if (targetPane) targetPane.classList.add("active");
    });
});

/* --- Mini-Tool 1: Password Generator --- */
const passLength = document.getElementById("pass-length");
const passLengthVal = document.getElementById("pass-length-val");
const passUpper = document.getElementById("pass-upper");
const passLower = document.getElementById("pass-lower");
const passNumbers = document.getElementById("pass-number");
const passSymbols = document.getElementById("pass-symbol");
const passOutput = document.getElementById("pass-output");
const passGenerateBtn = document.getElementById("pass-generate-btn");
const passCopyBtn = document.getElementById("pass-copy-btn");

if (passLength) {
    passLength.addEventListener("input", (e) => {
        if (passLengthVal) passLengthVal.textContent = e.target.value;
    });
}

function generatePassword() {
    if (!passLength || !passOutput) return;
    const length = parseInt(passLength.value);
    const upper = passUpper ? passUpper.checked : false;
    const lower = passLower ? passLower.checked : false;
    const numbers = passNumbers ? passNumbers.checked : false;
    const symbols = passSymbols ? passSymbols.checked : false;
    
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let charPool = "";
    if (upper) charPool += upperChars;
    if (lower) charPool += lowerChars;
    if (numbers) charPool += numberChars;
    if (symbols) charPool += symbolChars;
    
    if (charPool === "") {
        passOutput.textContent = "Select at least 1 option!";
        return;
    }
    
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charPool.length);
        password += charPool.charAt(randomIndex);
    }
    
    passOutput.textContent = password;
}

if (passGenerateBtn) {
    passGenerateBtn.addEventListener("click", generatePassword);
}

if (passCopyBtn) {
    passCopyBtn.addEventListener("click", () => {
        const text = passOutput ? passOutput.textContent : "";
        if (text && text !== "Select at least 1 option!") {
            navigator.clipboard.writeText(text).then(() => {
                const icon = passCopyBtn.querySelector("i");
                if (icon) {
                    icon.className = "fa-solid fa-check";
                    setTimeout(() => {
                        icon.className = "fa-regular fa-copy";
                    }, 1500);
                }
            });
        }
    });
}

/* --- Mini-Tool 2: QR Code Generator --- */
const qrInput = document.getElementById("qr-input");
const qrGenerateBtn = document.getElementById("qr-generate-btn");
const qrOutputContainer = document.getElementById("qr-output-container");

function generateQRCode() {
    if (!qrInput || !qrOutputContainer) return;
    const val = qrInput.value.trim();
    if (!val) {
        alert("Please enter a valid URL or text!");
        return;
    }
    
    qrOutputContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Generating...</p>`;
    
    const qrSize = 180;
    const encodedVal = encodeURIComponent(val);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedVal}`;
    
    // Create image element
    const img = new Image();
    img.src = qrUrl;
    img.alt = "Generated QR Code";
    img.style.borderRadius = "var(--radius-sm)";
    img.style.boxShadow = "var(--shadow-md)";
    img.style.background = "#ffffff";
    img.style.padding = "10px";
    
    img.onload = () => {
        qrOutputContainer.innerHTML = "";
        qrOutputContainer.appendChild(img);
        
        // Add Download button
        const dlBtn = document.createElement("a");
        dlBtn.href = qrUrl;
        dlBtn.target = "_blank";
        dlBtn.className = "widget-action-btn";
        dlBtn.style.textAlign = "center";
        dlBtn.style.display = "block";
        dlBtn.style.marginTop = "0.75rem";
        dlBtn.innerHTML = `<i class="fa-solid fa-download"></i> Save Image`;
        qrOutputContainer.appendChild(dlBtn);
    };
    
    img.onerror = () => {
        qrOutputContainer.innerHTML = `<p style="color: var(--accent); font-size: 0.9rem;">Failed to load QR code. Please check your network connection.</p>`;
    };
}

if (qrGenerateBtn) {
    qrGenerateBtn.addEventListener("click", generateQRCode);
}

/* --- Mini-Tool 3: Word & Character Counter --- */
const wordInput = document.getElementById("word-input");
const statChars = document.getElementById("stat-chars");
const statWords = document.getElementById("stat-words");
const statSentences = document.getElementById("stat-sentences");
const statReadTime = document.getElementById("stat-readtime");

if (wordInput) {
    wordInput.addEventListener("input", (e) => {
        const text = e.target.value;
        
        // Character count
        const chars = text.length;
        if (statChars) statChars.textContent = chars;
        
        // Word count
        const cleanedText = text.trim().replace(/\s+/g, ' ');
        const words = cleanedText === "" ? 0 : cleanedText.split(' ').length;
        if (statWords) statWords.textContent = words;
        
        // Sentence count
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        if (statSentences) statSentences.textContent = sentences;
        
        // Reading time (average 200 WPM)
        const readTime = Math.ceil(words / 200);
        if (statReadTime) statReadTime.textContent = words === 0 ? "0m" : `${readTime}m`;
    });
}

/* --- Run Initial Render --- */
document.addEventListener("DOMContentLoaded", () => {
    // Parse URL parameter first to set proper active category on load
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    
    // Check if running on the Blog route path (inside /blog/ folder)
    const isBlogRoute = window.location.pathname.includes('/blog/') || window.location.pathname.endsWith('/blog');
    
    if (isBlogRoute) {
        state.activeCategory = "blog";
        updateCategoryActiveUI("blog");
    } else if (catParam) {
        state.activeCategory = catParam;
        updateCategoryActiveUI(catParam);
    }
    
    renderTools();
    generatePassword(); // Initialise password output
    
    if (isBlogRoute || catParam) {
        // Smooth scroll to search section if filtering by query param or on blog path
        setTimeout(() => {
            const searchSec = document.getElementById("search-section");
            if (searchSec) searchSec.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
    
    // 1. QR Code Query Parameter (?qr=your_text_here)
    const qrParam = urlParams.get('qr');
    const qrInput = document.getElementById("qr-input");
    if (qrParam && qrInput) {
        qrInput.value = decodeURIComponent(qrParam);
        generateQRCode();
        // Scroll to widget panel smoothly after a tiny timeout
        setTimeout(() => {
            const targetSection = document.getElementById("interactive-section");
            const targetTab = document.getElementById("tab-qr");
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            if (targetTab) targetTab.click();
        }, 300);
    }
    
    // 2. Password Length Parameter (?pass_len=16)
    const passLenParam = urlParams.get('pass_len');
    const passLength = document.getElementById("pass-length");
    if (passLenParam && passLength) {
        const len = parseInt(passLenParam);
        if (len >= 6 && len <= 32) {
            passLength.value = len;
            const passLengthVal = document.getElementById("pass-length-val");
            if (passLengthVal) passLengthVal.textContent = len;
            generatePassword();
            setTimeout(() => {
                const targetSection = document.getElementById("interactive-section");
                const targetTab = document.getElementById("tab-password");
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
                if (targetTab) targetTab.click();
            }, 300);
        }
    }
    
    // 3. Word Counter Parameter (?text=your_text_here)
    const textParam = urlParams.get('text');
    const wordInput = document.getElementById("word-input");
    if (textParam && wordInput) {
        wordInput.value = decodeURIComponent(textParam);
        // Trigger manual input event to count metrics
        wordInput.dispatchEvent(new Event('input'));
        setTimeout(() => {
            const targetSection = document.getElementById("interactive-section");
            const targetTab = document.getElementById("tab-word");
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            if (targetTab) targetTab.click();
        }, 300);
    }
});

/* --- Smart Scroll Toggle Button --- */
const scrollToggleBtn = document.getElementById("scroll-toggle");

function updateScrollToggle() {
    if (!scrollToggleBtn) return;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;
    
    // Toggle active state when scrolled past half of page
    if (scrollPos > scrollHeight / 2) {
        scrollToggleBtn.classList.add("scroll-up");
        scrollToggleBtn.setAttribute("title", "Scroll to Top");
    } else {
        scrollToggleBtn.classList.remove("scroll-up");
        scrollToggleBtn.setAttribute("title", "Scroll to Bottom");
    }
}

if (scrollToggleBtn) {
    window.addEventListener("scroll", updateScrollToggle);
    window.addEventListener("resize", updateScrollToggle);
    
    scrollToggleBtn.addEventListener("click", () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        
        if (scrollPos > scrollHeight / 2) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    });
    
    // Run initial update
    updateScrollToggle();
}

/* --- Mobile Drawer Navigation --- */
const menuToggleBtn = document.getElementById("menu-toggle");
const drawerCloseBtn = document.getElementById("drawer-close");
const mobileDrawer = document.getElementById("mobile-drawer");

// Create drawer backdrop dynamically
const drawerBackdrop = document.createElement("div");
drawerBackdrop.className = "drawer-backdrop";
document.body.appendChild(drawerBackdrop);

if (menuToggleBtn && mobileDrawer) {
    menuToggleBtn.addEventListener("click", () => {
        mobileDrawer.classList.add("active");
        drawerBackdrop.classList.add("active");
    });
}

function closeDrawer() {
    if (mobileDrawer) {
        mobileDrawer.classList.remove("active");
        drawerBackdrop.classList.remove("active");
    }
}

if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener("click", closeDrawer);
}

/* --- Blog Reader Modal Logic --- */
function openBlogModal(blogId) {
    const article = TOOLS_DB.find(tool => tool.id === blogId);
    if (!article) return;
    
    const modal = document.getElementById("blog-modal");
    const modalTitle = document.getElementById("blog-modal-title");
    const modalBadge = document.getElementById("blog-modal-badge");
    const modalDate = document.getElementById("blog-modal-date");
    const modalContent = document.getElementById("blog-modal-content");
    
    if (modal && modalTitle && modalBadge && modalDate && modalContent) {
        modalTitle.textContent = article.title;
        modalBadge.textContent = article.badge || "Blog";
        modalDate.textContent = article.date || "Tech Insights";
        modalContent.innerHTML = article.content || `<p>${article.description}</p>`;
        
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }
}

function closeBlogModal() {
    const modal = document.getElementById("blog-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = ""; // Enable background scroll
    }
}

// Bind modal closing actions
window.addEventListener("DOMContentLoaded", () => {
    const modalCloseBtn = document.getElementById("blog-modal-close");
    const modalBackdrop = document.querySelector(".blog-modal-backdrop");
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeBlogModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", closeBlogModal);
    }
    
    // Close modal on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeBlogModal();
        }
    });
});

drawerBackdrop.addEventListener("click", closeDrawer);

// Intercept all standard hyperlink clicks if running inside the extension context
// and open them in a new browser tab on the live website (e.g. Home, About, Blog, Contact).
if (isExtension) {
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest("a");
        if (anchor && anchor.getAttribute("href")) {
            const href = anchor.getAttribute("href");
            // Ignore internal hash scroll anchors
            if (href.startsWith("#")) return;
            
            e.preventDefault();
            // Resolve relative paths to absolute live URLs on toolshub.cam
            let targetUrl = href;
            if (href.startsWith("/")) {
                targetUrl = "https://toolshub.cam" + href;
            } else if (!href.startsWith("http")) {
                targetUrl = "https://toolshub.cam/" + href;
            }
            window.open(targetUrl, "_blank");
        }
    });
}
