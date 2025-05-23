// 获取URL参数中的展览ID - 支持query参数和hash
function getExhibitionIdFromUrl() {
    console.log('Getting exhibition ID from URL...');
    
    // 首先尝试从URL参数获取 (?id=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');
    
    // 然后尝试从hash获取 (#exhibition-name)
    const hash = window.location.hash.substring(1); // 移除#号
    
    console.log('URL search string:', window.location.search);
    console.log('URL hash:', window.location.hash);
    console.log('Query ID:', queryId);
    console.log('Hash ID:', hash);
    
    // 优先使用query参数，如果没有则使用hash
    const finalId = queryId || hash || null;
    console.log('Final exhibition ID:', finalId);
    
    return finalId;
}

// 监听hash变化，当用户在archive页面点击不同展览时
window.addEventListener('hashchange', function() {
    console.log('Hash changed, reloading exhibition');
    loadExhibitionData();
});

// 在archive页面中使用的函数
function navigateToExhibition(slug, fromArchive = false) {
    if (fromArchive) {
        // 从archive页面来的，使用hash URL
        window.location.hash = slug;
        // 如果在同一页面，手动触发加载
        if (window.location.pathname.includes('exhibition.html')) {
            loadExhibitionData();
        } else {
            // 如果在其他页面，跳转到exhibition页面
            window.location.href = `exhibition.html#${slug}`;
        }
    } else {
        // 从列表页面来的，使用query参数
        window.location.href = `exhibition.html?id=${slug}`;
    }
}

