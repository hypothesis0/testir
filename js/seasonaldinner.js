// Homepage navigation function
function goToHomepage() {
    window.location.href = '../index.html';
}

// Load seasonal dinner data from JSON
async function loadSeasonalDinnerData() {
    try {
        console.log('Attempting to load seasonal dinner data');
        
        // Try multiple possible paths for the JSON file
        let response;
        let foundPath = '';
        
        // Try different possible paths
        const possiblePaths = [
            '/seasonaldinner-data.json',
            './seasonaldinner-data.json',
            '../seasonaldinner-data.json',
            'seasonaldinner-data.json',
            '/seasonal-dinner.json',
            './seasonal-dinner.json',
            '../seasonal-dinner.json',
            'seasonal-dinner.json'
        ];
        
        // Try each path until one works
        for (const path of possiblePaths) {
            try {
                console.log(`Trying path: ${path}`);
                const tempResponse = await fetch(path);
                if (tempResponse.ok) {
                    response = tempResponse;
                    foundPath = path;
                    console.log(`Found working path: ${path}`);
                    break;
                }
            } catch (err) {
                console.log(`Failed with path ${path}: ${err.message}`);
            }
        }
        
        // If we didn't find a working path
        if (!response || !response.ok) {
            throw new Error('Could not find seasonal dinner data file in any of the tried paths');
        }
        
        const data = await response.json();
        console.log('Successfully loaded seasonal dinner data:', data);
        
        // Render seasonal dinner content
        renderSeasonalDinner(data);
        
    } catch (error) {
        console.error('Error loading seasonal dinner data:', error);
        
        // Fallback content if loading fails
        document.getElementById('seasonal-dinner-content').innerHTML = `
            <div class="section">
                <h2>The Seasonal (shijie/时节) Dinner at Initial Research</h2>
                <p>
                    Join us for The Seasonal (shijie/时节) Dinner at Initial Research, a community gathering marking the beginning of each new season.
                </p>
            </div>`;
    }
}

// Render seasonal dinner content
function renderSeasonalDinner(data) {
    console.log("Rendering seasonal dinner with data:", data);
    
    // Get the container element
    const container = document.getElementById('seasonal-dinner-content');
    
    if (!container) {
        console.error("Container element 'seasonal-dinner-content' not found!");
        return;
    }
    
    // Build HTML content
    let html = '';
    
    // Add main section
    html += `
        <div class="section">
            <h2>${data.title || 'Seasonal Dinner'}</h2>`;
    
    // Split description into paragraphs
    const paragraphs = data.description ? data.description.split('\n\n') : [];
    
    paragraphs.forEach(paragraph => {
        // Process markdown bold format (**text**)
        const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html += `<p>${formattedParagraph}</p>`;
    });
    
    html += `</div>`;
    
    // Add additional sections (if any)
    if (data.additional_sections && data.additional_sections.length > 0) {
        data.additional_sections.forEach(section => {
            html += `
            <div class="section">
                <h2>${section.title || ''}</h2>`;
            
            // Split section.content into paragraphs
            const sectionParagraphs = section.content ? section.content.split('\n\n') : [];
            sectionParagraphs.forEach(paragraph => {
                // Process markdown bold format (**text**)
                const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p>${formattedParagraph}</p>`;
            });
            
            html += `</div>`;
        });
    }
    
    // Set the HTML content
    container.innerHTML = html;
}

// Mobile navigation functions
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show')) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        // Close all mobile dropdowns when closing nav
        const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    } else {
        mobileNav.style.display = 'flex';
        mobileNav.classList.add('show');
    }
}

// Mobile dropdown toggle
function toggleMobileDropdown(event, element) {
    event.preventDefault();
    const navItem = element.parentElement;
    
    // Check if this nav item has a dropdown
    const dropdown = navItem.querySelector('.mobile-dropdown');
    if (!dropdown) {
        // If no dropdown, it's a regular link - handle navigation here if needed
        return;
    }
    
    // Close all other mobile dropdowns
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    allMobileNavItems.forEach(item => {
        if (item !== navItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    navItem.classList.toggle('active');
}

// Auto-handle screen resize
window.addEventListener('resize', function() {
    const mobileNav = document.getElementById('mobileNav');
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    // If resizing to desktop width, close mobile nav
    if (window.innerWidth > 768) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add hamburger menu click event
    const hamburger = document.querySelector('.hamburger-menu');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileNav);
    }
    
    // Desktop dropdown toggle functionality
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdown = item.querySelector('.dropdown');
        
        if (dropdown) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other dropdowns
                navItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                item.classList.toggle('active');
            });
        } else {
            // Handle direct navigation for items without dropdowns
            link.addEventListener('click', function(e) {
                // Don't prevent default for direct navigation
                // The href will handle the navigation
                
                // Close all dropdowns when clicking on direct links
                navItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const isNavClick = e.target.closest('.nav-item');
        const isMobileNavClick = e.target.closest('.mobile-nav');
        const isHamburgerClick = e.target.closest('.hamburger-menu');
        
        if (!isNavClick && !isMobileNavClick && !isHamburgerClick) {
            navItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (mobileNav && hamburger && !hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            // Close all mobile dropdowns when clicking outside
            const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
            allMobileNavItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Load seasonal dinner data
    loadSeasonalDinnerData();
});