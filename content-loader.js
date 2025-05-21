// content-loader.js - 完整版本，修复轮播图和段落格式问题

// 添加调试日志
console.log("Content loader script starting...");

// 深度检查对象的辅助函数
function inspectObject(obj, prefix = '') {
  if (!obj) {
    console.log(prefix + 'Object is null or undefined');
    return;
  }
  
  if (typeof obj !== 'object') {
    console.log(prefix + `Not an object, but ${typeof obj}: ${obj}`);
    return;
  }
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value === null) {
      console.log(prefix + `${key}: null`);
    } else if (typeof value === 'object') {
      console.log(prefix + `${key}: [Object]`);
      inspectObject(value, prefix + '  ');
    } else {
      console.log(prefix + `${key}: ${value}`);
    }
  });
}

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
      
      // 更新介绍文本 - 保留HTML格式
      if (data.intro) {
        const introElement = document.querySelector('.fellowship-intro');
        if (introElement) {
          console.log("Updating intro text with formatted content");
          
          // 如果intro内容已经包含HTML标签，直接使用
          if (data.intro.includes('<p>') || data.intro.includes('<br>')) {
            introElement.innerHTML = data.intro;
          } else {
            // 否则将markdown格式转换为HTML
            introElement.innerHTML = `<p>${data.intro.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
          }
        } else {
          console.error("Intro element not found! Selector: .fellowship-intro");
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
            
            // 详细检查轮播图数据
            console.log("Inspecting fellow data:");
            console.log("Image type:", fellow.image_type);
            console.log("Main image:", fellow.image);
            console.log("Additional images:");
            if (fellow.additional_images) {
              inspectObject(fellow.additional_images);
            } else {
              console.log("  No additional images found");
            }
            
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
                const allImages = [];
                
                // 添加主图片（如果存在）
                if (fellow.image) {
                  let mainImagePath = correctImagePath(fellow.image);
                  console.log("Main carousel image path:", mainImagePath);
                  allImages.push({
                    src: mainImagePath,
                    caption: fellow.caption || ''
                  });
                }
                
                // 添加额外的轮播图片（如果存在）
                if (fellow.additional_images && fellow.additional_images.length > 0) {
                  console.log("Found additional images:", fellow.additional_images.length);
                  
                  fellow.additional_images.forEach((img, idx) => {
                    console.log(`Processing additional image ${idx+1}:`, img);
                    
                    if (img && img.src) {
                      // 修正额外图片路径
                      let extraImagePath = correctImagePath(img.src);
                      console.log(`Corrected path for additional image ${idx+1}:`, extraImagePath);
                      
                      allImages.push({
                        src: extraImagePath,
                        caption: img.caption || ''
                      });
                    } else {
                      console.warn(`Additional image ${idx+1} missing src property:`, img);
                    }
                  });
                }
                
                // 如果没有图片，添加占位符
                if (allImages.length === 0) {
                  console.log("No carousel images found, adding placeholder");
                  allImages.push({
                    src: '/uploads/placeholder.jpg',
                    caption: 'Image not provided'
                  });
                }
                
                console.log("Total carousel images:", allImages.length);
                
                // 为每个图片创建轮播幻灯片
                allImages.forEach((image, idx) => {
                  console.log(`Creating slide ${idx+1}:`, image.src);
                  
                  // 添加onerror处理并显示加载指示器
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
                    <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide('${fellow.id || `fellow-${index}`}', ${idx})"></div>
                  `;
                });
                
                // 仅当有多张图片时显示轮播点
                const dotsHtml = allImages.length > 1 ? `
                  <div class="carousel-dots">
                    ${carouselDots}
                  </div>
                ` : '';
                
                // 组装完整的轮播图HTML
                imageContent = `
                  <div class="image-carousel" data-carousel="${fellow.id || `fellow-${index}`}">
                    <div class="carousel-container">
                      ${carouselSlides}
                    </div>
                    ${dotsHtml}
                  </div>
                `;
              } else {
                // 单张图片
                console.log("Creating single image display for", fellow.name);
                imageContent = `
                  <div class="single-image-container">
                    <img src="${imagePath}" alt="${fellow.name || ''}" class="expanded-image" onerror="this.onerror=null; this.src='/uploads/placeholder.jpg'; console.error('Failed to load image:', this.src);">
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
          
          // 初始化轮播
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
        pauseAllCarousels();
        
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
            newCarousels.forEach(carousel => {
              initSpecificCarousel(carousel);
            });
            
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
        pauseAllCarousels();
        
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
        pauseAllCarousels();
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
        pauseAllCarousels();
      }
    });
  }
});

// 轮播图功能实现
function initCarousels() {
  console.log("Initializing all carousels");
  const carouselElements = document.querySelectorAll('.image-carousel');
  carouselElements.forEach(carousel => {
    initSpecificCarousel(carousel);
  });
}

function initSpecificCarousel(carouselElement) {
  const carouselId = carouselElement.dataset.carousel;
  if (!carouselId) {
    console.warn("Carousel missing data-carousel attribute");
    return;
  }
  
  console.log("Initializing carousel:", carouselId);
  
  const slides = carouselElement.querySelectorAll('.carousel-slide');
  if (slides.length <= 1) {
    console.log("Carousel has only one slide, skipping initialization");
    return; // 单张图片不需要初始化
  }
  
  // 存储轮播状态
  if (!window.carousels) window.carousels = new Map();
  
  window.carousels.set(carouselId, {
    currentSlide: 0,
    totalSlides: slides.length,
    element: carouselElement
  });
  
  console.log("Carousel initialized with", slides.length, "slides");
  
  // 开始自动轮播
  startAutoSwipe(carouselId);
}

function updateCarousel(carouselId) {
  if (!window.carousels) return;
  
  const carousel = window.carousels.get(carouselId);
  if (!carousel) return;
  
  const slides = carousel.element.querySelectorAll('.carousel-slide');
  const dots = carousel.element.querySelectorAll('.carousel-dot');
  
  // 更新幻灯片
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === carousel.currentSlide);
  });
  
  // 更新点
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === carousel.currentSlide);
  });
}

function startAutoSwipe(carouselId) {
  if (!window.carousels) return;
  
  const carousel = window.carousels.get(carouselId);
  if (!carousel || carousel.totalSlides <= 1) return;
  
  // 清除现有定时器
  pauseAutoSwipe(carouselId);
  
  // 如果不存在定时器映射，创建一个
  if (!window.carouselIntervals) window.carouselIntervals = new Map();
  
  // 设置新定时器（每4秒切换一次幻灯片）
  const interval = setInterval(() => {
    carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
    updateCarousel(carouselId);
  }, 4000);
  
  window.carouselIntervals.set(carouselId, interval);
}

function pauseAutoSwipe(carouselId) {
  if (!window.carouselIntervals) return;
  
  const interval = window.carouselIntervals.get(carouselId);
  if (interval) {
    clearInterval(interval);
    window.carouselIntervals.delete(carouselId);
  }
}

function pauseAllCarousels() {
  if (!window.carouselIntervals) return;
  
  window.carouselIntervals.forEach((interval, carouselId) => {
    clearInterval(interval);
  });
  window.carouselIntervals.clear();
}

function goToSlide(carouselId, slideIndex) {
  if (!window.carousels) return;
  
  const carousel = window.carousels.get(carouselId);
  if (!carousel) return;
  
  carousel.currentSlide = slideIndex;
  updateCarousel(carouselId);
  
  // 重新开始自动轮播
  pauseAutoSwipe(carouselId);
  startAutoSwipe(carouselId);
}