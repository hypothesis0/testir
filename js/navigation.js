// navigation-complete-fix.js - 完整的导航修复方案

// 替换原有的 navigation.js 文件
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
        
    } catch (error) {
        console.error('CMS导航加载失败，使用默认导航:', error);
        loadDefaultNavigation();
    }
    
    // 总是插入页脚和设置事件
    insertFooter();
    setupNavigationEvents();
    
    // 初始化智能导航
    initializeSmartNavigation();
}

// 从CMS数据生成HTML
function generateNavigationHTML(navData) {
    let desktopNavItems = '';
    let mobileNavItems = '';
    
    (navData.nav_items || []).forEach((item, index) => {
        if (!item.visible) return;
        
        const itemId = `nav-item-${index}`;
        
        if (item.direct_link) {
            desktopNavItems += `
                <div class="nav-item">
                    <a href="${item.direct_link}" onclick="return smartNavigate('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
            
            mobileNavItems += `
                <div class="mobile-nav-item">
                    <a href="${item.direct_link}" onclick="return smartNavigate('${item.direct_link}', event)">${item.label}</a>
                </div>
            `;
        } else if (item.dropdown_items && item.dropdown_items.length > 0) {
            let dropdownLinks = '';
            let mobileDropdownLinks = '';
            
            item.dropdown_items.forEach((dropItem, dropIndex) => {
                if (!dropItem.visible) return;
                
                dropdownLinks += `
                    <a href="${dropItem.link}" class="dropdown-link" 
                       onclick="return smartNavigate('${dropItem.link}', event)">
                        ${dropItem.label}
                    </a>
                `;
                
                mobileDropdownLinks += `
                    <a href="${dropItem.link}" class="mobile-dropdown-link"
                       onclick="return smartNavigate('${dropItem.link}', event)">
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
                <h1 onclick="smartGoHome()" style="cursor: pointer;">${navData.site_title || 'initial research'}</h1>
            </div>
            <nav class="nav-top">
                ${desktopNavItems}
            </nav>
            
            <div class="hamburger-menu" onclick="toggleMobileNav()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="mobile-nav" id="mobileNav">
                ${mobileNavItems}
            </div>
        </div>
    `;
}

// 加载默认导航（根据实际文件结构修复）
function loadDefaultNavigation() {
    const defaultNav = `
        <div class="top-banner">
            <div class="title-container">
                <h1 onclick="smartGoHome()" style="cursor: pointer;">initial research</h1>
            </div>
            <nav class="nav-top">
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">program</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="program/calendar.html" onclick="return smartNavigate('program/calendar.html', event)">calendar</a>
                            <a href="program/fellowship.html" onclick="return smartNavigate('program/fellowship.html', event)">fellowship</a>
                            <a href="program/communityhours.html" onclick="return smartNavigate('program/communityhours.html', event)">community hours</a>
                            <a href="program/seasonaldinner.html" onclick="return smartNavigate('program/seasonaldinner.html', event)">seasonal dinner</a>
                            <a href="program/exhibition.html" onclick="return smartNavigate('program/exhibition.html', event)">exhibitions</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="#" class="dropdown-toggle">about</a>
                    <div class="dropdown">
                        <div class="dropdown-container">
                            <a href="about/mission.html" onclick="return smartNavigate('about/mission.html', event)">mission</a>
                            <a href="about/vision.html" onclick="return smartNavigate('about/vision.html', event)">vision</a>
                            <a href="about/team.html" onclick="return smartNavigate('about/team.html', event)">team</a>
                            <a href="about/contact.html" onclick="return smartNavigate('about/contact.html', event)">contact</a>
                        </div>
                    </div>
                </div>
                
                <div class="nav-item">
                    <a href="supportus/supportus.html" onclick="return smartNavigate('supportus/supportus.html', event)">support us</a>
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
                        <a href="program/calendar.html" onclick="return smartNavigate('program/calendar.html', event)">calendar</a>
                        <a href="program/fellowship.html" onclick="return smartNavigate('program/fellowship.html', event)">fellowship</a>
                        <a href="program/communityhours.html" onclick="return smartNavigate('program/communityhours.html', event)">community hours</a>
                        <a href="program/seasonaldinner.html" onclick="return smartNavigate('program/seasonaldinner.html', event)">seasonal dinner</a>
                        <a href="program/exhibition.html" onclick="return smartNavigate('program/exhibition.html', event)">exhibitions</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="#" class="mobile-dropdown-toggle" onclick="toggleMobileDropdown(event, this)">
                        about
                        <span class="mobile-arrow">ᵥ</span>
                    </a>
                    <div class="mobile-dropdown">
                        <a href="about/mission.html" onclick="return smartNavigate('about/mission.html', event)">mission</a>
                        <a href="about/vision.html" onclick="return smartNavigate('about/vision.html', event)">vision</a>
                        <a href="about/team.html" onclick="return smartNavigate('about/team.html', event)">team</a>
                        <a href="about/contact.html" onclick="return smartNavigate('about/contact.html', event)">contact</a>
                    </div>
                </div>
                
                <div class="mobile-nav-item">
                    <a href="supportus/supportus.html" onclick="return smartNavigate('supportus/supportus.html', event)">support us</a>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', defaultNav);
}

// 智能导航系统
let pathCache = new Map();
let isNavigating = false;

async function smartNavigate(targetPath, event) {
    if (event) {
        event.preventDefault();
    }
    
    if (!targetPath || targetPath === '#' || isNavigating) {
        return false;
    }
    
    isNavigating = true;
    console.log(`🧭 智能导航到: ${targetPath}`);
    
    try {
        // 检查缓存
        if (pathCache.has(targetPath)) {
            const cachedPath = pathCache.get(targetPath);
            console.log(`📋 使用缓存: ${cachedPath}`);
            window.location.href = cachedPath;
            return false;
        }
        
        // 尝试找到正确路径
        const workingPath = await findWorkingPath(targetPath);
        
        if (workingPath) {
            pathCache.set(targetPath, workingPath);
            console.log(`✅ 找到路径: ${workingPath}`);
            window.location.href = workingPath;
        } else {
            showNavigationError(targetPath);
        }
        
    } catch (error) {
        console.error('导航错误:', error);
        showNavigationError(targetPath);
    } finally {
        isNavigating = false;
    }
    
    return false;
}

// 查找可用路径
async function findWorkingPath(targetPath) {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(s => s);
    
    let possiblePaths = [];
    
    // 根据当前路径深度生成可能的路径
    if (pathSegments.length <= 1) {
        // 在根目录或一级目录
        possiblePaths = [
            targetPath,
            `./${targetPath}`,
            `pages/${targetPath}`,
            `src/${targetPath}`
        ];
    } else if (pathSegments.length === 2) {
        // 在二级目录
        possiblePaths = [
            targetPath,
            `../${targetPath}`,
            `./${targetPath}`,
            `../../${targetPath}`
        ];
    } else {
        // 在更深的目录
        possiblePaths = [
            targetPath,
            `../${targetPath}`,
            `../../${targetPath}`,
            `../../../${targetPath}`,
            `./${targetPath}`
        ];
    }
    
    // 添加绝对路径尝试
    possiblePaths.push(`/${targetPath}`);
    
    // 如果路径包含子目录，尝试不同的组合
    if (targetPath.includes('/')) {
        const parts = targetPath.split('/');
        possiblePaths.push(parts[parts.length - 1]); // 只取文件名
        
        // 尝试不同的基础路径
        for (let i = 0; i < pathSegments.length; i++) {
            const basePath = '../'.repeat(i);
            possiblePaths.push(`${basePath}${targetPath}`);
        }
    }
    
    // 测试每个可能的路径
    for (const path of possiblePaths) {
        try {
            console.log(`🔍 测试路径: ${path}`);
            const response = await fetch(path, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                console.log(`✅ 路径有效: ${path}`);
                return path;
            }
        } catch (error) {
            // 继续测试下一个路径
            console.log(`❌ 路径无效: ${path}`);
        }
    }
    
    return null;
}

// 智能首页导航
async function smartGoHome() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(s => s);
    
    let homePaths = [];
    
    // 根据当前位置生成首页路径
    if (pathSegments.length <= 1) {
        homePaths = ['index.html', '/', './index.html'];
    } else {
        homePaths = [
            '../'.repeat(pathSegments.length - 1) + 'index.html',
            '../'.repeat(pathSegments.length) + 'index.html',
            '/',
            '/index.html'
        ];
    }
    
    for (const path of homePaths) {
        try {
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
                window.location.href = path;
                return;
            }
        } catch (error) {
            // 继续尝试下一个路径
        }
    }
    
    // 如果都找不到，去根路径
    window.location.href = '/';
}

// 显示导航错误
function showNavigationError(targetPath) {
    // 移除现有的错误消息
    const existingError = document.querySelector('.nav-error-modal');
    if (existingError) {
        existingError.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'nav-error-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            text-align: center;
            font-family: 'Space Grotesk', Arial, sans-serif;
            box-shadow: 0 12px 48px rgba(0,0,0,0.25);
            transform: scale(0.9);
            animation: modalPop 0.3s ease forwards;
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <h2 style="color: #ff6b6b; margin: 0 0 16px 0; font-size: 24px;">页面未找到</h2>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 16px;">
                无法访问: <strong style="color: #333;">${targetPath}</strong>
            </p>
            <p style="margin: 0 0 24px 0; color: #888; font-size: 14px;">
                页面可能不存在或路径不正确
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button onclick="diagnoseNavigation()" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    🔧 诊断问题
                </button>
                <button onclick="smartGoHome(); this.closest('.nav-error-modal').remove();" style="
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    🏠 返回首页
                </button>
                <button onclick="this.closest('.nav-error-modal').remove()" style="
                    background: linear-gradient(135deg, #9E9E9E, #757575);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    ✕ 关闭
                </button>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes modalPop {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // 3秒后自动显示建议
    setTimeout(() => {
        if (modal.parentElement) {
            const suggestion = modal.querySelector('div').querySelector('p:last-of-type');
            if (suggestion) {
                suggestion.innerHTML = '💡 提示：检查文件是否存在，或点击"诊断问题"获取详细信息';
                suggestion.style.color = '#4CAF50';
            }
        }
    }, 3000);
}

// 诊断导航问题
async function diagnoseNavigation() {
    const modal = document.createElement('div');
    modal.className = 'diagnosis-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 700px;
            width: 90%;
            margin: 20px;
            font-family: 'Space Grotesk', Arial, sans-serif;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <div style="font-size: 32px; margin-right: 12px;">🔧</div>
                <h2 style="color: #2196F3; margin: 0;">导航诊断工具</h2>
            </div>
            
            <div id="diagnosis-content" style="margin-bottom: 24px;">
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 24px; animation: spin 1s linear infinite;">⚙️</div>
                    <p style="margin-top: 16px; color: #666;">正在诊断导航问题...</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button onclick="this.closest('.diagnosis-modal').remove()" style="
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">关闭</button>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // 开始诊断
    setTimeout(async () => {
        const result = await runDiagnosis();
        displayDiagnosisResult(result);
    }, 1000);
}

// 运行诊断
async function runDiagnosis() {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    const pathSegments = currentPath.split('/').filter(s => s);
    
    // 根据实际文件结构测试页面
    const testPages = [
        'index.html',
        'program/calendar.html',
        'program/fellowship.html',
        'program/communityhours.html',
        'program/seasonaldinner.html',
        'program/exhibition.html',
        'supportus/supportus.html',
        'about/mission.html',
        'about/vision.html',
        'about/team.html',
        'about/contact.html'
    ];
    
    const foundPages = [];
    const missingPages = [];
    
    for (const page of testPages) {
        const workingPath = await findWorkingPath(page);
        if (workingPath) {
            foundPages.push({ original: page, working: workingPath });
        } else {
            missingPages.push(page);
        }
    }
    
    return {
        currentPath,
        currentUrl,
        pathSegments: pathSegments.length,
        foundPages,
        missingPages,
        suggestions: generateSuggestions(foundPages, missingPages, pathSegments)
    };
}

// 生成建议
function generateSuggestions(foundPages, missingPages, pathDepth) {
    const suggestions = [];
    
    if (foundPages.length === 0) {
        suggestions.push({
            type: 'error',
            icon: '🚨',
            title: '严重问题',
            message: '没有找到任何页面文件，请检查项目结构是否正确'
        });
    } else if (missingPages.length > foundPages.length) {
        suggestions.push({
            type: 'warning',
            icon: '⚠️',
            title: '文件缺失',
            message: `有 ${missingPages.length} 个页面文件缺失，请检查这些文件是否存在`
        });
    } else {
        suggestions.push({
            type: 'success',
            icon: '✅',
            title: '基本正常',
            message: `找到了 ${foundPages.length} 个页面，导航应该可以正常工作`
        });
    }
    
    if (pathDepth > 2) {
        suggestions.push({
            type: 'info',
            icon: '📁',
            title: '路径深度',
            message: '当前在深层目录中，可能需要调整相对路径'
        });
    }
    
    suggestions.push({
        type: 'tip',
        icon: '💡',
        title: '调试提示',
        message: '在URL后添加 ?debug=true 可以开启调试模式'
    });
    
    return suggestions;
}

// 显示诊断结果
function displayDiagnosisResult(result) {
    const content = document.getElementById('diagnosis-content');
    if (!content) return;
    
    content.innerHTML = `
        <div style="margin-bottom: 24px;">
            <h3 style="color: #333; margin-bottom: 12px;">📊 诊断结果</h3>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 4px 0;"><strong>当前路径:</strong> ${result.currentPath}</p>
                <p style="margin: 4px 0;"><strong>目录深度:</strong> ${result.pathSegments} 层</p>
                <p style="margin: 4px 0;"><strong>找到页面:</strong> ${result.foundPages.length} 个</p>
                <p style="margin: 4px 0;"><strong>缺失页面:</strong> ${result.missingPages.length} 个</p>
            </div>
        </div>
        
        ${result.foundPages.length > 0 ? `
        <div style="margin-bottom: 24px;">
            <h4 style="color: #4CAF50; margin-bottom: 12px;">✅ 找到的页面</h4>
            <div style="max-height: 200px; overflow-y: auto;">
                ${result.foundPages.map(p => `
                    <div style="padding: 8px; background: #f0f8f0; margin: 4px 0; border-radius: 4px; font-size: 14px;">
                        <strong>${p.original}</strong> → <code>${p.working}</code>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${result.missingPages.length > 0 ? `
        <div style="margin-bottom: 24px;">
            <h4 style="color: #ff6b6b; margin-bottom: 12px;">❌ 缺失的页面</h4>
            <div style="max-height: 150px; overflow-y: auto;">
                ${result.missingPages.map(p => `
                    <div style="padding: 8px; background: #fff0f0; margin: 4px 0; border-radius: 4px; font-size: 14px;">
                        ${p}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 24px;">
            <h4 style="color: #2196F3; margin-bottom: 12px;">💡 建议和提示</h4>
            ${result.suggestions.map(s => `
                <div style="padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid ${getSuggestionColor(s.type)}; background: ${getSuggestionBg(s.type)};">
                    <div style="font-weight: 500; margin-bottom: 4px;">
                        ${s.icon} ${s.title}
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        ${s.message}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 获取建议颜色
function getSuggestionColor(type) {
    const colors = {
        error: '#f44336',
        warning: '#ff9800',
        success: '#4caf50',
        info: '#2196f3',
        tip: '#9c27b0'
    };
    return colors[type] || '#666';
}

function getSuggestionBg(type) {
    const backgrounds = {
        error: '#ffebee',
        warning: '#fff3e0',
        success: '#e8f5e8',
        info: '#e3f2fd',
        tip: '#f3e5f5'
    };
    return backgrounds[type] || '#f5f5f5';
}

// 设置导航事件
function setupNavigationEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const dropdown = item.querySelector('.dropdown');
        if (dropdown) {
            // 桌面端悬停
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
            
            // 点击切换
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
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item') && 
            !e.target.closest('.mobile-nav') && 
            !e.target.closest('.hamburger-menu')) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

// 移动端导航
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

// 插入页脚
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

// 初始化智能导航
function initializeSmartNavigation() {
    // 全局函数
    window.smartNavigate = smartNavigate;
    window.smartGoHome = smartGoHome;
    window.diagnoseNavigation = diagnoseNavigation;
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+D 诊断
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            diagnoseNavigation();
        }
        
        // Ctrl+Shift+H 回首页
        if (e.ctrlKey && e.shiftKey && e.key === 'H') {
            e.preventDefault();
            smartGoHome();
        }
    });
    
    // 自动诊断（调试模式）
    if (window.location.search.includes('debug=true')) {
        setTimeout(diagnoseNavigation, 1000);
    }
    
    console.log('🚀 智能导航系统已启动');
    console.log('💡 快捷键: Ctrl+Shift+D (诊断), Ctrl+Shift+H (首页)');
}

// 初始化
document.addEventListener('DOMContentLoaded', loadNavigation);
