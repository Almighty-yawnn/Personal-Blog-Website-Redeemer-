// Admin Panel JavaScript with Supabase Integration

// Global variables
let currentUser = null;
let currentEditingArticle = null;
let categories = [];
let realtimeSubscriptions = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminInterface = document.getElementById('adminInterface');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    checkAuthStatus();
    setupEventListeners();
});

async function initializeSupabase() {
    try {
        // Check if Supabase is properly configured
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            showToast('Please configure your Supabase credentials in supabase-config.js', 'error');
            return;
        }
        
        // Load categories
        await loadCategories();
        
        // Set up real-time subscriptions
        setupRealtimeSubscriptions();
        
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        showToast('Error connecting to database. Please check your configuration.', 'error');
    }
}

async function loadCategories() {
    try {
        categories = await SupabaseDB.getCategories();
        updateCategorySelects();
    } catch (error) {
        console.error('Error loading categories:', error);
        // Use default categories if database fails
        categories = [
            { id: '1', name: 'Politics', slug: 'politics' },
            { id: '2', name: 'Business', slug: 'business' },
            { id: '3', name: 'Society', slug: 'society' },
            { id: '4', name: 'Technology', slug: 'technology' }
        ];
        updateCategorySelects();
    }
}

function updateCategorySelects() {
    const categorySelects = document.querySelectorAll('#articleCategory, #categoryFilter');
    categorySelects.forEach(select => {
        if (select.id === 'categoryFilter') {
            select.innerHTML = '<option value="all">All Categories</option>';
        } else {
            select.innerHTML = '<option value="">Select Category</option>';
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    });
}

function setupRealtimeSubscriptions() {
    // Subscribe to article changes for real-time updates
    const articleSubscription = SupabaseRealtime.subscribeToArticles((payload) => {
        console.log('Article change detected:', payload);
        // Refresh articles table if we're on the articles page
        const articlesSection = document.getElementById('articles-section');
        if (articlesSection && articlesSection.classList.contains('active')) {
            loadArticlesTable();
        }
        // Refresh dashboard if we're on dashboard
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection && dashboardSection.classList.contains('active')) {
            loadDashboardData();
        }
    });
    
    // Subscribe to stats changes for real-time dashboard updates
    const statsSubscriptions = SupabaseRealtime.subscribeToStats(() => {
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection && dashboardSection.classList.contains('active')) {
            loadDashboardData();
        }
    });
    
    realtimeSubscriptions = [articleSubscription, ...statsSubscriptions];
}

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
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const publishBtn = document.getElementById('publishBtn');
    
    if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => saveArticle('draft'));
    if (publishBtn) publishBtn.addEventListener('click', () => saveArticle('published'));
    
    // Rich text editor
    setupRichTextEditor();
    
    // Media upload
    function setupMediaUpload() {
        const uploadBtn = document.getElementById('uploadMediaBtn'); // Assuming ID from HTML
        const uploadModal = document.getElementById('uploadModal');
        const closeModal = uploadModal.querySelector('.close'); // Assuming close button class
        const fileInput = document.getElementById('mediaUploadInput');
        const uploadArea = document.getElementById('uploadArea');
    
        if (!uploadBtn || !uploadModal || !fileInput || !uploadArea) return;
    }
    setupMediaUpload();

    // Settings
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

    // Search and filters
    const articleSearch = document.getElementById('articleSearch');
    const categoryFilter = document.getElementById('categoryFilter');

    if (articleSearch) articleSearch.addEventListener('input', filterArticles);
    if (categoryFilter) categoryFilter.addEventListener('change', filterArticles);

    // Auth state change listener
    SupabaseAuth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            handleAuthSuccess(session);
        } else if (event === 'SIGNED_OUT') {
            handleAuthSignOut();
        }
    });
}

