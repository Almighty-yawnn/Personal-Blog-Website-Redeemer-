// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://bxusfjvtccvkpwlxupiq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dXNmanZ0Y2N2a3B3bHh1cGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTMyODIsImV4cCI6MjA2ODY2OTI4Mn0.aZ4PMbuSzDyBxQwab7ST5_sK0XLDPmG9OlxEHV-kYVQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
const TABLES = {
    ARTICLES: 'articles',
    CATEGORIES: 'categories',
    PAGES: 'pages',
    CONTACTS: 'contacts',
    SUBSCRIBERS: 'subscribers',
    COMMENTS: 'comments',
    ARTICLE_VIEWS: 'article_views'
};

// User roles
const ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    USER: 'user'
};

// Supabase Auth Helper Functions
class SupabaseAuth {
    static async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Check user role
            const userRole = await this.getUserRole(data.user.id);
            if (!userRole || userRole !== ROLES.ADMIN) {
                await this.signOut();
                throw new Error('Access denied. Admin privileges required.');
            }
            
            return { user: data.user, session: data.session };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }
    
    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
    
    static async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }
    
    static async getUserRole(userId) {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            return data?.role;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }
    
    static async isAdmin() {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        const role = await this.getUserRole(user.id);
        return role === ROLES.ADMIN;
    }
    
    static onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

// Database Helper Functions
class SupabaseDB {
    // Articles CRUD operations
    static async getArticles(options = {}) {
        let query = supabase
            .from(TABLES.ARTICLES)
            .select(`
                *,
                categories(name, slug)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.offset) {
            query = query.range(options.offset, options.offset + options.limit - 1);
        }
        
        if (options.category) {
            query = query.eq('category_id', options.category);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
    
    static async getArticleById(id) {
        const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .select(`
                *,
                categories(name, slug)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getAllArticlesForAdmin() {
        const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .select(`
                *,
                categories(name, slug)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    static async createArticle(articleData) {
        const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .insert([articleData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateArticle(id, articleData) {
        const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .update(articleData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async deleteArticle(id) {
        const { error } = await supabase
            .from(TABLES.ARTICLES)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
    
    // Categories
    static async getCategories() {
        const { data, error } = await supabase
            .from(TABLES.CATEGORIES)
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data;
    }
    
    // Contact form submissions
    static async submitContact(contactData) {
        const { data, error } = await supabase
            .from(TABLES.CONTACTS)
            .insert([{
                ...contactData,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Newsletter subscriptions
    static async addSubscriber(email) {
        const { data, error } = await supabase
            .from(TABLES.SUBSCRIBERS)
            .insert([{
                email,
                subscribed_at: new Date().toISOString(),
                is_active: true
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Dashboard statistics
    static async getDashboardStats() {
        try {
            const [articlesCount, viewsCount, subscribersCount, commentsCount] = await Promise.all([
                supabase.from(TABLES.ARTICLES).select('id', { count: 'exact', head: true }),
                supabase.from(TABLES.ARTICLE_VIEWS).select('id', { count: 'exact', head: true }),
                supabase.from(TABLES.SUBSCRIBERS).select('id', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from(TABLES.COMMENTS).select('id', { count: 'exact', head: true }).eq('is_approved', true)
            ]);
            
            return {
                totalArticles: articlesCount.count || 0,
                totalViews: viewsCount.count || 0,
                totalSubscribers: subscribersCount.count || 0,
                totalComments: commentsCount.count || 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalArticles: 0,
                totalViews: 0,
                totalSubscribers: 0,
                totalComments: 0
            };
        }
    }
    
    // Track article views
    static async trackArticleView(articleId, userAgent = null) {
        try {
            const { error } = await supabase
                .from(TABLES.ARTICLE_VIEWS)
                .insert([{
                    article_id: articleId,
                    viewed_at: new Date().toISOString(),
                    user_agent: userAgent
                }]);
            
            if (error) throw error;
        } catch (error) {
            console.error('Error tracking article view:', error);
        }
    }
    
    // Search articles
    static async searchArticles(query, limit = 10) {
        const { data, error } = await supabase
            .from(TABLES.ARTICLES)
            .select(`
                *,
                categories(name, slug)
            `)
            .eq('status', 'published')
            .or(`title.ilike.%${query}%, excerpt.ilike.%${query}%, content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
}

// Real-time subscriptions
class SupabaseRealtime {
    static subscribeToArticles(callback) {
        return supabase
            .channel('articles')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: TABLES.ARTICLES
            }, callback)
            .subscribe();
    }
    
    static subscribeToStats(callback) {
        const channels = [
            supabase.channel('articles-stats').on('postgres_changes', {
                event: '*', schema: 'public', table: TABLES.ARTICLES
            }, callback),
            supabase.channel('views-stats').on('postgres_changes', {
                event: '*', schema: 'public', table: TABLES.ARTICLE_VIEWS
            }, callback),
            supabase.channel('subscribers-stats').on('postgres_changes', {
                event: '*', schema: 'public', table: TABLES.SUBSCRIBERS
            }, callback)
        ];
        
        return channels;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SupabaseAuth, SupabaseDB, SupabaseRealtime, TABLES, ROLES };
}
