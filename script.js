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

// Sample articles data (in a real application, this would come from a database)
let articles = [
    {
        id: 1,
        title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
        excerpt: "An in-depth analysis of Ghana's economic strategies and recovery plans following the global pandemic impact on local industries and employment.",
        category: "business",
        date: "2024-01-15",
        author: "Redeemer Buatsi",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
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
        content: `
            <p>Ghana's democracy is experiencing a renaissance driven by unprecedented youth engagement. Young Ghanaians are no longer content to be passive observers; they are actively shaping the political discourse and demanding accountability from their leaders.</p>
            
            <p>Social media has become a powerful tool for political mobilization, with young activists using platforms like Twitter and Facebook to organize campaigns, share information, and hold politicians accountable.</p>
            
            <p>The recent elections saw record youth voter registration and participation, signaling a generational shift in political engagement. Young candidates are also running for office at various levels, bringing fresh perspectives to governance.</p>
            
            <p>However, challenges remain. Many young people still face barriers to political participation, including limited resources and entrenched political structures that favor established players.</p>
            
            <p>The future of Ghana's democracy depends on creating inclusive spaces for youth participation and ensuring that their voices are heard in policy-making processes.</p>
        `
    },
    {
        id: 4,
        title: "Climate Change and Agricultural Adaptation in Northern Ghana",
        excerpt: "Investigating how farmers in Northern Ghana are adapting to changing weather patterns and the role of technology in sustainable agriculture.",
        category: "society",
        date: "2024-01-08",
        author: "Redeemer Buatsi",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=250&fit=crop",
        content: `
            <p>Climate change is presenting unprecedented challenges to agricultural communities in Northern Ghana. Farmers who have relied on traditional farming methods for generations are now forced to adapt to increasingly unpredictable weather patterns.</p>
            
            <p>Prolonged droughts followed by intense flooding have disrupted planting seasons and reduced crop yields. Many farmers are turning to drought-resistant crop varieties and improved irrigation systems to maintain productivity.</p>
            
            <p>Technology is playing a crucial role in adaptation efforts. Mobile apps providing weather forecasts and farming advice are helping farmers make informed decisions about planting and harvesting.</p>
            
            <p>Government and NGO initiatives are supporting farmers with training on climate-smart agriculture techniques, including crop rotation, soil conservation, and water management.</p>
            
            <p>The resilience of Northern Ghana's farming communities is remarkable, but sustained support and investment in adaptation strategies are essential for long-term food security and rural livelihoods.</p>
        `
    },
    {
        id: 5,
        title: "The Rise of Fintech in Ghana: Transforming Financial Inclusion",
        excerpt: "Analyzing the growth of financial technology companies in Ghana and their impact on banking, payments, and financial services accessibility.",
        category: "technology",
        date: "2024-01-05",
        author: "Redeemer Buatsi",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
        content: `
            <p>Ghana's fintech sector is experiencing explosive growth, revolutionizing how Ghanaians access and use financial services. Mobile money platforms have become ubiquitous, with millions of users conducting daily transactions through their phones.</p>
            
            <p>Traditional banks are partnering with fintech companies to expand their reach and improve customer experience. Digital lending platforms are providing credit to previously underserved populations, including small business owners and rural communities.</p>
            
            <p>The regulatory environment has been supportive, with the Bank of Ghana implementing policies that encourage innovation while ensuring consumer protection and financial stability.</p>
            
            <p>Challenges remain, including cybersecurity concerns and the need for greater financial literacy among users. However, the potential for fintech to drive economic inclusion and growth is enormous.</p>
            
            <p>As Ghana continues to digitize its economy, fintech companies will play an increasingly important role in shaping the country's financial landscape and supporting economic development.</p>
        `
    },
    {
        id: 6,
        title: "Education Reform in Ghana: Preparing Students for the Future",
        excerpt: "Examining recent changes to Ghana's education system and their implications for student outcomes and workforce development.",
        category: "society",
        date: "2024-01-03",
        author: "Redeemer Buatsi",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
        content: `
            <p>Ghana's education system is undergoing significant reforms aimed at preparing students for the demands of the 21st century economy. The introduction of new curricula emphasizing STEM education and critical thinking skills represents a major shift from traditional rote learning methods.</p>
            
            <p>Technology integration in classrooms is accelerating, with initiatives to provide tablets and internet connectivity to schools across the country. This digital transformation is particularly important in rural areas where educational resources have historically been limited.</p>
            
            <p>Teacher training programs are being revamped to ensure educators are equipped with modern pedagogical skills and subject matter expertise. The government has also increased investment in teacher salaries and professional development.</p>
            
            <p>Challenges include infrastructure gaps, particularly in rural schools, and the need for sustained funding to implement reforms effectively. However, early indicators suggest that students are responding positively to the new approaches.</p>
            
            <p>The success of these reforms will be crucial for Ghana's long-term economic competitiveness and social development, as education remains the foundation for individual and national progress.</p>
        `
    }
];

