// reliable-navigation.js - Consistent and reliable navigation system with dynamic footer

class ReliableNavigation {
    constructor() {
        this.currentPath = window.location.pathname;
        this.currentFolder = this.detectCurrentFolder();
        this.pathCache = new Map();
        this.isNavigating = false;
        this.retryCount = 0;
        this.maxRetries = 2;
        
        // Pre-populate cache with known working paths
        this.initializePathCache();
    }

    // Detect current folder location
    detectCurrentFolder() {
        const path = this.currentPath;
        
        if (path.includes('/program/')) {
            return 'program';
        } else if (path.includes('/about/')) {
            return 'about';
        } else if (path.includes('/supportus/')) {
            return 'supportus';
        } else {
            return 'root';
        }
    }

    // Pre-populate cache with standard navigation paths
    initializePathCache() {
        const pathMappings = {
            // From root
            'root': {
                'program/calendar.html': 'program/calendar.html',
                'program/fellowship.html': 'program/fellowship.html',
                'program/communityhours.html': 'program/communityhours.html',
                'program/seasonaldinner.html': 'program/seasonaldinner.html',
                'program/exhibition.html': 'program/exhibition.html',
                'about/mission.html': 'about/mission.html',
                'about/vision.html': 'about/vision.html',
                'about/team.html': 'about/team.html',
                'about/contact.html': 'about/contact.html',
                'supportus/supportus.html': 'supportus/supportus.html'
            },
            // From program folder
            'program': {
                'program/calendar.html': 'calendar.html',
                'program/fellowship.html': 'fellowship.html',
                'program/communityhours.html': 'communityhours.html',
                'program/seasonaldinner.html': 'seasonaldinner.html',
                'program/exhibition.html': 'exhibition.html',
                'about/mission.html': '../about/mission.html',
                'about/vision.html': '../about/vision.html',
                'about/team.html': '../about/team.html',
                'about/contact.html': '../about/contact.html',
                'supportus/supportus.html': '../supportus/supportus.html',
                'index.html': '../index.html'
            },
            // From about folder
            'about': {
                'about/mission.html': 'mission.html',
                'about/vision.html': 'vision.html',
                'about/team.html': 'team.html',
                'about/contact.html': 'contact.html',
                'program/calendar.html': '../program/calendar.html',
                'program/fellowship.html': '../program/fellowship.html',
                'program/communityhours.html': '../program/communityhours.html',
                'program/seasonaldinner.html': '../program/seasonaldinner.html',
                'program/exhibition.html': '../program/exhibition.html',
                'supportus/supportus.html': '../supportus/supportus.html',
                'index.html': '../index.html'
            },
            // From supportus folder
            'supportus': {
                'supportus/supportus.html': 'supportus.html',
                'program/calendar.html': '../program/calendar.html',
                'program/fellowship.html': '../program/fellowship.html',
                'program/communityhours.html': '../program/communityhours.html',
                'program/seasonaldinner.html': '../program/seasonaldinner.html',
                'program/exhibition.html': '../program/exhibition.html',
                'about/mission.html': '../about/mission.html',
                'about/vision.html': '../about/vision.html',
                'about/team.html': '../about/team.html',
                'about/contact.html': '../about/contact.html',
                'index.html': '../index.html'
            }
        };

        // Pre-populate cache based on current folder
        const currentMappings = pathMappings[this.currentFolder] || {};
        for (const [target, actualPath] of Object.entries(currentMappings)) {
            const cacheKey = `${this.currentPath}:${target}`;
            this.pathCache.set(cacheKey, actualPath);
        }
    }

    // Reliable navigation with fallback strategies
    async navigateTo(targetPath, event) {
        if (event) event.preventDefault();
        if (!targetPath || targetPath === '#') return false;

        // Prevent multiple simultaneous navigation attempts
        if (this.isNavigating) {
            return false;
        }

        this.isNavigating = true;
        this.retryCount = 0;

        try {
            await this.attemptNavigation(targetPath);
        } catch (error) {
            // Final fallback - direct navigation
            window.location.href = targetPath;
        } finally {
            this.isNavigating = false;
        }

        return false;
    }

