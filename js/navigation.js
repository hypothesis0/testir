// navigation.js - 修复版本，解决页面访问问题

// 主导航加载器
async function loadNavigation() {
    try {
        // 尝试从CMS加载导航数据
        const response = await fetch('/navigation-data.json');
        
        if (!response.ok) {
            throw new Error('Failed to fetch navigation data');
        }
        
        const navData = await response.json();
        console.log('从CMS加载导航数据:', navData);
        
        // 生成并插入导航HTML
        document.body.insertAdjacentHTML('afterbegin', generateNavigationHTML(navData));
        
        // 插入页脚
        insertFooter();
        
        // 设置事件监听器
        setupNavigationEvents();
        
    } catch (error) {
        console.error('CMS导航加载失败，使用默认导航:', error);
        loadDefaultNavigation();
    }
}

// 从CMS数据生成HTML
function generateNavigationHTML(navData) {
    let desktopNavItems = '';
    let mobileNavItems = '';
    
    (navData.nav_items || []).forEach((item, index) => {
        if (!item.visible) return;
        
        const itemId = `nav-item-${index}`;
        
        if (item.direct_link) {
            // 简单链接项（无下拉菜单）
            desktopNavItems += `
                <div class="nav-item">
                    <a href="${item.direct_link}" onclick="navigateToPage('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
            
            mobileNavItems += `
                <div class="mobile-nav-item">
                    <a href="${item.direct_link}" onclick="navigateToPage('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
        } else if (item.dropdown_items && item.dropdown_items.length > 0) {
            // 下拉菜单项
            let dropdownLinks = '';
            let mobileDropdownLinks = '';
            
            item.dropdown_items.forEach((dropItem, dropIndex) => {
                if (!dropItem.visible) return;
                
                dropdownLinks += `
                    <a href="${dropItem.link}" class="dropdown-link" 
                       data-item-id="${itemId}-${dropIndex}"
                       onclick="navigateToPage('${dropItem.link}', event)">
                        ${dropItem.label}
                    </a>
                `;
                
                mobileDropdownLinks += `
                    <a href="${dropItem.link}" class="mobile-dropdown-link"
                       data-item-id="${itemId}-${dropIndex}"
                       onclick="navigateToPage('${dropItem.link}', event)">
                        ${dropItem.label}
                    </a>
                `;
            });
            
            if (dropdownLinks) {
                desktopNavItems += `
                    <div class="nav-item" data-item-id="${itemId}">
                        <a href="#" class="dropdown-toggle">${item.label}</a>
                        <div class="dropdown">
                            <div class="dropdown-container">
                                ${dropdownLinks}
                            </div>
                        </div>
                    </div>
                `;
                
                mobileNavItems += `
                    <div class="mobile-nav-item" data-item-id="${itemId}">
                        <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                            ${item.label}
                            <span class="mobile-arrow">ᵥ</span>
                        </a>
                        <div class="mobile-dropdown">
                            ${mobileDropdownLinks}
                        </div>
                    </div>
                `;
            }
        }
    });
    
    return `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="goToHomepage()" style="cursor: pointer;">${navData.site_title || 'initial research'}</h1>
            </div>
            <nav class="nav-top">
                ${desktopNavItems}
            </nav>
            
            <!-- 移动端汉堡菜单 -->
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <!-- 移动端导航菜单 -->
            <div class="mobile-nav" id="mobileNav">
                ${mobileNavItems}
            </div>
        </div>
    `;
}

// 智能页面导航函数
window.navigateToPage = function(url, event) {
    if (event) {
        event.preventDefault();
    }
    
    // 如果URL为空或只是#，不执行导航
    if (!url || url === '#') {
        return false;
    }
    
    console.log('正在导航到:', url);
    
    // 检查URL是否存在（简单检查）
    checkAndNavigate(url);
};

// 检查页面是否存在并导航
async function checkAndNavigate(url) {
    try {
        // 对于相对路径，先尝试直接导航
        if (!url.startsWith('http')) {
            // 构建完整URL用于检查
            const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
            const fullUrl = new URL(url, baseUrl + '/').href;
            
            // 尝试fetch检查页面是否存在
            const response = await fetch(fullUrl, { method: 'HEAD' });
            
            if (response.ok) {
                window.location.href = url;
            } else {
                console.warn(`页面不存在: ${url}`);
                showPageNotFoundMessage(url);
            }
        } else {
            // 外部链接直接导航
            window.location.href = url;
        }
    } catch (error) {
        console.error('导航检查失败:', error);
        // 如果检查失败，仍然尝试导航（可能是CORS问题）
        window.location.href = url;
    }
}

// 显示页面未找到消息
function showPageNotFoundMessage(url) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        text-align: center;
        font-family: 'Space Grotesk', Arial, sans-serif;
    `;
    
    message.innerHTML = `
        <h3 style="color: #ff6b6b; margin: 0 0 10px 0;">页面未找到</h3>
        <p style="margin: 0 0 15px 0;">无法访问: ${url}</p>
        <button onclick="this.parentElement.remove()" style="
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        ">关闭</button>
    `;
    
    document.body.appendChild(message);
    
    // 3秒后自动移除消息
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 3000);
}

// 插入页脚（保持不变）
function insertFooter() {
    const footer = `
        <footer style="
            margin-top: auto;
            width: 100%;
            background-color: rgb(180, 180, 180);
            padding: 10px 0;
            text-align: center;
            font-family: 'Space Grotesk', Helvetica, Arial, sans-serif;
            font-size: 16px;
            font-weight: 300;
            color: rgb(23, 23, 23);
            z-index: 1;
        ">
            124 Gallery Street, New York, NY 10001
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footer);
}

