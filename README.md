# 🚀 Developer Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and vanilla JavaScript. Features smooth animations, dark theme, and optimized for GitHub Pages hosting.

## ✨ Features

- **Modern Dark Theme** - Beautiful gradient backgrounds and glassmorphism effects
- **Smooth Animations** - Intersection Observer API for scroll-triggered animations
- **Fully Responsive** - Mobile-first design that works on all devices
- **Performance Optimized** - Lightweight with no framework dependencies
- **Interactive Elements** - Hover effects, typing animations, and counter animations
- **SEO Friendly** - Semantic HTML with proper meta tags

## 🎨 Sections

1. **Hero Section** - Eye-catching introduction with animated code window
2. **About Section** - Detailed information about skills and expertise
3. **Skills Section** - Technical stack showcased in organized categories
4. **Projects Section** - Portfolio pieces with problem/solution/impact format
5. **Contact Section** - Call-to-action with social links

## 🛠️ Technologies Used

- HTML5
- CSS3 (CSS Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter)

## 📦 Project Structure

```
Portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styles and responsive design
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## 🚀 Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in your browser
3. That's it! No build process required.

### Customization

#### Update Personal Information

Edit `index.html` and update:
- Navigation links
- Hero section title and description
- About section content
- Projects information
- Contact links (email, LinkedIn, GitHub)
- Footer text

#### Customize Colors

Edit `styles.css` and modify the CSS custom properties in `:root`:

```css
:root {
    --accent-primary: #8b5cf6;  /* Purple */
    --accent-secondary: #6366f1; /* Indigo */
    --accent-blue: #3b82f6;
    --accent-green: #10b981;
    /* ... more colors */
}
```

#### Add Your Projects

In `index.html`, find the projects section and add new project cards following this structure:

```html
<div class="project-card">
    <!-- Your project content -->
</div>
```

## 🌐 Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `yourusername.github.io` (replace `yourusername` with your GitHub username)
3. Make it public
4. Don't initialize with README (we already have one)

### Step 2: Push Your Code

Open Terminal in the Portfolio folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Portfolio website"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/yourusername.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select **main** branch
5. Click **Save**

Your website will be live at: `https://yourusername.github.io`

### Alternative: Deploy to a Project Repository

If you want to use a different repository name:

```bash
# Create repo with any name, e.g., 'portfolio'
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

Then in GitHub Settings > Pages:
- Source: main branch
- Your site will be at: `https://yourusername.github.io/portfolio`

## 📝 Customization Guide

### Changing Profile Picture Placeholders

The project uses placeholder avatars from `pravatar.cc`. Replace these with your own images:

```html
<!-- In index.html, replace: -->
<img src="https://i.pravatar.cc/40?img=1" alt="Client">

<!-- With your own image: -->
<img src="images/profile.jpg" alt="Your Name">
```

### Adding Social Media Links

Update the contact section buttons in `index.html`:

```html
<a href="mailto:your.email@example.com" class="btn btn-primary btn-large">
    Get In Touch
</a>
<a href="https://www.linkedin.com/in/yourprofile" class="btn btn-secondary btn-large" target="_blank">
    LinkedIn
</a>
<a href="https://github.com/yourprofile" class="btn btn-secondary btn-large" target="_blank">
    GitHub
</a>
```

### Modifying Animations

Edit `script.js` to customize:
- Animation timing
- Scroll effects
- Counter animations
- Typing speed

Example:
```javascript
const typingSpeed = 10; // Change this value for faster/slower typing
```

## 🎯 Performance Tips

- All images use optimized placeholders
- CSS is minimal and organized
- JavaScript uses modern APIs (Intersection Observer)
- No external dependencies except Google Fonts
- Lazy loading for smooth scrolling

## 🐛 Troubleshooting

### GitHub Pages Not Working?

1. Check repository name is exactly `yourusername.github.io`
2. Ensure repository is public
3. Wait 2-3 minutes after enabling Pages
4. Check Settings > Pages for any error messages

### Animations Not Working?

1. Make sure JavaScript is enabled in your browser
2. Check browser console for any errors (F12)
3. Ensure `script.js` is properly linked in `index.html`

### Mobile Menu Not Showing?

The mobile navigation automatically hides on smaller screens. To add a hamburger menu, uncomment the mobile menu code in `script.js`.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is open source and available for personal and commercial use. Feel free to customize it for your own portfolio!

## 🤝 Contributing

Found a bug or want to contribute? Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 💡 Tips for Success

1. **Personalize It** - Add your own projects, experiences, and personality
2. **Keep It Updated** - Regularly update with new projects and skills
3. **Test Thoroughly** - Check on different devices and browsers
4. **SEO Optimization** - Update meta descriptions and titles
5. **Analytics** - Consider adding Google Analytics to track visitors

## 🙏 Credits

- Design inspiration from modern SaaS landing pages
- Icons and animations created with CSS
- Font: Inter by Rasmus Andersson

## 📞 Support

If you need help or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the customization guide

---

**Made with ❤️ and JavaScript**

Happy coding! 🚀
