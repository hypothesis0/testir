// content-loader.js - Enhanced version with improved debugging and carousel fixes

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

// Enhanced function to check if an image exists (for debugging)
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

// New function to check entire carousel structure
function validateCarouselData(fellow) {
  console.log(`Validating carousel data for ${fellow.name || 'unnamed fellow'}`);
  
  const issues = [];
  
  // Check image type
  if (!fellow.image_type) {
    issues.push("Missing image_type property");
  } else if (fellow.image_type !== 'carousel') {
    issues.push(`Image type is "${fellow.image_type}" instead of "carousel"`);
  }
  
  // Check main image
  if (!fellow.image) {
    issues.push("Missing main image path");
  }
  
  // Check additional images
  if (!fellow.additional_images) {
    issues.push("Missing additional_images array");
  } else if (!Array.isArray(fellow.additional_images)) {
    issues.push("additional_images is not an array");
  } else if (fellow.additional_images.length === 0) {
    issues.push("additional_images array is empty");
  } else {
    // Validate each additional image
    fellow.additional_images.forEach((img, idx) => {
      if (!img) {
        issues.push(`Additional image #${idx+1} is null or undefined`);
      } else if (!img.src) {
        issues.push(`Additional image #${idx+1} is missing src property`);
      }
    });
  }
  
  if (issues.length > 0) {
    console.warn(`⚠️ Carousel validation issues for ${fellow.name || 'unnamed fellow'}:`, issues);
    return false;
  }
  
  console.log(`✅ Carousel data for ${fellow.name || 'unnamed fellow'} is valid`);
  return true;
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
                console.log(`Fellow ${fellow.name} has image_type: carousel`);
                
                // Validate carousel data structure first
                if (validateCarouselData(fellow)) {
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
                      } else {
                        console.warn(`Skipping invalid additional image ${imgIndex+1} for ${fellow.name}`);
                      }
                    });
                  }
                  
                  console.log(`Total images for ${fellow.name}'s carousel:`, allImages.length);
                  
                  // Create a carousel slide for each image
                  allImages.forEach((image, idx) => {
                    console.log(`Creating slide ${idx+1} with image:`, image.src);
                    carouselSlides += `
                      <div class="carousel-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
                        <img src="${image.src}" alt="${fellow.name || ''}" class="expanded-image" 
                             onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/api/placeholder/500/400';">
                        <div class="photo-credit">${image.caption || ''}</div>
                      </div>
                    `;
                    
                    carouselDots += `
                      <div class="carousel-dot ${idx === 0 ? 'active' : ''}" 
                           onclick="goToSlide('${fellow.id || `fellow-${index}`}', ${idx})"
                           data-slide-index="${idx}"></div>
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
                      <div class="carousel-controls">
                        <button class="carousel-prev" onclick="prevSlide('${fellow.id || `fellow-${index}`}')">Previous</button>
                        <button class="carousel-next" onclick="nextSlide('${fellow.id || `fellow-${index}`}')">Next</button>
                      </div>
                    </div>
                  `;
                } else {
                  console.warn(`Carousel data for ${fellow.name} is invalid, falling back to single image display`);
                  // Fall back to single image for invalid carousel data
                  imageContent = `
                    <div class="single-image-container">
                      <img src="${imagePath}" alt="${fellow.name || ''}" class="expanded-image" 
                           onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='/api/placeholder/500/400';">
                      <div class="photo-credit">${fellow.caption || ''}</div>
                      <div class="debug-info" style="color: red; font-size: 0.8em;">
                        Invalid carousel data - check console log
                      </div>
                    </div>
                  `;
                }
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
          console.log("Initializing carousels");
          initCarousels();
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
  
  // Implement setupExpandableRows function with improved logging
  window.setupExpandableRows = function() {
    console.log("Setting up expandable rows");
    const fellowRows = document.querySelectorAll('.fellow-row');
    console.log(`Found ${fellowRows.length} fellow rows to set up`);
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
        pauseAllCarousels();
        
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
            const newCarousel = expandedContent.querySelector('.image-carousel');
            if (newCarousel) {
              console.log("Found carousel in expanded content:", newCarousel.dataset.carousel);
              initSpecificCarousel(newCarousel);
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
        pauseAllCarousels();
        
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
        pauseAllCarousels();
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
        pauseAllCarousels();
      }
    });
  };
  
  // Improved carousel functions with better logging
  // Enhanced carousel navigation function
  window.goToSlide = function(carouselId, slideIndex) {
    console.log(`Navigating to slide ${slideIndex} in carousel ${carouselId}`);
    const carousel = document.querySelector(`.image-carousel[data-carousel="${carouselId}"]`);
    if (!carousel) {
      console.error(`Carousel not found: ${carouselId}`);
      return;
    }
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    
    console.log(`Found ${slides.length} slides and ${dots.length} dots`);
    
    if (slideIndex >= 0 && slideIndex < slides.length) {
      // Log the current slide visibility for debugging
      slides.forEach((slide, idx) => {
        const isActive = slide.classList.contains('active');
        console.log(`Slide ${idx} visibility before change: ${isActive ? 'visible' : 'hidden'}`);
      });
      
      // Update slides
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === slideIndex);
      });
      
      // Update dots
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === slideIndex);
      });
      
      // Update carousel state if using Map
      if (window.carousels && window.carousels.has(carouselId)) {
        window.carousels.get(carouselId).currentSlide = slideIndex;
        console.log(`Updated carousel state for ${carouselId}, current slide is now ${slideIndex}`);
      }
      
      // Log the new slide visibility for debugging
      slides.forEach((slide, idx) => {
        const isActive = slide.classList.contains('active');
        console.log(`Slide ${idx} visibility after change: ${isActive ? 'visible' : 'hidden'}`);
      });
    } else {
      console.error(`Invalid slide index ${slideIndex} - should be between 0 and ${slides.length-1}`);
    }
  };
  
  // Add new previous and next slide functions
  window.prevSlide = function(carouselId) {
    if (!window.carousels || !window.carousels.has(carouselId)) {
      console.error(`Carousel state not found for ${carouselId}`);
      return;
    }
    
    const carousel = window.carousels.get(carouselId);
    let newSlide = carousel.currentSlide - 1;
    if (newSlide < 0) newSlide = carousel.totalSlides - 1;
    
    console.log(`Moving to previous slide: ${newSlide} (from ${carousel.currentSlide})`);
    window.goToSlide(carouselId, newSlide);
  };
  
  window.nextSlide = function(carouselId) {
    if (!window.carousels || !window.carousels.has(carouselId)) {
      console.error(`Carousel state not found for ${carouselId}`);
      return;
    }
    
    const carousel = window.carousels.get(carouselId);
    let newSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
    
    console.log(`Moving to next slide: ${newSlide} (from ${carousel.currentSlide})`);
    window.goToSlide(carouselId, newSlide);
  };
  
  // Enhanced carousel initialization
  window.initCarousels = function() {
    // Initialize the carousel tracking objects
    if (!window.carousels) window.carousels = new Map();
    if (!window.carouselIntervals) window.carouselIntervals = new Map();
    
    const carouselElements = document.querySelectorAll('.image-carousel');
    console.log(`Found ${carouselElements.length} carousels to initialize`);
    
    carouselElements.forEach(carousel => {
      initSpecificCarousel(carousel);
    });
    
    // Dump carousel state to console
    console.log("All carousels after initialization:");
    window.carousels.forEach((state, id) => {
      console.log(`Carousel ${id}: ${state.totalSlides} slides, current slide: ${state.currentSlide}`);
    });
  };
  
  // Enhanced specific carousel initializer
  window.initSpecificCarousel = function(carousel) {
    const carouselId = carousel.dataset.carousel;
    if (!carouselId) {
      console.error("Carousel has no ID, cannot initialize");
      return;
    }
    
    console.log(`Initializing specific carousel: ${carouselId}`);
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    console.log(`Carousel ${carouselId} has ${slides.length} slides`);
    
    if (slides.length <= 1) {
      console.log(`Carousel ${carouselId} has only ${slides.length} slides, not initializing auto-rotation`);
      return; // Don't initialize for single images
    }
    
    // Check if slides are working correctly
    slides.forEach((slide, idx) => {
      const isActive = slide.classList.contains('active');
      console.log(`Slide ${idx} initial state: ${isActive ? 'visible' : 'hidden'}`);
    });
    
    // Initialize carousel state
    if (!window.carousels) window.carousels = new Map();
    if (!window.carouselIntervals) window.carouselIntervals = new Map();
    
    window.carousels.set(carouselId, {
      currentSlide: 0,
      totalSlides: slides.length,
      element: carousel
    });
    
    // Check if the CSS is correctly showing only active slides
    const shouldBeVisible = slides[0].classList.contains('active');
    if (!shouldBeVisible) {
      console.warn(`First slide of carousel ${carouselId} is not marked as active!`);
      slides[0].classList.add('active');
      
      // Also fix the corresponding dot
      const dots = carousel.querySelectorAll('.carousel-dot');
      if (dots.length > 0) {
        dots[0].classList.add('active');
      }
    }
    
    // Start auto-swipe
    startAutoSwipe(carouselId);
    
    console.log(`Carousel ${carouselId} initialized with ${slides.length} slides, auto-rotation started`);
  };
  
  // Enhanced start auto swipe function
  window.startAutoSwipe = function(carouselId) {
    if (!window.carousels || !window.carouselIntervals) {
      window.carousels = new Map();
      window.carouselIntervals = new Map();
    }
    
    const carousel = window.carousels.get(carouselId);
    if (!carousel || carousel.totalSlides <= 1) {
      console.log(`Not starting auto-swipe for carousel ${carouselId} - has only 1 slide or not found`);
      return;
    }
    
    // Clear existing interval
    pauseAutoSwipe(carouselId);
    
    // Set new interval (change slide every 4 seconds)
    console.log(`Starting auto-swipe for carousel ${carouselId}`);
    const interval = setInterval(() => {
      carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
      console.log(`Auto-advancing carousel ${carouselId} to slide ${carousel.currentSlide}`);
      window.goToSlide(carouselId, carousel.currentSlide);
    }, 4000);
    
    window.carouselIntervals.set(carouselId, interval);
  };
  
  // Enhanced pause auto swipe function
  window.pauseAutoSwipe = function(carouselId) {
    if (!window.carouselIntervals) return;
    
    const interval = window.carouselIntervals.get(carouselId);
    if (interval) {
      console.log(`Pausing auto-swipe for carousel ${carouselId}`);
      clearInterval(interval);
      window.carouselIntervals.delete(carouselId);
    }
  };
  
  // Enhanced pause all carousels function
  window.pauseAllCarousels = function() {
    if (!window.carouselIntervals) return;
    
    console.log(`Pausing all ${window.carouselIntervals.size} active carousels`);
    window.carouselIntervals.forEach((interval, carouselId) => {
      console.log(`Pausing carousel ${carouselId}`);
      clearInterval(interval);
    });
    window.carouselIntervals.clear();
  };
  
  // Add CSS check function to diagnose styling issues
  window.checkCarouselCSS = function() {
    // Get computed styles of carousel elements
    const carousels = document.querySelectorAll('.image-carousel');
    
    carousels.forEach(carousel => {
      const carouselId = carousel.dataset.carousel;
      console.log(`Checking CSS for carousel ${carouselId}:`);
      
      // Check carousel container
      const container = carousel.querySelector('.carousel-container');
      if (container) {
        const containerStyle = window.getComputedStyle(container);
        console.log(`Carousel container: position=${containerStyle.position}, display=${containerStyle.display}, overflow=${containerStyle.overflow}`);
      }
      
      // Check slides
      const slides = carousel.querySelectorAll('.carousel-slide');
      slides.forEach((slide, idx) => {
        const isActive = slide.classList.contains('active');
        const slideStyle = window.getComputedStyle(slide);
        console.log(`Slide ${idx} (${isActive ? 'active' : 'inactive'}): display=${slideStyle.display}, position=${slideStyle.position}, visibility=${slideStyle.visibility}, opacity=${slideStyle.opacity}`);
        
        // Check if slide has the expected property difference
        if (isActive) {
          if (slideStyle.display === 'none') {
            console.error(`CSS ERROR: Active slide ${idx} is set to display:none`);
          }
        } else {
          if (slideStyle.display !== 'none') {
            console.error(`CSS ERROR: Inactive slide ${idx} is not hidden (display=${slideStyle.display})`);
          }
        }
      });
    });
  };
  
  // Add a diagnostic function to check all carousel elements
  window.checkAllCarousels = function() {
    console.log("==== CAROUSEL DIAGNOSTIC CHECK ====");
    
    // 1. Check if carousels are registered
    console.log(`Registered carousels: ${window.carousels ? window.carousels.size : 0}`);
    console.log(`Active carousel intervals: ${window.carouselIntervals ? window.carouselIntervals.size : 0}`);
    
    // 2. Check carousel DOM elements
    const carouselElements = document.querySelectorAll('.image-carousel');
    console.log(`DOM carousels found: ${carouselElements.length}`);
    
    // 3. Check each carousel
    carouselElements.forEach(carousel => {
      const carouselId = carousel.dataset.carousel;
      console.log(`\nDiagnosing carousel: ${carouselId}`);
      
      // Check slides
      const slides = carousel.querySelectorAll('.carousel-slide');
      console.log(`  Found ${slides.length} slides`);
      
      // Check which slide is active
      let activeSlideCount = 0;
      slides.forEach((slide, idx) => {
        const isActive = slide.classList.contains('active');
        if (isActive) {
          activeSlideCount++;
          console.log(`  Slide ${idx} is active`);
        }
      });
      
      if (activeSlideCount === 0) {
        console.error(`  ERROR: No active slides in carousel ${carouselId}`);
      } else if (activeSlideCount > 1) {
        console.error(`  ERROR: Multiple active slides (${activeSlideCount}) in carousel ${carouselId}`);
      }
      
      // Check dots
      const dots = carousel.querySelectorAll('.carousel-dot');
      console.log(`  Found ${dots.length} navigation dots`);
      
      if (dots.length !== slides.length) {
        console.error(`  ERROR: Number of dots (${dots.length}) does not match number of slides (${slides.length})`);
      }
      
      // Check state object
      const state = window.carousels ? window.carousels.get(carouselId) : null;
      if (state) {
        console.log(`  Carousel state: currentSlide=${state.currentSlide}, totalSlides=${state.totalSlides}`);
        
        // Verify state matches DOM
        if (state.totalSlides !== slides.length) {
          console.error(`  ERROR: State totalSlides (${state.totalSlides}) does not match DOM slides (${slides.length})`);
        }
      } else {
        console.error(`  ERROR: No state object for carousel ${carouselId}`);
      }
      
      // Check if auto-rotation is active
      const hasInterval = window.carouselIntervals && window.carouselIntervals.has(carouselId);
      console.log(`  Auto-rotation active: ${hasInterval ? 'YES' : 'NO'}`);
    });
    
    // 4. Check CSS
    console.log("\nChecking CSS for carousels:");
    checkCarouselCSS();
    
    console.log("\n==== END DIAGNOSTIC CHECK ====");
  };
  
  // Fix CSS issues by adding essential styles if missing
  window.fixCarouselCSS = function() {
    console.log("Adding essential carousel CSS styles");
    
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      /* Essential carousel styles */
      .image-carousel {
        position: relative;
        max-width: 100%;
        margin: 0 auto;
      }
      
      .carousel-container {
        position: relative;
        overflow: hidden;
        width: 100%;
      }
      
      .carousel-slide {
        display: none; /* Hide all slides by default */
        width: 100%;
      }
      
      .carousel-slide.active {
        display: block; /* Show only active slide */
      }
      
      .carousel-dots {
        text-align: center;
        margin-top: 10px;
      }
      
      .carousel-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #bbb;
        margin: 0 5px;
        cursor: pointer;
      }
      
      .carousel-dot.active {
        background-color: #333;
      }
      
      .carousel-controls {
        margin-top: 10px;
        text-align: center;
      }
      
      .carousel-prev, .carousel-next {
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        padding: 5px 10px;
        margin: 0 5px;
        cursor: pointer;
      }
    `;
    
    // Append to head
    document.head.appendChild(style);
    console.log("Added essential carousel CSS");
  };
});

// Add a watchdog function to check if carousels are working
window.addEventListener('load', function() {
  console.log("Window loaded, running final carousel check");
  
  // Give time for everything to initialize
  setTimeout(function() {
    const carouselElements = document.querySelectorAll('.image-carousel');
    
    if (carouselElements.length === 0) {
      console.warn("No carousels found on page after load");
      return;
    }
    
    console.log(`Found ${carouselElements.length} carousels after page load`);
    
    // Check if any carousels have multiple slides
    let foundMultiSlideCarousel = false;
    
    carouselElements.forEach(carousel => {
      const slides = carousel.querySelectorAll('.carousel-slide');
      if (slides.length > 1) {
        foundMultiSlideCarousel = true;
        
        // Check if first slide is active
        const firstSlideActive = slides[0].classList.contains('active');
        if (!firstSlideActive) {
          console.error("First slide is not active, forcing active state");
          slides[0].classList.add('active');
        }
        
        // Check if auto-rotation is working
        const carouselId = carousel.dataset.carousel;
        const isRotating = window.carouselIntervals && window.carouselIntervals.has(carouselId);
        
        if (!isRotating) {
          console.warn(`Carousel ${carouselId} is not auto-rotating, restarting...`);
          if (typeof window.startAutoSwipe === 'function') {
            window.startAutoSwipe(carouselId);
          }
        }
      }
    });
    
    if (!foundMultiSlideCarousel) {
      console.warn("No multi-slide carousels found, check JSON data for carousel configuration");
    }
    
    // Run diagnostic check
    if (typeof window.checkAllCarousels === 'function') {
      window.checkAllCarousels();
    }
    
    // Add CSS fix if needed
    const activeSlides = document.querySelectorAll('.carousel-slide.active');
    if (activeSlides.length > 0) {
      // Check if active slides are visible
      let anyVisible = false;
      activeSlides.forEach(slide => {
        const computedStyle = window.getComputedStyle(slide);
        if (computedStyle.display !== 'none') {
          anyVisible = true;
        }
      });
      
      if (!anyVisible) {
        console.error("CSS issue detected: active slides are not visible, adding CSS fix");
        if (typeof window.fixCarouselCSS === 'function') {
          window.fixCarouselCSS();
        }
      }
    }
  }, 1000); // Check 1 second after page load
});
