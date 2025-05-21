// navigation.js - Full version with CMS integration

// Main navigation loader
async function loadNavigation() {
    try {
        console.log('Attempting to load navigation from:', '/navigation-data.json');
        const response = await fetch('/navigation-data.json');
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch navigation data: ${response.status} ${response.statusText}`);
        }
        
        const navData = await response.json();
        console.log('Successfully loaded navigation data:', navData);
        
        // Generate and insert navigation HTML
        document.body.insertAdjacentHTML('afterbegin', generateNavigationHTML(navData));
        
        // Insert footer
        insertFooter();
        
        // Setup event listeners
        setupNavigationEvents();
        
    } catch (error) {
        console.error('Error during navigation loading:', error.message);
        console.log('Falling back to default navigation');
        loadDefaultNavigation();
    }
}

// Generate HTML from CMS data
function generateNavigationHTML(navData) {
    // Generate desktop and mobile nav items
    let desktopNavItems = '';
    let mobileNavItems = '';
    
    (navData.nav_items || []).forEach((item, index) => {
        if (!item.visible) return;
        
        const itemId = `nav-item-${index}`;
        
        if (item.direct_link) {
            // Simple link item (no dropdown)
            desktopNavItems += `
                <div class="nav-item">
                    <a href="${item.direct_link}">${item.label}</a>
                </div>
            `;
            
            mobileNavItems += `
                <div class="mobile-nav-item">
                    <a href="${item.direct_link}">${item.label}</a>
                </div>
            `;
        } else if (item.dropdown_items && item.dropdown_items.length > 0) {
            // Dropdown menu item
            let dropdownLinks = '';
            let mobileDropdownLinks = '';
            
            item.dropdown_items.forEach((dropItem, dropIndex) => {
                if (!dropItem.visible) return;
                
                dropdownLinks += `
                    <a href="${dropItem.link}" class="dropdown-link" 
                       data-item-id="${itemId}-${dropIndex}">
                        ${dropItem.label}
                    </a>
                `;
                
                mobileDropdownLinks += `
                    <a href="${dropItem.link}" class="mobile-dropdown-link"
                       data-item-id="${itemId}-${dropIndex}">
                        ${dropItem.label}
                    </a>
                `;
            });
            
            if (dropdownLinks) {
                desktopNavItems += `
                    <div class="nav-item" data-item-id="${itemId}">
                        <a href="#" class="dropdown-toggle">${item.label}</a>
                        <div class="dropdown">
                            <div class="dropdown-container">
                                ${dropdownLinks}
                            </div>
                        </div>
                    </div>
                `;
                
                mobileNavItems += `
                    <div class="mobile-nav-item" data-item-id="${itemId}">
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
    
    return `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="goToHomepage()" style="cursor: pointer;">${navData.site_title || 'initial research'}</h1>
            </div>
            <nav class="nav-top">
                ${desktopNavItems}
            </nav>
            
            <!-- Hamburger menu for mobile -->
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <!-- Mobile navigation menu -->
            <div class="mobile-nav" id="mobileNav">
                ${mobileNavItems}
            </div>
        </div>
    `;
}

// Insert footer (unchanged from original)
function insertFooter() {
    const footer = `
        <footer style="
            margin-top: auto;
            width: 100%;
            background-color: rgb(180, 180, 180);
            padding: 10px 0;
            text-align: center;
            font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
            font-size: 16px;
            font-weight: 300;
            color: rgb(23, 23, 23);
            z-index: 1;
        ">
            124 Gallery Street, New York, NY 10001
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footer);
}

// Fallback to default navigation if CMS fails
function loadDefaultNavigation() {
    const defaultNav = `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="goToHomepage()" style="cursor: pointer;">initial research</h1>
            </div>
            <nav class="nav-top">
                <div class="nav-item">
                    <a href="#">program</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="calendar.html">calendar</a>
                            <a href="fellowship.html">fellowship</a>
                            <a href="communityhours.html">community hours</a>
                            <a href="seasonaldinner.html">seasonal dinner</a>
                            <a href="exhibition.html">exhibitions</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="#">about</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="../about/mission.html">mission</a>
                            <a href="../about/vision.html">vision</a>
                            <a href="../about/team.html">team</a>
                            <a href="../about/contact.html">contact</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="supportus.html">support us</a>
                </div>
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                <div class="mobile-nav-item">
                    <a href="#" onclick="toggleMobileDropdown(event, this)">
                        program
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="calendar.html">calendar</a>
                        <a href="fellowship.html">fellowship</a>
                        <a href="communityhours.html">community hours</a>
                        <a href="seasonaldinner.html">seasonal dinner</a>
                        <a href="exhibition.html">exhibitions</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="#" onclick="toggleMobileDropdown(event, this)">
                        about
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="../about/mission.html">mission</a>
                        <a href="../about/vision.html">vision</a>
                        <a href="../about/team.html">team</a>
                        <a href="../about/contact.html">contact</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="../supportus/supportus.html">support us</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', defaultNav);
    setupNavigationEvents();
}

// Navigation event setup
function setupNavigationEvents() {
    // Desktop dropdown functionality
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            // Desktop hover behavior
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
            
            // Click behavior for both desktop and mobile
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
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && 
            !e.target.closest('.mobile-nav') && 
            !e.target.closest('.hamburger-menu')) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Mobile navigation toggle
    window.toggleMobileNav = function() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show')) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        } else {
            mobileNav.style.display = 'flex';
            mobileNav.classList.add('show');
        }
    };
    
    // Mobile dropdown toggle
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
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        const mobileNav = document.getElementById('mobileNav');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (!hamburger?.contains(e.target) && !mobileNav?.contains(e.target)) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const mobileNav = document.getElementById('mobileNav');
        if (window.innerWidth > 768) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// Homepage navigation
window.goToHomepage = function() {
    window.location.href = '../index.html';
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadNavigation);
