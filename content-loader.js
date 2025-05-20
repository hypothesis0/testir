// 添加调试日志
console.log("Content loader script starting...");

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, fetching data...");
  
  // 获取JSON数据
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
      
      // 更新页面标题
      if (data.title) {
        console.log("Updating page title to:", data.title);
        document.title = data.title;
      }
      
      // 更新主标题
      if (data.heading) {
        const headingElement = document.querySelector('.main-headline');
        if (headingElement) {
          console.log("Updating main heading to:", data.heading);
          headingElement.textContent = data.heading;
        } else {
          console.error("Main heading element not found! Selector: .main-headline");
        }
      }
      
      // 更新介绍文本
      if (data.intro) {
        const introElement = document.querySelector('.fellowship-intro p');
        if (introElement) {
          console.log("Updating intro text");
          introElement.textContent = data.intro;
        } else {
          console.error("Intro element not found! Selector: .fellowship-intro p");
        }
      }
      
      // 更新队列标题
      if (data.cohort_title) {
        const cohortHeading = document.querySelector('.section-heading');
        if (cohortHeading) {
          console.log("Updating cohort title to:", data.cohort_title);
          cohortHeading.textContent = data.cohort_title;
        } else {
          console.error("Cohort heading element not found! Selector: .section-heading");
        }
      }
      
      // 更新研究员列表
      if (data.fellows && data.fellows.length > 0) {
        console.log("Found fellows data:", data.fellows.length, "fellows");
        const fellowsTable = document.querySelector('#cohort-2025 tbody');
        if (fellowsTable) {
          console.log("Found fellows table, clearing existing content");
          // 清除现有研究员
          fellowsTable.innerHTML = '';
          
          // 添加每个研究员
          data.fellows.forEach((fellow, index) => {
            console.log(`Processing fellow ${index+1}:`, fellow);
            
            // 创建图片内容
            let imageContent = '';
            
            // 检查图片数据
            console.log("Fellow image data:", {
              image: fellow.image,
              image_type: fellow.image_type,
              caption: fellow.caption,
              additional_images: fellow.additional_images
            });
            
            if (fellow.image) {
              console.log("Fellow has an image:", fellow.image);
              
              if (fellow.image_type === 'single' || !fellow.image_type) {
                console.log("Using single image display");
                imageContent = `
                  <div class="single-image-container">
                    <img src="${fellow.image}" alt="${fellow.name || ''}" class="expanded-image">
                    <div class="photo-credit">${fellow.caption || ''}</div>
                  </div>
                `;
              } else if (fellow.image_type === 'carousel') {
                console.log("Using carousel display");
                // 轮播图显示代码...
              }
            } else {
              console.log("Fellow has no image, using placeholder");
              imageContent = `
                <div class="single-image-container">
                  <img src="/img/placeholder.jpg" alt="No image available" class="expanded-image">
                  <div class="photo-credit">Image not provided</div>
                </div>
              `;
            }
            
            console.log("Generated image content:", imageContent);
            
            // 创建研究员HTML
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
            
            // 添加到表格
            fellowsTable.innerHTML += fellowHTML;
            console.log(`Added fellow ${fellow.name} to table`);
          });
          
          // 重新初始化交互功能
          console.log("Setting up interactive features");
          if (typeof initCarousels === 'function') {
            console.log("Initializing carousels");
            initCarousels();
          } else {
            console.warn("initCarousels function not found");
          }
          
          // 设置可扩展行
          console.log("Setting up expandable rows");
          setupExpandableRows();
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
  
  // 重新实现setupExpandableRows函数
  function setupExpandableRows() {
    const fellowRows = document.querySelectorAll('.fellow-row');
    let activeExpansion = null;
    
    fellowRows.forEach((row) => {
      row.addEventListener('click', function(event) {
        if (event.target.closest('.carousel-dot') || event.target.closest('.image-carousel')) {
          return;
        }
        
        const fellowId = this.getAttribute('data-fellow-id');
        if (!fellowId) return;
        
        const expandedRow = document.getElementById(`${fellowId}-row`);
        const expandedContent = document.getElementById(`${fellowId}-content`);
        
        if (!expandedRow || !expandedContent) return;
        
        const isActive = this.classList.contains('active');
        
        document.querySelectorAll('.fellow-row.active').forEach(row => {
          row.classList.remove('active');
        });
        
        document.querySelectorAll('.expanded-row.active').forEach(row => {
          row.classList.remove('active');
          const content = row.querySelector('.expanded-content');
          if (content) content.classList.remove('active');
        });
        
        if (!isActive) {
          this.classList.add('active');
          expandedRow.classList.add('active');
          expandedContent.classList.add('active');
          activeExpansion = fellowId;
          
          setTimeout(() => {
            const newCarousels = expandedContent.querySelectorAll('.image-carousel');
            newCarousels.forEach(carousel => {
              if (typeof initSpecificCarousel === 'function') {
                initSpecificCarousel(carousel);
              }
            });
            
            // 滚动到展开的内容
            const rect = expandedRow.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - 100;
            
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
          }, 100);
        } else {
          activeExpansion = null;
        }
        
        event.stopPropagation();
      });
    });
    
    // 处理关闭按钮点击
    document.querySelectorAll('.close-btn').forEach(button => {
      button.addEventListener('click', function(event) {
        const expandedContent = this.closest('.expanded-content');
        if (!expandedContent) return;
        
        const fellowId = expandedContent.id.replace('-content', '');
        const fellowRow = document.querySelector(`.fellow-row[data-fellow-id="${fellowId}"]`);
        
        if (fellowRow) {
          fellowRow.classList.remove('active');
        }
        
        expandedContent.classList.remove('active');
        const expandedRow = expandedContent.closest('.expanded-row');
        if (expandedRow) {
          expandedRow.classList.remove('active');
        }
        
        event.stopPropagation();
      });
    });
  }
});