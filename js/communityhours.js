// 主页面导航
function goToHomepage() {
    window.location.href = '../index.html';
}

// 移动导航功能
// Mobile navigation functions
function toggleMobileNav() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav) {
        console.log("Toggle mobile menu", mobileNav.style.display, mobileNav.classList.contains('show'));
        
        if (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show')) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            // Close all mobile dropdowns when closing nav
            const allMobileNavItems = document.querySelectorAll('.mobile-nav-item');
            allMobileNavItems.forEach(item => {
                item.classList.remove('active');
            });
        } else {
            mobileNav.style.display = 'flex';
            mobileNav.classList.add('show');
        }
    } else {
        console.error("Mobile nav element not found!");
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

// 从JSON加载社区活动数据
async function loadCommunityHoursData() {
    try {
        console.log('正在尝试加载社区活动数据');
        const response = await fetch('/communityhours-data.json');
        
        if (!response.ok) {
            throw new Error(`无法获取社区活动数据: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('成功加载社区活动数据:', data);
        
        // 渲染社区活动内容
        renderCommunityHours(data);
        
    } catch (error) {
        console.error('加载社区活动数据时出错:', error);
        
        // 如果加载失败，显示错误消息并使用后备内容
        document.getElementById('community-hours-content').innerHTML = `
            <div class="section">
                <h2>Community Hours</h2>
                <p class="hours">11:00 am– 4:00 pm</p>
                <p>
                    Join us on Wednesdays and Thursdays, from 11:00am-4:00pm, during our regular community hours at IR. The space is open for work, meetings, and intimate weekday programs. WiFi, a growing book collection, and tea are all provided. No RSVP required, stop by and say hi!
                </p>
            </div>`;
    }
}

// 渲染社区活动内容
function renderCommunityHours(data) {
    // 获取主内容容器
    const container = document.getElementById('community-hours-content');
    
    // 构建HTML内容
    let html = '';
    
    // 添加主要部分
    html += `
        <div class="section">
            <h2>${data.title || 'Community Hours'}</h2>
            <p class="hours">${data.hours || ''}</p>`;
    
    // 将description分割成段落
    const paragraphs = data.description ? data.description.split('\n\n') : [];
    paragraphs.forEach(paragraph => {
        html += `<p>${paragraph}</p>`;
    });
    
    html += `</div>`;
    
    // 添加额外部分（如果有）
    if (data.additional_sections && data.additional_sections.length > 0) {
        data.additional_sections.forEach(section => {
            html += `
            <div class="section">
                <h2>${section.title || ''}</h2>`;
            
            // 如果有"hours"字段
            if (section.hours) {
                html += `<p class="hours">${section.hours}</p>`;
            }
            
            // 将section.content分割成段落
            const sectionParagraphs = section.content ? section.content.split('\n\n') : [];
            sectionParagraphs.forEach(paragraph => {
                html += `<p>${paragraph}</p>`;
            });
            
            html += `</div>`;
        });
    }
    
    // 设置HTML内容
    container.innerHTML = html;
}

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
    
    // 从JSON文件加载社区活动数据
    loadCommunityHoursData();
    
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