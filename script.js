/*
 * PawBlocks Pet Shop - Main JavaScript
 * Handles navigation, search, scroll animations, and cart functionality
 * All rights reserved © 2025
 */

// ---- SCROLL ANIMATIONS ----

// Initialize scroll animations with Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToObserve = document.querySelectorAll(
        'section, .instruction-card, .product-card, .item'
    );
    elementsToObserve.forEach(element => observer.observe(element));
}

// ---- NAVBAR FUNCTIONALITY ----

// Initialize navbar and hamburger menu
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburgerMenu = document.getElementById('menu-icon');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    // Scroll effect - navbar becomes more compact
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Hamburger menu toggle
    if (hamburgerMenu && navbarMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
        
        // Close menu when a menu item is clicked
        const menuItems = navbarMenu.querySelectorAll('.navbar-menu-item a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                navbarMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (navbarMenu.classList.contains('active') && 
                !navbarMenu.contains(e.target) && 
                !hamburgerMenu.contains(e.target)) {
                navbarMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    }
}

// ===== SCROLL TO TOP BUTTON =====

// Initialize scroll to top button functionality
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }, { passive: true });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== SEARCH FUNCTIONALITY =====

// Initialize search with text highlighting
function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    // Clear highlights when input is cleared
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === '') {
            clearHighlights();
        }
    });
    
    // Handle search on Enter key - search through all text content
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (searchTerm === '') return;
            
            // Remove previous highlights
            clearHighlights();
            
            // Search through all text content, excluding nav and script/style elements
            const elements = document.querySelectorAll('body *:not(script):not(style):not(nav):not(nav *)');
            let firstHighlightedElement = null;
            
            elements.forEach(element => {
                // Only process leaf nodes with text content
                if (element.children.length === 0 && element.textContent) {
                    const text = element.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        const regex = new RegExp(`(${searchTerm})`, 'gi');
                        element.innerHTML = element.textContent.replace(regex, '<span class="highlight">$1</span>');
                        if (!firstHighlightedElement) {
                            firstHighlightedElement = element;
                        }
                    }
                }
            });
            
            // Scroll to first match
            if (firstHighlightedElement) {
                firstHighlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// Clear all search highlights
function clearHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.textContent = parent.textContent;
    });
}

// ---- CART STATE & DOM ELEMENTS ----

let cart = [];

// Cache DOM elements for better performance
const domElements = {
    cartIcon: document.querySelector('.ri-shopping-basket-fill')?.closest('a'),
    cartSidebar: document.querySelector('.basket-sidebar'),
    closeCart: document.querySelector('.close-basket'),
    addToCartButtons: document.querySelectorAll('.add-to-basket'),
    cartItemsContainer: document.querySelector('.basket-items'),
    totalPrice: document.querySelector('.total-price'),
    placeOrderBtn: document.querySelectorAll('.btn-place-order'),
    modal: document.getElementById('order-modal'),
    overlay: document.querySelector('.overlay'),
    closeModal: document.querySelector('#order-modal .close'),
    modalCloseBtn: null,
    checkoutForm: document.querySelector('#order-modal form'),
    contactForm: document.querySelector('.contact-form')
};

// Initialize cart from local storage
function initCart() {
    const savedCart = localStorage.getItem('pawblocksCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('pawblocksCart', JSON.stringify(cart));
}

// ---- CART BADGE ----

// Update cart badge with item count
function updateCartBadge() {
    let badge = document.querySelector('.basket-badge');
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCount > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add('basket-badge');
            if (domElements.cartIcon) {
                domElements.cartIcon.appendChild(badge);
            }
        }
        badge.textContent = cartCount;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// ---- CART MANAGEMENT ----

// Add item to cart
function addToCart(itemName, price) {
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: itemName, price, quantity: 1 });
    }
    
    updateCart();
    saveCart();
}

// Update cart display
function updateCart() {
    domElements.cartItemsContainer.innerHTML = '';
    
    let total = 0;
    let itemCount = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.classList.add('basket-item');
        cartItemEl.innerHTML = `
            <div class="basket-item-info">
                <div class="basket-item-name">${item.name}</div>
                <div class="basket-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <button class="basket-item-remove" data-index="${index}">Remove</button>
        `;
        domElements.cartItemsContainer.appendChild(cartItemEl);
    });
    
    domElements.totalPrice.textContent = total.toFixed(2);
    updateCartBadge();
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.basket-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeFromCart(parseInt(e.target.dataset.index));
        });
    });
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    saveCart();
}

// ---- MODAL MANAGEMENT ----

