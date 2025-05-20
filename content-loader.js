// Wait for document to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Fetch our CMS data
  fetch('/fellowship-data.json')
    .then(response => response.json())
    .then(data => {
      // Update page title if needed
      if (data.title) {
        document.title = data.title;
      }
      
      // Update main heading
      if (data.heading) {
        const headingElement = document.querySelector('.main-headline');
        if (headingElement) headingElement.textContent = data.heading;
      }
      
      // Update introduction text
      if (data.intro) {
        const introElement = document.querySelector('.fellowship-intro p');
        if (introElement) introElement.textContent = data.intro;
      }
      
      // Update cohort heading
      if (data.cohort_title) {
        const cohortHeading = document.querySelector('.section-heading');
        if (cohortHeading) cohortHeading.textContent = data.cohort_title;
      }
      
      // Update fellows list
      if (data.fellows && data.fellows.length > 0) {
        const fellowsTable = document.querySelector('#cohort-2025 tbody');
        if (fellowsTable) {
          // Clear existing fellows
          fellowsTable.innerHTML = '';
          
          // Add each fellow from the data
          data.fellows.forEach(fellow => {
            // Create the expanded content based on image type
            let imageContent = '';
            
            if (fellow.image_type === 'single' && fellow.image) {
              imageContent = `
                <div class="single-image-container">
                  <img src="${fellow.image}" alt="${fellow.name}" class="expanded-image">
                  <div class="photo-credit">${fellow.caption || ''}</div>
                </div>
              `;
            } else if (fellow.image_type === 'carousel' && fellow.images) {
              // For carousel implementation
              imageContent = `
                <div class="image-carousel" data-carousel="${fellow.id}">
                  <div class="carousel-container">
                    <div class="carousel-slide active">
                      <img src="${fellow.image}" alt="${fellow.name}" class="expanded-image">
                      <div class="photo-credit">${fellow.caption || ''}</div>
                    </div>
                  </div>
                </div>
              `;
            }
            
            // Create fellow row HTML
            const fellowHTML = `
              <tr class="fellow-row" data-fellow-id="${fellow.id}">
                <td class="fellow-number">${fellow.number}</td>
                <td class="fellow-name">${fellow.name}</td>
              </tr>
              <tr class="expanded-row" id="${fellow.id}-row">
                <td colspan="2" class="expanded-cell">
                  <div class="expanded-content" id="${fellow.id}-content">
                    <div class="expanded-left">
                      <h3 class="expanded-title">${fellow.title || fellow.name}</h3>
                      <div class="expanded-text">
                        ${fellow.bio}
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
            
            // Add to the table
            fellowsTable.innerHTML += fellowHTML;
          });
          
          // Reinitialize any interactive features
          if (typeof setupExpandableRows === 'function') {
            setupExpandableRows();
          }
          if (typeof initCarousels === 'function') {
            initCarousels();
          }
        }
      }
    })
    .catch(error => {
      console.error('Error loading content data:', error);
    });
});