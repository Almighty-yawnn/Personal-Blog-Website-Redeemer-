// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const closeSearch = document.getElementById('closeSearch');
const articlesGrid = document.getElementById('articlesGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const loadingOverlay = document.getElementById('loadingOverlay');

// Global variables
let articles = [];
let currentArticleIndex = 3; // Start showing 3 articles
let filteredArticles = [];
let currentCategory = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();  
    initializeSupabase();
    initializeApp();
    mobileMenuToggle();
    initMobileNav();
    initTouchHandlers();
});

async function initializeSupabase() {
    try {
        // Check if Supabase variables are missing or not set
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://bxusfjvtccvkpwlxupiq.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ') {
            console.warn('Supabase not configured, using fallback data');
            loadFallbackArticles();
            return;
        }

        // Try loading articles from Supabase
        await loadArticles();

    } catch (error) {
        console.error('Error initializing Supabase:', error);
        loadFallbackArticles();
    }
}

function initializeApp() {
    setupEventListeners();
    displayArticles();
    setupSmoothScrolling();
    setupScrollEffects();
}

async function loadArticles() {
    try {
        showLoading(true);
        
        // Fetch published articles from Supabase
        const fetchedArticles = await SupabaseDB.getArticles({ limit: 50 });
        
        // Transform Supabase data to match existing format
        articles = fetchedArticles.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: article.categories?.slug || 'uncategorized',
            date: article.published_at || article.created_at,
            author: article.author_name,
            image: article.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
            content: article.content,
            status: article.status
        }));
        
        filteredArticles = [...articles];
        
        // Track page view
        if (articles.length > 0) {
            // Track homepage view (you could create a special article for this)
            // SupabaseDB.trackArticleView('homepage', navigator.userAgent);
        }
        
    } catch (error) {
        console.error('Error loading articles from Supabase:', error);
        loadFallbackArticles();
    } finally {
        showLoading(false);
    }
}

function loadFallbackArticles() {
    // Fallback articles if Supabase is not available
    articles = [
        {
            id: 1,
            title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
            excerpt: "An in-depth analysis of Ghana's economic strategies and recovery plans following the global pandemic impact on local industries and employment.",
            category: "business",
            date: "2024-01-15",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
            status: "published",
            content: `
                <p>Ghana's economy has shown remarkable resilience in the face of unprecedented global challenges. As we navigate the post-pandemic landscape, several key factors emerge as crucial for sustainable recovery and growth.</p>
                
                <p>The government's strategic focus on digitalization has opened new avenues for economic development. From mobile money adoption to e-governance initiatives, technology is reshaping how Ghanaians conduct business and interact with public services.</p>
                
                <p>Agriculture remains a cornerstone of Ghana's economy, employing over 40% of the workforce. Recent investments in mechanization and sustainable farming practices are yielding positive results, with increased productivity and improved food security.</p>
                
                <p>The mining sector, particularly gold production, continues to be a significant contributor to foreign exchange earnings. However, there's a growing emphasis on responsible mining practices and community development.</p>
                
                <p>Looking ahead, Ghana's economic prospects appear promising, with projected GDP growth and increasing foreign investment. The key lies in maintaining fiscal discipline while investing in infrastructure and human capital development.</p>
            `
        },
        {
            id: 2,
            title: "Digital Transformation in Ghanaian Media: Opportunities and Challenges",
            excerpt: "Exploring how traditional media outlets in Ghana are adapting to digital platforms and the implications for journalism and public discourse.",
            category: "technology",
            date: "2024-01-12",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
            status: "published",
            content: `
                <p>The media landscape in Ghana is undergoing a fundamental transformation. Traditional newspapers, radio, and television stations are rapidly adapting to digital platforms, creating new opportunities while facing significant challenges.</p>
                
                <p>Social media platforms have democratized information sharing, allowing citizen journalists to break news and share perspectives. However, this has also led to concerns about misinformation and the need for media literacy.</p>
                
                <p>Established media houses are investing in digital infrastructure, developing mobile apps, and creating multimedia content to engage younger audiences who primarily consume news online.</p>
                
                <p>The challenge lies in monetizing digital content while maintaining editorial independence and quality journalism standards. Many outlets are experimenting with subscription models and sponsored content.</p>
                
                <p>As we move forward, the success of Ghana's media transformation will depend on balancing innovation with responsibility, ensuring that the public continues to receive accurate, timely, and relevant information.</p>
            `
        },
        {
            id: 3,
            title: "Youth Engagement in Ghana's Democratic Process: A New Generation's Voice",
            excerpt: "Examining the increasing participation of young Ghanaians in politics and civic activities, and their impact on the country's democratic development.",
            category: "politics",
            date: "2024-01-10",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop",
            status: "published",
            content: `
                <p>Ghana's democracy is experiencing a renaissance driven by unprecedented youth engagement. Young Ghanaians are no longer content to be passive observers; they are actively shaping the political discourse and demanding accountability from their leaders.</p>
                
                <p>Social media has become a powerful tool for political mobilization, with young activists using platforms like Twitter and Facebook to organize campaigns, share information, and hold politicians accountable.</p>
                
                <p>The recent elections saw record youth voter registration and participation, signaling a generational shift in political engagement. Young candidates are also running for office at various levels, bringing fresh perspectives to governance.</p>
                
                <p>However, challenges remain. Many young people still face barriers to political participation, including limited resources and entrenched political structures that favor established players.</p>
                
                <p>The future of Ghana's democracy depends on creating inclusive spaces for youth participation and ensuring that their voices are heard in policy-making processes.</p>
            `
        }
    ];
    
    filteredArticles = [...articles];
}

