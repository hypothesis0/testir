// universal-navigation.js - Universal navigation system compatible with existing CSS

class UniversalNavigation {
    constructor() {
        this.basePath = this.detectBasePath();
        this.currentPath = window.location.pathname;
        this.pathCache = new Map();
        this.isNavigating = false;
        
        console.log('🌐 Universal Navigation System started');
        console.log('📍 Current path:', this.currentPath);
        console.log('🏠 Base path:', this.basePath);
    }

    // Intelligent detection of project root path
    detectBasePath() {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(s => s && s !== 'index.html');
        
        // Remove filename, keep only directory path
        const currentFile = pathSegments[pathSegments.length - 1];
        if (currentFile && currentFile.includes('.html')) {
            pathSegments.pop();
        }
        
        // Build path back to root based on directory depth
        const depth = pathSegments.length;
        return depth === 0 ? './' : '../'.repeat(depth);
    }

    // Build absolute path
    buildAbsolutePath(relativePath) {
        if (relativePath.startsWith('/') || relativePath.startsWith('http')) {
            return relativePath;
        }
        return this.basePath + relativePath;
    }

    // Universal navigation function
    async navigateTo(targetPath, event) {
        if (event) {
            event.preventDefault();
        }

        if (!targetPath || targetPath === '#' || this.isNavigating) {
            return false;
        }

        this.isNavigating = true;
        console.log(`🧭 Navigating to: ${targetPath}`);

        try {
            // Check cache
            const cacheKey = `${this.currentPath}:${targetPath}`;
            if (this.pathCache.has(cacheKey)) {
                const cachedPath = this.pathCache.get(cacheKey);
                console.log(`📋 Using cached path: ${cachedPath}`);
                window.location.href = cachedPath;
                return false;
            }

            // Try multiple path combinations
            const possiblePaths = this.generatePossiblePaths(targetPath);
            
            for (const path of possiblePaths) {
                try {
                    console.log(`🔍 Testing path: ${path}`);
                    const response = await fetch(path, { method: 'HEAD' });
                    
                    if (response.ok) {
                        console.log(`✅ Valid path found: ${path}`);
                        this.pathCache.set(cacheKey, path);
                        window.location.href = path;
                        return false;
                    }
                } catch (error) {
                    // Continue to next path
                }
            }

            console.log(`❌ No valid path found for: ${targetPath}`);
            this.showNavigationError(targetPath, possiblePaths);

        } catch (error) {
            console.error('Navigation error:', error);
            this.showNavigationError(targetPath, []);
        } finally {
            this.isNavigating = false;
        }

        return false;
    }

    // Generate all possible paths
    generatePossiblePaths(targetPath) {
        const paths = [];
        
        // 1. Based on detected base path
        paths.push(this.buildAbsolutePath(targetPath));
        
        // 2. Original path
        paths.push(targetPath);
        
        // 3. Relative path variations
        paths.push(`./${targetPath}`);
        
        // 4. Different levels of back navigation
        for (let i = 1; i <= 4; i++) {
            paths.push('../'.repeat(i) + targetPath);
        }
        
        // 5. Absolute path
        paths.push(`/${targetPath}`);
        
        // 6. If path contains folders, try different base path combinations
        if (targetPath.includes('/')) {
            const parts = targetPath.split('/');
            const fileName = parts[parts.length - 1];
            
            // Try just the filename
            paths.push(fileName);
            paths.push(this.buildAbsolutePath(fileName));
        }
        
        // Remove duplicates and filter empty values
        return [...new Set(paths)].filter(p => p && p !== '#');
    }

    // Show navigation error - styled to match existing CSS
    showNavigationError(targetPath, attemptedPaths) {
        // Remove existing error
        const existingError = document.querySelector('.nav-error-overlay');
        if (existingError) {
            existingError.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'nav-error-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(23, 23, 23, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: rgb(241, 61, 33);
                border-radius: 0;
                padding: 48px;
                max-width: 600px;
                width: 90%;
                color: rgb(23, 23, 23);
                font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
                box-shadow: none;
            ">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h2 style="
                        font-size: 34px;
                        font-weight: 500;
                        margin: 0 0 16px 0;
                        color: rgb(23, 23, 23);
                        font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
                    ">Page Not Found</h2>
                    <p style="
                        font-size: 16px;
                        font-weight: 300;
                        margin: 0;
                        color: rgb(23, 23, 23);
                    ">Unable to access: <strong>${targetPath}</strong></p>
                </div>

                <div style="margin-bottom: 24px; font-size: 16px; font-weight: 300; line-height: 1.4;">
                    <p style="margin: 0 0 12px 0;"><strong>Current location:</strong> ${this.currentPath}</p>
                    <p style="margin: 0 0 12px 0;"><strong>Base path:</strong> ${this.basePath}</p>
                    <p style="margin: 0;"><strong>Attempted paths:</strong> ${attemptedPaths.length} total</p>
                </div>

                <div style="
                    background: rgba(23, 23, 23, 0.1);
                    padding: 20px;
                    margin-bottom: 24px;
                    font-size: 14px;
                ">
                    <strong>Possible solutions:</strong><br>
                    • Check if file exists in correct location<br>
                    • Verify filename case sensitivity<br>
                    • Ensure web server is running<br>
                    • Check file permissions
                </div>

                <div style="text-align: center;">
                    <button onclick="universalNav.goHome(); this.closest('.nav-error-overlay').remove();" style="
                        background: rgb(23, 23, 23);
                        color: rgb(241, 61, 33);
                        border: none;
                        padding: 12px 24px;
                        margin-right: 12px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 300;
                        font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgba(23, 23, 23, 0.8)'" onmouseout="this.style.background='rgb(23, 23, 23)'">
                        Go Home
                    </button>
                    <button onclick="this.closest('.nav-error-overlay').remove()" style="
                        background: transparent;
                        color: rgb(23, 23, 23);
                        border: 2px solid rgb(23, 23, 23);
                        padding: 10px 22px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 300;
                        font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='rgb(23, 23, 23)'; this.style.color='rgb(241, 61, 33)'" onmouseout="this.style.background='transparent'; this.style.color='rgb(23, 23, 23)'">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Click background to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Smart home navigation
    async goHome() {
        const homePaths = [
            this.buildAbsolutePath('index.html'),
            this.buildAbsolutePath(''),
            'index.html',
            '../index.html',
            '../../index.html',
            '../../../index.html',
            '/',
            '/index.html'
        ];

        for (const path of homePaths) {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    window.location.href = path;
                    return;
                }
            } catch (error) {
                // Continue trying
            }
        }

        // If all fail, go to root
        window.location.href = '/';
    }
}

