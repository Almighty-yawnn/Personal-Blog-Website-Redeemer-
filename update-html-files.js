const fs = require('fs').promises;
const path = require('path');

// Files to update (excluding header.html and index.html which we've already updated)
const htmlFiles = [
    'about-me.html',
    'admin.html',
    'article.html',
    'articles.html',
    'test-supabase.html'
];

// The header HTML to insert
const headerHTML = `
    <!-- Header will be loaded here -->
    <header data-include-html="header.html"></header>
`;

// The script to add before </body>
const scriptHTML = `
    <script src="script.js"></script>
`;

async function updateHTMLFile(file) {
    try {
        const filePath = path.join(__dirname, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Remove existing header
        content = content.replace(/<header[\s\S]*?<\/header>/, '');
        
        // Add new header after <body>
        content = content.replace(/<body[^>]*>/, match => `${match}${headerHTML}`);
        
        // Add script before </body> if not present
        if (!content.includes('<script src="script.js">')) {
            content = content.replace('</body>', `${scriptHTML}</body>`);
        }
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } catch (error) {
        console.error(`Error updating ${file}:`, error);
    }
}

async function updateAllFiles() {
    for (const file of htmlFiles) {
        await updateHTMLFile(file);
    }
    console.log('All files have been updated!');
}

updateAllFiles();