function displayArticles() {
    const articlesToShow = filteredArticles.slice(0, currentArticleIndex);
    
    if (articlesGrid) {
        articlesGrid.innerHTML = articlesToShow.map(article => `
            <article class="article-card" onclick="openArticle('${article.id}')">
                <img src="${article.image}" alt="${article.title}" class="article-image">
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-category">${capitalizeFirst(article.category)}</span>
                        <span class="article-date">${formatDate(article.date)}</span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <a href="#" class="read-more">Read More →</a>
                </div>
            </article>
        `).join('');
    }
    
    // Show/hide load more button
    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentArticleIndex >= filteredArticles.length ? 'none' : 'block';
    }
}

function loadMoreArticles() {
    currentArticleIndex += 3;
    displayArticles();
}

async function filterArticlesByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredArticles = [...articles];
    } else {
        filteredArticles = articles.filter(article => article.category === category);
    }
    
    currentArticleIndex = 3;
    displayArticles();
    
    // Update section title
    const sectionTitle = document.querySelector('.featured-articles .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = category === 'all' ? 'Latest Articles' : `${capitalizeFirst(category)} Articles`;
    }
}

async function openArticle(articleId) {
    // Navigate to the article detail page with proper URL routing
    window.location.href = `article.html?id=${articleId}`;
}

async function handleNewsletterSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value.trim();
    const button = form.querySelector('button');

    if (!email) {
        showToast('Please enter a valid email address.', 'warning');
        return;
    }

    // Save original button text
    const originalText = button.textContent;

    // Show loading state
    button.innerHTML = `<span class="loading"></span> <strong>Subscribing...</strong>`;
    button.disabled = true;

    try {
        // Check if Supabase keys are real
        const usingDemoKeys =
            SUPABASE_URL === 'https://bxusfjvtccvkpwlxupiq.supabase.co' &&
            SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ';

        if (!usingDemoKeys) {
            await SupabaseDB.addSubscriber(email);
            showToast('🎉 Successfully subscribed to our newsletter!', 'success');
        } else {
            // Fake delay for demo mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast('🎉 Successfully subscribed to our newsletter!', 'success');
        }

        form.reset();

    } catch (error) {
        console.error('Newsletter subscription error:', error);

        if (error.message.toLowerCase().includes('duplicate')) {
            showToast('ℹ️ You are already subscribed to our newsletter.', 'info');
        } else {
            showToast('❌ Error subscribing. Please try again later.', 'error');
        }

    } finally {
        // Restore button state
        button.textContent = originalText;
        button.disabled = false;
    }
}