    // Attempt navigation with multiple strategies
    async attemptNavigation(targetPath) {
        const cacheKey = `${this.currentPath}:${targetPath}`;
        
        // Strategy 1: Use cached path if available
        if (this.pathCache.has(cacheKey)) {
            const cachedPath = this.pathCache.get(cacheKey);
            if (await this.validatePath(cachedPath)) {
                window.location.href = cachedPath;
                return;
            } else {
                // Remove invalid cached path
                this.pathCache.delete(cacheKey);
            }
        }

        // Strategy 2: Try pre-calculated paths
        const calculatedPaths = this.calculateReliablePaths(targetPath);
        
        for (const path of calculatedPaths) {
            if (await this.validatePath(path)) {
                this.pathCache.set(cacheKey, path);
                window.location.href = path;
                return;
            }
        }

        // Strategy 3: Retry with different approach
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => {
                this.attemptNavigation(targetPath);
            }, 100 * this.retryCount); // Increasing delay
            return;
        }

        // Strategy 4: Final fallback - try original path
        window.location.href = targetPath;
    }

    // Calculate reliable paths based on current location
    calculateReliablePaths(targetPath) {
        const paths = [];
        
        // Add most likely paths first
        switch (this.currentFolder) {
            case 'root':
                paths.push(targetPath);
                paths.push('./' + targetPath);
                break;
                
            case 'program':
                if (targetPath.startsWith('program/')) {
                    paths.push(targetPath.replace('program/', ''));
                    paths.push('./' + targetPath.replace('program/', ''));
                } else {
                    paths.push('../' + targetPath);
                }
                paths.push(targetPath);
                break;
                
            case 'about':
                if (targetPath.startsWith('about/')) {
                    paths.push(targetPath.replace('about/', ''));
                    paths.push('./' + targetPath.replace('about/', ''));
                } else {
                    paths.push('../' + targetPath);
                }
                paths.push(targetPath);
                break;
                
            case 'supportus':
                if (targetPath.startsWith('supportus/')) {
                    paths.push(targetPath.replace('supportus/', ''));
                    paths.push('./' + targetPath.replace('supportus/', ''));
                } else {
                    paths.push('../' + targetPath);
                }
                paths.push(targetPath);
                break;
        }

        // Add additional fallback paths
        paths.push('/' + targetPath);
        paths.push('../../' + targetPath);

        // Remove duplicates and empty values
        return [...new Set(paths.filter(p => p && p !== '#'))];
    }

    // Validate path with better error handling
    async validatePath(path) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300); // Longer timeout for reliability

            const response = await fetch(path, { 
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache', // Always check fresh
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            clearTimeout(timeoutId);
            return response.ok && response.status === 200;
            
        } catch (error) {
            return false;
        }
    }

    // Reliable home navigation
    goHome() {
        const homePaths = this.calculateReliablePaths('index.html');
        
        // Try the most likely home path first
        let homePath = '../index.html';
        if (this.currentFolder === 'root') {
            homePath = 'index.html';
        }
        
        window.location.href = homePath;
    }

    // Preload critical pages for better reliability
    preloadCriticalPages() {
        const criticalPages = [
            'program/calendar.html',
            'about/mission.html',
            'supportus/supportus.html',
            'index.html'
        ];

        criticalPages.forEach(page => {
            const paths = this.calculateReliablePaths(page);
            paths.slice(0, 2).forEach(path => {
                // Preload silently
                fetch(path, { method: 'HEAD', cache: 'force-cache' }).catch(() => {});
            });
        });
    }
}

// Create global instance
const reliableNav = new ReliableNavigation();

// NEW: Load footer data dynamically
async function loadFooterData() {
    try {
        console.log('Loading footer data...');
        
        // Try multiple possible paths for footer data
        const possiblePaths = [
            './footer-data.json',
            '../footer-data.json',
            '/footer-data.json',
            'footer-data.json'
        ];
        
        let response;
        for (const path of possiblePaths) {
            try {
                const tempResponse = await fetch(path);
                if (tempResponse.ok) {
                    response = tempResponse;
                    console.log(`✓ Loaded footer data from: ${path}`);
                    break;
                }
            } catch (err) {
                console.log(`✗ Failed to load footer from ${path}`);
            }
        }
        
        if (response && response.ok) {
            const footerData = await response.json();
            console.log('Footer data loaded:', footerData);
            
            // Only add footer if show_footer is true
            if (footerData.show_footer) {
                const footerHTML = `<footer>${footerData.footer_text || '124 Gallery Street, New York, NY 10001'}</footer>`;
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            }
        } else {
            // Fallback to hardcoded footer
            console.log('Using fallback footer');
            addFallbackFooter();
        }
        
    } catch (error) {
        console.error('Error loading footer data:', error);
        // Fallback to hardcoded footer
        addFallbackFooter();
    }
}

// Fallback footer function
function addFallbackFooter() {
    if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', '<footer>124 Gallery Street, New York, NY 10001</footer>');
    }
}

