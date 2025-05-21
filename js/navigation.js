// navigation.js - Complete version for your project

// Main navigation loader
async function loadNavigation() {
    try {
        // Try to load navigation from CMS-generated files
        const response = await fetch('../navigation/navigation-data.json');
        const navData = await response.json();
        
        // Generate and insert navigation HTML
        document.body.insertAdjacentHTML('afterbegin', generateNavigationHTML(navData));
        
        // Insert the footer
        insertFooter();
        
        // Set up navigation event listeners
        setupNavigationEvents();
        
    } catch (error) {
        console.error('Error loading CMS navigation, falling back to default:', error);
        loadDefaultNavigation();
    }
}

// Generate HTML from CMS data
function generateNavigationHTML(navData) {
    // Generate desktop and mobile nav items
    let desktopNavItems = '';
    let mobileNavItems = '';
    
    (navData.nav_items || []).forEach((item, index) => {
        if (item.visible === false) return;
        
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
                if (dropItem.visible === false) return;
                
                dropdownLinks += `
                    <a href="${dropItem.link}">${dropItem.label}</a>
                `;
                
                mobileDropdownLinks += `
                    <a href="${dropItem.link}">${dropItem.label}</a>
                `;
            });
            
            if (dropdownLinks) {
                desktopNavItems += `
                    <div class="nav-item">
                        <a href="#">${item.label}</a>
                        <div class="dropdown">
                            <div class="dropdown-container">
                                ${dropdownLinks}
                            </div>
                        </div>
                    </div>
                `;
                
                mobileNavItems += `
                    <div class="mobile-nav-item">
                        <a href="#" onclick="toggleMobileDropdown(event, this)">
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
                <h1 onclick="goToHomepage()" style="cursor: pointer;">initial research</h1>
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

// Insert footer (unchanged from your original)
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
                    <a href="supportus.html">support us</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', defaultNav);
    setupNavigationEvents();
}

// Navigation event setup (unchanged from your original)
function setupNavigationEvents() {
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
            const toggle = item.querySelector('a:first-child');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        document.querySelectorAll('.nav-item').forEach(i => {
                            if (i !== item) i.classList.remove('active');
                        });
                        item.classList.toggle('active');
                        e.stopPropagation();
                    }
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
}

// Mobile navigation functions (unchanged from your original)
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

// Homepage navigation
window.goToHomepage = function() {
    window.location.href = '../index.html';
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadNavigation);