async function handleContactSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const button = e.target.querySelector('button');
    
    // Show loading state
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Sending...';
    button.disabled = true;
    
    try {
        const contactData = {
            name: formData.get('name') || e.target.querySelector('input[placeholder*="Name"]').value,
            email: formData.get('email') || e.target.querySelector('input[type="email"]').value,
            subject: formData.get('subject') || e.target.querySelector('input[placeholder*="Subject"]').value,
            message: formData.get('message') || e.target.querySelector('textarea').value
        };
        
        // Try to submit to Supabase
        if (SUPABASE_URL !== 'https://bxusfjvtccvkpwlxupiq.supabase.co' && SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ') {
            await SupabaseDB.submitContact(contactData);
            showToast('Message sent successfully! We will get back to you soon.', 'success');
        } else {
            // Simulate success for demo
            await new Promise(resolve => setTimeout(resolve, 1500));
            showToast('Message sent successfully! We will get back to you soon.', 'success');
        }
        
        e.target.reset();
        
    } catch (error) {
        console.error('Contact form submission error:', error);
        showToast('Error sending message. Please try again.', 'error');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

async function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        let results = [];

        // ✅ Check if Supabase credentials are provided
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            const supabaseResults = await SupabaseDB.searchArticles(query, 10);
            results = supabaseResults.map(article => ({
                id: article.id,
                title: article.title,
                excerpt: article.excerpt,
                category: article.categories?.name || 'Uncategorized',
                date: article.published_at || article.created_at,
                content: article.content
            }));
        } else {
            // 🔄 Fallback to local search
            results = articles.filter(article => 
                article.title.toLowerCase().includes(query) ||
                article.excerpt.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query)
            );
        }

        displaySearchResults(results);

    } catch (error) {
        console.error('Search error:', error);

        // 🔄 If Supabase search fails, fallback to local
        const results = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query)
        );
        displaySearchResults(results);
    }
}


function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">No articles found matching your search.</p>';
        return;
    }
    
    const resultsHTML = results.map(article => `
        <div class="search-result-item" onclick="openArticle('${article.id}')">
            <h4>${article.title}</h4>
            <p>${article.excerpt}</p>
            <small>${formatDate(article.date)} • ${article.category}</small>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHTML;
}

function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
    
    // Search functionality
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === 'Escape') {
            closeSearchModal();
        }
    });
    
    if (closeSearch) closeSearch.addEventListener('click', closeSearchModal);
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }
    
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    
    // Load more articles
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreArticles);
    
    // Newsletter subscription
    if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    
    // Contact form
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmission);
    
    // Category filtering
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterArticlesByCategory(category);
        });
    });
    
    // Footer category links
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            filterArticlesByCategory(category);
            document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function toggleMobileMenu() {
    if (navMenu) navMenu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

function openSearchModal() {
    if (searchModal) {
        searchModal.style.display = 'block';
        if (searchInput) searchInput.focus();
    }
}

function closeSearchModal() {
    if (searchModal) {
        searchModal.style.display = 'none';
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupScrollEffects() {
    // Header background on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        }
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.article-card, .category-card, .stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #27ae60;' : ''}
        ${type === 'error' ? 'background: #e74c3c;' : ''}
        ${type === 'info' ? 'background: #3498db;' : ''}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Add keyboard shortcuts info
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        alert('Keyboard Shortcuts:\nCtrl + K: Open search\nEscape: Close modals');
    }
});

// Add search shortcut hint
setTimeout(() => {
    const searchHint = document.createElement('div');
    searchHint.innerHTML = '<small style="color:rgb(36, 212, 224);">Press Ctrl + K to search</small>';
    searchHint.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 8px 12px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        font-size: 12px;
        z-index: 1000;
    `;
    
    document.body.appendChild(searchHint);
    setTimeout(() => {
        if (searchHint.parentNode) {
            searchHint.remove();
        }
    }, 5000);
}, 2000);

function loadHeader() {
    const headerPlaceholder = document.querySelector('header[data-include-html]');
    if (headerPlaceholder) {
        const headerFile = headerPlaceholder.getAttribute('data-include-html');
        fetch(headerFile)
            .then(response => response.text())
            .then(html => {
                // Add a class to prevent flash of unstyled content
                document.documentElement.classList.add('js-header-loading');
                
                // Insert the header HTML
                headerPlaceholder.outerHTML = html;
                
                // Force reflow to ensure animations work
                void headerPlaceholder.offsetWidth;
                
                // Remove loading class to trigger animations
                setTimeout(() => {
                    document.documentElement.classList.remove('js-header-loading');
                    document.documentElement.classList.add('js-header-loaded');
                }, 50);
                
                // Re-initialize mobile menu after header is loaded
                mobileMenuToggle();
            })
            .catch(error => {
                console.error('Error loading header:', error);
                // If there's an error, still try to show the header without animation
                document.documentElement.classList.add('js-header-loaded');
            });
    } else {
        document.documentElement.classList.add('js-header-loaded');
    }
}

