// content-loader.js - Fixed version for fellowship page

// Debugging helper
const DEBUG = true;
function log(message, obj = null) {
  if (DEBUG) {
    if (obj) {
      console.log(message, obj);
    } else {
      console.log(message);
    }
  }
}

// Helper function to deeply inspect objects
function inspectObject(obj, prefix = '') {
  if (!obj) {
    log(prefix + 'Object is null or undefined');
    return;
  }
  
  if (typeof obj !== 'object') {
    log(prefix + `Not an object, but ${typeof obj}: ${obj}`);
    return;
  }
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value === null) {
      log(prefix + `${key}: null`);
    } else if (typeof value === 'object') {
      log(prefix + `${key}: [Object]`);
      inspectObject(value, prefix + '  ');
    } else {
      log(prefix + `${key}: ${value}`);
    }
  });
}

// Path correction function - handles all potential path issues
function correctImagePath(path) {
  if (!path) return '';
  
  log("Original path:", path);
  
  // If path is an object with src property (from JSON structure)
  if (typeof path === 'object' && path.src) {
    path = path.src;
  }
  
  // Remove any double slashes
  let correctedPath = path.replace(/\/\//g, '/');
  
  // Ensure path starts with a slash
  if (!correctedPath.startsWith('/')) {
    correctedPath = '/' + correctedPath;
  }
  
  // Fix common path patterns
  correctedPath = correctedPath
    .replace('/img/uploads/', '/uploads/img/')
    .replace('/uploads/uploads/', '/uploads/');
  
  log("Corrected path:", correctedPath);
  return correctedPath;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  log("DOM loaded, fetching fellowship data...");
  
  // Fetch the JSON data
  fetch('/fellowship-data.json')
    .then(response => {
      log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      log("Fellowship data loaded successfully:", data);
      
      // Update page title if provided
      if (data.title) {
        log("Updating page title to:", data.title);
        document.title = data.title;
      }
      
      // Update main heading
      if (data.heading) {
        const headingElement = document.querySelector('.main-headline');
        if (headingElement) {
          log("Updating main heading to:", data.heading);
          headingElement.textContent = data.heading;
        } else {
          console.error("Main heading element not found! Selector: .main-headline");
        }
      }
      
      // Update introduction text - preserving HTML format
      if (data.intro) {
        const introElement = document.querySelector('.fellowship-intro');
        if (introElement) {
          log("Updating intro text with formatted content");
          
          // If intro already contains HTML tags, use it directly
          if (data.intro.includes('<p>') || data.intro.includes('<br>')) {
            introElement.innerHTML = data.intro;
          } else {
            // Otherwise convert markdown-style text to HTML
            introElement.innerHTML = `<p>${data.intro.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
          }
        } else {
          console.error("Intro element not found! Selector: .fellowship-intro");
        }
      }
      
      // Update cohort title
      if (data.cohort_title) {
        const cohortHeading = document.querySelector('.section-heading');
        if (cohortHeading) {
          log("Updating cohort title to:", data.cohort_title);
          cohortHeading.textContent = data.cohort_title;
        } else {
          console.error("Cohort heading element not found! Selector: .section-heading");
        }
      }
      
      // Update fellows list
      if (data.fellows && data.fellows.length > 0) {
        log("Found fellows data:", data.fellows.length, "fellows");
        const fellowsTable = document.querySelector('#cohort-2025 tbody');
        if (fellowsTable) {
          log("Found fellows table, clearing existing content");
          
          // Clear existing fellows
          fellowsTable.innerHTML = '';
          
          // Add each fellow
          data.fellows.forEach((fellow, index) => {
            log(`Processing fellow ${index+1}:`, fellow.name);
            
            // Skip empty fellows (sometimes CMS adds empty entries)
            if (!fellow.name || fellow.name === '1') {
              log("Skipping empty fellow entry");
              return;
            }
            
            // Prepare the fellow ID
            const fellowId = fellow.id || `fellow-${index+1}`;
            
            // Create image content section
            let imageContent = '';
            
            // Get image path from various possible fields in the JSON
            let imagePath = '';
            if (fellow.image) {
              imagePath = correctImagePath(fellow.image);
            } else if (fellow.single_image && fellow.single_image.src) {
              imagePath = correctImagePath(fellow.single_image.src);
            }
            
            let imageCaption = fellow.caption || 
                              (fellow.single_image ? fellow.single_image.caption : '') || 
                              '';
            
            // Check if this should be a carousel or single image
            const isCarousel = fellow.image_type === 'carousel' || 
                              (fellow.additional_images && fellow.additional_images.length > 0) ||
                              (fellow.carousel_images && fellow.carousel_images.length > 0);
            
            if (isCarousel) {
              log("Creating carousel for", fellow.name);
              
              // Create an array of all carousel images
              const allImages = [];
              
              // Add main image if it exists
              if (imagePath) {
                allImages.push({
                  src: imagePath,
                  caption: imageCaption
                });
              }
              
              // Add additional images from either field
              const additionalImages = fellow.additional_images || fellow.carousel_images || [];
              if (additionalImages.length > 0) {
                log("Found additional images:", additionalImages.length);
                
                additionalImages.forEach((img, idx) => {
                  if (img && (img.src || typeof img === 'string')) {
                    const src = typeof img === 'string' ? img : img.src;
                    const caption = img.caption || '';
                    
                    allImages.push({
                      src: correctImagePath(src),
                      caption: caption
                    });
                  }
                });
              }
              
              // Make sure we have at least one image
              if (allImages.length === 0) {
                log("No carousel images found, adding placeholder");
                allImages.push({
                  src: '/uploads/placeholder.jpg',
                  caption: 'Image not provided'
                });
              }
              
              // Create carousel slides and dots
              let carouselSlides = '';
              let carouselDots = '';
              
              allImages.forEach((image, idx) => {
                carouselSlides += `
                  <div class="carousel-slide ${idx === 0 ? 'active' : ''}">
                    <img 
                      src="${image.src}" 
                      alt="${fellow.name || ''} slide ${idx+1}" 
                      class="expanded-image"
                      onerror="this.onerror=null; this.src='/uploads/placeholder.jpg'; console.error('Failed to load carousel image:', '${image.src}')"
                    >
                    <div class="photo-credit">${image.caption || ''}</div>
                  </div>
                `;
                
                carouselDots += `
                  <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide('${fellowId}', ${idx})"></div>
                `;
              });
              
              // Only show dots if multiple images
              const dotsHtml = allImages.length > 1 ? `
                <div class="carousel-dots">
                  ${carouselDots}
                </div>
              ` : '';
              
              // Assemble complete carousel HTML
              imageContent = `
                <div class="image-carousel" data-carousel="${fellowId}">
                  <div class="carousel-container">
                    ${carouselSlides}
                  </div>
                  ${dotsHtml}
                </div>
              `;
            } else {
              // Single image
              log("Creating single image display for", fellow.name);
              imageContent = `
                <div class="single-image-container">
                  <img src="${imagePath}" alt="${fellow.name || ''}" class="expanded-image" onerror="this.onerror=null; this.src='/uploads/placeholder.jpg'; console.error('Failed to load image:', this.src);">
                  <div class="photo-credit">${imageCaption}</div>
                </div>
              `;
            }
            
            // Create fellow HTML with all the content
            const fellowHTML = `
              <tr class="fellow-row" data-fellow-id="${fellowId}">
                <td class="fellow-number">${fellow.number || (index + 1).toString().padStart(2, '0')}</td>
                <td class="fellow-name">${fellow.name || ''}</td>
              </tr>
              <tr class="expanded-row" id="${fellowId}-row">
                <td colspan="2" class="expanded-cell">
                  <div class="expanded-content" id="${fellowId}-content">
                    <div class="expanded-left">
                      <h3 class="expanded-title">${fellow.title || fellow.name || ''}</h3>
                      <div class="expanded-text">
                        ${fellow.bio || ''}
                      </div>
                    </div>
                    <div class="expanded-right">
                      ${imageContent}
                    </div>
                    <button class="close-btn">&times;</button>
                  </div>
                </td>
              </tr>
            `;
            
            // Add to table
            fellowsTable.innerHTML += fellowHTML;
            log(`Added fellow ${fellow.name} to table`);
          });
          
          // Initialize interactive features
          log("Setting up interactive features");
          setupExpandableRows();
          initCarousels();
        } else {
          console.error("Fellows table not found! Selector: #cohort-2025 tbody");
        }
      } else {
        console.error("No fellows data found in the JSON");
      }
    })
    .catch(error => {
      console.error('Error loading or processing fellowship data:', error);
      
      // Show error message on the page
      const fellowsTable = document.querySelector('#cohort-2025 tbody');
      if (fellowsTable) {
        fellowsTable.innerHTML += `
          <tr>
            <td colspan="2" style="text-align: center; padding: 20px; color: #f33;">
              <p>Error loading fellowship data. Please try refreshing the page.</p>
              <p>Technical details: ${error.message}</p>
            </td>
          </tr>
        `;
      }
    });
});

// ===== CAROUSEL FUNCTIONS =====

// Global variables for carousels
window.carousels = new Map();
window.carouselIntervals = new Map();

// Initialize all carousels
function initCarousels() {
  log("Initializing all carousels");
  const carouselElements = document.querySelectorAll('.image-carousel');
  carouselElements.forEach(carousel => {
    initSpecificCarousel(carousel);
  });
}

// Initialize a specific carousel
function initSpecificCarousel(carouselElement) {
  const carouselId = carouselElement.dataset.carousel;
  if (!carouselId) {
    log("Carousel missing data-carousel attribute");
    return;
  }
  
  log("Initializing carousel:", carouselId);
  
  const slides = carouselElement.querySelectorAll('.carousel-slide');
  if (slides.length <= 1) {
    log("Carousel has only one slide, skipping initialization");
    return; // Don't initialize for single images
  }
  
  // Store carousel state
  window.carousels.set(carouselId, {
    currentSlide: 0,
    totalSlides: slides.length,
    element: carouselElement
  });
  
  log("Carousel initialized with", slides.length, "slides");
  
  // Start auto-swipe
  startAutoSwipe(carouselId);
}

// Update carousel display
function updateCarousel(carouselId) {
  const carousel = window.carousels.get(carouselId);
  if (!carousel) return;
  
  const slides = carousel.element.querySelectorAll('.carousel-slide');
  const dots = carousel.element.querySelectorAll('.carousel-dot');
  
  // Update slides
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === carousel.currentSlide);
  });
  
  // Update dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === carousel.currentSlide);
  });
}

// Start auto-swipe for a carousel
function startAutoSwipe(carouselId) {
  const carousel = window.carousels.get(carouselId);
  if (!carousel || carousel.totalSlides <= 1) return;
  
  // Clear existing interval
  pauseAutoSwipe(carouselId);
  
  // Set new interval (change slide every 4 seconds)
  const interval = setInterval(() => {
    carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
    updateCarousel(carouselId);
  }, 4000);
  
  window.carouselIntervals.set(carouselId, interval);
}

// Pause auto-swipe for a carousel
function pauseAutoSwipe(carouselId) {
  const interval = window.carouselIntervals.get(carouselId);
  if (interval) {
    clearInterval(interval);
    window.carouselIntervals.delete(carouselId);
  }
}

// Pause all carousels
function pauseAllCarousels() {
  window.carouselIntervals.forEach((interval, carouselId) => {
    clearInterval(interval);
  });
  window.carouselIntervals.clear();
}

// Global function for carousel navigation (used by onclick handlers)
window.goToSlide = function(carouselId, slideIndex) {
  const carousel = window.carousels.get(carouselId);
  if (!carousel) return;
  
  carousel.currentSlide = slideIndex;
  updateCarousel(carouselId);
  
  // Restart auto-swipe after manual navigation
  pauseAutoSwipe(carouselId);
  startAutoSwipe(carouselId);
};

// ===== EXPANDABLE ROWS FUNCTIONS =====

// Setup expandable rows functionality
function setupExpandableRows() {
  log("Setting up expandable rows");
  const fellowRows = document.querySelectorAll('.fellow-row');
  let activeExpansion = null;
  
  fellowRows.forEach((row) => {
    row.addEventListener('click', function(event) {
      // Don't expand if clicking on carousel dots or images
      if (event.target.closest('.carousel-dot') || event.target.closest('.image-carousel')) {
        return;
      }
      
      const fellowId = this.getAttribute('data-fellow-id');
      if (!fellowId) return;
      
      log('Clicking fellow row:', fellowId);
      
      // Find the expanded row and content
      const expandedRow = document.getElementById(`${fellowId}-row`);
      const expandedContent = document.getElementById(`${fellowId}-content`);
      
      if (!expandedRow || !expandedContent) {
        console.error('Could not find expanded elements for:', fellowId);
        return;
      }
      
      // Check if this row is already active
      const isActive = this.classList.contains('active');
      log('Is currently active:', isActive);
      
      // Remove active class from all fellow rows
      document.querySelectorAll('.fellow-row.active').forEach(row => {
        row.classList.remove('active');
      });
      
      // Close all expanded contents
      document.querySelectorAll('.expanded-row.active').forEach(row => {
        row.classList.remove('active');
        const content = row.querySelector('.expanded-content');
        if (content) content.classList.remove('active');
      });
      
      // Pause all carousels
      pauseAllCarousels();
      
      // If this row wasn't active before, open it
      if (!isActive) {
        // Add active class to the clicked row
        this.classList.add('active');
        
        // Show the expanded content row
        expandedRow.classList.add('active');
        expandedContent.classList.add('active');
        
        // Update active expansion
        activeExpansion = fellowId;
        
        // Initialize carousels for the newly opened fellow and scroll
        setTimeout(() => {
          // Re-initialize carousels for the newly expanded content
          const newCarousels = expandedContent.querySelectorAll('.image-carousel');
          newCarousels.forEach(carousel => {
            initSpecificCarousel(carousel);
          });
          
          // Scroll to expanded content
          scrollToExpandedContent(expandedRow);
        }, 100);
      } else {
        // This row was active, so we closed it
        activeExpansion = null;
      }
      
      // Prevent the event from propagating to document click handler
      event.stopPropagation();
    });
  });
  
  // Handle close button clicks
  const closeButtons = document.querySelectorAll('.close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      const expandedContent = this.closest('.expanded-content');
      if (!expandedContent) return;
      
      // Find the fellow row
      const fellowId = expandedContent.id.replace('-content', '');
      const fellowRow = document.querySelector(`.fellow-row[data-fellow-id="${fellowId}"]`);
      
      if (fellowRow) {
        fellowRow.classList.remove('active');
      }
      
      // Close the expanded content
      expandedContent.classList.remove('active');
      const expandedRow = expandedContent.closest('.expanded-row');
      if (expandedRow) {
        expandedRow.classList.remove('active');
      }
      
      // Reset active expansion
      activeExpansion = null;
      
      // Pause all carousels
      pauseAllCarousels();
      
      // Prevent the event from propagating
      event.stopPropagation();
    });
  });
  
  // Document click handler to close expanded content when clicking outside
  document.addEventListener('click', function(event) {
    // Check if the click was outside both fellow rows and expanded content
    const targetRow = event.target.closest('.fellow-row');
    const targetExpandedContent = event.target.closest('.expanded-content');
    const closeButton = event.target.closest('.close-btn');
    
    if (!targetRow && !targetExpandedContent && !closeButton) {
      // Reset all fellow rows
      document.querySelectorAll('.fellow-row.active').forEach(row => {
        row.classList.remove('active');
      });
      
      // Close all expanded contents
      document.querySelectorAll('.expanded-row.active').forEach(row => {
        row.classList.remove('active');
        const content = row.querySelector('.expanded-content');
        if (content) content.classList.remove('active');
      });
      
      // Reset active expansion and pause carousels
      activeExpansion = null;
      pauseAllCarousels();
    }
  });
  
  // Keyboard handler for Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      // Reset all fellow rows
      document.querySelectorAll('.fellow-row.active').forEach(row => {
        row.classList.remove('active');
      });
      
      // Close all expanded contents
      document.querySelectorAll('.expanded-row.active').forEach(row => {
        row.classList.remove('active');
        const content = row.querySelector('.expanded-content');
        if (content) content.classList.remove('active');
      });
      
      // Reset active expansion and pause carousels
      activeExpansion = null;
      pauseAllCarousels();
    }
  });
}

// Scroll to expanded content
function scrollToExpandedContent(expandedRow) {
  if (!expandedRow.classList.contains('active')) return;
  
  // Calculate position to scroll to (slightly above the expanded row)
  const rect = expandedRow.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetY = rect.top + scrollTop - 100; // 100px offset from top
  
  // Smooth scroll to the target position
  window.scrollTo({
    top: targetY,
    behavior: 'smooth'
  });
}

// ==== NAVIGATION FUNCTIONS ====

// Initialize navigation event listeners
function initNavigationEvents() {
  log("Initializing navigation event listeners");
  
  // Desktop navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function(event) {
      // Find the link
      const link = this.querySelector('a');
      if (link && link.getAttribute('href') !== '#') {
        // If this is a real link (not dropdown toggle), don't prevent default
        return;
      }
      
      // Toggle active state for dropdown
      event.preventDefault();
      
      // Close all other dropdowns
      navItems.forEach(navItem => {
        if (navItem !== this) {
          navItem.classList.remove('active');
        }
      });
      
      // Toggle current dropdown
      this.classList.toggle('active');
    });
  });
}

// Make sure we have this global function defined
window.toggleMobileNav = function() {
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
};

// And this one
window.toggleMobileDropdown = function(event, element) {
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
};

// Initialize navigation on load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initNavigationEvents();
} else {
  document.addEventListener('DOMContentLoaded', initNavigationEvents);
}

// Handle window resize for responsive adjustments
window.addEventListener('resize', function() {
  const mobileNav = document.getElementById('mobileNav');
  if (!mobileNav) return;
  
  // Close mobile nav on desktop width
  if (window.innerWidth > 768) {
    mobileNav.style.display = 'none';
    mobileNav.classList.remove('show');
    
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    allMobileNavItems.forEach(item => {
      item.classList.remove('active');
    });
  }
});