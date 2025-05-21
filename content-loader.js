// content-loader.js - 完整版本，包含路径修正

// 添加调试日志
console.log("Content loader script starting...");

// 路径修正函数 - 处理所有可能的路径问题
function correctImagePath(path) {
  if (!path) return '';
  
  console.log("Correcting path:", path);
  
  // 修正1: img/uploads/ → uploads/img/
  let correctedPath = path.replace('img/uploads/', 'uploads/img/');
  
  // 修正2: 如果路径以uploads开头但没有前导斜杠
  if (correctedPath.startsWith('uploads/') && !correctedPath.startsWith('/uploads/')) {
    correctedPath = '/' + correctedPath;
  }
  
  // 修正3: 确保所有路径以斜杠开头
  if (!correctedPath.startsWith('/')) {
    correctedPath = '/' + correctedPath;
  }
  
  // 修正4: 修复可能的双斜杠问题
  correctedPath = correctedPath.replace('//', '/');
  
  console.log("Corrected to:", correctedPath);
  return correctedPath;
}

// 检查图片路径是否存在的函数（用于调试）
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

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
            console.log(`Processing fellow ${index+1}:`, fellow.name);
            
            // 创建图片内容
            let imageContent = '';
            
            // 获取并修正图片路径
            let imagePath = correctImagePath(fellow.image);
            
            if (imagePath) {
              // 检查图片类型
              if (fellow.image_type === 'carousel') {
                console.log("Creating carousel for", fellow.name);
                // 创建轮播图
                let carouselSlides = '';
                let carouselDots = '';
                
                // 创建所有轮播图片的数组
                const allImages = [
                  {src: imagePath, caption: fellow.caption || ''}
                ];
                
                // 添加额外的轮播图片 (如果有)
                if (fellow.additional_images && fellow.additional_images.length > 0) {
                  console.log("Adding additional images:", fellow.additional_images.length);
                  fellow.additional_images.forEach(img => {
                    if (img && img.src) {
                      // 修正额外图片的路径
                      let extraImagePath = correctImagePath(img.src);
                      allImages.push({
                        src: extraImagePath,
                        caption: img.caption || ''
                      });
                    }
                  });
                }
                
                // 为每个图片创建轮播幻灯片
                allImages.forEach((image, idx) => {
                  console.log(`Creating slide ${idx+1} with image:`, image.src);
                  carouselSlides += `
                    <div class="carousel-slide ${idx === 0 ? 'active' : ''}">
                      <img src="${image.src}" alt="${fellow.name || ''}" class="expanded-image" onerror="this.onerror=null; console.error('Failed to load image:', this.src);">
                      <div class="photo-credit">${image.caption || ''}</div>
                    </div>
                  `;
                  
                  carouselDots += `
                    <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide('${fellow.id || `fellow-${index}`}', ${idx})"></div>
                  `;
                });
                
                // 组装完整的轮播图HTML
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
                // 单张图片
                console.log("Creating single image display for", fellow.name);
                imageContent = `
                  <div class="single-image-container">
                    <img src="${imagePath}" alt="${fellow.name || ''}" class="expanded-image" onerror="this.onerror=null; console.error('Failed to load image:', this.src);">
                    <div class="photo-credit">${fellow.caption || ''}</div>
                  </div>
                `;
              }
            } else {
              // 没有图片
              console.log("No image for", fellow.name);
              imageContent = `
                <div class="single-image-container">
                  <div style="text-align: center; padding: 40px; background: #f5f5f5; color: #888;">
                    <p>Image not provided</p>
                  </div>
                </div>
              `;
            }
            
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
          setupExpandableRows();
          
          if (typeof initCarousels === 'function') {
            console.log("Initializing carousels");
            initCarousels();
          } else {
            console.warn("initCarousels function not found, may need to implement");
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
  
  // 重新实现setupExpandableRows函数，以防原页面中没有
  function setupExpandableRows() {
    console.log("Setting up expandable rows");
    const fellowRows = document.querySelectorAll('.fellow-row');
    let activeExpansion = null;
    
    fellowRows.forEach((row) => {
      row.addEventListener('click', function(event) {
        // 不要在点击轮播点或图片时展开
        if (event.target.closest('.carousel-dot') || event.target.closest('.image-carousel')) {
          return;
        }
        
        const fellowId = this.getAttribute('data-fellow-id');
        if (!fellowId) return;
        
        console.log('Clicking fellow row:', fellowId);
        
        // 找到展开行和内容
        const expandedRow = document.getElementById(`${fellowId}-row`);
        const expandedContent = document.getElementById(`${fellowId}-content`);
        
        if (!expandedRow || !expandedContent) {
          console.error('Could not find expanded elements for:', fellowId);
          return;
        }
        
        // 检查此行是否已经激活
        const isActive = this.classList.contains('active');
        console.log('Is currently active:', isActive);
        
        // 移除所有研究员行的激活类
        document.querySelectorAll('.fellow-row.active').forEach(row => {
          row.classList.remove('active');
        });
        
        // 关闭所有展开内容
        document.querySelectorAll('.expanded-row.active').forEach(row => {
          row.classList.remove('active');
          const content = row.querySelector('.expanded-content');
          if (content) content.classList.remove('active');
        });
        
        // 暂停所有轮播
        if (typeof pauseAllCarousels === 'function') {
          pauseAllCarousels();
        }
        
        // 如果此行之前未激活，打开它
        if (!isActive) {
          // 添加激活类到点击的行
          this.classList.add('active');
          
          // 显示展开内容行
          expandedRow.classList.add('active');
          expandedContent.classList.add('active');
          
          // 更新激活的展开
          activeExpansion = fellowId;
          
          // 为新打开的研究员初始化轮播并滚动
          setTimeout(() => {
            // 重新初始化轮播
            const newCarousels = expandedContent.querySelectorAll('.image-carousel');
            if (typeof initSpecificCarousel === 'function') {
              newCarousels.forEach(carousel => {
                initSpecificCarousel(carousel);
              });
            }
            
            // 滚动到展开内容
            const rect = expandedRow.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - 100; // 100px顶部偏移
            
            window.scrollTo({
              top: targetY,
              behavior: 'smooth'
            });
          }, 100);
        } else {
          // 此行已激活，关闭它
          activeExpansion = null;
        }
        
        // 防止事件传播到文档点击处理器
        event.stopPropagation();
      });
    });
    
    // 处理关闭按钮点击
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        const expandedContent = this.closest('.expanded-content');
        if (!expandedContent) return;
        
        // 找到研究员行
        const fellowId = expandedContent.id.replace('-content', '');
        const fellowRow = document.querySelector(`.fellow-row[data-fellow-id="${fellowId}"]`);
        
        if (fellowRow) {
          fellowRow.classList.remove('active');
        }
        
        // 关闭展开内容
        expandedContent.classList.remove('active');
        const expandedRow = expandedContent.closest('.expanded-row');
        if (expandedRow) {
          expandedRow.classList.remove('active');
        }
        
        // 重置激活展开
        activeExpansion = null;
        
        // 暂停所有轮播
        if (typeof pauseAllCarousels === 'function') {
          pauseAllCarousels();
        }
        
        // 防止事件传播
        event.stopPropagation();
      });
    });
    
    // 点击外部关闭展开内容
    document.addEventListener('click', function(event) {
      // 检查点击是否在研究员行和展开内容之外
      const targetRow = event.target.closest('.fellow-row');
      const targetExpandedContent = event.target.closest('.expanded-content');
      const closeButton = event.target.closest('.close-btn');
      
      if (!targetRow && !targetExpandedContent && !closeButton) {
        // 重置所有研究员行
        document.querySelectorAll('.fellow-row.active').forEach(row => {
          row.classList.remove('active');
        });
        
        // 关闭所有展开内容
        document.querySelectorAll('.expanded-row.active').forEach(row => {
          row.classList.remove('active');
          const content = row.querySelector('.expanded-content');
          if (content) content.classList.remove('active');
        });
        
        // 重置激活展开
        activeExpansion = null;
        
        // 暂停所有轮播
        if (typeof pauseAllCarousels === 'function') {
          pauseAllCarousels();
        }
      }
    });
    
    // 添加键盘导航（Escape键关闭展开内容）
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        // 重置所有研究员行
        document.querySelectorAll('.fellow-row.active').forEach(row => {
          row.classList.remove('active');
        });
        
        // 关闭所有展开内容
        document.querySelectorAll('.expanded-row.active').forEach(row => {
          row.classList.remove('active');
          const content = row.querySelector('.expanded-content');
          if (content) content.classList.remove('active');
        });
        
        // 重置激活展开
        activeExpansion = null;
        
        // 暂停所有轮播
        if (typeof pauseAllCarousels === 'function') {
          pauseAllCarousels();
        }
      }
    });
  }
  
  // 如果页面上没有定义这些轮播函数，提供基本实现
  if (typeof goToSlide !== 'function') {
    window.goToSlide = function(carouselId, slideIndex) {
      console.log(`Navigating to slide ${slideIndex} in carousel ${carouselId}`);
      const carousel = document.querySelector(`.image-carousel[data-carousel="${carouselId}"]`);
      if (!carousel) return;
      
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      
      if (slideIndex >= 0 && slideIndex < slides.length) {
        // 更新幻灯片
        slides.forEach((slide, idx) => {
          slide.classList.toggle('active', idx === slideIndex);
        });
        
        // 更新点
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === slideIndex);
        });
      }
    };
  }
});
