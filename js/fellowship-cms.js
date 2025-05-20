// 此脚本用于从CMS生成的数据动态构建研究员列表
document.addEventListener('DOMContentLoaded', function() {
    // 初始化功能
    setupNavigation();
    setupExpandableRows();
    initCarousels();
});

// 设置导航功能
function setupNavigation() {
    // 桌面导航功能
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdown = item.querySelector('.dropdown');
        
        if (dropdown) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', function(e) {
        const isNavClick = e.target.closest('.nav-item');
        const isMobileNavClick = e.target.closest('.mobile-nav');
        
        if (!isNavClick && !isMobileNavClick) {
            navItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// 设置可展开行
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
            
            pauseAllCarousels();
            
            if (!isActive) {
                this.classList.add('active');
                expandedRow.classList.add('active');
                expandedContent.classList.add('active');
                activeExpansion = fellowId;
                
                setTimeout(() => {
                    const newCarousels = expandedContent.querySelectorAll('.image-carousel');
                    newCarousels.forEach(carousel => {
                        initSpecificCarousel(carousel);
                    });
                    scrollToExpandedContent(expandedRow);
                }, 100);
            } else {
                activeExpansion = null;
            }
            
            event.stopPropagation();
        });
    });
    
    // 处理关闭按钮
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
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
            
            activeExpansion = null;
            pauseAllCarousels();
            
            event.stopPropagation();
        });
    });
}

// 轮播图功能
const carousels = new Map();
let carouselIntervals = new Map();

function initCarousels() {
    const carouselElements = document.querySelectorAll('.image-carousel');
    carouselElements.forEach(carousel => {
        initSpecificCarousel(carousel);
    });
}

function initSpecificCarousel(carouselElement) {
    const carouselId = carouselElement.dataset.carousel;
    if (!carouselId) return;
    
    const slides = carouselElement.querySelectorAll('.carousel-slide');
    const dots = carouselElement.querySelectorAll('.carousel-dot');
    
    if (slides.length <= 1) return;
    
    carousels.set(carouselId, {
        currentSlide: 0,
        totalSlides: slides.length,
        element: carouselElement
    });
    
    updateCarousel(carouselId);
    startAutoSwipe(carouselId);
}

function updateCarousel(carouselId) {
    const carousel = carousels.get(carouselId);
    if (!carousel) return;
    
    const slides = carousel.element.querySelectorAll('.carousel-slide');
    const dots = carousel.element.querySelectorAll('.carousel-dot');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === carousel.currentSlide);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === carousel.currentSlide);
    });
}

function startAutoSwipe(carouselId) {
    const carousel = carousels.get(carouselId);
    if (!carousel || carousel.totalSlides <= 1) return;
    
    pauseAutoSwipe(carouselId);
    
    const interval = setInterval(() => {
        carousel.currentSlide = (carousel.currentSlide + 1) % carousel.totalSlides;
        updateCarousel(carouselId);
    }, 4000);
    
    carouselIntervals.set(carouselId, interval);
}

function pauseAutoSwipe(carouselId) {
    const interval = carouselIntervals.get(carouselId);
    if (interval) {
        clearInterval(interval);
        carouselIntervals.delete(carouselId);
    }
}

function pauseAllCarousels() {
    carouselIntervals.forEach((interval, carouselId) => {
        clearInterval(interval);
    });
    carouselIntervals.clear();
}

function goToSlide(carouselId, slideIndex) {
    const carousel = carousels.get(carouselId);
    if (!carousel) return;
    
    carousel.currentSlide = slideIndex;
    updateCarousel(carouselId);
    
    pauseAutoSwipe(carouselId);
    startAutoSwipe(carouselId);
}

function scrollToExpandedContent(expandedRow) {
    if (!expandedRow.classList.contains('active')) return;
    
    const rect = expandedRow.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - 100;
    
    window.scrollTo({
        top: targetY,
        behavior: 'smooth'
    });
}

// 移动导航函数
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show')) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    } else {
        mobileNav.style.display = 'flex';
        mobileNav.classList.add('show');
    }
}

function toggleMobileDropdown(event, element) {
    event.preventDefault();
    const navItem = element.parentElement;
    
    const dropdown = navItem.querySelector('.mobile-dropdown');
    if (!dropdown) {
        return;
    }
    
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    allMobileNavItems.forEach(item => {
        if (item !== navItem) {
            item.classList.remove('active');
        }
    });
    
    navItem.classList.toggle('active');
}

// 窗口调整大小时处理
window.addEventListener('resize', function() {
    const mobileNav = document.getElementById('mobileNav');
    const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    if (window.innerWidth > 768) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    }
});

// 点击外部关闭移动导航
document.addEventListener('click', function(e) {
    const mobileNav = document.getElementById('mobileNav');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.style.display = 'none';
        mobileNav.classList.remove('show');
        const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
        allMobileNavItems.forEach(item => {
            item.classList.remove('active');
        });
    }
});