# Redeemer Buatsi Personal Blog Website

A modern, responsive personal blog website designed for Redeemer Buatsi, a journalist with a strong presence in multiple Ghanaian media outlets. The site features a beautiful UI optimized for news and informational content, with an intuitive content management system that allows both Redeemer and his assistant to post content easily without coding knowledge.

## Features

### 🎨 Modern Design

- Clean, professional layout optimized for journalism
- Responsive design that works on all devices
- Ghana-inspired color scheme with green and gold accents
- Beautiful typography using Inter and Playfair Display fonts
- Smooth animations and hover effects

### 📝 Content Management System

- **Easy-to-use admin panel** accessible at `/admin.html`
- **Rich text editor** with formatting tools
- **Media library** for image management
- **Article categories**: Politics, Business, Society, Technology
- **Draft and publish workflow**
- **User roles**: Administrator and Editor permissions
- **Auto-save functionality** to prevent content loss

### 🔍 User Experience

- **Advanced search** with keyboard shortcuts (Ctrl+K)
- **Category filtering** for easy content discovery
- **Newsletter subscription** system
- **Contact form** for reader engagement
- **Social media integration**
- **Mobile-responsive navigation**

### 🚀 Technical Features

- **Pure HTML, CSS, and JavaScript** - no complex frameworks
- **Local storage** for content persistence
- **Progressive enhancement** for better performance
- **SEO-friendly** structure
- **Accessibility** considerations
- **Fast loading** with optimized assets

## Getting Started

### 1. Setup

1. Download or clone all files to your web server
2. Ensure all files are in the same directory
3. Open `index.html` in a web browser to view the site
4. Access the admin panel at `admin.html`

### 2. Admin Access

**Default Login Credentials:**

- **Administrator**: Username: `redeemer`, Password: `admin123`
- **Editor**: Username: `assistant`, Password: `helper123`

### 3. Publishing Content

1. Log into the admin panel
2. Navigate to "New Article"
3. Fill in the article details:
   - Title and category (required)
   - Excerpt/summary (required)
   - Featured image URL
   - Article content using the rich text editor
   - Tags for better organization
4. Save as draft or publish immediately

## File Structure

```
personal-website/
├── index.html              # Main website homepage
├── admin.html              # Admin panel interface
├── styles.css              # Main website styles
├── admin-styles.css        # Admin panel styles
├── script.js               # Main website functionality
├── admin-script.js         # Admin panel functionality
├── package.json            # Project dependencies
└── README.md               # This documentation
```

## Content Management Guide

### For Redeemer (Administrator)

- Full access to all features
- Can create, edit, and delete articles
- Can manage site settings
- Can upload media files
- Can manage user accounts

### For Assistant (Editor)

- Can create and edit articles
- Can upload media files
- Can save drafts and publish articles
- Cannot access site settings or user management

### Writing Articles

1. **Title**: Clear, engaging headlines
2. **Category**: Choose appropriate category for better organization
3. **Excerpt**: 2-3 sentence summary for article previews
4. **Featured Image**: Use high-quality images from Unsplash or similar
5. **Content**: Use the rich text editor for formatting
6. **Tags**: Add relevant keywords for better searchability

### Image Management

- Upload images through the Media Library
- Supported formats: JPG, PNG, GIF
- Recommended size: 400x250px for featured images
- Use descriptive filenames
- Images are stored locally (consider cloud storage for production)

## Supabase Backend Setup

This project uses Supabase as the backend for articles, authentication, and data management. Follow these steps to set up your Supabase project:

### 1. Database Schema Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/bxusfjvtccvkpwlxupiq
2. Navigate to the **SQL Editor** in the left sidebar
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Click **Run** to execute the schema creation

This will create all necessary tables:

- `categories` - Article categories
- `articles` - Blog articles with content
- `pages` - Static pages
- `contacts` - Contact form submissions
- `subscribers` - Newsletter subscribers
- `comments` - Article comments
- `article_views` - View tracking
- `user_roles` - User role management

### 2. Create Admin User

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add user** and create a user with your email and password
3. After creating the user, go to **SQL Editor** and run this query to make them an admin:

```sql
INSERT INTO user_roles (user_id, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'admin',
  NOW()
);
```

Replace `'your-email@example.com'` with the email you used to create the user.

### 3. Test the Integration

1. Open `admin.html` in your browser
2. Try logging in with the admin credentials you created
3. Create a test article to verify everything is working
4. Check the main site (`index.html`) to see if articles load from Supabase

### 4. Row Level Security (RLS)

The schema automatically sets up Row Level Security policies:

- **Public users** can only read published articles
- **Admin users** can create, read, update, and delete all content
- **Contact forms and subscriptions** are publicly writable but only admin readable

### Troubleshooting

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify credentials** in `supabase-config.js` match your project
3. **Ensure schema is applied** by checking tables exist in Supabase dashboard
4. **Check user roles** by running: `SELECT * FROM user_roles;` in SQL Editor

## Customization

### Colors and Branding

The site uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #2c5530; /* Ghana green */
  --secondary-color: #ffd700; /* Ghana gold */
  --accent-color: #e74c3c; /* Red accent */
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;
}
```

### Adding New Categories

1. Update the category options in both `index.html` and `admin.html`
2. Add corresponding icons in the categories section
3. Update the filter functionality in `script.js`

### Social Media Links

Update social media URLs in the footer section of `index.html` and in the admin settings panel.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Images are optimized and served from CDN (Unsplash)
- CSS and JavaScript are minified for production
- Fonts are loaded efficiently with `font-display: swap`
- Smooth scrolling and animations use CSS transforms
- Local storage is used efficiently to minimize data usage

## Security Considerations

- Admin authentication is client-side (suitable for demo/development)
- For production, implement server-side authentication
- Sanitize user inputs in the rich text editor
- Use HTTPS in production
- Regular backups of content and media

## Deployment Options

### Static Hosting (Recommended)

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to Git repository
- **GitHub Pages**: Push to repository and enable Pages
- **Firebase Hosting**: Use Firebase CLI

### Traditional Web Hosting

- Upload all files to your web server
- Ensure proper file permissions
- Configure domain and SSL certificate

## Future Enhancements

### Planned Features

- Comment system for reader engagement
- Email newsletter integration
- Analytics dashboard
- SEO optimization tools
- Multi-language support
- Advanced media management
- Backup and export functionality

### Technical Improvements

- Server-side content management
- Database integration
- API for mobile app
- Advanced search with full-text indexing
- Automated social media posting
- Email notifications for new articles

## Support and Maintenance

### Regular Tasks

- Update article content regularly
- Monitor site performance
- Backup content and media
- Update contact information
- Review and respond to reader feedback

### Troubleshooting

- **Admin login issues**: Check browser localStorage
- **Images not loading**: Verify image URLs
- **Responsive issues**: Test on multiple devices
- **Performance problems**: Optimize images and content

## Contact

For technical support or questions about this website:

- **Developer**: Herbert Mantey
- **Client**: Redeemer Buatsi
- **Email**: herbertmantey@gmail.com

## License

This project is created specifically for Redeemer Buatsi's personal blog. All content and design elements are proprietary. The code structure can be adapted for similar projects with proper attribution.

---

**Built with ❤️ for Ghanaian journalism excellence**