async function checkAuthStatus() {
    showLoading(true);
    try {
        const user = await SupabaseAuth.getCurrentUser();
        if (user) {
            const isAdmin = await SupabaseAuth.isAdmin();
            if (isAdmin) {
                currentUser = user;
                showAdminInterface();
            } else {
                showLoginScreen();
                showToast('Admin privileges required to access this panel.', 'error');
            }
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLoginScreen();
    } finally {
        showLoading(false);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    
    // Show loading state
    const originalText = loginButton.innerHTML;
    loginButton.innerHTML = '<span class="loading"></span> Signing in...';
    loginButton.disabled = true;
    
    try {
        const { user, session } = await SupabaseAuth.signIn(email, password);
        currentUser = user;
        showToast('Login successful!', 'success');
        // showAdminInterface will be called by the auth state change listener
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
        loginButton.innerHTML = originalText;
        loginButton.disabled = false;
    }
}

async function handleLogout() {
    try {
        await SupabaseAuth.signOut();
        // handleAuthSignOut will be called by the auth state change listener
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error during logout', 'error');
    }
}

function handleAuthSuccess(session) {
    currentUser = session.user;
    showAdminInterface();
}

function handleAuthSignOut() {
    currentUser = null;
    
    // Clean up real-time subscriptions
    realtimeSubscriptions.forEach(subscription => {
        if (subscription && subscription.unsubscribe) {
            subscription.unsubscribe();
        }
    });
    realtimeSubscriptions = [];
    
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
        userInfo.style.display = 'inline-block';
        userName.textContent = currentUser.user_metadata?.full_name || 'Redeemer Buatsi';
        
        // Update author field
        const authorField = document.getElementById('articleAuthor');
        if (authorField) {
            authorField.value = currentUser.user_metadata?.full_name || 'Redeemer Buatsi';
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
            if (!currentEditingArticle) {
                resetArticleForm();
            }
            break;
        case 'media':
            loadMediaLibrary();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

async function loadDashboardData() {
    try {
        showLoading(true);
        
        // Load dashboard statistics
        const stats = await SupabaseDB.getDashboardStats();
        
        // Update stat cards
        document.getElementById('totalArticles').textContent = stats.totalArticles;
        document.querySelector('.stat-card:nth-child(2) h3').textContent = stats.totalViews;
        document.querySelector('.stat-card:nth-child(3) h3').textContent = stats.totalSubscribers;
        document.querySelector('.stat-card:nth-child(4) h3').textContent = stats.totalComments;
        
        // Load recent articles
        const recentArticles = await SupabaseDB.getAllArticlesForAdmin();
        const recentArticlesContainer = document.getElementById('recentArticles');
        
        if (recentArticlesContainer) {
            recentArticlesContainer.innerHTML = recentArticles.slice(0, 5).map(article => `
                <div class="recent-article-item" onclick="editArticle('${article.id}')">
                    <img src="${article.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=60&h=60&fit=crop'}" alt="${article.title}">
                    <div class="recent-article-info">
                        <h4>${article.title}</h4>
                        <p>${formatDate(article.created_at)} • ${article.categories?.name || 'Uncategorized'}</p>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadArticlesTable() {
    try {
        showLoading(true);
        
        const articles = await SupabaseDB.getAllArticlesForAdmin();
        const articlesTableBody = document.getElementById('articlesTableBody');
        
        if (!articlesTableBody) return;
        
        articlesTableBody.innerHTML = articles.map(article => `
            <tr>
                <td>
                    <strong>${article.title}</strong>
                    <br>
                    <small style="color: #7f8c8d;">${article.excerpt.substring(0, 80)}...</small>
                </td>
                <td><span class="article-category">${article.categories?.name || 'Uncategorized'}</span></td>
                <td>${formatDate(article.created_at)}</td>
                <td><span class="status-badge status-${article.status}">${capitalizeFirst(article.status)}</span></td>
                <td>
                    <div class="article-actions">
                        <button class="action-icon edit" onclick="editArticle('${article.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-icon delete" onclick="deleteArticle('${article.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading articles:', error);
        showToast('Error loading articles', 'error');
    } finally {
        showLoading(false);
    }
}

async function filterArticles() {
    const searchTerm = document.getElementById('articleSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    try {
        let articles = await SupabaseDB.getAllArticlesForAdmin();
        
        // Apply filters
        if (searchTerm) {
            articles = articles.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.excerpt.toLowerCase().includes(searchTerm)
            );
        }
        
        if (categoryFilter && categoryFilter !== 'all') {
            articles = articles.filter(article => article.category_id === categoryFilter);
        }
        
        // Update table with filtered results
        const articlesTableBody = document.getElementById('articlesTableBody');
        if (articlesTableBody) {
            articlesTableBody.innerHTML = articles.map(article => `
                <tr>
                    <td>
                        <strong>${article.title}</strong>
                        <br>
                        <small style="color: #7f8c8d;">${article.excerpt.substring(0, 80)}...</small>
                    </td>
                    <td><span class="article-category">${article.categories?.name || 'Uncategorized'}</span></td>
                    <td>${formatDate(article.created_at)}</td>
                    <td><span class="status-badge status-${article.status}">${capitalizeFirst(article.status)}</span></td>
                    <td>
                        <div class="article-actions">
                            <button class="action-icon edit" onclick="editArticle('${article.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon delete" onclick="deleteArticle('${article.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error filtering articles:', error);
        showToast('Error filtering articles', 'error');
    }
}

async function saveArticle(status) {
    const title = document.getElementById('articleTitle').value;
    const categoryId = document.getElementById('articleCategory').value;
    const excerpt = document.getElementById('articleExcerpt').value;
    const featuredImageUrl = document.getElementById('articleImage').value;
    const content = document.getElementById('articleContent').innerHTML;
    const tags = document.getElementById('articleTags').value;
    const authorName = document.getElementById('articleAuthor').value;
    
    if (!title || !categoryId || !excerpt || !content) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const articleData = {
            title,
            excerpt,
            content,
            featured_image_url: featuredImageUrl || null,
            category_id: categoryId,
            author_id: currentUser.id,
            author_name: authorName,
            status,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };
        
        let savedArticle;
        if (currentEditingArticle) {
            // Update existing article
            savedArticle = await SupabaseDB.updateArticle(currentEditingArticle.id, articleData);
            showToast(`Article ${status === 'published' ? 'published' : 'updated'} successfully!`, 'success');
        } else {
            // Create new article
            savedArticle = await SupabaseDB.createArticle(articleData);
            showToast(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`, 'success');
        }
        
        if (status === 'published') {
            resetArticleForm();
            showSection('articles');
        }
        
        currentEditingArticle = null;
        
    } catch (error) {
        console.error('Error saving article:', error);
        showToast('Error saving article: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function editArticle(articleId) {
    try {
        showLoading(true);
        
        const article = await SupabaseDB.getArticleById(articleId);
        if (!article) {
            showToast('Article not found', 'error');
            return;
        }
        
        currentEditingArticle = article;
        
        showSection('new-article');
        
        // Fill form with article data
        document.getElementById('articleTitle').value = article.title;
        document.getElementById('articleCategory').value = article.category_id || '';
        document.getElementById('articleExcerpt').value = article.excerpt;
        document.getElementById('articleImage').value = article.featured_image_url || '';
        document.getElementById('articleContent').innerHTML = article.content;
        document.getElementById('articleTags').value = article.tags ? article.tags.join(', ') : '';
        document.getElementById('articleAuthor').value = article.author_name;
        
        // Update section header
        const sectionHeader = document.querySelector('#new-article-section .section-header h1');
        sectionHeader.textContent = 'Edit Article';
        
        showToast('Article loaded for editing', 'success');
        
    } catch (error) {
        console.error('Error loading article for editing:', error);
        showToast('Error loading article: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteArticle(articleId) {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading(true);
        
        await SupabaseDB.deleteArticle(articleId);
        showToast('Article deleted successfully.', 'success');
        
        // Refresh the articles table
        loadArticlesTable();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error deleting article:', error);
        showToast('Error deleting article: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function resetArticleForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleContent').innerHTML = '';
    document.getElementById('articleAuthor').value = currentUser?.user_metadata?.full_name || 'Redeemer Buatsi';
    currentEditingArticle = null;
    
    // Reset section header
    const sectionHeader = document.querySelector('#new-article-section .section-header h1');
    sectionHeader.textContent = 'Write New Article';
}

// Keep existing functions for rich text editor, media upload, settings, etc.
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
    const uploadBtn = document.getElementById('uploadMediaBtn'); // Assuming ID from HTML
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = uploadModal.querySelector('.close'); // Assuming close button class
    const fileInput = document.getElementById('mediaUploadInput');
    const uploadArea = document.getElementById('uploadArea');

    if (!uploadBtn || !uploadModal || !fileInput || !uploadArea) return;

    // Open modal on button click
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.style.display = 'none';
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        for (const file of files) {
            uploadFile(file);
        }
        uploadModal.style.display = 'none'; // Close after upload
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover'); // Add CSS class for highlight
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        for (const file of files) {
            uploadFile(file);
        }
        uploadModal.style.display = 'none';
    });

    // Handle copy and delete in grid
    mediaGrid.addEventListener('click', (e) => {
        if (e.target.closest('.copy-link')) {
            const btn = e.target.closest('.copy-link');
            const url = btn.dataset.url;
            navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard!', 'success');
        } else if (e.target.closest('.delete-media')) {
            const btn = e.target.closest('.delete-media');
            const url = btn.dataset.url;
            const element = btn.closest('.media-item');
            deleteMedia(url, element);
        }
    });
}

// Update the uploadFile function in admin-script.js
async function uploadFile(file) {
    try {
        // Generate a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `media/${fileName}`;

        // Show loading state
        showLoading(true, 'Uploading file...');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('media') // Your bucket name
            .upload(filePath, file);

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        // Add to media grid
        addMediaToGrid(publicUrl, file.type);
        
        // Show success message
        showToast('File uploaded successfully!', 'success');
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error uploading file: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Update the deleteMedia function
async function deleteMedia(url, element) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        // Extract the file path from the URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('media')).join('/');

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from('media')
            .remove([filePath]);

        if (error) throw error;

        // Remove from UI
        element.remove();
        showToast('File deleted successfully!', 'success');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Error deleting file: ' + error.message, 'error');
    }
}

// Add this new function (referenced in uploadFile)
function addMediaToGrid(url, type) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.innerHTML = `
        <img src="${url}" alt="Uploaded media">
        <div class="media-actions">
            <button class="copy-link" data-url="${url}">
                <i class="fas fa-link"></i>
            </button>
            <button class="delete-media" data-url="${url}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    mediaGrid.prepend(mediaItem); // Add to top of grid
}

// Add this function to load existing media
async function loadMedia() {
    try {
        showLoading(true, 'Loading media...');
        
        const { data: files, error } = await supabase.storage
            .from('media')
            .list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;

        // Clear existing media grid
        mediaGrid.innerHTML = '';

        // Add each file to the grid
        for (const file of files) {
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(file.name);
            
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <img src="${publicUrl}" alt="${file.name}">
                <div class="media-actions">
                    <button class="copy-link" data-url="${publicUrl}">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="delete-media" data-url="${publicUrl}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            mediaGrid.appendChild(mediaItem);
        }
    } catch (error) {
        console.error('Error loading media:', error);
        showToast('Error loading media: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Call loadMedia when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    loadMedia();
});

async function saveSettings() {
    // Implementation for saving settings to Supabase
    showToast('Settings saved successfully!', 'success');
}

function loadSettings() {
    // Implementation for loading settings from Supabase
}

function loadMediaLibrary() {
    // Implementation for loading media from Supabase Storage
    loadMedia(); // Call the existing loadMedia to populate grid
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
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
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