async function loadExhibitionData() {
    try {
        console.log('=== EXHIBITION DEBUG START ===');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // 获取URL中的展览ID
        const exhibitionId = getExhibitionIdFromUrl();
        console.log('Parsed exhibition ID:', exhibitionId);
        
        if (!exhibitionId) {
            console.log('No exhibition ID found, will show default exhibition');
        }
        
        // 加载展览管理数据
        let response;
        const possiblePaths = [
            './exhibitions-manager.json',
            '../exhibitions-manager.json',
            '/exhibitions-manager.json',
            'exhibitions-manager.json'
        ];
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying to load: ${path}`);
                const tempResponse = await fetch(path);
                if (tempResponse.ok) {
                    response = tempResponse;
                    console.log(`✓ Successfully loaded from: ${path}`);
                    break;
                }
            } catch (err) {
                console.log(`✗ Failed to load ${path}: ${err.message}`);
            }
        }
        
        if (!response || !response.ok) {
            console.log('Could not load exhibitions manager data, using static content');
            renderStaticExhibition();
            return;
        }
        
        const managerData = await response.json();
        console.log('Raw manager data:', managerData);
        
        const exhibitions = managerData.exhibitions || [];
        console.log('Number of exhibitions found:', exhibitions.length);
        console.log('All exhibition slugs:', exhibitions.map(ex => ex.slug));
        
        let exhibition;
        
        if (exhibitionId) {
            // 查找指定的展览
            console.log(`Looking for exhibition with slug: "${exhibitionId}"`);
            exhibition = exhibitions.find(ex => {
                console.log(`Comparing "${ex.slug}" with "${exhibitionId}"`);
                return ex.slug === exhibitionId;
            });
            
            if (!exhibition) {
                console.log(`✗ Exhibition "${exhibitionId}" not found`);
                console.log('Available exhibitions:', exhibitions.map(ex => ({
                    title: ex.title,
                    slug: ex.slug
                })));
                renderNotFound(exhibitionId);
                return;
            } else {
                console.log(`✓ Found exhibition: "${exhibition.title}"`);
            }
        } else {
            // 显示默认展览（第一个可见的，按order排序）
            const visibleExhibitions = exhibitions
                .filter(ex => ex.show_in_list !== false)
                .sort((a, b) => (a.order || 999) - (b.order || 999));
            
            exhibition = visibleExhibitions[0];
            console.log('Using default exhibition:', exhibition ? exhibition.title : 'none');
            
            if (!exhibition) {
                console.log('No exhibitions available');
                renderNoExhibition();
                return;
            }
        }
        
        console.log('Final exhibition to render:', {
            title: exhibition.title,
            slug: exhibition.slug,
            order: exhibition.order
        });
        
        // 渲染展览内容
        renderExhibition(exhibition);
        console.log('=== EXHIBITION DEBUG END ===');
        
    } catch (error) {
        console.error('Error in loadExhibitionData:', error);
        renderStaticExhibition();
    }
}

// 渲染展览内容
function renderExhibition(data) {
    console.log("=== RENDERING EXHIBITION ===");
    console.log("Exhibition data:", data);
    console.log("Exhibition title:", data.title);
    console.log("Exhibition slug:", data.slug);
    
    // 更新页面标题和URL
    if (data.title) {
        document.title = `Initial Research - ${data.title}`;
        
        // 更新URL但不刷新页面（仅当使用hash时）
        if (window.location.hash && data.slug) {
            const newUrl = `${window.location.pathname}#${data.slug}`;
            window.history.replaceState({}, '', newUrl);
        }
    }
    
    // 获取主内容容器
    const container = document.getElementById('exhibition-content');
    
    // 构建HTML内容
    let html = `
        <div class="exhibition-heading">
            <h1>${data.title || 'Exhibition'}</h1>
            <p>${data.date_range || ''}</p>
        </div>`;
    
    // 构建图片滚动部分
    html += `
        <div class="hero-image-container">
            <div class="scroll-arrow scroll-left" onclick="scrollImages('left')">←</div>
            <div class="scroll-arrow scroll-right" onclick="scrollImages('right')">→</div>
            
            <div class="hero-image-scroll" id="heroImageScroll">`;
    
    // 添加所有图片
    if (data.images && data.images.length > 0) {
        console.log(`Found ${data.images.length} images to display`);
        data.images.forEach((image, index) => {
            console.log(`Processing image ${index + 1}:`, image);
            html += `
                <div class="hero-image-item">
                    <img src="${image.url}" alt="${image.alt || data.title}" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">${image.caption || ''}</div>
                </div>`;
        });
    } else {
        console.log("No images found in data, using placeholder");
        html += `
            <div class="hero-image-item">
                <img src="img/exhibition/placeholder.jpg" alt="No image available" title="No image available">
                <div class="hero-image-caption">No images available</div>
            </div>`;
    }
    
    html += `
            </div>
            
            <!-- 分页点 -->
            <div class="pagination-dots" id="paginationDots">`;
    
    // 添加与图片数量相同的点
    const imageCount = data.images ? data.images.length : 1;
    for (let i = 0; i < imageCount; i++) {
        html += `<div class="pagination-dot ${i === 0 ? 'active' : ''}" onclick="scrollToImage(${i})"></div>`;
    }
    
    html += `
            </div>
        </div>`;
    
    // 添加文本内容
    html += `
        <div class="text-content">`;
    
    if (data.description) {
        const paragraphs = data.description.split('\n\n');
        paragraphs.forEach(paragraph => {
            const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            html += `<p>${formattedParagraph}</p>`;
        });
    } else {
        html += `<p>No description available</p>`;
    }
    
    html += `</div>`;
    
    // 添加下载按钮（只有在有PDF文件时才显示）
    if (data.pdf_file && data.pdf_file.trim() !== '') {
        console.log("Adding PDF download button with file:", data.pdf_file);
        html += `<div class="action-buttons">`;
        html += `<a href="${data.pdf_file}" class="download-button" target="_blank">${data.pdf_button_text || 'download exhibition pdf'}</a>`;
        html += `</div>`;
    } else {
        console.log("No PDF file found, not showing download button");
        // 完全不显示按钮区域
    }
    
    // 设置HTML内容
    container.innerHTML = html;
    
    console.log("Exhibition rendered successfully");
    
    // 初始化滚动功能
    initScrollIndicators();
    addTouchSwipeSupport();
}