// Create global instance
const universalNav = new UniversalNavigation();

// Main navigation loading function - compatible with existing CSS
async function loadUniversalNavigation() {
    try {
        // Try loading from CMS
        const response = await fetch(universalNav.buildAbsolutePath('navigation-data.json'));
        
        if (!response.ok) {
            throw new Error('CMS data loading failed');
        }
        
        const navData = await response.json();
        console.log('✅ Navigation data loaded from CMS');
        document.body.insertAdjacentHTML('afterbegin', generateNavHTML(navData));
        
    } catch (error) {
        console.log('📝 Using default navigation configuration');
        loadDefaultNav();
    }
    
    // Always execute setup
    insertFooter();
    setupNavEvents();
    setupGlobalFunctions();
}

// Generate CMS navigation HTML - using existing CSS classes
function generateNavHTML(navData) {
    let desktopNavItems = '';
    let mobileNavItems = '';
    
    (navData.nav_items || []).forEach((item, index) => {
        if (!item.visible) return;
        
        if (item.direct_link) {
            desktopNavItems += `
                <div class="nav-item">
                    <a href="${item.direct_link}" onclick="return universalNav.navigateTo('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
            
            mobileNavItems += `
                <div class="mobile-nav-item">
                    <a href="${item.direct_link}" onclick="return universalNav.navigateTo('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
        } else if (item.dropdown_items && item.dropdown_items.length > 0) {
            let dropdownLinks = '';
            let mobileDropdownLinks = '';
            
            item.dropdown_items.forEach((dropItem) => {
                if (!dropItem.visible) return;
                
                dropdownLinks += `
                    <a href="${dropItem.link}" onclick="return universalNav.navigateTo('${dropItem.link}', event)">
                        ${dropItem.label}
                    </a>
                `;
                
                mobileDropdownLinks += `
                    <a href="${dropItem.link}" onclick="return universalNav.navigateTo('${dropItem.link}', event)">
                        ${dropItem.label}
                    </a>
                `;
            });
            
            if (dropdownLinks) {
                desktopNavItems += `
                    <div class="nav-item">
                        <a href="#" class="dropdown-toggle">${item.label}</a>
                        <div class="dropdown">
                            <div class="dropdown-container">
                                ${dropdownLinks}
                            </div>
                        </div>
                    </div>
                `;
                
                mobileNavItems += `
                    <div class="mobile-nav-item">
                        <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                            ${item.label}
                            <span class="mobile-arrow">ᵥ</span>
                        </a>
                        <div class="mobile-dropdown">
                            ${mobileDropdownLinks}
                        </div>
                    </div>
                `;
            }
        }
    });
    
    return generateNavHTMLTemplate(navData.site_title || 'initial research', desktopNavItems, mobileNavItems);
}

