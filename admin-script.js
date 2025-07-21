// Admin Panel JavaScript

// User credentials and session management
const users = {
    'redeemer': { password: 'admin123', role: 'admin', name: 'Redeemer Buatsi' },
    'assistant': { password: 'helper123', role: 'editor', name: 'Assistant' }
};

let currentUser = null;
let currentEditingArticle = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminInterface = document.getElementById('adminInterface');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    loadDashboardData();
});

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });
    
    // Article form
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        document.getElementById('saveDraftBtn').addEventListener('click', () => saveArticle('draft'));
        document.getElementById('publishBtn').addEventListener('click', () => saveArticle('published'));
    }
    
    // Rich text editor
    setupRichTextEditor();
    
    // Media upload
    setupMediaUpload();
    
    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Search and filters
    document.getElementById('articleSearch').addEventListener('input', filterArticles);
    document.getElementById('categoryFilter').addEventListener('change', filterArticles);
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAdminInterface();
    } else {
        showLoginScreen();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username].password === password) {
        currentUser = { username, ...users[username] };
        localStorage.setItem('adminUser', JSON.stringify(currentUser));
        showAdminInterface();
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid credentials. Please try again.', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('adminUser');
    currentUser = null;
    showLoginScreen();
    showToast('Logged out successfully.', 'info');
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminInterface.style.display = 'none';
}

function showAdminInterface() {
    loginScreen.style.display = 'none';
    adminInterface.style.display = 'flex';
    updateUserInfo();
    loadDashboardData();
}