// 渲染静态展览内容（作为后备方案）
function renderStaticExhibition() {
    console.log("Rendering static exhibition content");
    document.getElementById('exhibition-content').innerHTML = `
        <div class="exhibition-heading">
            <h1>Embodied Memories</h1>
            <p>April 15 - June 30, 2025</p>
        </div>
        
        <div class="hero-image-container">
            <div class="scroll-arrow scroll-left" onclick="scrollImages('left')">←</div>
            <div class="scroll-arrow scroll-right" onclick="scrollImages('right')">→</div>
            
            <div class="hero-image-scroll" id="heroImageScroll">
                <div class="hero-image-item">
                    <img src="img/exhibition/1.png" alt="Exhibition: Embodied Memories" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">Exhibition overview: Embodied Memories</div>
                </div>
                
                <div class="hero-image-item">
                    <img src="img/exhibition/2.jpg" alt="Sowon Kwon, 'Inherited Patterns'" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">Sowon Kwon, "Inherited Patterns" (2024)</div>
                </div>
                
                <div class="hero-image-item">
                    <img src="img/exhibition/3.jpg" alt="Nini Dongnier, 'Ancestral Objects'" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">Nini Dongnier, "Ancestral Objects" (2024)</div>
                </div>
                
                <div class="hero-image-item">
                    <img src="img/exhibition/4.jpg" alt="Yu Ji & Ho King Man, 'Intergenerational Dialogue'" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">Yu Ji & Ho King Man, "Intergenerational Dialogue" (2023)</div>
                </div>
                
                <div class="hero-image-item">
                    <img src="img/exhibition/5.jpg" alt="Patty Chang, 'Memory Objects'" title="Click to enlarge" onclick="openLightbox(this)">
                    <div class="hero-image-caption">Patty Chang, "Memory Objects" (2023)</div>
                </div>
            </div>
            
            <!-- Pagination dots for mobile -->
            <div class="pagination-dots" id="paginationDots">
                <div class="pagination-dot active" onclick="scrollToImage(0)"></div>
                <div class="pagination-dot" onclick="scrollToImage(1)"></div>
                <div class="pagination-dot" onclick="scrollToImage(2)"></div>
                <div class="pagination-dot" onclick="scrollToImage(3)"></div>
                <div class="pagination-dot" onclick="scrollToImage(4)"></div>
            </div>
        </div>
        
        <!-- Text content -->
        <div class="text-content">
            <p>Initial Research presents <strong>Embodied Memories: Tracing Asian Diaspora Through Material Culture</strong>, a group exhibition exploring how artists of Asian diaspora use material culture to navigate complex identities and histories. The exhibition features works that examine cultural artifacts, family heirlooms, and everyday objects as repositories of memory, migration, and cultural transmission.</p>
            
            <p>Through diverse media including sculpture, photography, video, and installation, participating artists investigate how material objects become vessels for intergenerational knowledge, cultural preservation, and identity formation in diaspora communities.</p>
            
            <p>The exhibition considers how material objects become charged with cultural meaning and personal history, especially in the context of migration and diaspora. By working with and through objects—whether family heirlooms, cultural artifacts, or everyday items—the artists highlight how material culture serves as a tangible link to ancestral homelands, cultural heritage, and familial histories.</p>
        </div>
        
        <!-- Download PDF button (only if PDF exists) -->
        <div class="action-buttons">
            <a href="#" class="download-button">download exhibition pdf</a>
        </div>
    `;
    
    // Initialize scroll indicators and pagination for the static content
    initScrollIndicators();
    updatePaginationDots();
}

// 渲染"无展览"页面
function renderNoExhibition() {
    document.getElementById('exhibition-content').innerHTML = `
        <div class="exhibition-heading">
            <h1>No Current Exhibition</h1>
            <p>Check back soon for upcoming exhibitions</p>
        </div>
        
        <div class="text-content">
            <p>There are currently no exhibitions available. Please check back later or <a href="exhibitionlist.html">view all exhibitions</a>.</p>
        </div>
    `;
}

// 渲染"未找到展览"页面
function renderNotFound(exhibitionId) {
    document.getElementById('exhibition-content').innerHTML = `
        <div class="exhibition-heading">
            <h1>Exhibition Not Found</h1>
            <p>The exhibition "${exhibitionId}" was not found</p>
        </div>
        
        <div class="text-content">
            <p>The requested exhibition could not be found. Please <a href="exhibitionlist.html">return to exhibitions list</a> to view available exhibitions.</p>
        </div>
    `;
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

// Add touch swipe support for the image scroll
function addTouchSwipeSupport() {
    const scrollContainer = document.getElementById('heroImageScroll');
    if (!scrollContainer) return;
    
    let startX, startY, isDragging = false;
    
    scrollContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });
    
    scrollContainer.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        
        // Check if the user is scrolling horizontally
        const deltaX = startX - touchX;
        const deltaY = startY - touchY;
        
        // If scrolling more horizontally than vertically, prevent the default page scroll
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    scrollContainer.addEventListener('touchend', function(e) {
        isDragging = false;
    }, { passive: true });
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

// 获取当前图片索引
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

// 滚动到指定图片
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

// 滚动到指定索引的图片
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
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// 关闭灯箱
function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
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

// DOM准备就绪时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded, initializing exhibition page");
    
    // 从管理数据中加载展览数据
    loadExhibitionData();
});