// Load default universal navigation - using existing CSS classes
function loadDefaultNav() {
    const desktopNavItems = `
        <div class="nav-item">
            <a href="#" class="dropdown-toggle">program</a>
            <div class="dropdown">
                <div class="dropdown-container">
                    <a href="program/calendar.html" onclick="return universalNav.navigateTo('program/calendar.html', event)">calendar</a>
                    <a href="program/fellowship.html" onclick="return universalNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                    <a href="program/communityhours.html" onclick="return universalNav.navigateTo('program/communityhours.html', event)">community hours</a>
                    <a href="program/seasonaldinner.html" onclick="return universalNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                    <a href="program/exhibition.html" onclick="return universalNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
                </div>
            </div>
        </div>
        
        <div class="nav-item">
            <a href="#" class="dropdown-toggle">about</a>
            <div class="dropdown">
                <div class="dropdown-container">
                    <a href="about/mission.html" onclick="return universalNav.navigateTo('about/mission.html', event)">mission</a>
                    <a href="about/vision.html" onclick="return universalNav.navigateTo('about/vision.html', event)">vision</a>
                    <a href="about/team.html" onclick="return universalNav.navigateTo('about/team.html', event)">team</a>
                    <a href="about/contact.html" onclick="return universalNav.navigateTo('about/contact.html', event)">contact</a>
                </div>
            </div>
        </div>
        
        <div class="nav-item">
            <a href="supportus/supportus.html" onclick="return universalNav.navigateTo('supportus/supportus.html', event)">support us</a>
        </div>
    `;

    const mobileNavItems = `
        <div class="mobile-nav-item">
            <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                program
                <span class="mobile-arrow">ᵥ</span>
            </a>
            <div class="mobile-dropdown">
                <a href="program/calendar.html" onclick="return universalNav.navigateTo('program/calendar.html', event)">calendar</a>
                <a href="program/fellowship.html" onclick="return universalNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                <a href="program/communityhours.html" onclick="return universalNav.navigateTo('program/communityhours.html', event)">community hours</a>
                <a href="program/seasonaldinner.html" onclick="return universalNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                <a href="program/exhibition.html" onclick="return universalNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
            </div>
        </div>
        
        <div class="mobile-nav-item">
            <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                about
                <span class="mobile-arrow">ᵥ</span>
            </a>
            <div class="mobile-dropdown">
                <a href="about/mission.html" onclick="return universalNav.navigateTo('about/mission.html', event)">mission</a>
                <a href="about/vision.html" onclick="return universalNav.navigateTo('about/vision.html', event)">vision</a>
                <a href="about/team.html" onclick="return universalNav.navigateTo('about/team.html', event)">team</a>
                <a href="about/contact.html" onclick="return universalNav.navigateTo('about/contact.html', event)">contact</a>
            </div>
        </div>
        
        <div class="mobile-nav-item">
            <a href="supportus/supportus.html" onclick="return universalNav.navigateTo('supportus/supportus.html', event)">support us</a>
        </div>
    `;

    const navHTML = generateNavHTMLTemplate('initial research', desktopNavItems, mobileNavItems);
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// Generate navigation HTML template - using existing CSS classes
function generateNavHTMLTemplate(siteTitle, desktopNavItems, mobileNavItems) {
    return `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="universalNav.goHome()" style="cursor: pointer;">${siteTitle}</h1>
            </div>
            <nav class="nav-top">
                ${desktopNavItems}
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                ${mobileNavItems}
            </div>
        </div>
    `;
}

// Setup navigation events - compatible with existing CSS
function setupNavEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            // Desktop hover - matches original behavior
            if (window.innerWidth > 768) {
                item.addEventListener('mouseenter', () => {
                    document.querySelectorAll('.nav-item').forEach(i => {
                        if (i !== item) i.classList.remove('active');
                    });
                    item.classList.add('active');
                });
                
                item.addEventListener('mouseleave', () => {
                    item.classList.remove('active');
                });
            }
            
            // Click toggle - matches original behavior
            const toggle = item.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item').forEach(i => {
                        if (i !== item) i.classList.remove('active');
                    });
                    item.classList.toggle('active');
                    e.stopPropagation();
                });
            }
        }
    });
    
    // Click outside to close - matches original behavior
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && 
            !e.target.closest('.mobile-nav') && 
            !e.target.closest('.hamburger-menu')) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// Setup global functions - compatible with existing CSS
function setupGlobalFunctions() {
    // Mobile navigation toggle - matches original behavior
    window.toggleMobileNav = function() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav.classList.contains('show')) {
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        } else {
            mobileNav.classList.add('show');
        }
    };

    // Mobile dropdown toggle - matches original behavior
    window.toggleMobileDropdown = function(e, element) {
        e.preventDefault();
        const navItem = element.parentElement;
        const dropdown = navItem.querySelector('.mobile-dropdown');
        
        if (!dropdown) return;
        
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            if (item !== navItem) item.classList.remove('active');
        });
        
        navItem.classList.toggle('active');
    };

    // Compatibility functions
    window.navigateToPage = (url, event) => universalNav.navigateTo(url, event);
    window.smartNavigate = (url, event) => universalNav.navigateTo(url, event);
    window.goToHomepage = () => universalNav.goHome();
    window.smartGoHome = () => universalNav.goHome();
}

// Insert footer - using existing styles
function insertFooter() {
    // Check if footer already exists
    if (document.querySelector('footer')) {
        return;
    }
    
    const footer = `
        <footer>
            124 Gallery Street, New York, NY 10001
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footer);
}

// Initialize - compatible with existing CSS
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Universal Navigation System started');
    loadUniversalNavigation();
});

// Debug functionality
window.universalNav = universalNav;
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        console.log('🔍 Navigation debug info:');
        console.log('Current path:', universalNav.currentPath);
        console.log('Base path:', universalNav.basePath);
        console.log('Path cache:', universalNav.pathCache);
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        universalNav.goHome();
    }
});