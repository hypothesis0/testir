// content-loader.js - Fixed version with improved path handling

// Add debug logging
console.log("Content loader script starting...");

// Enhanced path correction function - handles all possible path scenarios
function correctImagePath(path) {
  if (!path) return '';
  
  console.log("Original path:", path);
  
  // Remove any URL parameters that might cause issues
  let correctedPath = path.split('?')[0];
  
  // Path correction strategy:
  
  // 1. Handle relative paths from CMS (img/uploads/)
  if (correctedPath.includes('img/uploads/')) {
    // Keep as is, this matches the CMS configuration
  }
  
  // 2. Ensure paths have leading slash if they don't start with http or /
  if (!correctedPath.startsWith('/') && !correctedPath.startsWith('http')) {
    correctedPath = '/' + correctedPath;
  }
  
  // 3. Fix double slashes anywhere in the path
  while (correctedPath.includes('//')) {
    correctedPath = correctedPath.replace('//', '/');
  }
  
  // 4. Special case for the CMS pattern - ensure uploads folders are properly formatted
  // This addresses the path structure defined in config.yml
  if (correctedPath.includes('/uploads/') && !correctedPath.includes('/img/uploads/')) {
    correctedPath = correctedPath.replace('/uploads/', '/img/uploads/');
  }
  
  console.log("Corrected to:", correctedPath);
  
  // Final safety check - validate image path format
  if (!correctedPath.startsWith('/') && !correctedPath.startsWith('http')) {
    console.warn("Path may still be incorrect:", correctedPath);
  }
  
  return correctedPath;
}