let currentArticleIndex = 3; // Start showing 3 articles
let filteredArticles = [...articles];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    displayArticles();
    setupSmoothScrolling();
    setupScrollEffects();
}

function setupEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
    
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
    
    closeSearch.addEventListener('click', closeSearchModal);
    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });
    
    searchInput.addEventListener('input', handleSearch);
    
    // Load more articles
    loadMoreBtn.addEventListener('click', loadMoreArticles);
    
    // Newsletter subscription
    newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    
    // Contact form
    contactForm.addEventListener('submit', handleContactSubmission);
    
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
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function openSearchModal() {
    searchModal.style.display = 'block';
    searchInput.focus();
}

function closeSearchModal() {
    searchModal.style.display = 'none';
    searchInput.value = '';
    searchResults.innerHTML = '';
}

function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    const results = articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
    );
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">No articles found matching your search.</p>';
        return;
    }
    
    const resultsHTML = results.map(article => `
        <div class="search-result-item" onclick="openArticle(${article.id})">
            <h4>${article.title}</h4>
            <p>${article.excerpt}</p>
            <small>${formatDate(article.date)} • ${capitalizeFirst(article.category)}</small>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHTML;
}

function displayArticles() {
    const articlesToShow = filteredArticles.slice(0, currentArticleIndex);
    
    articlesGrid.innerHTML = articlesToShow.map(article => `
        <article class="article-card" onclick="openArticle(${article.id})">
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
    
    // Show/hide load more button
    loadMoreBtn.style.display = currentArticleIndex >= filteredArticles.length ? 'none' : 'block';
}

function loadMoreArticles() {
    currentArticleIndex += 3;
    displayArticles();
}

function filterArticlesByCategory(category) {
    if (category === 'all') {
        filteredArticles = [...articles];
    } else {
        filteredArticles = articles.filter(article => article.category === category);
    }
    
    currentArticleIndex = 3;
    displayArticles();
    
    // Update section title
    const sectionTitle = document.querySelector('.featured-articles .section-title');
    sectionTitle.textContent = category === 'all' ? 'Latest Articles' : `${capitalizeFirst(category)} Articles`;
}

function openArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    // Create article detail page
    const articleDetailHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${article.title} - Redeemer Buatsi</title>
            <link rel="stylesheet" href="styles.css">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <header class="header">
                <nav class="nav">
                    <div class="nav-container">
                        <div class="logo">
                            <h1>Redeemer Buatsi</h1>
                            <p>Journalist & Media Professional</p>
                        </div>
                        <ul class="nav-menu">
                            <li><a href="index.html" class="nav-link">Home</a></li>
                            <li><a href="index.html#about" class="nav-link">About</a></li>
                            <li><a href="index.html#articles" class="nav-link">Articles</a></li>
                            <li><a href="index.html#contact" class="nav-link">Contact</a></li>
                            <li><a href="admin.html" class="nav-link admin-link">Admin</a></li>
                        </ul>
                    </div>
                </nav>
            </header>
            
            <main style="padding-top: 100px;">
                <div class="article-detail">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="meta">
                        <div>
                            <span class="article-category">${capitalizeFirst(article.category)}</span>
                            <span style="margin: 0 1rem;">•</span>
                            <span>${formatDate(article.date)}</span>
                        </div>
                        <span>By ${article.author}</span>
                    </div>
                    <h1>${article.title}</h1>
                    <div class="content">
                        ${article.content}
                    </div>
                    <div style="margin-top: 3rem; text-align: center;">
                        <a href="index.html" class="btn btn-primary">← Back to Articles</a>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `;
    
    // Open in new window/tab
    const newWindow = window.open('', '_blank');
    newWindow.document.write(articleDetailHTML);
    newWindow.document.close();
}

function handleNewsletterSubmission(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simulate API call
    const button = e.target.querySelector('button');
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Subscribing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = 'Subscribed!';
        button.style.background = '#27ae60';
        e.target.reset();
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
    }, 1500);
}

function handleContactSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Simulate API call
    const button = e.target.querySelector('button');
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Sending...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = 'Message Sent!';
        button.style.background = '#27ae60';
        e.target.reset();
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
    }, 1500);
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
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
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

// Add keyboard shortcuts info
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        alert('Keyboard Shortcuts:\nCtrl + K: Open search\nEscape: Close modals');
    }
});

// Add search shortcut hint
const searchHint = document.createElement('div');
searchHint.innerHTML = '<small style="color: #7f8c8d;">Press Ctrl + K to search</small>';
searchHint.style.position = 'fixed';
searchHint.style.bottom = '20px';
searchHint.style.right = '20px';
searchHint.style.background = 'rgba(255, 255, 255, 0.9)';
searchHint.style.padding = '8px 12px';
searchHint.style.borderRadius = '4px';
searchHint.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
searchHint.style.fontSize = '12px';
searchHint.style.zIndex = '1000';

// Show hint for 5 seconds after page load
setTimeout(() => {
    document.body.appendChild(searchHint);
    setTimeout(() => {
        if (searchHint.parentNode) {
            searchHint.remove();
        }
    }, 5000);
}, 2000);