// Load navigation with reliability enhancements
function loadReliableNavigation() {
    loadDefaultReliableNav();
    setupReliableNavEvents();
    setupReliableGlobalFunctions();
    
    // Load footer data
    loadFooterData();
    
    // Preload critical pages after a short delay
    setTimeout(() => {
        reliableNav.preloadCriticalPages();
    }, 1000);
}

// Default navigation HTML
function loadDefaultReliableNav() {
    const navHTML = `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="reliableNav.goHome()" style="cursor: pointer;">initial research</h1>
            </div>
            <nav class="nav-top">
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">program</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="program/calendar.html" onclick="return reliableNav.navigateTo('program/calendar.html', event)">calendar</a>
                            <a href="program/fellowship.html" onclick="return reliableNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                            <a href="program/communityhours.html" onclick="return reliableNav.navigateTo('program/communityhours.html', event)">community hours</a>
                            <a href="program/seasonaldinner.html" onclick="return reliableNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                            <a href="program/exhibition.html" onclick="return reliableNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">about</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="about/mission.html" onclick="return reliableNav.navigateTo('about/mission.html', event)">mission</a>
                            <a href="about/vision.html" onclick="return reliableNav.navigateTo('about/vision.html', event)">vision</a>
                            <a href="about/team.html" onclick="return reliableNav.navigateTo('about/team.html', event)">team</a>
                            <a href="about/contact.html" onclick="return reliableNav.navigateTo('about/contact.html', event)">contact</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="supportus/supportus.html" onclick="return reliableNav.navigateTo('supportus/supportus.html', event)">support us</a>
                </div>
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNavReliable()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdownReliable(event, this)">
                        program
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="program/calendar.html" onclick="return reliableNav.navigateTo('program/calendar.html', event)">calendar</a>
                        <a href="program/fellowship.html" onclick="return reliableNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                        <a href="program/communityhours.html" onclick="return reliableNav.navigateTo('program/communityhours.html', event)">community hours</a>
                        <a href="program/seasonaldinner.html" onclick="return reliableNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                        <a href="program/exhibition.html" onclick="return reliableNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdownReliable(event, this)">
                        about
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="about/mission.html" onclick="return reliableNav.navigateTo('about/mission.html', event)">mission</a>
                        <a href="about/vision.html" onclick="return reliableNav.navigateTo('about/vision.html', event)">vision</a>
                        <a href="about/team.html" onclick="return reliableNav.navigateTo('about/team.html', event)">team</a>
                        <a href="about/contact.html" onclick="return reliableNav.navigateTo('about/contact.html', event)">contact</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="supportus/supportus.html" onclick="return reliableNav.navigateTo('supportus/supportus.html', event)">support us</a>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // Footer will be loaded by loadFooterData() function
}

// Reliable event setup
function setupReliableNavEvents() {
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.querySelector('.dropdown-toggle') === e.target) {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item.active').forEach(item => {
                if (item !== navItem) item.classList.remove('active');
            });
            navItem.classList.toggle('active');
        }
        
        if (!e.target.closest('.nav-item') && !e.target.closest('.mobile-nav')) {
            document.querySelectorAll('.nav-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    if (window.innerWidth > 768) {
        document.addEventListener('mouseover', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.querySelector('.dropdown')) {
                document.querySelectorAll('.nav-item.active').forEach(item => {
                    if (item !== navItem) item.classList.remove('active');
                });
                navItem.classList.add('active');
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (navItem && !navItem.contains(e.relatedTarget)) {
                navItem.classList.remove('active');
            }
        });
    }
}

// Global functions
function setupReliableGlobalFunctions() {
    window.toggleMobileNavReliable = function() {
        const mobileNav = document.getElementById('mobileNav');
        mobileNav.classList.toggle('show');
    };

    window.toggleMobileDropdownReliable = function(e, element) {
        e.preventDefault();
        const navItem = element.parentElement;
        navItem.classList.toggle('active');
    };

    // Compatibility functions
    window.navigateToPage = (url, event) => reliableNav.navigateTo(url, event);
    window.goToHomepage = () => reliableNav.goHome();
    window.toggleMobileNav = window.toggleMobileNavReliable;
    window.toggleMobileDropdown = window.toggleMobileDropdownReliable;
}

// Initialize with proper timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReliableNavigation);
} else {
    loadReliableNavigation();
}

// Global access
window.reliableNav = reliableNav;

// Debug only when requested
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        console.log('Reliable Nav Debug:', {
            currentPath: reliableNav.currentPath,
            currentFolder: reliableNav.currentFolder,
            cacheSize: reliableNav.pathCache.size,
            isNavigating: reliableNav.isNavigating,
            cache: Object.fromEntries(reliableNav.pathCache)
        });
    }
});
