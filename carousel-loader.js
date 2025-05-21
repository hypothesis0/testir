// Add this script right after your existing content-loader.js script
// This provides a specific fix for carousel images without changing your entire setup

document.addEventListener('DOMContentLoaded', function() {
  console.log("🛠️ Carousel Path Fix starting...");
  
  // Wait a short time to let your main content-loader.js run first
  setTimeout(function() {
    // Find all carousels and fix them
    const carousels = document.querySelectorAll('.image-carousel');
    console.log(`Found ${carousels.length} carousels to fix`);
    
    carousels.forEach(carousel => {
      const carouselId = carousel.dataset.carousel;
      console.log(`Fixing carousel: ${carouselId}`);
      
      // Find all slides in this carousel
      const slides = carousel.querySelectorAll('.carousel-slide');
      console.log(`Found ${slides.length} slides in carousel ${carouselId}`);
      
      // Fix each slide's image path
      slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        if (!img) return;
        
        const originalSrc = img.getAttribute('src');
        console.log(`Slide ${index+1} original image path: "${originalSrc}"`);
        
        // Check if the image is loaded
        if (img.complete && img.naturalWidth > 0) {
          console.log(`Image already loaded successfully: ${originalSrc}`);
          return;
        }
        
        // Try to correct the path
        let correctedSrc = tryCorrectPath(originalSrc, carouselId, index);
        if (correctedSrc !== originalSrc) {
          console.log(`Corrected path: "${correctedSrc}"`);
          img.setAttribute('src', correctedSrc);
          
          // Add fallback error handling
          img.onerror = function() {
            console.error(`Failed to load image: ${correctedSrc}`);
            this.onerror = null;
            
            // Try alternate path format as a last resort
            const altPath = tryAlternatePath(correctedSrc);
            if (altPath !== correctedSrc) {
              console.log(`Trying alternate path: ${altPath}`);
              this.src = altPath;
            } else {
              // If all else fails, use a placeholder
              this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage Not Found%3C/text%3E%3C/svg%3E';
            }
          };
        }
      });
      
      // Ensure first slide is active and visible
      if (slides.length > 0) {
        slides.forEach((slide, idx) => {
          if (idx === 0) {
            slide.classList.add('active');
            slide.style.display = 'block';
          } else {
            slide.classList.remove('active');
            slide.style.display = 'none';
          }
        });
      }
      
      // Make sure carousel dots work
      const dots = carousel.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.onclick = function() {
          console.log(`Dot ${idx+1} clicked for carousel ${carouselId}`);
          showSlide(carouselId, idx);
        };
      });
    });
    
    console.log("🛠️ Carousel Path Fix complete");
  }, 1000); // Wait 1 second for content-loader.js to finish
  
  // Helper function to try different path formats
  function tryCorrectPath(originalPath, carouselId, slideIndex) {
    if (!originalPath) return '';
    
    // First check if path already works
    if (checkImageExists(originalPath)) {
      return originalPath;
    }
    
    // Path correction strategies
    let correctedPath = originalPath;
    
    // 1. Special handling for known carousel paths
    if (carouselId === 'te-editions-2025') {
      // Try specific known paths for the te-editions carousel
      if (slideIndex === 0) {
        const specificPaths = [
          '/img/uploads/teeditions_kechun_qin.jpg',
          'img/uploads/teeditions_kechun_qin.jpg',
          '/img/fellowship/2025&2026cohort/teeditions_Kechun Qin.jpg',
          'img/fellowship/2025&2026cohort/teeditions_Kechun Qin.jpg'
        ];
        
        for (const path of specificPaths) {
          if (checkImageExists(path)) {
            return path;
          }
        }
      }
      else if (slideIndex === 1) {
        const specificPaths = [
          '/img/uploads/teeditions_michael_guo.jpg',
          'img/uploads/teeditions_michael_guo.jpg',
          '/img/fellowship/2025&2026cohort/teeditions_Michael Guo.jpg',
          'img/fellowship/2025&2026cohort/teeditions_Michael Guo.jpg'
        ];
        
        for (const path of specificPaths) {
          if (checkImageExists(path)) {
            return path;
          }
        }
      }
    }
    
    // 2. General path correction
    
    // Try adding/removing leading slash
    if (correctedPath.startsWith('/')) {
      const noLeadingSlash = correctedPath.substring(1);
      if (checkImageExists(noLeadingSlash)) {
        return noLeadingSlash;
      }
    } else {
      const withLeadingSlash = '/' + correctedPath;
      if (checkImageExists(withLeadingSlash)) {
        return withLeadingSlash;
      }
    }
    
    // Try converting fellowship path to uploads path
    if (correctedPath.includes('/fellowship/')) {
      const toUploadsPath = correctedPath.replace('/fellowship/2025&2026cohort/', '/uploads/');
      if (checkImageExists(toUploadsPath)) {
        return toUploadsPath;
      }
    }
    
    // Try converting uploads path to fellowship path
    if (correctedPath.includes('/uploads/')) {
      const toFellowshipPath = correctedPath.replace('/uploads/', '/fellowship/2025&2026cohort/');
      if (checkImageExists(toFellowshipPath)) {
        return toFellowshipPath;
      }
    }
    
    // If nothing worked, return original path
    return originalPath;
  }
  
  // Helper function to try alternate path formats
  function tryAlternatePath(path) {
    // Convert to lowercase (some servers are case-sensitive)
    const lowercasePath = path.toLowerCase();
    if (lowercasePath !== path) {
      return lowercasePath;
    }
    
    // Try different folder structure
    if (path.includes('uploads')) {
      return path.replace('uploads', 'fellowship/2025&2026cohort');
    }
    
    if (path.includes('fellowship/2025&2026cohort')) {
      return path.replace('fellowship/2025&2026cohort', 'uploads');
    }
    
    return path;
  }
  
  // Helper function to check if an image exists (synchronous version)
  // Note: This is not 100% reliable but works for most cases
  function checkImageExists(url) {
    const img = new Image();
    img.src = url;
    return img.complete;
  }
  
  // Helper function to show a specific slide
  function showSlide(carouselId, slideIndex) {
    const carousel = document.querySelector(`.image-carousel[data-carousel="${carouselId}"]`);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    
    slides.forEach((slide, idx) => {
      if (idx === slideIndex) {
        slide.classList.add('active');
        slide.style.display = 'block';
      } else {
        slide.classList.remove('active');
        slide.style.display = 'none';
      }
    });
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === slideIndex);
    });
  }
});