// 如果CMS加载失败，使用默认导航
function loadDefaultNavigation() {
    const defaultNav = `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="goToHomepage()" style="cursor: pointer;">initial research</h1>
            </div>
            <nav class="nav-top">
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">program</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="calendar.html" onclick="navigateToPage('calendar.html', event)">calendar</a>
                            <a href="fellowship.html" onclick="navigateToPage('fellowship.html', event)">fellowship</a>
                            <a href="communityhours.html" onclick="navigateToPage('communityhours.html', event)">community hours</a>
                            <a href="seasonaldinner.html" onclick="navigateToPage('seasonaldinner.html', event)">seasonal dinner</a>
                            <a href="exhibition.html" onclick="navigateToPage('exhibition.html', event)">exhibitions</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">about</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="../about/mission.html" onclick="navigateToPage('../about/mission.html', event)">mission</a>
                            <a href="../about/vision.html" onclick="navigateToPage('../about/vision.html', event)">vision</a>
                            <a href="../about/team.html" onclick="navigateToPage('../about/team.html', event)">team</a>
                            <a href="../about/contact.html" onclick="navigateToPage('../about/contact.html', event)">contact</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="supportus.html" onclick="navigateToPage('supportus.html', event)">support us</a>
                </div>
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                        program
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="calendar.html" onclick="navigateToPage('calendar.html', event)">calendar</a>
                        <a href="fellowship.html" onclick="navigateToPage('fellowship.html', event)">fellowship</a>
                        <a href="communityhours.html" onclick="navigateToPage('communityhours.html', event)">community hours</a>
                        <a href="seasonaldinner.html" onclick="navigateToPage('seasonaldinner.html', event)">seasonal dinner</a>
                        <a href="exhibition.html" onclick="navigateToPage('exhibition.html', event)">exhibitions</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                        about
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="../about/mission.html" onclick="navigateToPage('../about/mission.html', event)">mission</a>
                        <a href="../about/vision.html" onclick="navigateToPage('../about/vision.html', event)">vision</a>
                        <a href="../about/team.html" onclick="navigateToPage('../about/team.html', event)">team</a>
                        <a href="../about/contact.html" onclick="navigateToPage('../about/contact.html', event)">contact</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="../supportus/supportus.html" onclick="navigateToPage('../supportus/supportus.html', event)">support us</a>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', defaultNav);
    setupNavigationEvents();
}

// 导航事件设置
function setupNavigationEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            // 桌面端悬停行为
            if (window.innerWidth > 768) {
                item.addEventListener('mouseenter', () => {
                    document.querySelectorAll('.nav-item').forEach(i => {
                        if (i !== item) i.classList.remove('active');
                    });
                    item.classList.add('active');
                });
                
                item.addEventListener('mouseleave', () => {
                    item.classList.remove('active');
                });
            }
            
            // 点击行为（桌面端和移动端）
            const toggle = item.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item').forEach(i => {
                        if (i !== item) i.classList.remove('active');
                    });
                    item.classList.toggle('active');
                    e.stopPropagation();
                });
            }
        }
    });
    
    // 点击外部时关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && 
            !e.target.closest('.mobile-nav') && 
            !e.target.closest('.hamburger-menu')) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // 移动端导航切换
    window.toggleMobileNav = function() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav.style.display === 'flex' || mobileNav.classList.contains('show')) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        } else {
            mobileNav.style.display = 'flex';
            mobileNav.classList.add('show');
        }
    };
    
    // 移动端下拉菜单切换
    window.toggleMobileDropdown = function(e, element) {
        e.preventDefault();
        const navItem = element.parentElement;
        const dropdown = navItem.querySelector('.mobile-dropdown');
        
        if (!dropdown) return;
        
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            if (item !== navItem) item.classList.remove('active');
        });
        
        navItem.classList.toggle('active');
    };
    
    // 点击外部时关闭移动端导航
    document.addEventListener('click', (e) => {
        const mobileNav = document.getElementById('mobileNav');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (!hamburger?.contains(e.target) && !mobileNav?.contains(e.target)) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
        const mobileNav = document.getElementById('mobileNav');
        if (window.innerWidth > 768) {
            mobileNav.style.display = 'none';
            mobileNav.classList.remove('show');
            document.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// 首页导航 - 改进版本
window.goToHomepage = function() {
    // 尝试多种可能的首页路径
    const possiblePaths = [
        '../index.html',
        '../../index.html',
        '/index.html',
        '/'
    ];
    
    // 根据当前路径智能选择
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    if (pathSegments.length <= 1) {
        // 已在根目录或一级目录
        navigateToPage('index.html');
    } else if (pathSegments.length === 2) {
        // 在二级目录
        navigateToPage('../index.html');
    } else {
        // 在更深的目录
        navigateToPage('../../index.html');
    }
};

// DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', loadNavigation);