// Individual Article Page JavaScript
// Handles loading and displaying a single article with related content

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorState = document.getElementById('errorState');
const articleDetail = document.querySelector('.article-detail');

// Article elements
const articleBreadcrumb = document.getElementById('articleBreadcrumb');
const articleCategory = document.getElementById('articleCategory');
const articleDate = document.getElementById('articleDate');
const articleTitle = document.getElementById('articleTitle');
const articleExcerpt = document.getElementById('articleExcerpt');
const articleAuthor = document.getElementById('articleAuthor');
const articleViews = document.getElementById('articleViews');
const articleReadTime = document.getElementById('articleReadTime');
const articleImage = document.getElementById('articleImage');
const articleContent = document.getElementById('articleContent');
const articleTags = document.getElementById('articleTags');
const prevArticle = document.getElementById('prevArticle');
const nextArticle = document.getElementById('nextArticle');
const relatedArticles = document.getElementById('relatedArticles');
const relatedArticlesGrid = document.getElementById('relatedArticlesGrid');
const footerNewsletterForm = document.getElementById('footerNewsletterForm');

// Global variables
let currentArticle = null;
let allArticles = [];

// Initialize the article page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadArticle();
});

async function loadArticle() {
    try {
        showLoading(true);
        
        // Get article ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            showError();
            return;
        }
        
        // Load the article
        await loadArticleById(articleId);
        
        if (!currentArticle) {
            showError();
            return;
        }
        
        // Display the article
        displayArticle();
        
        // Load related content
        await loadRelatedContent();
        
    } catch (error) {
        console.error('Error loading article:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

async function loadArticleById(articleId) {
    try {
        // Fetch article from Supabase
        let article = await SupabaseDB.getArticleById(articleId);

        if (!article) {
            console.warn('Article not found, using fallback data');
            currentArticle = await loadFallbackArticle(articleId);
            return currentArticle;
        }

        // Transform Supabase data
        currentArticle = {
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: article.categories?.slug || 'uncategorized',
            categoryName: article.categories?.name || 'Uncategorized',
            date: article.published_at || article.created_at,
            author: article.author_name || 'Redeemer Buatsi',
            image: article.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
            content: article.content,
            status: article.status || 'draft',
            tags: article.tags || [],
            views: article.view_count || 0
        };

        // Track the view
        if (currentArticle && currentArticle.id) {
            await trackView(currentArticle.id);
        }
        
        return currentArticle;

    } catch (error) {
        console.error('Error fetching article from Supabase:', error);
        currentArticle = await loadFallbackArticle(articleId);
        return currentArticle;
    }
}


function loadFallbackArticle(articleId) {
    // Fallback articles if Supabase is not available
    const fallbackArticles = [
        {
            id: '1',
            title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
            excerpt: "An in-depth analysis of Ghana's economic strategies and recovery plans following the global pandemic impact on local industries and employment.",
            category: "business",
            categoryName: "Business",
            date: "2024-01-15",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
            status: "published",
            tags: ["economy", "ghana", "recovery"],
            views: 1247,
            content: `
                <p>Ghana's economy has shown remarkable resilience in the face of unprecedented global challenges. As the country navigates the post-pandemic landscape, several key strategies have emerged that position Ghana for sustainable economic recovery and growth.</p>
                
                <h3>Economic Fundamentals</h3>
                <p>The Ghanaian economy, traditionally anchored by gold, cocoa, and oil exports, has demonstrated its ability to adapt and diversify. Recent government initiatives have focused on strengthening domestic industries while maintaining strong export relationships with international partners.</p>
                
                <h3>Recovery Strategies</h3>
                <p>Key recovery strategies include:</p>
                <ul>
                    <li>Investment in digital infrastructure and technology</li>
                    <li>Support for small and medium enterprises (SMEs)</li>
                    <li>Agricultural modernization and value chain development</li>
                    <li>Tourism sector revitalization</li>
                </ul>
                
                <h3>Challenges and Opportunities</h3>
                <p>While challenges remain, including inflation pressures and global supply chain disruptions, Ghana's strategic position in West Africa and its stable democratic institutions provide a strong foundation for economic growth.</p>
                
                <p>The path forward requires continued collaboration between government, private sector, and international partners to ensure that recovery efforts translate into long-term prosperity for all Ghanaians.</p>
            `
        },
        {
            id: '2',
            title: "Digital Transformation in Ghanaian Media: Opportunities and Challenges",
            excerpt: "Exploring how traditional media outlets in Ghana are adapting to digital platforms and the implications for journalism and public discourse.",
            category: "technology",
            categoryName: "Technology",
            date: "2024-01-12",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
            status: "published",
            tags: ["media", "digital", "journalism"],
            views: 892,
            content: `
                <p>The media landscape in Ghana is undergoing a fundamental transformation as traditional outlets embrace digital platforms and new technologies reshape how news is produced, distributed, and consumed.</p>
                
                <h3>The Digital Shift</h3>
                <p>Traditional media houses are investing heavily in digital infrastructure, recognizing that online presence is no longer optional but essential for survival in the modern media ecosystem.</p>
                
                <h3>Opportunities</h3>
                <p>Digital transformation offers numerous opportunities:</p>
                <ul>
                    <li>Expanded reach and audience engagement</li>
                    <li>Real-time news delivery and interaction</li>
                    <li>Cost-effective content distribution</li>
                    <li>Data-driven insights into audience preferences</li>
                </ul>
                
                <h3>Challenges</h3>
                <p>However, the transition also presents significant challenges, including the need for digital literacy training, cybersecurity concerns, and the fight against misinformation.</p>
                
                <p>The future of Ghanaian media lies in successfully balancing traditional journalistic values with innovative digital approaches to storytelling and audience engagement.</p>
            `
        },
        {
            id: '3',
            title: "Youth Engagement in Ghana's Democratic Process: A New Generation's Voice",
            excerpt: "Examining the increasing participation of young Ghanaians in politics and civic activities, and their impact on the country's democratic development.",
            category: "politics",
            categoryName: "Politics",
            date: "2024-01-10",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop",
            status: "published",
            tags: ["politics", "youth", "democracy"],
            views: 1156,
            content: `
                <p>Ghana's democracy is experiencing a renaissance driven by unprecedented youth engagement. Young Ghanaians are no longer content to be passive observers; they are actively shaping the political discourse and demanding accountability from their leaders.</p>
                
                <h3>Rising Political Consciousness</h3>
                <p>The current generation of young Ghanaians is more politically aware and engaged than ever before. Social media has become a powerful tool for political mobilization, with young activists using platforms like Twitter and Facebook to organize campaigns, share information, and hold politicians accountable.</p>
                
                <h3>Youth-Led Initiatives</h3>
                <p>Several youth-led organizations have emerged as significant forces in Ghanaian politics:</p>
                <ul>
                    <li>Advocacy groups focused on transparency and accountability</li>
                    <li>Civic education initiatives targeting young voters</li>
                    <li>Digital platforms for political discourse and debate</li>
                    <li>Community organizing efforts addressing local issues</li>
                </ul>
                
                <h3>Impact on Democratic Institutions</h3>
                <p>This increased youth engagement is having a tangible impact on Ghana's democratic institutions, forcing political parties to address issues that matter to young people and adopt more inclusive approaches to governance.</p>
                
                <p>As Ghana continues to strengthen its democratic foundations, the active participation of young citizens will be crucial in ensuring that the country's political future reflects the aspirations and values of all Ghanaians.</p>
            `
        }
    ];
    
    currentArticle = fallbackArticles.find(article => article.id === articleId);
}

function displayArticle() {
    if (!currentArticle) return;
    
    // Update page title
    document.title = `${currentArticle.title} - Redeemer Buatsi`;
    
    // Update breadcrumb
    articleBreadcrumb.textContent = currentArticle.title.length > 50 
        ? currentArticle.title.substring(0, 50) + '...' 
        : currentArticle.title;
    
    // Update article metadata
    articleCategory.textContent = currentArticle.categoryName;
    articleCategory.className = `article-category ${currentArticle.category}`;
    articleDate.textContent = formatDate(currentArticle.date);
    
    // Update article content
    articleTitle.textContent = currentArticle.title;
    articleExcerpt.textContent = currentArticle.excerpt;
    articleAuthor.textContent = currentArticle.author;
    
    // Update article stats
    articleViews.querySelector('span').textContent = `${currentArticle.views || 0} views`;
    articleReadTime.querySelector('span').textContent = calculateReadTime(currentArticle.content);
    
    // Update featured image
    articleImage.src = currentArticle.image;
    articleImage.alt = currentArticle.title;
    
    // Update article content
    articleContent.innerHTML = currentArticle.content;
    
    // Update tags
    if (currentArticle.tags && currentArticle.tags.length > 0) {
        articleTags.innerHTML = `
            <h4>Tags:</h4>
            <div class="tags-list">
                ${currentArticle.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
        `;
        articleTags.style.display = 'block';
    } else {
        articleTags.style.display = 'none';
    }
    
    // Show article content
    articleDetail.style.display = 'block';
    errorState.style.display = 'none';
}

async function loadRelatedContent() {
    try {
        // Fetch articles from Supabase if configured
        let fetchedArticles = [];
        if (
            SUPABASE_URL !== 'https://bxusfjvtccvkpwlxupiq.supabase.co' &&
            SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kVQ'
        ) {
            fetchedArticles = await SupabaseDB.getArticles({ limit: 100 });
        }

        // Map fetched articles or fallback to defaults
        allArticles = (fetchedArticles.length ? fetchedArticles : getFallbackArticles()).map(article => ({
            id: article.id || '0',
            title: article.title || 'Untitled Article',
            excerpt: article.excerpt || '',
            category: article.categories?.slug || 'uncategorized',
            categoryName: article.categories?.name || 'Uncategorized',
            date: article.published_at || article.created_at || new Date().toISOString(),
            author: article.author_name || 'Unknown',
            image: article.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop'
        }));

        // Setup navigation and related articles
        setupArticleNavigation();
        setupRelatedArticles();

    } catch (error) {
        console.error('Error loading related content:', error);
        allArticles = getFallbackArticles();
        setupArticleNavigation();
        setupRelatedArticles();
    }
}

// Fallback articles function
function getFallbackArticles() {
    return [
        {
            id: '1',
            title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
            category: "business",
            categoryName: "Business",
            date: "2024-01-15",
            author: "Redeemer Buatsi",
            excerpt: "",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop"
        },
        {
            id: '2',
            title: "Digital Transformation in Ghanaian Media: Opportunities and Challenges",
            category: "technology",
            categoryName: "Technology",
            date: "2024-01-12",
            author: "Redeemer Buatsi",
            excerpt: "",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop"
        },
        {
            id: '3',
            title: "Youth Engagement in Ghana's Democratic Process: A New Generation's Voice",
            category: "politics",
            categoryName: "Politics",
            date: "2024-01-10",
            author: "Redeemer Buatsi",
            excerpt: "",
            image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop"
        }
    ];
}


function setupArticleNavigation() {
    if (!currentArticle || allArticles.length === 0) return;
    
    // Sort articles by date
    const sortedArticles = allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentIndex = sortedArticles.findIndex(article => article.id === currentArticle.id);
    
    if (currentIndex === -1) return;
    
    // Previous article (newer)
    if (currentIndex > 0) {
        const prev = sortedArticles[currentIndex - 1];
        prevArticle.querySelector('.nav-title').textContent = prev.title;
        prevArticle.querySelector('.nav-title').href = `article.html?id=${prev.id}`;
        prevArticle.style.display = 'block';
    }
    
    // Next article (older)
    if (currentIndex < sortedArticles.length - 1) {
        const next = sortedArticles[currentIndex + 1];
        nextArticle.querySelector('.nav-title').textContent = next.title;
        nextArticle.querySelector('.nav-title').href = `article.html?id=${next.id}`;
        nextArticle.style.display = 'block';
    }
}

function setupRelatedArticles() {
    if (!currentArticle || allArticles.length === 0) return;
    
    // Find related articles (same category, excluding current)
    const related = allArticles
        .filter(article => 
            article.id !== currentArticle.id && 
            article.category === currentArticle.category
        )
        .slice(0, 3);
    
    if (related.length > 0) {
        relatedArticlesGrid.innerHTML = related.map(article => `
            <div class="related-article-card" onclick="window.location.href='article.html?id=${article.id}'">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
                <div class="related-article-content">
                    <span class="related-article-category">${article.categoryName}</span>
                    <h4>${article.title}</h4>
                    <span class="related-article-date">${formatDate(article.date)}</span>
                </div>
            </div>
        `).join('');
        
        relatedArticles.style.display = 'block';
    }
}

async function trackView(articleId) {
    try {
        if (SUPABASE_URL !== 'https://bxusfjvtccvkpwlxupiq.supabase.co' && SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ') {
            await SupabaseDB.trackArticleView(articleId, navigator.userAgent);
        }
    } catch (error) {
        console.error('Error tracking article view:', error);
    }
}

function shareArticle() {
    if (!currentArticle) return;
    
    if (navigator.share) {
        navigator.share({
            title: currentArticle.title,
            text: currentArticle.excerpt,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Article URL copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Unable to copy URL', 'error');
        });
    }
}

function showError() {
    articleDetail.style.display = 'none';
    errorState.style.display = 'block';
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
    
    // Newsletter form
    if (footerNewsletterForm) {
        footerNewsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
    
    // Category links in footer
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            window.location.href = `articles.html?category=${category}`;
        });
    });
}

function toggleMobileMenu() {
    if (navMenu) navMenu.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');
}

async function handleNewsletterSubmission(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    const button = e.target.querySelector('button');

    // Simple email validation regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Subscribing...';
    button.disabled = true;

    try {
        // Submit to Supabase or simulate
        if (SUPABASE_URL !== 'https://bxusfjvtccvkpwlxupiq.supabase.co' &&
            SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ') {
            await SupabaseDB.addSubscriber(email);
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        showToast('Successfully subscribed to newsletter!', 'success');
        e.target.reset();

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        if (error.message.includes('duplicate')) {
            showToast('You are already subscribed to our newsletter.', 'info');
        } else {
            showToast('Error subscribing to newsletter. Please try again.', 'error');
        }
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}


// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function calculateReadTime(content) {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
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
