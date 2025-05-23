// fixed-navigation.js - Corrected cross-folder navigation system

class CrossFolderNavigation {
    constructor() {
        this.currentPath = window.location.pathname;
        this.currentFolder = this.detectCurrentFolder();
        this.pathCache = new Map();
        this.isNavigating = false;
        
        console.log('🌐 Cross-Folder Navigation System started');
        console.log('📍 Current path:', this.currentPath);
        console.log('📁 Current folder:', this.currentFolder);
    }

    // Detect which folder we're currently in
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

    // Build correct cross-folder path
    buildCrossFolderPath(targetPath) {
        // If target path starts with '/', it's absolute
        if (targetPath.startsWith('/')) {
            return targetPath;
        }

        // If target path starts with 'http', it's external
        if (targetPath.startsWith('http')) {
            return targetPath;
        }

        const paths = [];
        
        // Current folder logic
        switch (this.currentFolder) {
            case 'root':
                // From root, paths are direct
                paths.push(targetPath);
                paths.push('./' + targetPath);
                break;
                
            case 'program':
                // From program folder
                if (targetPath.startsWith('program/')) {
                    // Same folder: program/calendar.html -> program/exhibition.html
                    const fileName = targetPath.replace('program/', '');
                    paths.push(fileName);              // exhibition.html
                    paths.push('./' + fileName);       // ./exhibition.html
                } else if (targetPath.startsWith('about/')) {
                    // To about folder: program/calendar.html -> about/mission.html
                    paths.push('../' + targetPath);    // ../about/mission.html
                } else if (targetPath.startsWith('supportus/')) {
                    // To supportus folder: program/calendar.html -> supportus/supportus.html
                    paths.push('../' + targetPath);    // ../supportus/supportus.html
                } else if (targetPath === 'index.html') {
                    // To root: program/calendar.html -> index.html
                    paths.push('../' + targetPath);    // ../index.html
                    paths.push('../index.html');
                } else {
                    // Other cases
                    paths.push('../' + targetPath);
                    paths.push(targetPath);
                }
                break;
                
            case 'about':
                // From about folder
                if (targetPath.startsWith('about/')) {
                    // Same folder: about/mission.html -> about/team.html
                    const fileName = targetPath.replace('about/', '');
                    paths.push(fileName);              // team.html
                    paths.push('./' + fileName);       // ./team.html
                } else if (targetPath.startsWith('program/')) {
                    // To program folder: about/mission.html -> program/calendar.html
                    paths.push('../' + targetPath);    // ../program/calendar.html
                } else if (targetPath.startsWith('supportus/')) {
                    // To supportus folder: about/mission.html -> supportus/supportus.html
                    paths.push('../' + targetPath);    // ../supportus/supportus.html
                } else if (targetPath === 'index.html') {
                    // To root: about/mission.html -> index.html
                    paths.push('../' + targetPath);    // ../index.html
                    paths.push('../index.html');
                } else {
                    // Other cases
                    paths.push('../' + targetPath);
                    paths.push(targetPath);
                }
                break;
                
            case 'supportus':
                // From supportus folder
                if (targetPath.startsWith('supportus/')) {
                    // Same folder: supportus/supportus.html -> supportus/other.html
                    const fileName = targetPath.replace('supportus/', '');
                    paths.push(fileName);              // other.html
                    paths.push('./' + fileName);       // ./other.html
                } else if (targetPath.startsWith('program/')) {
                    // To program folder: supportus/supportus.html -> program/calendar.html
                    paths.push('../' + targetPath);    // ../program/calendar.html
                } else if (targetPath.startsWith('about/')) {
                    // To about folder: supportus/supportus.html -> about/mission.html
                    paths.push('../' + targetPath);    // ../about/mission.html
                } else if (targetPath === 'index.html') {
                    // To root: supportus/supportus.html -> index.html
                    paths.push('../' + targetPath);    // ../index.html
                    paths.push('../index.html');
                } else {
                    // Other cases
                    paths.push('../' + targetPath);
                    paths.push(targetPath);
                }
                break;
        }

        // Add fallback paths
        paths.push(targetPath);                    // Original path
        paths.push('../../' + targetPath);        // Two levels up
        paths.push('/' + targetPath);             // Absolute path

        // Remove duplicates
        return [...new Set(paths)];
    }

    // Fast navigation with correct cross-folder paths
    async navigateTo(targetPath, event) {
        if (event) event.preventDefault();
        if (!targetPath || targetPath === '#' || this.isNavigating) return false;

        this.isNavigating = true;
        console.log(`🧭 Navigating from ${this.currentFolder} to: ${targetPath}`);

        try {
            // Check cache
            const cacheKey = `${this.currentPath}:${targetPath}`;
            if (this.pathCache.has(cacheKey)) {
                const cachedPath = this.pathCache.get(cacheKey);
                console.log(`📋 Using cached path: ${cachedPath}`);
                window.location.href = cachedPath;
                return false;
            }

            // Generate cross-folder paths
            const possiblePaths = this.buildCrossFolderPath(targetPath);
            console.log('🔍 Testing paths:', possiblePaths);

            // Test paths quickly
            const workingPath = await this.testPathsQuick(possiblePaths);
            
            if (workingPath) {
                this.pathCache.set(cacheKey, workingPath);
                console.log(`✅ Found working path: ${workingPath}`);
                window.location.href = workingPath;
            } else {
                console.log(`❌ No working path found for: ${targetPath}`);
                this.showQuickError(targetPath, possiblePaths);
            }

        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback: try the original path
            window.location.href = targetPath;
        } finally {
            this.isNavigating = false;
        }

        return false;
    }

