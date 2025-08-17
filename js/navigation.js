// Shared Navigation Component
class Navigation {
  constructor() {
    this.currentPath = window.location.pathname;
    this.init();
  }

  // Navigation data structure
  getNavItems() {
    return [
      { href: '../index.html', text: 'Home', id: 'home' },
      { href: 'index.html', text: 'Senses Overview', id: 'senses-overview', senses: true },
      { href: 'light.html', text: 'Light & Vision', id: 'light', senses: true },
      { href: 'taste.html', text: 'Taste & Flavor', id: 'taste', senses: true },
      { href: 'quantum.html', text: 'Quantum Physics', id: 'quantum', senses: true },
      { href: 'donate.html', text: 'Donate', id: 'donate', senses: true },
      { href: '../chat.html', text: 'Chat', id: 'chat' }
    ];
  }

  // Determine if we're in the senses directory
  isInSensesDirectory() {
    return this.currentPath.includes('/senses/') || this.currentPath.endsWith('/senses');
  }

  // Adjust href based on current location
  adjustHref(item) {
    if (this.isInSensesDirectory()) {
      // We're in senses directory
      if (item.senses) {
        return item.href; // Use as-is for senses pages
      } else {
        return item.href; // Already has ../ for non-senses pages
      }
    } else {
      // We're in root directory
      if (item.senses) {
        return `senses/${item.href}`; // Add senses/ prefix
      } else if (item.id === 'home') {
        return 'index.html'; // Home page in root
      } else {
        return item.href.replace('../', ''); // Remove ../ prefix
      }
    }
  }

  // Determine if a nav item should be active
  isActive(item) {
    const adjustedHref = this.adjustHref(item);
    const currentFile = this.currentPath.split('/').pop() || 'index.html';
    const hrefFile = adjustedHref.split('/').pop();
    
    // Special case for home page
    if (item.id === 'home') {
      return currentFile === 'index.html' && !this.isInSensesDirectory();
    }
    
    return currentFile === hrefFile;
  }

  // Generate navigation HTML
  generateNavHTML() {
    const navItems = this.getNavItems();
    
    return `
      <nav class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <h2><a href="${this.isInSensesDirectory() ? '../index.html' : 'index.html'}">Banquotas</a></h2>
          <button class="menu-toggle" id="menuToggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <ul class="nav-links">
          ${navItems.map(item => `
            <li><a href="${this.adjustHref(item)}" ${this.isActive(item) ? 'class="active"' : ''}>${item.text}</a></li>
          `).join('')}
        </ul>
      </nav>
    `;
  }

  // Initialize navigation
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  // Render navigation
  render() {
    // Find existing navigation or create container
    let navContainer = document.querySelector('.nav-container');
    if (!navContainer) {
      navContainer = document.createElement('div');
      navContainer.className = 'nav-container';
      document.body.insertBefore(navContainer, document.body.firstChild);
    }

    // Insert navigation HTML
    navContainer.innerHTML = this.generateNavHTML();

    // Initialize mobile menu functionality
    this.initMobileMenu();
  }

  // Initialize mobile menu toggle
  initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      });
    }
  }
}

// Initialize navigation when script loads
new Navigation();
