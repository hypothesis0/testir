// carousel-loader.js - Dedicated script to handle carousel loading from JSON
// This script will properly load carousel images from fellowship-data.json

document.addEventListener('DOMContentLoaded', function() {
  console.log("🎠 Carousel Loader starting...");

  // Fetch the JSON data for the fellowship
  fetch('/fellowship-data.json')
    .then(response => {
      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data loaded successfully, processing carousels...");
      
      // Check if we have fellows data
      if (!data.fellows || !Array.isArray(data.fellows) || data.fellows.length === 0) {
        console.error("No fellows data found in JSON!");
        return;
      }
      
      // Process each fellow
      data.fellows.forEach((fellow, index) => {
        console.log(`Processing fellow ${index+1}: ${fellow.name || 'Unknown'}`);
        
        // Only process carousel-type images
        if (fellow.image_type !== 'carousel') {
          console.log(`Fellow ${fellow.name} does not have carousel images, skipping.`);
          return;
        }
        
        const fellowId = fellow.id || `fellow-${index}`;
        console.log(`Fellow ${fellow.name} has carousel images, id: ${fellowId}`);
        
        // Find the carousel container in the DOM
        const carouselContainer = document.querySelector(`.image-carousel[data-carousel="${fellowId}"] .carousel-container`);
        const dotsContainer = document.querySelector(`.image-carousel[data-carousel="${fellowId}"] .carousel-dots`);
        
        if (!carouselContainer || !dotsContainer) {
          console.error(`Could not find carousel containers for fellow ${fellowId}`);
          return;
        }
        
        console.log(`Found carousel container for ${fellowId}, will update with JSON data`);
        
        // Clear existing content
        carouselContainer.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        // Create array of all images for this carousel
        const images = [];
        
        // Add main image first
        if (fellow.image) {
          images.push({
            src: fellow.image,
            caption: fellow.caption || ''
          });
        }
        
        // Add additional images
        if (fellow.additional_images && Array.isArray(fellow.additional_images) && fellow.additional_images.length > 0) {
          fellow.additional_images.forEach(img => {
            if (img && img.src) {
              images.push({
                src: img.src,
                caption: img.caption || ''
              });
            }
          });
        }
        
        // If we have no images at all, show placeholder
        if (images.length === 0) {
          carouselContainer.innerHTML = `
            <div class="carousel-slide active">
              <div style="text-align: center; padding: 40px; background: #f5f5f5; color: #888;">
                <p>No images provided</p>
              </div>
            </div>
          `;
          return;
        }
        
        console.log(`Found ${images.length} images for carousel ${fellowId}`);
        
        // Create carousel slides and dots
        images.forEach((image, idx) => {
          // Clean up image path - ensure it has proper format
          let imageSrc = image.src;
          
          // 1. Remove any query params
          imageSrc = imageSrc.split('?')[0];
          
          // 2. Ensure path has leading slash if not absolute
          if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
            imageSrc = '/' + imageSrc;
          }
          
          console.log(`Creating slide ${idx + 1} with image ${imageSrc}`);
          
          // Create the slide
          const slide = document.createElement('div');
          slide.className = `carousel-slide ${idx === 0 ? 'active' : ''}`;
          slide.style.display = idx === 0 ? 'block' : 'none';
          
          slide.innerHTML = `
            <img src="${imageSrc}" alt="${fellow.name || ''}" class="expanded-image"
                 onerror="this.onerror=null; console.error('Failed to load image:', this.src); this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23f0f0f0\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-family=\\'sans-serif\\' font-size=\\'18\\' fill=\\'%23999\\'%3EImage Not Found%3C/text%3E%3C/svg%3E';">
            <div class="photo-credit">${image.caption || ''}</div>
          `;
          
          carouselContainer.appendChild(slide);
          
          // Create the dot
          const dot = document.createElement('div');
          dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
          dot.setAttribute('onclick', `goToSlide('${fellowId}', ${idx})`);
          
          dotsContainer.appendChild(dot);
        });
        
        // Make sure carousel functions are defined
        ensureCarouselFunctions();
        
        // Initialize this carousel
        if (typeof window.initSpecificCarousel === 'function') {
          const carousel = document.querySelector(`.image-carousel[data-carousel="${fellowId}"]`);
          if (carousel) {
            window.initSpecificCarousel(carousel);
            console.log(`Initialized carousel for ${fellowId}`);
          }
        }
      });
    })
    .catch(error => {
      console.error('Error loading or processing fellowship data:', error);
    });
  
  // Make sure all carousel functions are defined
  function ensureCarouselFunctions() {
    // Only define these if they don't already exist
    
    if (typeof window.carousels === 'undefined') {
      window.carousels = new Map();
    }
    
    if (typeof window.carouselIntervals === 'undefined') {
      window.carouselIntervals = new Map();
    }
    
    if (typeof window.goToSlide !== 'function') {
      window.goToSlide = function(carouselId, slideIndex) {
        console.log(`Going to slide ${slideIndex} in carousel ${carouselId}`);
        const carousel = document.querySelector(`.image-carousel[data-carousel="${carouselId}"]`);
        if (!carousel) return;
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        
        if (slideIndex >= 0 && slideIndex < slides.length) {
          // Update slides
          slides.forEach((slide, idx) => {
            if (idx === slideIndex) {
              slide.classList.add('active');
              slide.style.display = 'block';
            } else {
              slide.classList.remove('active');
              slide.style.display = 'none';
            }
          });
          
          // Update dots
          dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === slideIndex);
          });
          
          // Update carousel state
          if (window.carousels.has(carouselId)) {
            window.carousels.get(carouselId).currentSlide = slideIndex;
          }
        }
      };
    }
    
    if (typeof window.initSpecificCarousel !== 'function') {
      window.initSpecificCarousel = function(carousel) {
        const carouselId = carousel.dataset.carousel;
        if (!carouselId) return;
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        if (slides.length <= 1) return;
        
        // Initialize carousel state
        window.carousels.set(carouselId, {
          currentSlide: 0,
          totalSlides: slides.length,
          element: carousel
        });
        
        // Start auto rotation
        window.startAutoSwipe(carouselId);
      };
    }
    
    if (typeof window.startAutoSwipe !== 'function') {
      window.startAutoSwipe = function(carouselId) {
        const carousel = window.carousels.get(carouselId);
        if (!carousel || carousel.totalSlides <= 1) return;
        
        // Clear existing interval
        window.pauseAutoSwipe(carouselId);
        
        // Set new interval
        const interval = setInterval(() => {
          carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
          window.goToSlide(carouselId, carousel.currentSlide);
        }, 4000);
        
        window.carouselIntervals.set(carouselId, interval);
      };
    }
    
    if (typeof window.pauseAutoSwipe !== 'function') {
      window.pauseAutoSwipe = function(carouselId) {
        const interval = window.carouselIntervals.get(carouselId);
        if (interval) {
          clearInterval(interval);
          window.carouselIntervals.delete(carouselId);
        }
      };
    }
    
    if (typeof window.pauseAllCarousels !== 'function') {
      window.pauseAllCarousels = function() {
        window.carouselIntervals.forEach((interval, carouselId) => {
          clearInterval(interval);
        });
        window.carouselIntervals.clear();
      };
    }
    
    if (typeof window.initCarousels !== 'function') {
      window.initCarousels = function() {
        const carousels = document.querySelectorAll('.image-carousel');
        carousels.forEach(carousel => {
          window.initSpecificCarousel(carousel);
        });
      };
    }
  }
  
  console.log("🎠 Carousel Loader ready");
});