    // Quick path testing
    async testPathsQuick(paths) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 200); // 200ms timeout

        try {
            for (const path of paths) {
                try {
                    console.log(`Testing: ${path}`);
                    const response = await fetch(path, { 
                        method: 'HEAD',
                        signal: controller.signal,
                        cache: 'no-cache' // Force fresh check
                    });
                    
                    if (response.ok) {
                        clearTimeout(timeoutId);
                        return path;
                    }
                } catch (error) {
                    if (error.name === 'AbortError') break;
                    continue;
                }
            }
        } catch (error) {
            console.log('Path testing aborted or failed');
        }

        clearTimeout(timeoutId);
        return null;
    }

    // Show error with path details
    showQuickError(targetPath, attemptedPaths) {
        const message = `
Navigation Failed!

Target: ${targetPath}
Current folder: ${this.currentFolder}
Current path: ${this.currentPath}

Attempted paths:
${attemptedPaths.slice(0, 5).map(p => `• ${p}`).join('\n')}

Check browser console for more details.
        `;
        alert(message);
    }

    // Go home with correct path
    goHome() {
        let homePath;
        switch (this.currentFolder) {
            case 'root':
                homePath = 'index.html';
                break;
            default:
                homePath = '../index.html';
                break;
        }
        
        console.log(`🏠 Going home via: ${homePath}`);
        window.location.href = homePath;
    }
}

// Create global instance
const crossNav = new CrossFolderNavigation();

// Load navigation immediately
function loadCrossFolderNavigation() {
    loadDefaultCrossNav();
    setupCrossNavEvents();
    setupCrossGlobalFunctions();
    console.log('⚡ Cross-folder navigation loaded');
}

// Default navigation with corrected paths
function loadDefaultCrossNav() {
    const navHTML = `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="crossNav.goHome()" style="cursor: pointer;">initial research</h1>
            </div>
            <nav class="nav-top">
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">program</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="program/calendar.html" onclick="return crossNav.navigateTo('program/calendar.html', event)">calendar</a>
                            <a href="program/fellowship.html" onclick="return crossNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                            <a href="program/communityhours.html" onclick="return crossNav.navigateTo('program/communityhours.html', event)">community hours</a>
                            <a href="program/seasonaldinner.html" onclick="return crossNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                            <a href="program/exhibition.html" onclick="return crossNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">about</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="about/mission.html" onclick="return crossNav.navigateTo('about/mission.html', event)">mission</a>
                            <a href="about/vision.html" onclick="return crossNav.navigateTo('about/vision.html', event)">vision</a>
                            <a href="about/team.html" onclick="return crossNav.navigateTo('about/team.html', event)">team</a>
                            <a href="about/contact.html" onclick="return crossNav.navigateTo('about/contact.html', event)">contact</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="supportus/supportus.html" onclick="return crossNav.navigateTo('supportus/supportus.html', event)">support us</a>
                </div>
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNavCross()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdownCross(event, this)">
                        program
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="program/calendar.html" onclick="return crossNav.navigateTo('program/calendar.html', event)">calendar</a>
                        <a href="program/fellowship.html" onclick="return crossNav.navigateTo('program/fellowship.html', event)">fellowship</a>
                        <a href="program/communityhours.html" onclick="return crossNav.navigateTo('program/communityhours.html', event)">community hours</a>
                        <a href="program/seasonaldinner.html" onclick="return crossNav.navigateTo('program/seasonaldinner.html', event)">seasonal dinner</a>
                        <a href="program/exhibition.html" onclick="return crossNav.navigateTo('program/exhibition.html', event)">exhibitions</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdownCross(event, this)">
                        about
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="about/mission.html" onclick="return crossNav.navigateTo('about/mission.html', event)">mission</a>
                        <a href="about/vision.html" onclick="return crossNav.navigateTo('about/vision.html', event)">vision</a>
                        <a href="about/team.html" onclick="return crossNav.navigateTo('about/team.html', event)">team</a>
                        <a href="about/contact.html" onclick="return crossNav.navigateTo('about/contact.html', event)">contact</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="supportus/supportus.html" onclick="return crossNav.navigateTo('supportus/supportus.html', event)">support us</a>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    
    // Add footer
    if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', '<footer>124 Gallery Street, New York, NY 10001</footer>');
    }
}

// Event setup
function setupCrossNavEvents() {
    // Use event delegation
    document.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item');
        if (navItem && navItem.querySelector('.dropdown-toggle') === e.target) {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item.active').forEach(item => {
                if (item !== navItem) item.classList.remove('active');
            });
            navItem.classList.toggle('active');
        }
        
        // Close dropdowns when clicking outside
        if (!e.target.closest('.nav-item') && !e.target.closest('.mobile-nav')) {
            document.querySelectorAll('.nav-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    // Hover for desktop
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
function setupCrossGlobalFunctions() {
    window.toggleMobileNavCross = function() {
        const mobileNav = document.getElementById('mobileNav');
        mobileNav.classList.toggle('show');
    };

    window.toggleMobileDropdownCross = function(e, element) {
        e.preventDefault();
        const navItem = element.parentElement;
        navItem.classList.toggle('active');
    };

    // Compatibility functions
    window.navigateToPage = (url, event) => crossNav.navigateTo(url, event);
    window.goToHomepage = () => crossNav.goHome();
    window.toggleMobileNav = window.toggleMobileNavCross;
    window.toggleMobileDropdown = window.toggleMobileDropdownCross;
}

// Initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCrossFolderNavigation);
} else {
    loadCrossFolderNavigation();
}

// Global access
window.crossNav = crossNav;

// Debug
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        console.log('Cross-Folder Nav Debug:', {
            currentPath: crossNav.currentPath,
            currentFolder: crossNav.currentFolder,
            cacheSize: crossNav.pathCache.size,
            cache: Object.fromEntries(crossNav.pathCache)
        });
    }
});