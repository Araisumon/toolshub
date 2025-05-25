// Initialize cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [
        { title: 'Premium Wireless Earbuds', price: 89.99, quantity: 1 },
        { title: 'Smart Watch Pro 2023', price: 199.99, quantity: 1 },
        { title: 'Fast Wireless Charger', price: 29.99, quantity: 1 }
    ];

    // Function to update cart summary (modal and checkout section)
    function updateCartSummary() {
        const cartItemsContainers = document.querySelectorAll('.cart-items');
        const cartItemCounts = document.querySelectorAll('.cart-item-count');
        const cartSubtotals = document.querySelectorAll('.cart-subtotal');
        const cartTaxes = document.querySelectorAll('.cart-tax');
        const cartTotals = document.querySelectorAll('.cart-total');
        const cartModal = document.querySelector('.cart-modal');
        const cartEmpty = document.querySelector('.cart-empty');

        // Update cart count
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCounts.forEach(count => count.textContent = totalQuantity);
        document.querySelector('.cart-count').textContent = totalQuantity;

        // Update cart items
        cartItemsContainers.forEach(container => {
            container.innerHTML = '';
            cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                if (container.classList.contains('cart-items') && container.closest('.cart-modal')) {
                    // Modal cart items
                    itemElement.classList.add('cart-item');
                    itemElement.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-index="${index}" data-tooltip="Decrease Quantity">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-index="${index}" data-tooltip="Increase Quantity">+</button>
                        </div>
                        <button class="remove-item" data-index="${index}" data-tooltip="Remove Item">Remove</button>
                    `;
                } else {
                    // Checkout section cart items
                    itemElement.classList.add('summary-item');
                    itemElement.innerHTML = `
                        <span>${item.title} × ${item.quantity}</span>
                        <span>$${(item.quantity * item.price).toFixed(2)}</span>
                    `;
                }
                container.appendChild(itemElement);
            });
        });

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.06; // 6% tax
        const total = subtotal + tax;

        // Update totals
        cartSubtotals.forEach(subtotalEl => subtotalEl.textContent = `$${subtotal.toFixed(2)}`);
        cartTaxes.forEach(taxEl => taxEl.textContent = `$${tax.toFixed(2)}`);
        cartTotals.forEach(totalEl => totalEl.textContent = `$${total.toFixed(2)}`);

        // Show/hide empty cart message
        if (cart.length === 0 && cartModal.style.display === 'flex') {
            cartEmpty.style.display = 'block';
            cartItemsContainers[0].style.display = 'none'; // Hide modal cart items
        } else {
            cartEmpty.style.display = 'none';
            cartItemsContainers[0].style.display = 'block';
        }

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to update user menu based on login status
    function updateUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        const userEmailEl = document.querySelector('.user-email');
        const signinLink = document.querySelector('.user-signin');
        const logoutLink = document.querySelector('.user-logout');
        const loggedInUser = localStorage.getItem('loggedInUser');

        if (loggedInUser) {
            userEmailEl.textContent = loggedInUser;
            signinLink.style.display = 'none';
            logoutLink.style.display = 'block';
        } else {
            userEmailEl.textContent = 'Sign In';
            signinLink.style.display = 'block';
            logoutLink.style.display = 'none';
        }
    }

    // Cart modal toggle
    const cartModal = document.querySelector('.cart-modal');
    const cartLink = document.querySelector('.user-actions a[href="#"] .fa-shopping-cart').parentElement;
    const cartModalClose = document.querySelector('.cart-modal-close');
    const continueShopping = document.querySelector('.continue-shopping');

    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        cartLink.classList.add('loading');
        cartLink.style.pointerEvents = 'none';
        setTimeout(() => {
            cartModal.style.display = 'flex';
            updateCartSummary();
            cartLink.classList.remove('loading');
            cartLink.style.pointerEvents = 'auto';
        }, 1000);
    });

    cartModalClose.addEventListener('click', () => {
        cartModalClose.classList.add('loading');
        cartModal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            cartModal.style.display = 'none';
            cartModal.style.animation = 'fadeIn 0.3s ease';
            cartModalClose.classList.remove('loading');
        }, 300);
    });

    continueShopping.addEventListener('click', () => {
        continueShopping.classList.add('loading');
        cartModal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            cartModal.style.display = 'none';
            cartModal.style.animation = 'fadeIn 0.3s ease';
            continueShopping.classList.remove('loading');
        }, 300);
    });

    // Close modal when clicking outside
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModalClose.click();
        }
    });

    // Cart item actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const index = parseInt(e.target.dataset.index);
            const isIncrease = e.target.classList.contains('increase');
            e.target.classList.add('loading');
            e.target.disabled = true;
            setTimeout(() => {
                if (isIncrease) {
                    cart[index].quantity += 1;
                } else if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                }
                updateCartSummary();
                e.target.classList.remove('loading');
                e.target.disabled = false;
            }, 1000);
        } else if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            e.target.classList.add('loading');
            e.target.disabled = true;
            setTimeout(() => {
                cart.splice(index, 1);
                updateCartSummary();
                e.target.classList.remove('loading');
                e.target.disabled = false;
            }, 1000);
        }
    });

    // Sign-in modal toggle
    const signinModal = document.querySelector('.signin-modal');
    const signinLink = document.querySelector('.user-signin');
    const signinModalClose = document.querySelector('.signin-modal-close');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.querySelector('.error-message');

    signinLink.addEventListener('click', (e) => {
        e.preventDefault();
        signinLink.parentElement.parentElement.classList.add('loading');
        signinLink.style.pointerEvents = 'none';
        setTimeout(() => {
            signinModal.style.display = 'flex';
            errorMessage.style.display = 'none';
            loginForm.reset();
            signinLink.parentElement.parentElement.classList.remove('loading');
            signinLink.style.pointerEvents = 'auto';
        }, 1000);
    });

    signinModalClose.addEventListener('click', () => {
        signinModalClose.classList.add('loading');
        signinModal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            signinModal.style.display = 'none';
            signinModal.style.animation = 'fadeIn 0.3s ease';
            signinModalClose.classList.remove('loading');
        }, 300);
    });

    // Close sign-in modal when clicking outside
    signinModal.addEventListener('click', (e) => {
        if (e.target === signinModal) {
            signinModalClose.click();
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const userData = JSON.parse(localStorage.getItem('userData'));

        setTimeout(() => {
            if (userData && userData.email === email && userData.password === password) {
                // Successful login
                localStorage.setItem('loggedInUser', email);
                updateUserMenu();
                alert(`Welcome back, ${email}!`);
                signinModalClose.click();
            } else {
                // Invalid credentials
                errorMessage.textContent = 'Invalid email or password. Please try again.';
                errorMessage.style.display = 'block';
            }
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }, 1000);
    });

    // Logout functionality
    const logoutLink = document.querySelector('.user-logout');
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logoutLink.parentElement.parentElement.classList.add('loading');
        logoutLink.style.pointerEvents = 'none';
        setTimeout(() => {
            localStorage.removeItem('loggedInUser');
            updateUserMenu();
            alert('You have been logged out.');
            logoutLink.parentElement.parentElement.classList.remove('loading');
            logoutLink.style.pointerEvents = 'auto';
        }, 1000);
    });

    // Chatbot toggle functionality
    const chatbotIcon = document.querySelector('.chatbot-icon');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotSend = document.querySelector('.chatbot-send');
    const chatbotInput = document.querySelector('.chatbot-input input');
    const chatbotMessages = document.querySelector('.chatbot-messages');

    chatbotIcon.addEventListener('click', () => {
        chatbotContainer.style.display = 'flex';
    });

    chatbotClose.addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
    });

    // Mock chatbot response
    chatbotSend.addEventListener('click', () => {
        const message = chatbotInput.value.trim();
        if (message) {
            chatbotSend.classList.add('loading');
            chatbotSend.disabled = true;
            const userMessage = document.createElement('div');
            userMessage.classList.add('chatbot-message', 'user');
            userMessage.textContent = message;
            chatbotMessages.appendChild(userMessage);

            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.classList.add('chatbot-message', 'bot');
                botMessage.textContent = `Thanks for your message: "${message}". How else can I assist you?`;
                chatbotMessages.appendChild(botMessage);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                chatbotInput.value = '';
                chatbotSend.classList.remove('loading');
                chatbotSend.disabled = false;
            }, 1000);
        }
    });

    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatbotSend.click();
        }
    });

    // Mobile menu toggle functionality
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Voice search functionality
    const voiceSearch = document.querySelector('.voice-search');
    const searchInput = document.querySelector('.search-bar input');

    voiceSearch.addEventListener('click', () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.onresult = (event) => {
                const query = event.results[0][0].transcript;
                searchInput.value = query;
                alert(`Searching for: ${query}`);
            };
            recognition.onerror = () => {
                alert('Error with voice search. Please try again.');
            };
            recognition.start();
        } else {
            alert('Voice search is not supported in this browser.');
        }
    });

    // Mock filtering logic
    const filterTags = document.querySelectorAll('.filter-tag');
    const resetFilters = document.querySelector('.reset-filters');
    const productCards = document.querySelectorAll('.product-card');

    function applyFilters() {
        const activeFilters = {
            category: document.querySelector('.filter-tag.active[data-filter="category"]')?.dataset.value,
            price: document.querySelector('.filter-tag.active[data-filter="price"]')?.dataset.value,
            brand: document.querySelector('.filter-tag.active[data-filter="brand"]')?.dataset.value,
            rating: document.querySelector('.filter-tag.active[data-filter="rating"]')?.dataset.value
        };

        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardPrice = parseFloat(card.dataset.price);
            const cardBrand = card.dataset.brand;
            const cardRating = parseInt(card.dataset.rating);

            let showCard = true;

            // Category filter
            if (activeFilters.category && activeFilters.category !== 'All') {
                showCard = showCard && cardCategory === activeFilters.category;
            }

            // Price filter
            if (activeFilters.price) {
                if (activeFilters.price === '0-50') {
                    showCard = showCard && cardPrice <= 50;
                } else if (activeFilters.price === '50-100') {
                    showCard = showCard && cardPrice > 50 && cardPrice <= 100;
                } else if (activeFilters.price === '100-200') {
                    showCard = showCard && cardPrice > 100 && cardPrice <= 200;
                } else if (activeFilters.price === '200+') {
                    showCard = showCard && cardPrice > 200;
                }
            }

            // Brand filter
            if (activeFilters.brand) {
                showCard = showCard && cardBrand === activeFilters.brand;
            }

            // Rating filter
            if (activeFilters.rating) {
                showCard = showCard && cardRating >= parseInt(activeFilters.rating);
            }

            card.classList.toggle('hidden', !showCard);
        });
    }

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const filterGroup = tag.parentElement;
            filterGroup.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            applyFilters();
        });
    });

    resetFilters.addEventListener('click', () => {
        filterTags.forEach(tag => {
            if (tag.dataset.value === 'All' || tag.dataset.value === '50-100' || tag.dataset.value === 'Samsung' || tag.dataset.value === '3') {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
        applyFilters();
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            button.classList.add('loading');
            button.disabled = true;
            const productCard = button.closest('.product-card');
            const title = productCard.querySelector('.product-title').textContent;
            const price = parseFloat(productCard.querySelector('.current-price').textContent.replace('$', ''));

            setTimeout(() => {
                const existingItem = cart.find(item => item.title === title);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ title, price, quantity: 1 });
                }
                updateCartSummary();
                button.classList.remove('loading');
                button.disabled = false;
                alert(`${title} added to cart!`);
            }, 1000);
        });
    });

    // Checkout button functionality
    const checkoutButtons = document.querySelectorAll('.checkout-btn');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('loading');
            button.disabled = true;
            setTimeout(() => {
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                } else {
                    const activePayment = document.querySelector('.payment-method.active')?.textContent.trim() || 'None';
                    alert(`Processing checkout with ${activePayment}... Thank you for your purchase!`);
                    cart = [];
                    updateCartSummary();
                    cartModal.style.display = 'none';
                }
                button.classList.remove('loading');
                button.disabled = false;
            }, 2000);
        });
    });

    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');

    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.querySelector('i').classList.toggle('fa-moon', theme === 'light');
        themeToggle.querySelector('i').classList.toggle('fa-sun', theme === 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    // Scroll tool functionality
    const scrollTool = document.querySelector('.scroll-tool');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTool.classList.add('visible');
        } else {
            scrollTool.classList.remove('visible');
        }
    });

    scrollTool.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize cart and user menu on page load
    updateCartSummary();
    updateUserMenu();