function updateUserInfo() {
    if (currentUser) {
        // Update author field
        const authorField = document.getElementById('articleAuthor');
        if (authorField) {
            authorField.value = currentUser.name;
        }
    }
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Show section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'articles':
            loadArticlesTable();
            break;
        case 'new-article':
            resetArticleForm();
            break;
        case 'media':
            loadMediaLibrary();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

function loadDashboardData() {
    // Load recent articles
    const recentArticlesContainer = document.getElementById('recentArticles');
    if (recentArticlesContainer) {
        const recentArticles = getStoredArticles().slice(0, 5);
        recentArticlesContainer.innerHTML = recentArticles.map(article => `
            <div class="recent-article-item" onclick="editArticle(${article.id})">
                <img src="${article.image}" alt="${article.title}">
                <div class="recent-article-info">
                    <h4>${article.title}</h4>
                    <p>${formatDate(article.date)} • ${capitalizeFirst(article.category)}</p>
                </div>
            </div>
        `).join('');
    }
    
    // Update total articles count
    const totalArticlesElement = document.getElementById('totalArticles');
    if (totalArticlesElement) {
        totalArticlesElement.textContent = getStoredArticles().length;
    }
}

function loadArticlesTable() {
    const articlesTableBody = document.getElementById('articlesTableBody');
    if (!articlesTableBody) return;
    
    const articles = getStoredArticles();
    articlesTableBody.innerHTML = articles.map(article => `
        <tr>
            <td>
                <strong>${article.title}</strong>
                <br>
                <small style="color: #7f8c8d;">${article.excerpt.substring(0, 80)}...</small>
            </td>
            <td><span class="article-category">${capitalizeFirst(article.category)}</span></td>
            <td>${formatDate(article.date)}</td>
            <td><span class="status-badge status-${article.status || 'published'}">${capitalizeFirst(article.status || 'published')}</span></td>
            <td>
                <div class="article-actions">
                    <button class="action-icon edit" onclick="editArticle(${article.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon delete" onclick="deleteArticle(${article.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterArticles() {
    const searchTerm = document.getElementById('articleSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const articles = getStoredArticles();
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                            article.excerpt.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Update table with filtered results
    const articlesTableBody = document.getElementById('articlesTableBody');
    if (articlesTableBody) {
        articlesTableBody.innerHTML = filteredArticles.map(article => `
            <tr>
                <td>
                    <strong>${article.title}</strong>
                    <br>
                    <small style="color: #7f8c8d;">${article.excerpt.substring(0, 80)}...</small>
                </td>
                <td><span class="article-category">${capitalizeFirst(article.category)}</span></td>
                <td>${formatDate(article.date)}</td>
                <td><span class="status-badge status-${article.status || 'published'}">${capitalizeFirst(article.status || 'published')}</span></td>
                <td>
                    <div class="article-actions">
                        <button class="action-icon edit" onclick="editArticle(${article.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" onclick="deleteArticle(${article.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function saveArticle(status) {
    const title = document.getElementById('articleTitle').value;
    const category = document.getElementById('articleCategory').value;
    const excerpt = document.getElementById('articleExcerpt').value;
    const image = document.getElementById('articleImage').value;
    const content = document.getElementById('articleContent').innerHTML;
    const tags = document.getElementById('articleTags').value;
    const author = document.getElementById('articleAuthor').value;
    
    if (!title || !category || !excerpt || !content) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    const articles = getStoredArticles();
    const articleData = {
        id: currentEditingArticle ? currentEditingArticle.id : Date.now(),
        title,
        category,
        excerpt,
        image: image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        author,
        date: currentEditingArticle ? currentEditingArticle.date : new Date().toISOString().split('T')[0],
        status,
        lastModified: new Date().toISOString()
    };
    
    if (currentEditingArticle) {
        const index = articles.findIndex(a => a.id === currentEditingArticle.id);
        articles[index] = articleData;
    } else {
        articles.unshift(articleData);
    }
    
    localStorage.setItem('blogArticles', JSON.stringify(articles));
    
    showToast(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`, 'success');
    
    if (status === 'published') {
        resetArticleForm();
        showSection('articles');
    }
    
    currentEditingArticle = null;
}

function editArticle(articleId) {
    const articles = getStoredArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (!article) return;
    
    currentEditingArticle = article;
    
    // Fill form with article data
    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleCategory').value = article.category;
    document.getElementById('articleExcerpt').value = article.excerpt;
    document.getElementById('articleImage').value = article.image;
    document.getElementById('articleContent').innerHTML = article.content;
    document.getElementById('articleTags').value = article.tags ? article.tags.join(', ') : '';
    document.getElementById('articleAuthor').value = article.author;
    
    showSection('new-article');
    
    // Update section header
    const sectionHeader = document.querySelector('#new-article-section .section-header h1');
    sectionHeader.textContent = 'Edit Article';
}

function deleteArticle(articleId) {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return;
    }
    
    const articles = getStoredArticles();
    const filteredArticles = articles.filter(a => a.id !== articleId);
    localStorage.setItem('blogArticles', JSON.stringify(filteredArticles));
    
    showToast('Article deleted successfully.', 'success');
    loadArticlesTable();
    loadDashboardData();
}

function resetArticleForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleContent').innerHTML = '';
    document.getElementById('articleAuthor').value = currentUser ? currentUser.name : 'Redeemer Buatsi';
    currentEditingArticle = null;
    
    // Reset section header
    const sectionHeader = document.querySelector('#new-article-section .section-header h1');
    sectionHeader.textContent = 'Write New Article';
}

function setupRichTextEditor() {
    const editor = document.getElementById('articleContent');
    const toolbar = document.querySelector('.editor-toolbar');
    
    if (!editor || !toolbar) return;
    
    toolbar.addEventListener('click', function(e) {
        if (e.target.classList.contains('editor-btn')) {
            e.preventDefault();
            const action = e.target.dataset.action;
            
            if (action === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else {
                document.execCommand(action, false, null);
            }
            
            // Update button states
            updateToolbarButtons();
        }
    });
    
    editor.addEventListener('keyup', updateToolbarButtons);
    editor.addEventListener('mouseup', updateToolbarButtons);
    
    function updateToolbarButtons() {
        const buttons = toolbar.querySelectorAll('.editor-btn');
        buttons.forEach(btn => {
            const action = btn.dataset.action;
            if (document.queryCommandState(action)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function setupMediaUpload() {
    const uploadBtn = document.getElementById('uploadMediaBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const closeModal = document.querySelector('.close-modal');
    
    if (!uploadBtn || !uploadModal) return;
    
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = 'rgba(44, 85, 48, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '';
        
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });
}

function handleFileUpload(files) {
    // Simulate file upload (in a real application, this would upload to a server)
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const mediaItem = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: e.target.result,
                    type: 'image',
                    size: file.size,
                    uploadDate: new Date().toISOString()
                };
                
                // Store in localStorage (in a real app, this would be on a server)
                const mediaLibrary = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
                mediaLibrary.unshift(mediaItem);
                localStorage.setItem('mediaLibrary', JSON.stringify(mediaLibrary));
                
                loadMediaLibrary();
                showToast('Image uploaded successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('uploadModal').style.display = 'none';
}

function loadMediaLibrary() {
    const mediaGrid = document.getElementById('mediaGrid');
    if (!mediaGrid) return;
    
    const mediaLibrary = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
    
    // Add some sample images if library is empty
    if (mediaLibrary.length === 0) {
        const sampleImages = [
            {
                id: 1,
                name: 'ghana-parliament.jpg',
                url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop',
                type: 'image',
                size: 245760,
                uploadDate: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                name: 'business-meeting.jpg',
                url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
                type: 'image',
                size: 312480,
                uploadDate: '2024-01-14T15:30:00Z'
            },
            {
                id: 3,
                name: 'technology-news.jpg',
                url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
                type: 'image',
                size: 198720,
                uploadDate: '2024-01-13T09:15:00Z'
            }
        ];
        localStorage.setItem('mediaLibrary', JSON.stringify(sampleImages));
        mediaLibrary.push(...sampleImages);
    }
    
    mediaGrid.innerHTML = mediaLibrary.map(item => `
        <div class="media-item" onclick="selectMedia('${item.url}')">
            <img src="${item.url}" alt="${item.name}">
            <div class="media-item-info">
                <h4>${item.name}</h4>
                <p>${formatFileSize(item.size)} • ${formatDate(item.uploadDate.split('T')[0])}</p>
            </div>
        </div>
    `).join('');
}

function selectMedia(url) {
    // Copy URL to clipboard
    navigator.clipboard.writeText(url).then(() => {
        showToast('Image URL copied to clipboard!', 'success');
    });
}

function saveSettings() {
    const settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        contactEmail: document.getElementById('contactEmail').value,
        twitterUrl: document.getElementById('twitterUrl').value,
        linkedinUrl: document.getElementById('linkedinUrl').value,
        facebookUrl: document.getElementById('facebookUrl').value
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    if (settings.siteTitle) document.getElementById('siteTitle').value = settings.siteTitle;
    if (settings.siteDescription) document.getElementById('siteDescription').value = settings.siteDescription;
    if (settings.contactEmail) document.getElementById('contactEmail').value = settings.contactEmail;
    if (settings.twitterUrl) document.getElementById('twitterUrl').value = settings.twitterUrl;
    if (settings.linkedinUrl) document.getElementById('linkedinUrl').value = settings.linkedinUrl;
    if (settings.facebookUrl) document.getElementById('facebookUrl').value = settings.facebookUrl;
}

// Utility functions
function getStoredArticles() {
    const stored = localStorage.getItem('blogArticles');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Return sample articles if none stored
    const sampleArticles = [
        {
            id: 1,
            title: "Ghana's Economic Outlook: Navigating Post-Pandemic Recovery",
            excerpt: "An in-depth analysis of Ghana's economic strategies and recovery plans following the global pandemic impact on local industries and employment.",
            category: "business",
            date: "2024-01-15",
            author: "Redeemer Buatsi",
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
            status: "published",
            content: "<p>Ghana's economy has shown remarkable resilience in the face of unprecedented global challenges...</p>"
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
            content: "<p>The media landscape in Ghana is undergoing a fundamental transformation...</p>"
        }
    ];
    
    localStorage.setItem('blogArticles', JSON.stringify(sampleArticles));
    return sampleArticles;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Auto-save functionality for article drafts
let autoSaveTimer;
function setupAutoSave() {
    const articleForm = document.getElementById('articleForm');
    if (!articleForm) return;
    
    const inputs = articleForm.querySelectorAll('input, textarea, select');
    const editor = document.getElementById('articleContent');
    
    function triggerAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            const title = document.getElementById('articleTitle').value;
            if (title.trim()) {
                // Save as draft automatically
                const draftData = {
                    title: document.getElementById('articleTitle').value,
                    category: document.getElementById('articleCategory').value,
                    excerpt: document.getElementById('articleExcerpt').value,
                    image: document.getElementById('articleImage').value,
                    content: document.getElementById('articleContent').innerHTML,
                    tags: document.getElementById('articleTags').value,
                    lastSaved: new Date().toISOString()
                };
                
                localStorage.setItem('articleDraft', JSON.stringify(draftData));
                showToast('Draft auto-saved', 'info');
            }
        }, 5000); // Auto-save after 5 seconds of inactivity
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', triggerAutoSave);
    });
    
    if (editor) {
        editor.addEventListener('input', triggerAutoSave);
    }
}

// Load auto-saved draft
function loadDraft() {
    const draft = localStorage.getItem('articleDraft');
    if (draft && confirm('A draft was found. Would you like to restore it?')) {
        const draftData = JSON.parse(draft);
        
        document.getElementById('articleTitle').value = draftData.title || '';
        document.getElementById('articleCategory').value = draftData.category || '';
        document.getElementById('articleExcerpt').value = draftData.excerpt || '';
        document.getElementById('articleImage').value = draftData.image || '';
        document.getElementById('articleContent').innerHTML = draftData.content || '';
        document.getElementById('articleTags').value = draftData.tags || '';
        
        showToast('Draft restored successfully!', 'success');
    }
}

// Initialize auto-save when new article section is shown
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupAutoSave();
        if (window.location.hash === '#new-article') {
            loadDraft();
        }
    }, 1000);
});
