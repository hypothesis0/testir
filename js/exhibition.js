// 主页面导航
function goToHomepage() {
    window.location.href = '../index.html';
}

// 移动导航功能
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav && (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show'))) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        // 关闭所有移动下拉菜单
        const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    } else if (mobileNav) {
        mobileNav.style.display = 'flex';
        mobileNav.classList.add('show');
    }
}

// 移动下拉菜单切换
function toggleMobileDropdown(event, element) {
    event.preventDefault();
    const navItem = element.parentElement;
    
    // 检查此导航项是否有下拉菜单
    const dropdown = navItem.querySelector('.mobile-dropdown');
    if (!dropdown) {
        // 如果没有下拉菜单，则是常规链接
        return;
    }
    
    // 关闭所有其他移动下拉菜单
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    allMobileNavItems.forEach(item => {
        if (item !== navItem) {
            item.classList.remove('active');
        }
    });
    
    // 切换当前下拉菜单
    navItem.classList.toggle('active');
}

// 从JSON加载展览数据
async function loadExhibitionData() {
    try {
        console.log('正在尝试加载展览数据');
        const response = await fetch('/exhibition-data.json');
        
        if (!response.ok) {
            throw new Error(`无法获取展览数据: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('成功加载展览数据:', data);
        
        // 渲染展览内容
        renderExhibition(data);
        
    } catch (error) {
        console.error('加载展览数据时出错:', error);
        
        // 如果加载失败，显示错误消息并使用后备内容
        document.getElementById('exhibition-content').innerHTML = `
            <div class="exhibition-heading">
                <h1>Embodied Memories</h1>
                <p>April 15 - June 30, 2025</p>
            </div>
            
            <!-- 后备内容 -->
            <div class="error-message">
                <p>无法加载展览数据。请稍后再试。</p>
            </div>
            
            <div class="hero-image-container">
                <div class="hero-image-scroll" id="heroImageScroll">
                    <div class="hero-image-item">
                        <img src="img/exhibition/1.png" alt="Exhibition: Embodied Memories" title="Click to enlarge" onclick="openLightbox(this)">
                        <div class="hero-image-caption">Exhibition overview: Embodied Memories</div>
                    </div>
                </div>
            </div>
            
            <div class="text-content">
                <p>Initial Research presents <strong>Embodied Memories: Tracing Asian Diaspora Through Material Culture</strong>, a group exhibition exploring how artists of Asian diaspora use material culture to navigate complex identities and histories.</p>
            </div>`;
        
        // 初始化图片滚动
        initScrollIndicators();
    }
}

// 渲染展览内容
function renderExhibition(data) {
    // 获取主内容容器
    const container = document.getElementById('exhibition-content');
    
    // 构建展览标题部分
    let html = `
        <div class="exhibition-heading">
            <h1>${data.title}</h1>
            <p>${data.date_range}</p>
        </div>`;
    
    // 构建图片滚动部分
    html += `
        <div class="hero-image-container">
            <div class="scroll-arrow scroll-left" onclick="scrollImages('left')">←</div>
            <div class="scroll-arrow scroll-right" onclick="scrollImages('right')">→</div>
            
            <div class="hero-image-scroll" id="heroImageScroll">`;
    
    // 添加所有图片
    data.images.forEach((image, index) => {
        html += `
                <div class="hero-image-item">
                    <img src="${image.url}" alt="${image.alt || data.title}" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">${image.caption || ''}</div>
                </div>`;
    });
    
    html += `
            </div>
            
            <!-- 分页点 -->
            <div class="pagination-dots" id="paginationDots">`;
    
    // 添加与图片数量相同的点
    data.images.forEach((_, index) => {
        html += `<div class="pagination-dot ${index === 0 ? 'active' : ''}" onclick="scrollToImage(${index})"></div>`;
    });
    
    html += `
            </div>
        </div>`;
    
    // 添加文本内容
    html += `
        <div class="text-content">`;
    
    // 将description分割成段落
    const paragraphs = data.description.split('\n\n');
    paragraphs.forEach(paragraph => {
        html += `<p>${paragraph}</p>`;
    });
    
    html += `
        </div>`;
    
    // 添加下载按钮（如果有）
    if (data.pdf_url) {
        html += `
        <div class="action-buttons">
            <a href="${data.pdf_url}" class="download-button">download exhibition pdf</a>
        </div>`;
    }
    
    // 设置HTML内容
    container.innerHTML = html;
    
    // 初始化滚动功能
    initScrollIndicators();
    updatePaginationDots();
}

// 初始化滚动指示器
function initScrollIndicators() {
    const scrollContainer = document.getElementById('heroImageScroll');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', function() {
            // 滚动时更新分页点
            updatePaginationDots();
        });
    }
}

// 根据当前图片更新分页点
function updatePaginationDots() {
    const dots = document.querySelectorAll('.pagination-dot');
    const currentIndex = getCurrentImageIndex();
    
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function scrollImages(direction) {
    const scrollContainer = document.getElementById('heroImageScroll');
    if (!scrollContainer) return;
    
    const items = scrollContainer.querySelectorAll('.hero-image-item');
    const currentIndex = getCurrentImageIndex();
    
    let targetIndex;
    if (direction === 'left') {
        targetIndex = Math.max(0, currentIndex - 1);
    } else {
        targetIndex = Math.min(items.length - 1, currentIndex + 1);
    }
    
    scrollToImage(targetIndex);
}

function getCurrentImageIndex() {
    const scrollContainer = document.getElementById('heroImageScroll');
    if (!scrollContainer) return 0;
    
    const items = scrollContainer.querySelectorAll('.hero-image-item');
    const scrollPosition = scrollContainer.scrollLeft;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
        const containerCenter = scrollPosition + (scrollContainer.offsetWidth / 2);
        const distance = Math.abs(itemCenter - containerCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });
    
    return closestIndex;
}

function scrollToImage(index) {
    const scrollContainer = document.getElementById('heroImageScroll');
    if (!scrollContainer) return;
    
    const items = scrollContainer.querySelectorAll('.hero-image-item');
    
    if (items[index]) {
        const targetItem = items[index];
        const targetPosition = targetItem.offsetLeft - ((scrollContainer.offsetWidth - targetItem.offsetWidth) / 2);
        scrollContainer.scrollTo({ left: targetPosition, behavior: 'smooth' });
        
        // 立即更新分页点
        updatePaginationDots();
    }
}

// 灯箱功能
function openLightbox(img) {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

// 添加键盘支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        scrollImages('left');
    } else if (e.key === 'ArrowRight') {
        scrollImages('right');
    }
});

// 自动屏幕大小调整处理
window.addEventListener('resize', function() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav) {
        const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
        
        // 如果调整为桌面宽度，关闭移动导航
        if (window.innerWidth > 768) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            allMobileNavItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    }
    
    // 调整大小时更新分页点
    updatePaginationDots();
});

// DOM准备就绪时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 桌面下拉菜单切换功能
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdown = item.querySelector('.dropdown');
        
        if (link && dropdown) {
            // 处理有下拉菜单的导航项的切换
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 关闭所有其他下拉菜单
                navItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // 切换当前下拉菜单
                item.classList.toggle('active');
            });
        } else if (link) {
            // 处理没有下拉菜单的直接导航
            link.addEventListener('click', function(e) {
                // 不阻止默认行为
                // href 将处理导航
                
                // 点击直接链接时关闭所有下拉菜单
                navItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
            });
        }
    });
    
    
   // 点击外部时关闭下拉菜单
    document.addEventListener('click', function(e) {
        const isNavClick = e.target.closest('.nav-item');
        const isMobileNavClick = e.target.closest('.mobile-nav');
        
        if (!isNavClick && !isMobileNavClick) {
            navItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // 从JSON文件加载展览数据
    loadExhibitionData();
    
    // 点击外部时关闭移动导航
    document.addEventListener('click', function(e) {
        const mobileNav = document.getElementById('mobileNav');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (mobileNav && hamburger && !hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            // 点击外部时关闭所有移动下拉菜单
            const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
            allMobileNavItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
});