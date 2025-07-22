-- Supabase Database Schema and RLS Policies
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Redeemer Buatsi',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[], -- Array of tags
    meta_title VARCHAR(255),
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table (for static pages like About, Contact, etc.)
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table (for contact form submissions)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table (for newsletter)
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article_views table (for analytics)
CREATE TABLE IF NOT EXISTS article_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- Create user_roles table (for role management)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_roles.user_id = $1 AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT role FROM user_roles WHERE user_id = auth.uid()),
        'user'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for articles table
-- Allow everyone to read published articles
CREATE POLICY "Anyone can view published articles" ON articles
    FOR SELECT USING (status = 'published');

-- Allow admins to do everything with articles
CREATE POLICY "Admins can manage all articles" ON articles
    FOR ALL USING (is_admin(auth.uid()));

-- Allow authors to manage their own articles
CREATE POLICY "Authors can manage their own articles" ON articles
    FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for categories table
-- Allow everyone to read categories
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Allow only admins to manage categories
CREATE POLICY "Only admins can manage categories" ON categories
    FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE USING (is_admin(auth.uid()));

-- RLS Policies for pages table
-- Allow everyone to read published pages
CREATE POLICY "Anyone can view published pages" ON pages
    FOR SELECT USING (is_published = true);

-- Allow admins to manage all pages
CREATE POLICY "Admins can manage all pages" ON pages
    FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for contacts table
-- Allow anyone to insert contact submissions
CREATE POLICY "Anyone can submit contact form" ON contacts
    FOR INSERT WITH CHECK (true);

-- Allow only admins to read contacts
CREATE POLICY "Only admins can view contacts" ON contacts
    FOR SELECT USING (is_admin(auth.uid()));

-- Allow only admins to update contacts (mark as read)
CREATE POLICY "Only admins can update contacts" ON contacts
    FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for subscribers table
-- Allow anyone to subscribe
CREATE POLICY "Anyone can subscribe" ON subscribers
    FOR INSERT WITH CHECK (true);

-- Allow subscribers to update their own subscription
CREATE POLICY "Users can update their own subscription" ON subscribers
    FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow admins to view all subscribers
CREATE POLICY "Admins can view all subscribers" ON subscribers
    FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for comments table
-- Allow anyone to submit comments
CREATE POLICY "Anyone can submit comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Allow everyone to view approved comments
CREATE POLICY "Anyone can view approved comments" ON comments
    FOR SELECT USING (is_approved = true);

-- Allow admins to manage all comments
CREATE POLICY "Admins can manage all comments" ON comments
    FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for article_views table
-- Allow anyone to insert views (for analytics)
CREATE POLICY "Anyone can track article views" ON article_views
    FOR INSERT WITH CHECK (true);

-- Allow admins to view analytics
CREATE POLICY "Admins can view analytics" ON article_views
    FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for user_roles table
-- Allow users to view their own role
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to manage all user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (is_admin(auth.uid()));

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
    ('Politics', 'politics', 'Political analysis and governance insights'),
    ('Business', 'business', 'Economic trends and business developments'),
    ('Society', 'society', 'Social issues and community stories'),
    ('Technology', 'technology', 'Digital transformation and innovation')
ON CONFLICT (slug) DO NOTHING;

-- Create a function to automatically create user role on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug for articles
CREATE OR REPLACE FUNCTION auto_generate_article_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
            NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
        END LOOP;
    END IF;
    
    -- Set published_at when status changes to published
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
        NEW.published_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating article slugs
CREATE TRIGGER auto_generate_article_slug_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION auto_generate_article_slug();

-- Create admin user (replace with your actual email)
-- You'll need to sign up first, then run this to make yourself admin
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'admin' FROM auth.users WHERE email = 'your-admin-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