// Open checkout modal
function openModal() {
    if (domElements.modal && domElements.overlay) {
        domElements.modal.classList.add('active');
        domElements.overlay.classList.add('active');
    }
}

// Close checkout modal
function closeModal() {
    if (domElements.modal && domElements.overlay) {
        domElements.modal.classList.remove('active');
        domElements.overlay.classList.remove('active');
    }
}

// ---- CONTACT FORM VALIDATION ----

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate contact form data
function validateContactForm(formData) {
    const { name, email, message } = formData;
    let isValid = true;
    
    // Clear previous errors
    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('message-error').textContent = '';
    
    if (!name.trim()) {
        document.getElementById('name-error').textContent = 'Please enter your name.';
        isValid = false;
    }
    if (!validateEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address.';
        isValid = false;
    }
    if (!message.trim()) {
        document.getElementById('message-error').textContent = 'Please enter your message.';
        isValid = false;
    }
    return isValid;
}

// ---- CHECKOUT FORM VALIDATION ----

function validateCheckoutForm(formData) {
    const { name, email, phone, address } = formData;
    let isValid = true;
    
    if (!name.trim()) {
        alert('Please enter your name.');
        isValid = false;
    } else if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        isValid = false;
    } else if (!phone.trim()) {
        alert('Please enter your phone number.');
        isValid = false;
    } else if (!address.trim()) {
        alert('Please enter your address.');
        isValid = false;
    }
    return isValid;
}

// ---- EVENT LISTENERS INITIALIZATION ----

function initEventListeners() {
    // Cart open/close functionality
    if (domElements.cartIcon && domElements.cartSidebar) {
        domElements.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (domElements.cartSidebar) domElements.cartSidebar.classList.add('active');
            if (domElements.overlay) domElements.overlay.classList.add('active');
        });
    }
    
    if (domElements.closeCart) {
        domElements.closeCart.addEventListener('click', () => {
            if (domElements.cartSidebar) domElements.cartSidebar.classList.remove('active');
            if (domElements.overlay) domElements.overlay.classList.remove('active');
        });
    }
    
    // Add to cart button functionality
    domElements.addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const itemName = e.target.dataset.item;
            const price = parseFloat(e.target.closest('.item').dataset.price);
            addToCart(itemName, price);
        });
    });
    
    // Place order modal
    if (domElements.placeOrderBtn && domElements.placeOrderBtn.length) {
        domElements.placeOrderBtn.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        }));
    }
    
    // Modal close buttons
    if (domElements.closeModal) {
        domElements.closeModal.addEventListener('click', closeModal);
    }
    
    // Overlay click to close modal
    if (domElements.overlay) {
        domElements.overlay.addEventListener('click', (e) => {
            if (e.target === domElements.overlay) {
                closeModal();
            }
        });
    }
    
    // Checkout form submission
    if (domElements.checkoutForm) {
        domElements.checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: domElements.checkoutForm.querySelector('#name')?.value || '',
                email: domElements.checkoutForm.querySelector('#email')?.value || '',
                phone: domElements.checkoutForm.querySelector('#phone')?.value || '',
                address: domElements.checkoutForm.querySelector('#address')?.value || ''
            };
            
            if (validateCheckoutForm(formData)) {
                // Clear form and cart after successful submission
                domElements.checkoutForm.reset();
                const cartItems = cart.map(item => `${item.name} x${item.quantity} ($${item.price.toFixed(2)})`).join('; ');
                const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                
                console.log('Order placed:', {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    items: cartItems,
                    total: `$${totalPrice.toFixed(2)}`
                });
                
                cart = [];
                saveCart();
                updateCart();
                closeModal();
            }
        });
    }
    
    // Contact form submission
    if (domElements.contactForm) {
        domElements.contactForm.addEventListener('submit', (e) => {
            const formData = {
                name: domElements.contactForm.querySelector('input[type="text"]')?.value || '',
                email: domElements.contactForm.querySelector('input[type="email"]')?.value || '',
                message: domElements.contactForm.querySelector('textarea')?.value || ''
            };
            
            if (!validateContactForm(formData)) {
                e.preventDefault();
            } else {
                // Clear form after successful validation
                setTimeout(() => {
                    domElements.contactForm.reset();
                    document.getElementById('name-error').textContent = '';
                    document.getElementById('email-error').textContent = '';
                    document.getElementById('message-error').textContent = '';
                }, 100);
            }
        });
    }
}

// ---- INITIALIZATION ----

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components on page load
    initScrollAnimations();
    initNavbar();
    initCart();
    initScrollToTop();
    initSearch();
    initEventListeners();
}, { passive: true });
