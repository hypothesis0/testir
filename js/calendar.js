// 主导航功能
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

// 将从JSON加载
let events = [];

// 函数来加载事件数据
async function loadEventData() {
    try {
        console.log('正在尝试加载日历数据');
        const response = await fetch('/calendar-data.json');
        
        if (!response.ok) {
            throw new Error(`无法获取日历数据: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('成功加载日历数据:', data);
        
        // 将日期字符串转换为Date对象
        events = data.events.map(event => {
            return {
                ...event,
                date: new Date(event.date)
            };
        });
        
        // 使用加载的事件初始化日历
        initializeCalendar();
        
    } catch (error) {
        console.error('加载日历数据时出错:', error);
        
        // 如果加载失败，回退到示例数据
        console.log('使用备用事件数据');
        events = [
            { 
                id: 1, 
                date: new Date('2025-05-20T23:59:59.999-04:00'),
                title: "Summer Exhibition Opening",
                displayDate: "05.20.25",
                subtitle: "exhibition",
                image: "img/upcomings/1.jpg",
                timeDisplay: "6pm to 9pm",
                description: "Join us for the opening reception of our Summer Exhibition featuring works by emerging artists exploring themes of ecology, community, and speculative futures. The exhibition brings together paintings, sculptures, video installations, and interactive works that envision alternative ways of being in relation to our environment and each other. Refreshments will be served.",
                rsvpLink: "https://example.com/rsvp/summer-exhibition"
            },
            { 
                id: 2, 
                date: new Date('2025-05-25T23:59:59.999-04:00'), 
                title: "Artist Talk: Maria Garcia",
                displayDate: "05.25.25",
                subtitle: "lecture",
                image: "img/upcomings/2.jpg",
                timeDisplay: "7pm to 8:30pm",
                description: "Acclaimed artist Maria Garcia discusses her recent work examining the intersection of digital technology and traditional craft practices. Garcia will present her methodology and research process, followed by a Q&A session. This talk is presented in collaboration with the Digital Arts Foundation and is part of our ongoing series on contemporary art practices.",
                rsvpLink: "https://example.com/rsvp/maria-garcia-talk"
            },
            { 
                id: 3, 
                date: new Date('2025-07-22T23:59:59.999-04:00'), 
                title: "Experimental Film Night",
                displayDate: "07.22.25",
                subtitle: "screening",
                image: "img/upcomings/1.jpg",
                timeDisplay: "8pm to 10pm",
                description: "A curated selection of experimental short films by international filmmakers pushing the boundaries of the medium. The program includes works that explore non-narrative structures, alternative production techniques, and expanded cinema practices. Each screening will be followed by a brief discussion led by film curator Alex Wong.",
                rsvpLink: "https://example.com/rsvp/experimental-film"
            }
        ];
        
        // 使用备用数据初始化日历
        initializeCalendar();
    }
}

// 设置详细视图的函数
function setupDetailView() {
    const upcomingRows = document.querySelectorAll('#upcoming-table tr');
    const pastRows = document.querySelectorAll('#past-table tr');
    const detailView = document.getElementById('event-details');
    const mobilePopup = document.getElementById('mobile-popup-overlay');
    const mobilePopupContent = document.getElementById('mobile-popup-content');
    const closeButton = document.getElementById('close-detail');
    const mobileCloseButton = document.getElementById('mobile-close-button');
    
    // 检查是否在移动设备上
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // 显示事件详情的函数
    function showEventDetails(event) {
        // 从数组中获取随机颜色
        const colorsData = document.querySelector('.rectangle-colors').getAttribute('data-colors');
        const colors = JSON.parse(colorsData);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 格式化日期
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = event.date.toLocaleDateString('en-US', options);
        
        if (isMobile()) {
            // 移动弹窗
            const mobileDetailTitle = document.getElementById('mobile-detail-title');
            const mobileDetailSubtitle = document.getElementById('mobile-detail-subtitle');
            const mobileDetailImage = document.getElementById('mobile-detail-image');
            const mobileDetailDate = document.getElementById('mobile-detail-date');
            const mobileDetailTime = document.getElementById('mobile-detail-time');
            const mobileDetailDescription = document.getElementById('mobile-detail-description');
            const mobileRsvpButton = document.getElementById('mobile-rsvp-button');
            
            mobileDetailTitle.textContent = event.title;
            mobileDetailSubtitle.textContent = event.subtitle;
            mobileDetailImage.src = event.image;
            mobileDetailImage.alt = event.title;
            mobileDetailDate.textContent = formattedDate;
            mobileDetailTime.textContent = event.timeDisplay;
            mobileDetailDescription.textContent = event.description;
            
            // 为弹窗边框应用随机颜色
            mobilePopupContent.style.borderColor = randomColor;
            
            // 以弹性布局显示移动弹窗以进行居中
            mobilePopup.style.display = 'flex';
            
            // RSVP按钮事件监听器（先移除任何现有的）
            mobileRsvpButton.replaceWith(mobileRsvpButton.cloneNode(true));
            const newMobileRsvpButton = document.getElementById('mobile-rsvp-button');
            newMobileRsvpButton.addEventListener('click', function() {
                if (event.rsvpLink) {
                    window.open(event.rsvpLink, '_blank');
                } else {
                    alert('感谢您对' + event.title + '的RSVP！我们将通过电子邮件发送更多详细信息。');
                }
            });
        } else {
            // 桌面详细视图
            const detailTitle = document.getElementById('detail-title');
            const detailSubtitle = document.getElementById('detail-subtitle');
            const detailImage = document.getElementById('detail-image');
            const detailDate = document.getElementById('detail-date');
            const detailTime = document.getElementById('detail-time');
            const detailDescription = document.getElementById('detail-description');
            const rsvpButton = document.getElementById('rsvp-button');
            
            // 立即隐藏悬停效果
            document.getElementById('rectangle-1').style.opacity = '0';
            
            detailTitle.textContent = event.title;
            detailSubtitle.textContent = event.subtitle;
            detailImage.src = event.image;
            detailImage.alt = event.title;
            detailDate.textContent = formattedDate;
            detailTime.textContent = event.timeDisplay;
            detailDescription.textContent = event.description;
            detailView.style.backgroundColor = randomColor;
            
            // 显示详细视图
            setTimeout(function() {
                detailView.style.display = 'flex';
            }, 10);
            
            // RSVP按钮事件监听器（先移除任何现有的）
            rsvpButton.replaceWith(rsvpButton.cloneNode(true));
            const newRsvpButton = document.getElementById('rsvp-button');
            newRsvpButton.addEventListener('click', function() {
                if (event.rsvpLink) {
                    window.open(event.rsvpLink, '_blank');
                } else {
                    alert('感谢您对' + event.title + '的RSVP！我们将通过电子邮件发送更多详细信息。');
                }
            });
        }
    }
    
    // 为每个即将到来的事件行设置点击事件
    upcomingRows.forEach(row => {
        const eventId = row.getAttribute('data-rectangle');
        const event = events.find(e => e.id == eventId);
        
        if (event) {
            row.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showEventDetails(event);
            });
        }
    });
    
    // 为每个过去的事件行设置点击事件（重定向到外部链接）
    pastRows.forEach(row => {
        const eventId = row.getAttribute('data-rectangle');
        const event = events.find(e => e.id == eventId);
        
        if (event && event.link) {
            row.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.open(event.link, '_blank');
            });
            
            row.style.cursor = 'pointer';
            row.setAttribute('title', 'Click to view more details');
        }
    });
    
    // 关闭按钮事件监听器
    closeButton.addEventListener('click', function() {
        detailView.style.display = 'none';
        document.getElementById('rectangle-1').style.opacity = '0';
    });
    
    // 点击关闭按钮时关闭移动弹窗
    mobileCloseButton.addEventListener('click', function() {
        mobilePopup.style.display = 'none';
    });
    
    // 点击覆盖背景时关闭移动弹窗
    mobilePopup.addEventListener('click', function(e) {
        if (e.target === mobilePopup) {
            mobilePopup.style.display = 'none';
        }
    });
}

// 获取纽约时区当前日期和时间的函数
function getCurrentNYDateTime() {
    // 获取纽约时区的当前日期
    const now = new Date();
    return new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
}

// 初始化页面的函数
function initializeCalendar() {
    const nowNY = getCurrentNYDateTime(); // 获取纽约时区的当前日期时间
    
    // 将事件分为即将到来和过去的
    const upcomingEvents = events.filter(event => {
        return nowNY <= event.date; // 如果当前时间在事件结束前，则事件即将到来
    });
    
    const pastEvents = events.filter(event => {
        return nowNY > event.date; // 如果当前时间在事件结束后，则事件已过去
    }).sort((a, b) => b.date - a.date); // 按最近的先排序
    
    // 填充表格
    populateEventTable('upcoming-table', upcomingEvents);
    populateEventTable('past-table', pastEvents);
    
    // 如果需要，显示"无事件"消息
    document.getElementById('no-upcoming').style.display = upcomingEvents.length === 0 ? 'block' : 'none';
    document.getElementById('no-past').style.display = pastEvents.length === 0 ? 'block' : 'none';
    
    // 为标签切换添加事件监听器
    const upcomingTab = document.getElementById('upcoming-tab');
    const pastTab = document.getElementById('past-tab');
    const upcomingContainer = document.getElementById('upcoming-container');
    const pastContainer = document.getElementById('past-container');
    const sectionTitle = document.getElementById('section-title');
    
    // 显示即将到来事件的函数
    function showUpcoming() {
        upcomingContainer.style.display = 'block';
        pastContainer.style.display = 'none';
        upcomingTab.classList.add('active');
        upcomingTab.classList.remove('inactive');
        pastTab.classList.add('inactive');
        pastTab.classList.remove('active');
        sectionTitle.textContent = 'UPCOMING';
    }
    
    // 显示过去事件的函数
    function showPast() {
        upcomingContainer.style.display = 'none';
        pastContainer.style.display = 'block';
        upcomingTab.classList.add('inactive');
        upcomingTab.classList.remove('active');
        pastTab.classList.add('active');
        pastTab.classList.remove('inactive');
        sectionTitle.textContent = 'PAST';
    }
    
    // 标签的点击处理程序
    upcomingTab.addEventListener('click', showUpcoming);
    pastTab.addEventListener('click', showPast);
    
    // 设置事件行的悬停效果
    setupHoverEffects();
    
    // 设置详细视图的点击
    setupDetailView();
}

// 填充事件表格的函数
function populateEventTable(tableId, eventsList) {
    const tableBody = document.getElementById(tableId).querySelector('tbody');
    tableBody.innerHTML = '';
    
    eventsList.forEach(event => {
        const row = document.createElement('tr');
        row.setAttribute('data-rectangle', event.id);
        
        const dateCell = document.createElement('td');
        dateCell.className = 'date-column';
        dateCell.textContent = event.displayDate;
        
        const titleCell = document.createElement('td');
        titleCell.className = 'title-column';
        titleCell.textContent = event.title;
        
        row.appendChild(dateCell);
        row.appendChild(titleCell);
        tableBody.appendChild(row);
    });
}

// 设置悬停效果的函数
function setupHoverEffects() {
    const tableRows = document.querySelectorAll('.programs-table tr');
    const rectangle = document.getElementById('rectangle-1');
    
    // 从数据属性获取颜色
    const colorsData = document.querySelector('.rectangle-colors').getAttribute('data-colors');
    const colors = JSON.parse(colorsData);
    
    tableRows.forEach(row => {
        const eventId = row.getAttribute('data-rectangle');
        const event = events.find(e => e.id == eventId);
        
        if (event) {
            row.addEventListener('mouseenter', function() {
                // 仅在桌面上显示悬停效果，且详细视图未显示
                if (window.innerWidth > 768 && document.getElementById('event-details').style.display !== 'flex') {
                    // 设置事件详情
                    const eventTitle = rectangle.querySelector('.event-title h2');
                    const eventSubtitle = rectangle.querySelector('.event-title h3');
                    const eventImage = rectangle.querySelector('.event-image');
                    const eventDateElement = rectangle.querySelector('.event-date p:first-child');
                    const eventTimeElement = rectangle.querySelector('.event-date p:last-child');
                    
                    eventTitle.textContent = event.title;
                    eventSubtitle.textContent = event.subtitle;
                    eventImage.src = event.image;
                    eventImage.alt = event.title;
                    
                    // 格式化日期
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    eventDateElement.textContent = event.date.toLocaleDateString('en-US', options);
                    eventTimeElement.textContent = event.timeDisplay;
                    
                    // 从数组中获取随机颜色
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    // 设置矩形的背景颜色
                    rectangle.style.backgroundColor = randomColor;
                    
                    // 显示矩形
                    rectangle.style.opacity = '1';
                }
            });
            
            row.addEventListener('mouseleave', function() {
                // 仅在桌面上隐藏悬停效果，且详细视图未显示
                if (window.innerWidth > 768 && document.getElementById('event-details').style.display !== 'flex') {
                    // 不悬停时隐藏矩形
                    rectangle.style.opacity = '0';
                }
            });
        }
    });
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
    
    // 从JSON文件加载事件数据
    loadEventData();
    
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