// Function to check if an image exists (for debugging)
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log("✅ Image loaded successfully:", url);
      resolve(true);
    };
    img.onerror = () => {
      console.error("❌ Image failed to load:", url);
      resolve(false);
    };
    img.src = url;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, fetching data...");
  
  // Fetch the JSON data
  fetch('/fellowship-data.json')
    .then(response => {
      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data loaded successfully:", data);
      
      // Update page title
      if (data.title) {
        console.log("Updating page title to:", data.title);
        document.title = data.title;
      }
      
      // Update main heading
      if (data.heading) {
        const headingElement = document.querySelector('.main-headline');
        if (headingElement) {
          console.log("Updating main heading to:", data.heading);
          headingElement.textContent = data.heading;
        } else {
          console.error("Main heading element not found! Selector: .main-headline");
        }
      }
      
      // Update intro text
      if (data.intro) {
        const introElement = document.querySelector('.fellowship-intro p');
        if (introElement) {
          console.log("Updating intro text");
          introElement.textContent = data.intro;
        } else {
          console.error("Intro element not found! Selector: .fellowship-intro p");
        }
      }
      
      // Update cohort title
      if (data.cohort_title) {
        const cohortHeading = document.querySelector('.section-heading');
        if (cohortHeading) {
          console.log("Updating cohort title to:", data.cohort_title);
          cohortHeading.textContent = data.cohort_title;
        } else {
          console.error("Cohort heading element not found! Selector: .section-heading");
        }
      }
      
      // Update fellow list
      if (data.fellows && data.fellows.length > 0) {
        console.log("Found fellows data:", data.fellows.length, "fellows");
        const fellowsTable = document.querySelector('#cohort-2025 tbody');
        if (fellowsTable) {
          console.log("Found fellows table, clearing existing content");
          // Clear existing fellows
          fellowsTable.innerHTML = '';
          
          // Add each fellow
          data.fellows.forEach((fellow, index) => {
            console.log(`Processing fellow ${index+1}:`, fellow.name);
            
            // Create image content
            let imageContent = '';
            
            // Get and correct image path
            let imagePath = correctImagePath(fellow.image);
            
            // Debug image path
            if (imagePath) {
              checkImageExists(imagePath).then(exists => {
                if (!exists) {
                  console.warn(`Image for ${fellow.name} may need path correction: ${imagePath}`);
                }
              });
            }
            
            if (imagePath) {
              // Check image type
              if (fellow.image_type === 'carousel') {
                console.log("Creating carousel for", fellow.name);
                // Create carousel
                let carouselSlides = '';
                let carouselDots = '';
                
                // Create array of all carousel images
                const allImages = [
                  {src: imagePath, caption: fellow.caption || ''}
                ];
                
                // Add additional carousel images (if any)
                if (fellow.additional_images && fellow.additional_images.length > 0) {
                  console.log("Adding additional images:", fellow.additional_images.length);
                  fellow.additional_images.forEach((img, imgIndex) => {
                    if (img && img.src) {
                      // Correct additional image path
                      let extraImagePath = correctImagePath(img.src);
                      
                      // Debug additional image path
                      checkImageExists(extraImagePath).then(exists => {
                        if (!exists) {
                          console.warn(`Additional image ${imgIndex+1} for ${fellow.name} may need path correction: ${extraImagePath}`);
                        }
                      });
                      
                      allImages.push({
                        src: extraImagePath,
                        caption: img.caption || ''
                      });
                    }
                  });
                }
                
                // Create a carousel slide for each image
                allImages.forEach((image, idx) => {
                  console.log(`Creating slide ${idx+1} with image:`, image.src);
                  carouselSlides += `
                    <div class="carousel-slide ${idx === 0 ? 'active' : ''}">
                      <img src="${image.src}" alt="${fellow.name || ''}" class="expanded-image" 
                           onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/api/placeholder/500/400';">
                      <div class="photo-credit">${image.caption || ''}</div>
                    </div>
                  `;
                  
                  carouselDots += `
                    <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide('${fellow.id || `fellow-${index}`}', ${idx})"></div>
                  `;
                });
                
                // Assemble complete carousel HTML
                imageContent = `
                  <div class="image-carousel" data-carousel="${fellow.id || `fellow-${index}`}">
                    <div class="carousel-container">
                      ${carouselSlides}
                    </div>
                    <div class="carousel-dots">
                      ${carouselDots}
                    </div>
                  </div>
                `;
              } else {
                // Single image
                console.log("Creating single image display for", fellow.name);
                imageContent = `
                  <div class="single-image-container">
                    <img src="${imagePath}" alt="${fellow.name || ''}" class="expanded-image" 
                         onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/api/placeholder/500/400';">
                    <div class="photo-credit">${fellow.caption || ''}</div>
                  </div>
                `;
              }
            } else {
              // No image
              console.log("No image for", fellow.name);
              imageContent = `
                <div class="single-image-container">
                  <div style="text-align: center; padding: 40px; background: #f5f5f5; color: #888;">
                    <p>Image not provided</p>
                  </div>
                </div>
              `;
            }
            
            // Create fellow HTML
            const fellowHTML = `
              <tr class="fellow-row" data-fellow-id="${fellow.id || `fellow-${index}`}">
                <td class="fellow-number">${fellow.number || ''}</td>
                <td class="fellow-name">${fellow.name || ''}</td>
              </tr>
              <tr class="expanded-row" id="${fellow.id || `fellow-${index}`}-row">
                <td colspan="2" class="expanded-cell">
                  <div class="expanded-content" id="${fellow.id || `fellow-${index}`}-content">
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
            console.log(`Added fellow ${fellow.name} to table`);
          });
          
          // Re-initialize interactive features
          console.log("Setting up interactive features");
          setupExpandableRows();
          
          // Initialize carousels
          if (typeof initCarousels === 'function') {
            console.log("Initializing carousels");
            initCarousels();
          } else {
            console.log("Creating initCarousels function");
            window.initCarousels = function() {
              const carouselElements = document.querySelectorAll('.image-carousel');
              console.log(`Found ${carouselElements.length} carousels to initialize`);
              carouselElements.forEach(carousel => {
                const carouselId = carousel.dataset.carousel;
                if (!carouselId) return;
                
                console.log(`Initializing carousel: ${carouselId}`);
                
                // Create window carousel object if needed
                if (!window.carousels) {
                  window.carousels = new Map();
                  window.carouselIntervals = new Map();
                }
                
                const slides = carousel.querySelectorAll('.carousel-slide');
                if (slides.length <= 1) return;
                
                window.carousels.set(carouselId, {
                  currentSlide: 0,
                  totalSlides: slides.length,
                  element: carousel
                });
                
                // Start auto rotation
                if (typeof window.startAutoSwipe === 'function') {
                  window.startAutoSwipe(carouselId);
                }
              });
            };
            window.initCarousels();
          }
        } else {
          console.error("Fellows table not found! Selector: #cohort-2025 tbody");
        }
      } else {
        console.warn("No fellows data found in the JSON");
      }
    })
    .catch(error => {
      console.error('Error loading or processing content data:', error);
    });
  
  // Implement setupExpandableRows function if not already in page
  window.setupExpandableRows = function() {
    console.log("Setting up expandable rows");
    const fellowRows = document.querySelectorAll('.fellow-row');
    let activeExpansion = null;
    
    fellowRows.forEach((row) => {
      row.addEventListener('click', function(event) {
        // Don't expand when clicking carousel dots or images
        if (event.target.closest('.carousel-dot') || event.target.closest('.image-carousel')) {
          return;
        }
        
        const fellowId = this.getAttribute('data-fellow-id');
        if (!fellowId) return;
        
        console.log('Clicking fellow row:', fellowId);
        
        // Find expanded row and content
        const expandedRow = document.getElementById(`${fellowId}-row`);
        const expandedContent = document.getElementById(`${fellowId}-content`);
        
        if (!expandedRow || !expandedContent) {
          console.error('Could not find expanded elements for:', fellowId);
          return;
        }
        
        // Check if this row is already active
        const isActive = this.classList.contains('active');
        console.log('Is currently active:', isActive);
        
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
        if (typeof window.pauseAllCarousels === 'function') {
          window.pauseAllCarousels();
        }
        
        // If this row wasn't active before, open it
        if (!isActive) {
          // Add active class to clicked row
          this.classList.add('active');
          
          // Show expanded content row
          expandedRow.classList.add('active');
          expandedContent.classList.add('active');
          
          // Update active expansion
          activeExpansion = fellowId;
          
          // Initialize carousels for newly opened fellow and scroll
          setTimeout(() => {
            // Re-initialize carousels
            const newCarousels = expandedContent.querySelectorAll('.image-carousel');
            if (typeof window.initSpecificCarousel === 'function') {
              newCarousels.forEach(carousel => {
                window.initSpecificCarousel(carousel);
              });
            }
            
            // Scroll to expanded content
            const rect = expandedRow.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - 100; // 100px top offset
            
            window.scrollTo({
              top: targetY,
              behavior: 'smooth'
            });
          }, 100);
        } else {
          // This row was active, so we closed it
          activeExpansion = null;
        }
        
        // Prevent event from propagating to document click handler
        event.stopPropagation();
      });
    });
    
    // Handle close button clicks
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        const expandedContent = this.closest('.expanded-content');
        if (!expandedContent) return;
        
        // Find fellow row
        const fellowId = expandedContent.id.replace('-content', '');
        const fellowRow = document.querySelector(`.fellow-row[data-fellow-id="${fellowId}"]`);
        
        if (fellowRow) {
          fellowRow.classList.remove('active');
        }
        
        // Close expanded content
        expandedContent.classList.remove('active');
        const expandedRow = expandedContent.closest('.expanded-row');
        if (expandedRow) {
          expandedRow.classList.remove('active');
        }
        
        // Reset active expansion
        activeExpansion = null;
        
        // Pause all carousels
        if (typeof window.pauseAllCarousels === 'function') {
          window.pauseAllCarousels();
        }
        
        // Prevent event propagation
        event.stopPropagation();
      });
    });
    
    // Close expanded content when clicking outside
    document.addEventListener('click', function(event) {
      // Check if click was outside both a fellow row and expanded content
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
        
        // Reset active expansion
        activeExpansion = null;
        
        // Pause all carousels
        if (typeof window.pauseAllCarousels === 'function') {
          window.pauseAllCarousels();
        }
      }
    });
    
    // Add keyboard navigation (Escape key to close expanded content)
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
        
        // Reset active expansion
        activeExpansion = null;
        
        // Pause all carousels
        if (typeof window.pauseAllCarousels === 'function') {
          window.pauseAllCarousels();
        }
      }
    });
  };
  
  // Define carousel functions if not already defined
  if (typeof window.goToSlide !== 'function') {
    window.goToSlide = function(carouselId, slideIndex) {
      console.log(`Navigating to slide ${slideIndex} in carousel ${carouselId}`);
      const carousel = document.querySelector(`.image-carousel[data-carousel="${carouselId}"]`);
      if (!carousel) {
        console.error(`Carousel not found: ${carouselId}`);
        return;
      }
      
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      if (slideIndex >= 0 && slideIndex < slides.length) {
        // Update slides
        slides.forEach((slide, idx) => {
          slide.classList.toggle('active', idx === slideIndex);
        });
        
        // Update dots
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === slideIndex);
        });
        
        // Update carousel state if using Map
        if (window.carousels && window.carousels.get(carouselId)) {
          window.carousels.get(carouselId).currentSlide = slideIndex;
        }
      }
    };
  }
  
  // Implement carousel functions if not defined
  if (typeof window.initSpecificCarousel !== 'function') {
    window.initSpecificCarousel = function(carousel) {
      const carouselId = carousel.dataset.carousel;
      if (!carouselId) return;
      
      console.log(`Initializing specific carousel: ${carouselId}`);
      
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      if (slides.length <= 1) return; // Don't initialize for single images
      
      // Initialize carousel state
      if (!window.carousels) window.carousels = new Map();
      if (!window.carouselIntervals) window.carouselIntervals = new Map();
      
      window.carousels.set(carouselId, {
        currentSlide: 0,
        totalSlides: slides.length,
        element: carousel
      });
      
      // Start auto-swipe
      window.startAutoSwipe(carouselId);
    };
  }
  
  if (typeof window.startAutoSwipe !== 'function') {
    window.startAutoSwipe = function(carouselId) {
      if (!window.carousels || !window.carouselIntervals) {
        window.carousels = new Map();
        window.carouselIntervals = new Map();
      }
      
      const carousel = window.carousels.get(carouselId);
      if (!carousel || carousel.totalSlides <= 1) return;
      
      // Clear existing interval
      window.pauseAutoSwipe(carouselId);
      
      // Set new interval (change slide every 4 seconds)
      const interval = setInterval(() => {
        carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
        window.goToSlide(carouselId, carousel.currentSlide);
      }, 4000);
      
      window.carouselIntervals.set(carouselId, interval);
    };
  }
  
  if (typeof window.pauseAutoSwipe !== 'function') {
    window.pauseAutoSwipe = function(carouselId) {
      if (!window.carouselIntervals) return;
      
      const interval = window.carouselIntervals.get(carouselId);
      if (interval) {
        clearInterval(interval);
        window.carouselIntervals.delete(carouselId);
      }
    };
  }
  
  if (typeof window.pauseAllCarousels !== 'function') {
    window.pauseAllCarousels = function() {
      if (!window.carouselIntervals) return;
      
      window.carouselIntervals.forEach((interval, carouselId) => {
        clearInterval(interval);
      });
      window.carouselIntervals.clear();
    };
  }
});
