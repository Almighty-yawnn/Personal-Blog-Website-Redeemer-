// Articles Page JavaScript
// Handles the dedicated articles listing page with search, filtering, and pagination

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const allArticlesGrid = document.getElementById('allArticlesGrid');
const articlesCount = document.getElementById('articlesCount');
const articleSearchInput = document.getElementById('articleSearchInput');
const categoryFilterSelect = document.getElementById('categoryFilterSelect');
const sortSelect = document.getElementById('sortSelect');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const loadingMore = document.getElementById('loadingMore');
const loadingOverlay = document.getElementById('loadingOverlay');

// Global variables
let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
const articlesPerPage = 12;
let totalPages = 1;
let currentCategory = 'all';
let currentSort = 'newest';
let searchQuery = '';

// Initialize the articles page
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    setupEventListeners();
    loadCategories();
});

async function initializeSupabase() {
    try {
        // Check if Supabase is properly configured
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('Supabase not configured, using fallback data');
            loadFallbackArticles();
            return;
        }
        
        // Load articles from Supabase
        await loadAllArticles();
        
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        loadFallbackArticles();
    }
}

async function loadAllArticles() {
    try {
        showLoading(true);
        
        // Fetch all published articles from Supabase
        const fetchedArticles = await SupabaseDB.getArticles({ limit: 1000 });
        
        // Transform Supabase data to match existing format
        allArticles = fetchedArticles.map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: article.categories?.slug || 'uncategorized',
            categoryName: article.categories?.name || 'Uncategorized',
            date: article.published_at || article.created_at,
            author: article.author_name,
            image: article.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
            content: article.content,
            status: article.status,
            tags: article.tags || []
        }));
        
        // Apply initial filters and display
        applyFiltersAndDisplay();
        
    } catch (error) {
        console.error('Error loading articles from Supabase:', error);
        loadFallbackArticles();
    } finally {
        showLoading(false);
    }
}

function loadFallbackArticles() {
    // Fallback articles if Supabase is not available
    allArticles = [
        {
            id: 1,
            title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
            excerpt: "An in-depth analysis of Ghana's economic strategies and recovery plans following the global pandemic impact on local industries and employment.",
            category: "business",
            categoryName: "Business",
            date: "2024-01-15",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
            status: "published",
            tags: ["economy", "ghana", "recovery"],
            content: `<p>Ghana's economy has shown remarkable resilience in the face of unprecedented global challenges...</p>`
        },
        {
            id: 2,
            title: "Digital Transformation in Ghanaian Media: Opportunities and Challenges",
            excerpt: "Exploring how traditional media outlets in Ghana are adapting to digital platforms and the implications for journalism and public discourse.",
            category: "technology",
            categoryName: "Technology",
            date: "2024-01-12",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop",
            status: "published",
            tags: ["media", "digital", "journalism"],
            content: `<p>The media landscape in Ghana is undergoing a fundamental transformation...</p>`
        },
        {
            id: 3,
            title: "Youth Engagement in Ghana's Democratic Process: A New Generation's Voice",
            excerpt: "Examining the increasing participation of young Ghanaians in politics and civic activities, and their impact on the country's democratic development.",
            category: "politics",
            categoryName: "Politics",
            date: "2024-01-10",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop",
            status: "published",
            tags: ["politics", "youth", "democracy"],
            content: `<p>Ghana's democracy is experiencing a renaissance driven by unprecedented youth engagement...</p>`
        }
    ];
    
    applyFiltersAndDisplay();
}

async function loadCategories() {
    try {
        if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
            const categories = await SupabaseDB.getCategories();
            updateCategoryFilter(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        // Use default categories
        const defaultCategories = [
            { slug: 'politics', name: 'Politics' },
            { slug: 'business', name: 'Business' },
            { slug: 'technology', name: 'Technology' },
            { slug: 'society', name: 'Society' }
        ];
        updateCategoryFilter(defaultCategories);
    }
}

function updateCategoryFilter(categories) {
    categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.slug;
        option.textContent = category.name;
        categoryFilterSelect.appendChild(option);
    });
}

function applyFiltersAndDisplay() {
    // Start with all articles
    filteredArticles = [...allArticles];
    
    // Apply search filter
    if (searchQuery.trim()) {
        filteredArticles = filteredArticles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === currentCategory);
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'newest':
            filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title':
            filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    currentPage = Math.min(currentPage, Math.max(1, totalPages));
    
    // Update display
    updateArticlesCount();
    displayCurrentPage();
    updatePaginationControls();
}

function updateArticlesCount() {
    const total = filteredArticles.length;
    const start = (currentPage - 1) * articlesPerPage + 1;
    const end = Math.min(currentPage * articlesPerPage, total);
    
    if (total === 0) {
        articlesCount.textContent = 'No articles found';
    } else if (total <= articlesPerPage) {
        articlesCount.textContent = `Showing ${total} article${total === 1 ? '' : 's'}`;
    } else {
        articlesCount.textContent = `Showing ${start}-${end} of ${total} articles`;
    }
}

function displayCurrentPage() {
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, endIndex);
    
    if (articlesToShow.length === 0) {
        allArticlesGrid.innerHTML = `
            <div class="no-articles">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No articles found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    allArticlesGrid.innerHTML = articlesToShow.map(article => `
        <article class="article-card" onclick="openArticle('${article.id}')">
            <img src="${article.image}" alt="${article.title}" class="article-image" loading="lazy">
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-category">${article.categoryName}</span>
                    <span class="article-date">${formatDate(article.date)}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-footer">
                    <span class="article-author">By ${article.author}</span>
                    <a href="#" class="read-more" onclick="event.stopPropagation(); openArticle('${article.id}')">Read More →</a>
                </div>
            </div>
        </article>
    `).join('');
}

function updatePaginationControls() {
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    }
    
    paginationControls.style.display = 'flex';
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function openArticle(articleId) {
    // Create a proper article detail page URL with query parameter
    const articleUrl = `article.html?id=${articleId}`;
    window.location.href = articleUrl;
}

function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
    
    // Search functionality
    if (articleSearchInput) {
        articleSearchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Category filter
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', handleCategoryFilter);
    }
    
    // Sort filter
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Pagination controls
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    
    // Footer category links
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            categoryFilterSelect.value = category;
            handleCategoryFilter();
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            articleSearchInput.focus();
        }
    });
}

function handleSearch() {
    searchQuery = articleSearchInput.value.trim();
    currentPage = 1;
    applyFiltersAndDisplay();
}

function handleCategoryFilter() {
    currentCategory = categoryFilterSelect.value;
    currentPage = 1;
    applyFiltersAndDisplay();
}

function handleSortChange() {
    currentSort = sortSelect.value;
    currentPage = 1;
    applyFiltersAndDisplay();
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        applyFiltersAndDisplay();
        // Scroll to top of articles
        document.querySelector('.articles-listing').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function toggleMobileMenu() {
    if (navMenu) navMenu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

// Auto-refresh articles every 30 seconds to catch new publications
setInterval(async () => {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            const currentCount = allArticles.length;
            await loadAllArticles();
            
            // Show notification if new articles were added
            if (allArticles.length > currentCount) {
                const newCount = allArticles.length - currentCount;
                showToast(`${newCount} new article${newCount === 1 ? '' : 's'} published!`, 'success');
            }
        } catch (error) {
            console.error('Error refreshing articles:', error);
        }
    }
}, 30000); // 30 seconds