const texts = [
    "Connecting Data, People, and Ideas through Research, Communication, and Strategic Thinking",
    "Transforming complex information into actionable insights that drive smarter decisions.",
    "Storytelling that creates impact, inspires change, and connects with people deeply.",
    "Empowering organizations with knowledge to make informed decisions and drive positive change."
];

const typingElement = document.getElementById("typing-text");

  let textIndex = 0;   // which sentence we are on
  let charIndex = 0;   // which character in the sentence
let isDeleting = false;

function typeEffect() {
    const currentText = texts[textIndex];

    if (!isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, 3000); // pause after full sentence
        return;
    }
    } else {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length; // move to next phrase, loop back
    }
    }

    setTimeout(typeEffect, isDeleting ? 50 : 100); // adjust typing & deleting speed
}


typeEffect();

setInterval(async () => {
    try {
        const currentCount = articles.length;
        await loadArticles(); // Refetch from Supabase
        if (articles.length > currentCount) {
            filteredArticles = [...articles]; // Update filtered list
            displayArticles(); // Redisplay on homepage
            showToast(`${articles.length - currentCount} new articles published!`, 'success');
        }
    } catch (error) {
        console.error('Error refreshing articles:', error);
    }
}, 30000); // Poll every 30 seconds

function mobileMenuToggle() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.querySelector('.nav-menu');

    // Toggle mobile menu
    hamburger?.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = this.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = navMenu.contains(e.target) || hamburger.contains(e.target);
        if (!isClickInside && navMenu?.classList.contains('active')) {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    mobileMenuToggle();
});

// Mobile Navigation Toggle
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const overlay = document.querySelector('.overlay');

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
    
    // Update ARIA attributes
    const isExpanded = navMenu.classList.contains('active');
    mobileNavToggle.setAttribute('aria-expanded', isExpanded);
    
    // Toggle hamburger icon
    mobileNavToggle.classList.toggle('is-active');
}

// Close mobile menu when clicking outside
function closeMobileMenu(e) {
    if (navMenu.classList.contains('active') && !e.target.closest('.nav-menu') && !e.target.closest('.mobile-nav-toggle')) {
        toggleMobileMenu();
    }
}

// Close mobile menu when clicking on a nav link
function closeOnNavLinkClick() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
}

// Initialize mobile navigation
function initMobileNav() {
    if (mobileNavToggle) {
        // Create overlay if it doesn't exist
        if (!overlay) {
            const overlayEl = document.createElement('div');
            overlayEl.className = 'overlay';
            document.body.appendChild(overlayEl);
        }
        
        // Add event listeners
        mobileNavToggle.addEventListener('click', toggleMobileMenu);
        document.addEventListener('click', closeMobileMenu);
        closeOnNavLinkClick();
        
        // Set initial ARIA attributes
        mobileNavToggle.setAttribute('aria-label', 'Toggle navigation');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.setAttribute('aria-controls', 'nav-menu');
    }
}

// Handle touch events for better mobile UX
function initTouchHandlers() {
    // Prevent double-tap zoom on buttons and links
    const interactiveElements = document.querySelectorAll('a, button, .btn, [role="button"]');
    interactiveElements.forEach(el => {
        el.addEventListener('touchend', function(e) {
            // Add active class for visual feedback
            this.classList.add('active');
            
            // Remove active class after animation completes
            setTimeout(() => {
                this.classList.remove('active');
            }, 150);
            
            // Prevent ghost clicks on iOS
            e.preventDefault();
            this.click();
        }, { passive: false });
    });
}

// Handle viewport resize
function handleResize() {
    // Close mobile menu if window is resized to desktop
    if (window.innerWidth > 991.98 && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initTouchHandlers();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Add loaded class to body to prevent FOUC
    document.body.classList.add('loaded');
});

// Handle page transitions
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-transition-out');
});

// Handle scroll events for header
let lastScroll = 0;
const header = document.querySelector('.header');

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
}

// Handle form submissions with loading states
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
        }
    });
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Add loading class to body to prevent FOUC
document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive') {
        document.body.classList.remove('loaded');
    } else if (document.readyState === 'complete') {
        document.body.classList.add('loaded');
    }
});

// Lazy load images
if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support native lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Add focus styles for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('using-keyboard');
});

// Add smooth scroll behavior for browsers that don't support it natively
if (!('scrollBehavior' in document.documentElement.style)) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
    script.onload = () => {
        smoothScroll.polyfill();
    };
    document.head.appendChild(script);
}