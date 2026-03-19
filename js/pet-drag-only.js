// 纯JavaScript实现的宠物动画控制器
(function() {
    'use strict';
    
    // 检测是否为手机浏览器 - 简化版本，提高兼容性
function isMobileBrowser() {
    try {
        // 仅使用可靠的userAgent检测，避免使用可能导致错误的API
        const userAgent = navigator.userAgent || '';
        const userAgentLower = userAgent.toLowerCase();
        
        // 只检测最常见的移动设备关键词，但排除VIVO浏览器（因为它在桌面模式下仍包含移动关键词）
        const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod'];
        
        // 检查是否包含移动关键词且不是VIVO浏览器
        const hasMobileKeyword = mobileKeywords.some(keyword => userAgentLower.includes(keyword));
        const isVivoBrowser = userAgentLower.includes('vivobrowser');
        
        // 如果包含移动关键词且不是VIVO浏览器，则认为是手机浏览器
        return hasMobileKeyword && !isVivoBrowser;
    } catch (error) {
        // 如果检测过程中发生错误，默认返回false，确保页面能正常加载

        return false;
    }
}
    
    // 尝试初始化宠物控制器，使用try-catch包裹整个初始化过程
    try {
        // 如果是手机浏览器，直接返回，不初始化宠物控制器
        if (isMobileBrowser()) {
            
            return;
        }
        
        // 检查是否已经初始化过，避免重复初始化
        if (window.PetController) {
            // 如果已经初始化，先清理旧实例
            if (typeof window.PetController.cleanupResources === 'function') {
                window.PetController.cleanupResources();
            }
            // 移除旧实例
            delete window.PetController;
        }
        
        // 检查设置是否显示宠物，不显示则直接返回
        // 首先检查localStorage中的设置，避免依赖SettingsManager的初始化顺序
        var showPet = true;
        try {
            // 使用localStorageManager获取设置，确保统一处理
            if (window.localStorageManager) {
                var savedSettings = window.localStorageManager.getItem('petSettings');
                if (savedSettings) {
                    showPet = savedSettings.showPetByDefault !== false;
                }
            }
        } catch (error) {
            console.error('Failed to check pet settings:', error);
        }
        
        if (!showPet) {
            
            return;
        }
        
        
    } catch (error) {
        console.error('Failed to initialize pet controller:', error);
        return; // 发生任何错误都直接返回，确保页面能正常加载
    }
    
    // 宠物控制对象
    const PetController = {
        // 状态变量
        state: 'stand', // stand, talk, run, dance
        direction: 'right', // right, left
        autoMove: true,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        // 初始位置设为底部（DOM加载后设置）
        currentX: 50,
        currentY: 50,
        speed: 2,
        // 上次状态，用于防止连续说彩虹屁
        lastState: 'stand',
        // 跳舞动画变量
        danceFrameIndex: 0, // 跳舞帧索引
        // 严格按照用户要求的顺序设计跳舞序列：左右站立 → 右左张嘴 → 左右跑步 → 右左站立...
        danceSequence: [
            { direction: 'left', action: 'normal' },   // 左站立
            { direction: 'right', action: 'normal' },  // 右站立
            { direction: 'right', action: 'open_mouth' }, // 右张嘴
            { direction: 'left', action: 'open_mouth' },  // 左张嘴
            { direction: 'left', action: 'run' },      // 左跑步
            { direction: 'right', action: 'run' },     // 右跑步
            { direction: 'right', action: 'normal' },  // 右站立
            { direction: 'left', action: 'normal' }    // 左站立
        ], // 严格按照用户要求顺序设计的跳舞序列
        danceInterval: 150, // 跳舞帧切换间隔（毫秒），每150ms切换一次动作，提高流畅度
        lastDanceFrameChange: 0, // 上次跳舞帧切换时间
        // 动画变量
        isRunningFrame: false,
        lastFrameChange: 0,
        frameInterval: 150, // 每150ms切换一次帧，平衡流畅度和速度
        
        // DOM元素
        container: null,
        pet: null,
        speechBubble: null,
        // 右键菜单
        contextMenu: null,
        // 定时器ID
        autoMoveInterval: null,
        autoStateChangeInterval: null,
        animationInterval: null,
        idleTimer: null, // 空闲检测定时器
        maxIdleTime: 180000, // 最大空闲时间（3分钟）
        // 说话状态标志
        isSpeakingPageContent: false, // 是否正在说页面相关内容
        
        // 预加载所有动画图片
        preloadImages: function() {
            const imagePaths = [
                'animation/left.webp',
                'animation/left_open_mouth.webp',
                'animation/left_run.webp',
                'animation/right.webp',
                'animation/right_open_mouth.webp',
                'animation/right_run.webp'
            ];
            
            // 创建图片缓存对象，存储已加载的图片
            this.imageCache = this.imageCache || {};
            
            // 预加载所有图片并存储到缓存中
            const loadPromises = imagePaths.map(path => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        // 将加载完成的图片存储到缓存
                        this.imageCache[path] = img;
                        resolve();
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image: ${path}`);
                        resolve(); // 即使加载失败也继续
                    };
                    img.src = path;
                });
            });
            
            // 返回Promise，用于等待所有图片加载完成
            return Promise.all(loadPromises);
        },
        
        // 初始化
        init: function() {
            try {
                
                
                // 移除旧的petHidden逻辑，统一使用新的设置系统
                
                // 彩虹屁相关初始化
                this.usedRainbowPhrases = new Set(); // 已使用的彩虹屁集合，用于去重
                this.rainbowCache = []; // 彩虹屁缓存数组
                this.cacheSize = 2; // 减少缓存大小，降低初始网络请求
                
                // 添加统计相关变量
                this.mouseClickCount = 0; // 鼠标点击次数
                this.pageLoadTime = Date.now(); // 页面加载时间
                
                // 预加载所有动画图片，等待加载完成后再创建宠物元素
                this.preloadImages().then(() => {
                    // 延迟创建宠物元素，减少对LCP的影响
                    setTimeout(() => {
                        // 创建并设置宠物元素
                        this.createPetElements();
                        
                        // 所有图片加载完成后，设置初始背景图片
                        if (this.imageCache && this.imageCache['animation/right.webp']) {
                            this.pet.style.backgroundImage = `url('animation/right.webp')`;
                        }
                        
                        // 应用设置：根据默认显示设置控制宠物显示状态
                        if (window.SettingsManager) {
                            if (!window.SettingsManager.getSetting('showPetByDefault')) {
                                this.container.style.display = 'none';
                            } else {
                                // 确保宠物显示
                                this.container.style.display = 'block';
                            }
                        } else {
                            // 默认显示宠物
                            this.container.style.display = 'block';
                        }
                        
                        // 添加拖动功能
                        this.addDragFunctionality();
                        
                        // 启动动画定时器，确保所有状态的动画都能持续更新
                        this.startAnimation();
                        
                        // DOM加载完成后，设置初始位置为底部
                        this.setInitialPosition();
                        
                        // 页面加载完成后，宠物说提示语
                        setTimeout(() => {
                            // 根据当前时间生成问候语
                            const getGreeting = () => {
                                const hour = new Date().getHours();
                                if (hour < 6) return '凌晨好';
                                if (hour < 12) return '早上好';
                                if (hour < 18) return '下午好';
                                return '晚上好';
                            };
                            const greeting = getGreeting();
                            this.speak('<span style="color: red; font-weight: bold;">重点：</span>' + greeting + '，非官方选型工具，型号和描述以官网资料为准', 5000, true);
                        }, 1000);
                        
                        // 启动自动移动和状态切换
                        this.startAutoMove();
                        this.startAutoStateChange();
                        
                        // 启动空闲检测定时器
                        this.resetIdleTimer();
                        
                        // 添加页面切换事件监听
                        this.addPageChangeListener();
                        
                        // 添加鼠标点击事件监听
                        this.handleMouseClick = () => {
                            this.mouseClickCount++;
                        };
                        document.addEventListener('click', this.handleMouseClick);
                        
                        // 添加每隔5分钟说统计信息的定时器
                        this.statisticsInterval = setInterval(() => {
                            this.speakStatistics();
                        }, 5 * 60 * 1000); // 5分钟
                        
                        // 保存事件监听器引用，方便移除
                        this.handlePageChange = (event) => this.speak(event.detail?.page || 'main');
                        this.handleShowFilterResults = (event) => this.speak(`已为您筛选出符合条件的${event.detail?.productType || '产品'}产品！`, 2500);
                        this.handleModalOpen = (event) => {
                            const productType = event.detail?.productType || '产品';
                            let speechText = '';
                            switch(productType.toLowerCase()) {
                                case 'hmi': speechText = 'HMI人机界面筛选弹窗已打开，您可以选择筛选条件。'; break;
                                case 'plc': speechText = 'PLC控制器筛选弹窗已打开，您可以根据需求选择参数。'; break;
                                case 'servo': speechText = '伺服系统筛选弹窗已打开，您可以选择适合的伺服产品。'; break;
                                case 'inverter': speechText = '变频器筛选弹窗已打开，您可以筛选不同规格的变频器。'; break;
                                case 'io': speechText = 'IO模块筛选弹窗已打开，您可以选择适合的IO模块。'; break;
                                case 'outdoorio': speechText = '柜外IO模块筛选弹窗已打开，您可以选择适合的柜外IO模块。'; break;
                                default: speechText = '筛选弹窗已打开，您可以选择筛选条件。';
                            }
                            this.speak(speechText, 3500);
                        };
                    }, 100); // 延迟100ms创建宠物元素，减少对LCP的影响
                    
                    // 延迟更新缓存，减少初始网络请求
                    setTimeout(() => {
                        this.updateRainbowCache();
                    }, 2000); // 延迟2秒更新缓存
                });
                
            } catch (error) {
                
                // 清理资源，避免内存泄漏
                try {
                    // 清理已创建的DOM元素
                    if (this.container && this.container.parentNode) {
                        this.container.parentNode.removeChild(this.container);
                    }
                    if (this.contextMenu && this.contextMenu.parentNode) {
                        this.contextMenu.parentNode.removeChild(this.contextMenu);
                    }
                    // 清理已设置的定时器
                    if (this.autoMoveInterval) clearInterval(this.autoMoveInterval);
                    if (this.autoStateChangeInterval) clearInterval(this.autoStateChangeInterval);
                    if (this.animationInterval) cancelAnimationFrame(this.animationInterval);
                    if (this.statisticsInterval) clearInterval(this.statisticsInterval);
                } catch (cleanupError) {
                }
                return false; // 初始化失败
            }
        },
        
        // 公共资源清理方法
        cleanupResources: function() {
            // 清理所有定时器
            if (this.autoMoveInterval) {
                clearInterval(this.autoMoveInterval);
                this.autoMoveInterval = null;
            }
            if (this.autoStateChangeInterval) {
                clearInterval(this.autoStateChangeInterval);
                this.autoStateChangeInterval = null;
            }
            if (this.animationInterval) {
                cancelAnimationFrame(this.animationInterval);
                this.animationInterval = null;
            }
            if (this.statisticsInterval) {
                clearInterval(this.statisticsInterval);
                this.statisticsInterval = null;
            }
            
            // 移除所有事件监听器
            if (this.handlePageChange) {
                document.removeEventListener('pageChange', this.handlePageChange);
            }
            if (this.handleShowFilterResults) {
                document.removeEventListener('showFilterResults', this.handleShowFilterResults);
            }
            if (this.handleModalOpen) {
                document.removeEventListener('modalOpen', this.handleModalOpen);
            }
            if (this.handleMouseClick) {
                document.removeEventListener('click', this.handleMouseClick);
            }
            if (this._handleMouseMove) {
                document.removeEventListener('mousemove', this._handleMouseMove);
            }
            if (this._handleDoubleClick) {
                document.removeEventListener('dblclick', this._handleDoubleClick);
            }
            if (this.idleTimer) {
                clearTimeout(this.idleTimer);
                this.idleTimer = null;
            }
            
            // 移除鼠标和触摸事件监听器
            if (this.container) {
                // 移除鼠标事件监听器
                if (this._handleDragStart) {
                    this.container.removeEventListener('mousedown', this._handleDragStart);
                    document.removeEventListener('mousemove', this._handleDragMove);
                    document.removeEventListener('mouseup', this._handleDragEnd);
                    document.removeEventListener('mouseleave', this._handleDragEnd);
                }
                if (this._handleClick) {
                    this.container.removeEventListener('click', this._handleClick);
                }
                
                // 移除触摸事件监听器
                if (this._handleDragStart) {
                    this.container.removeEventListener('touchstart', this._handleDragStart);
                    document.removeEventListener('touchmove', this._handleDragMove);
                    document.removeEventListener('touchend', this._handleDragEnd);
                    document.removeEventListener('touchcancel', this._handleDragEnd);
                }
                if (this._handleClick) {
                    this.container.removeEventListener('touchend', this._handleClick);
                }
                
                // 移除右键菜单事件监听器
                if (this._handleContextMenu) {
                    this.container.removeEventListener('contextmenu', this._handleContextMenu);
                    document.removeEventListener('click', this._handleDocumentClick);
                }
            }
            
            // 移除窗口大小变化监听器
            if (this._handleResize) {
                window.removeEventListener('resize', this._handleResize);
            }
            
            // 清理DOM元素
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                this.container = null;
            }
            if (this.contextMenu && this.contextMenu.parentNode) {
                this.contextMenu.parentNode.removeChild(this.contextMenu);
                this.contextMenu = null;
            }
            
            // 清理彩虹屁缓存
            if (this.usedRainbowPhrases) {
                this.usedRainbowPhrases.clear();
            }
            this.rainbowCache = [];
            
            // 从全局对象中移除
            if (window.PetController === this) {
                delete window.PetController;
            }
            
            console.log('PetController resources cleaned up successfully');
        },
        
        // 设置初始位置为底部
        setInitialPosition: function() {
            // 计算底部位置，考虑缩放比例
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            // 确保sizeRatio是有效数字，避免缩放比例为0或NaN
            const validSizeRatio = typeof this.sizeRatio === 'number' && !isNaN(this.sizeRatio) && this.sizeRatio > 0 ? this.sizeRatio : 80;
            const scale = validSizeRatio / 100;
            const petHeight = 200 * scale; // 缩放后的宠物高度
            const petWidth = 120 * scale; // 缩放后的宠物宽度
            const bottomPadding = 20; // 底部留一些间距
            
            // 设置初始位置为底部中间
            this.currentY = windowHeight - petHeight - bottomPadding;
            this.currentX = (windowWidth - petWidth) / 2; // 中间位置
            
            // 更新位置
            this.updatePosition();
            
        },
        
        // 添加页面切换事件监听
        addPageChangeListener: function() {
            
            
            // 监听系统自定义的pageChange事件
            document.addEventListener('pageChange', (event) => {
                
                
                // 根据页面类型显示不同的提示
                const pageType = event.detail?.page || event.page || 'main';
                let speechText = '';
                
                switch(pageType) {
                    case 'main':
                        speechText = '欢迎回到控制面板！您可以选择产品类型开始选型。';
                        break;
                    case 'hmi':
                        speechText = '这里是HMI人机界面选型页面，您可以筛选合适的产品。';
                        break;
                    case 'plc':
                        speechText = '这里是PLC控制器选型页面，您可以根据需求筛选产品。';
                        break;
                    case 'servo':
                        speechText = '这里是伺服系统选型页面，您可以选择适合的伺服产品。';
                        break;
                    case 'highpowerservo':
                        speechText = '这里是大功率伺服系统选型页面，您可以选择适合的大功率伺服产品。';
                        break;
                    case 'robot':
                        speechText = '这里是机器人选型页面，您可以选择适合的工业机器人产品。';
                        break;
                    case 'inverter':
                        speechText = '这里是变频器选型页面，您可以筛选不同规格的变频器。';
                        break;
                    case 'io':
                        speechText = '这里是IO模块选型页面，您可以选择适合的IO模块产品。';
                        break;
                    case 'bom':
                        speechText = '这里是BOM管理页面，您可以管理您的物料清单。';
                        break;
                    case 'compare':
                        speechText = '这里是产品对比页面，您可以对比不同产品的参数。';
                        break;
                    default:
                        speechText = `欢迎来到${pageType}页面！`;
                }
                
                // 宠物说话
                this.speak(speechText, 3000);
            });
            
            // 监听系统的showFilterResults事件
            document.addEventListener('showFilterResults', (event) => {
                
                const productType = event.detail?.productType || '产品';
                this.speak(`已为您筛选出符合条件的${productType}产品！`, 2500);
            });
            
            // 监听弹窗打开事件
            document.addEventListener('modalOpen', (event) => {
                
                const productType = event.detail?.productType || '产品';
                let speechText = '';
                
                // 根据不同产品类型显示不同的提示
                switch(productType.toLowerCase()) {
                    case 'hmi':
                        speechText = 'HMI人机界面筛选弹窗已打开，您可以选择筛选条件。';
                        break;
                    case 'plc':
                        speechText = 'PLC控制器筛选弹窗已打开，您可以根据需求选择参数。';
                        break;
                    case 'servo':
                        speechText = '伺服系统筛选弹窗已打开，您可以选择适合的伺服产品。';
                        break;
                    case 'highpowerservo':
                        speechText = '大功率伺服系统筛选弹窗已打开，您可以选择适合的大功率伺服产品。';
                        break;
                    case 'robot':
                        speechText = '机器人筛选弹窗已打开，您可以选择适合的工业机器人产品。';
                        break;
                    case 'inverter':
                        speechText = '变频器筛选弹窗已打开，您可以筛选不同规格的变频器。';
                        break;
                    case 'io':
                        speechText = 'IO模块筛选弹窗已打开，您可以选择适合的IO模块产品。';
                        break;
                    default:
                        speechText = '筛选弹窗已打开，您可以选择筛选条件。';
                }
                
                // 宠物说话
                this.speak(speechText, 3500);
            });
        },
        
        // 创建宠物元素 - 添加说话气泡
        createPetElements: function() {
            
            
            // 创建容器
            this.container = document.createElement('div');
            this.container.id = 'pet-container';
            
            // 直接设置内联样式，不依赖CSS
            // 初始隐藏，等所有图片加载完成后再显示
            this.container.style.cssText = `
                position: fixed;
                top: 50px;
                left: 50px;
                width: 120px;
                height: 200px;
                z-index: 999999;
                background-color: transparent;
                overflow: visible;
                display: none;
                opacity: 1;
                visibility: visible;
            `;
            
            // 创建宠物元素
            this.pet = document.createElement('div');
            this.pet.id = 'pet';
            
            // 设置宠物初始样式，添加平滑过渡效果
            this.pet.style.cssText = `
                width: 100%;
                height: 100%;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center bottom;
                /* 初始不设置背景图片，等所有图片加载完成后通过JS设置 */
                background-image: none;
                /* 添加平滑过渡效果，避免图片切换闪烁 */
                transition: background-image 0.1s ease-in-out;
                /* 确保硬件加速，提高动画性能 */
                transform: translateZ(0);
                backface-visibility: hidden;
                will-change: background-image;
            `;
            
            // 创建说话气泡 - 更宽，在头顶显示
            this.speechBubble = document.createElement('div');
            this.speechBubble.id = 'pet-speech-bubble';
            this.speechBubble.style.cssText = `
                position: absolute;
                top: -110px;
                left: 50%;
                transform: translateX(-50%);
                background-color: white;
                padding: 12px 20px;
                border-radius: 20px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
                z-index: 999999;
                font-family: Arial, sans-serif;
                font-size: 18px;
                color: #333;
                max-width: 400px;
                width: auto;
                text-align: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                min-width: 250px;
            `;
            
            // 添加气泡尾部 - 调整位置
            const bubbleTail = document.createElement('div');
            bubbleTail.style.cssText = `
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-top: 10px solid white;
            `;
            this.speechBubble.appendChild(bubbleTail);
            
            // 创建右键菜单
            this.contextMenu = document.createElement('div');
            this.contextMenu.id = 'pet-context-menu';
            this.contextMenu.style.cssText = `
                position: absolute;
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                padding: 5px 0;
                z-index: 1000000;
                display: none;
                font-family: Arial, sans-serif;
                font-size: 14px;
                min-width: 120px;
            `;
            
            // 从设置管理器获取大小比例，如果不存在则使用默认值
            this.sizeRatio = window.SettingsManager ? window.SettingsManager.getSetting('sizeRatio') || 80 : 80;
            // 应用大小比例
            this.updatePetSize();
            
            // 菜单选项
            const menuItems = [
                { id: 'static', text: '静止' },
                { id: 'normal', text: '正常' },
                { id: 'dance', text: '跳舞' },
                { id: 'hide', text: '隐藏' }
            ];
            
            // 添加菜单项
            menuItems.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.id = `pet-menu-${item.id}`;
                menuItem.className = 'pet-menu-item';
                menuItem.textContent = item.text;
                menuItem.style.cssText = `
                    padding: 10px 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                    color: #333;
                `;
                
                // 添加鼠标悬停效果
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.backgroundColor = '#4a90e2';
                    menuItem.style.color = 'white';
                });
                
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.backgroundColor = 'transparent';
                    menuItem.style.color = '#333';
                });
                
                // 添加点击事件
                menuItem.addEventListener('click', (e) => {
                    this.handleMenuItemClick(item.id);
                    this.contextMenu.style.display = 'none';
                    // 阻止事件冒泡
                    e.stopPropagation();
                });
                
                this.contextMenu.appendChild(menuItem);
            });
            
            // 添加大小调整分割线
            const separator = document.createElement('div');
            separator.style.cssText = `
                height: 1px;
                background-color: #f0f0f0;
                margin: 5px 0;
            `;
            this.contextMenu.appendChild(separator);
            
            // 添加大小调整部分
            const sizeContainer = document.createElement('div');
            sizeContainer.style.cssText = `
                padding: 10px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            
            // 添加大小调整标签
            const sizeLabel = document.createElement('span');
            sizeLabel.textContent = '大小：';
            sizeLabel.style.cssText = `
                font-size: 14px;
                color: #333;
                white-space: nowrap;
            `;
            sizeContainer.appendChild(sizeLabel);
            
            // 添加大小输入框
            const sizeInput = document.createElement('input');
            sizeInput.type = 'number';
            sizeInput.value = this.sizeRatio;
            sizeInput.min = '0';
            sizeInput.max = '200';
            sizeInput.step = '10';
            sizeInput.style.cssText = `
                width: 60px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-size: 14px;
                text-align: center;
            `;
            
            // 添加百分比符号
            const percentSign = document.createElement('span');
            percentSign.textContent = '%';
            percentSign.style.cssText = `
                font-size: 14px;
                color: #333;
            `;
            
            // 添加输入事件处理
            sizeInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 0) {
                    value = 0;
                } else if (value > 200) {
                    value = 200;
                }
                e.target.value = value;
                this.sizeRatio = value;
                // 调整人物大小
                this.updatePetSize();
                // 保存到设置管理器
                if (window.SettingsManager) {
                    window.SettingsManager.updateSetting('sizeRatio', value);
                }
                // 阻止事件冒泡
                e.stopPropagation();
            });
            
            // 添加失去焦点事件处理
            sizeInput.addEventListener('blur', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 0) {
                    value = 0;
                    e.target.value = value;
                } else if (value > 200) {
                    value = 200;
                    e.target.value = value;
                }
                this.sizeRatio = value;
                this.updatePetSize();
                // 保存到设置管理器
                if (window.SettingsManager) {
                    window.SettingsManager.updateSetting('sizeRatio', value);
                }
            });
            
            // 添加到大小容器
            sizeContainer.appendChild(sizeInput);
            sizeContainer.appendChild(percentSign);
            
            // 添加到右键菜单
            this.contextMenu.appendChild(sizeContainer);
            
            // 添加到页面
            this.container.appendChild(this.pet);
            this.container.appendChild(this.speechBubble);
            document.body.appendChild(this.container);
            document.body.appendChild(this.contextMenu);
            
            
        },
        
        // 添加拖动功能 - 纯JavaScript实现，支持鼠标和触摸事件
        addDragFunctionality: function() {
            
            
            // 将事件监听器保存为对象属性，以便在cleanupResources方法中正确移除它们
            
            // 处理开始拖动的通用函数
            this._handleDragStart = (e) => {
                
                this.isDragging = true;
                this.autoMove = false;
                
                // 获取坐标，支持鼠标和触摸事件
                const clientX = e.clientX || e.touches[0].clientX;
                const clientY = e.clientY || e.touches[0].clientY;
                
                // 直接获取鼠标/触摸相对于屏幕的坐标，不考虑缩放影响
                // 因为拖动是基于鼠标/触摸位置，而不是元素内部位置
                this.dragStartX = clientX - this.currentX;
                this.dragStartY = clientY - this.currentY;
                
                // 阻止默认行为，防止文本选择等
                e.preventDefault();
            };
            
            // 处理拖动移动的通用函数
            this._handleDragMove = (e) => {
                if (this.isDragging) {
                    // 获取坐标，支持鼠标和触摸事件
                    const clientX = e.clientX || e.touches[0].clientX;
                    const clientY = e.clientY || e.touches[0].clientY;
                    
                    // 计算新位置：鼠标/触摸位置 - 初始偏移量
                    let newX = clientX - this.dragStartX;
                    let newY = clientY - this.dragStartY;
                    
                    // 获取窗口尺寸
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;
                    
                    // 计算缩放比例和实际尺寸
                    // transformOrigin为top left，所以容器左上角坐标就是其显示位置的左上角
                    const scale = this.sizeRatio / 100;
                    const originalWidth = 120;
                    const originalHeight = 200;
                    
                    // 计算缩放后的实际显示尺寸
                    const actualWidth = originalWidth * scale;
                    const actualHeight = originalHeight * scale;
                    
                    // 简单直观的边界检查：
                    // 确保容器左上角坐标 + 实际尺寸 <= 窗口尺寸
                    // 确保容器左上角坐标 >= 0
                    newX = Math.max(0, Math.min(newX, windowWidth - actualWidth));
                    newY = Math.max(0, Math.min(newY, windowHeight - actualHeight));
                    
                    // 只有位置变化时才更新，避免不必要的重绘
                    if (this.currentX !== newX || this.currentY !== newY) {
                        this.currentX = newX;
                        this.currentY = newY;
                        this.updatePosition();
                    }
                }
            };
            
            // 处理拖动结束的通用函数
            this._handleDragEnd = () => {
                if (this.isDragging) {
                    this.isDragging = false;
                }
            };
            
            // 处理点击/触摸的通用函数
            this._handleClick = (_e) => {
                // 只有在非拖动状态下才切换状态
                if (!this.isDragging) {
                    this.toggleState();
                }
            };
            
            // 处理右键菜单事件
            this._handleContextMenu = (e) => {
                // 阻止默认右键菜单
                e.preventDefault();
                // 停止事件冒泡
                e.stopPropagation();
                
                // 显示右键菜单
                this.contextMenu.style.display = 'block';
                
                // 确保菜单不超出屏幕
                const menuWidth = this.contextMenu.offsetWidth;
                const menuHeight = this.contextMenu.offsetHeight;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // 计算菜单位置
                let menuX = e.clientX;
                let menuY = e.clientY;
                
                // 水平调整
                if (menuX + menuWidth > windowWidth) {
                    menuX = windowWidth - menuWidth - 5;
                }
                
                // 垂直调整
                if (menuY + menuHeight > windowHeight) {
                    menuY = windowHeight - menuHeight - 5;
                }
                
                // 设置菜单位置
                this.contextMenu.style.left = menuX + 'px';
                this.contextMenu.style.top = menuY + 'px';
            };
            
            // 处理点击页面其他地方关闭右键菜单
            this._handleDocumentClick = (e) => {
                if (!this.container.contains(e.target) && e.target !== this.contextMenu && !this.contextMenu.contains(e.target)) {
                    this.contextMenu.style.display = 'none';
                }
            };
            
            // 鼠标事件
            this.container.addEventListener('mousedown', this._handleDragStart);
            document.addEventListener('mousemove', this._handleDragMove);
            document.addEventListener('mouseup', this._handleDragEnd);
            document.addEventListener('mouseleave', this._handleDragEnd);
            this.container.addEventListener('click', this._handleClick);
            
            // 触摸事件
            this.container.addEventListener('touchstart', this._handleDragStart, { passive: false });
            document.addEventListener('touchmove', this._handleDragMove, { passive: false });
            document.addEventListener('touchend', this._handleDragEnd);
            document.addEventListener('touchcancel', this._handleDragEnd);
            this.container.addEventListener('touchend', this._handleClick);
            
            // 右键菜单事件
            this.container.addEventListener('contextmenu', this._handleContextMenu);
            
            // 点击页面其他地方关闭右键菜单
            document.addEventListener('click', this._handleDocumentClick);
            
            // 鼠标移动事件，用于重置空闲定时器
            this._handleMouseMove = () => {
                this.resetIdleTimer();
            };
            document.addEventListener('mousemove', this._handleMouseMove);
            
            // 双击事件，用于显示隐藏的宠物
            this._handleDoubleClick = () => {
                // 检查宠物是否隐藏，并且设置中允许显示宠物
                if (this.container && this.container.style.display === 'none') {
                    // 检查设置中的宠物显示选项
                    const shouldShowPet = window.SettingsManager ? window.SettingsManager.getSetting('showPetByDefault') !== false : true;
                    if (shouldShowPet) {
                        this.showPet();
                    }
                }
            };
            document.addEventListener('dblclick', this._handleDoubleClick);
            
            
        },
        
        // 更新位置
        updatePosition: function() {
            
            
            // 直接设置内联样式
            this.container.style.left = this.currentX + 'px';
            this.container.style.top = this.currentY + 'px';
        },
        
        // 更新人物大小
        updatePetSize: function() {
            
            
            // 确保sizeRatio是有效数字，避免缩放比例为0或NaN
            const validSizeRatio = typeof this.sizeRatio === 'number' && !isNaN(this.sizeRatio) && this.sizeRatio > 0 ? this.sizeRatio : 80;
            // 计算缩放比例，确保宠物始终可见
            const scale = validSizeRatio / 100;
            
            // 设置人物容器的缩放，使用默认transformOrigin（top left）
            // 这样定位计算更直观，边界检查更容易
            this.container.style.transform = `scale(${scale})`;
            this.container.style.transformOrigin = 'top left';
        },
        
        // 说话方法 - 显示气泡和说话动画
        speak: function(text = null, duration = null, isPageContent = false) {
            // 如果正在说页面相关内容，不处理新的彩虹屁请求
            if (text === null && this.isSpeakingPageContent) {
                return;
            }
            
            // 如果没有提供文本，从API获取彩虹屁
            if (text === null) {
                // 先从缓存获取，如果缓存为空则调用API
                const cachedPhrase = this.getCachedRainbowPhrase();
                if (cachedPhrase) {
                    this.speak(cachedPhrase);
                } else {
                    // 调用API获取彩虹屁
                    this.fetchRainbowPhrase().then(phrase => {
                        this.speak(phrase);
                    }).catch(_error => {
                        
                        // 失败时使用默认语句
                        this.speak('欢迎使用产品选型系统！');
                    });
                }
                return;
            }
            
            // 根据文字长度动态计算显示时间
            // 基础时间2秒 + 每字符0.1秒，最短2秒，最长10秒
            if (duration === null) {
                const baseDuration = 2000; // 基础时间2秒
                const charDuration = 200; // 每字符0.1秒
                const maxDuration = 10000; // 最长10秒
                duration = Math.min(maxDuration, Math.max(baseDuration, baseDuration + (text.length * charDuration)));
            }
            
            
            
            // 确保气泡存在
            if (!this.speechBubble) {
                
                return;
            }
            
            // 设置气泡文本
            const textElement = this.speechBubble.querySelector('.speech-text');
            if (textElement) {
                textElement.innerHTML = text;
            } else {
                // 移除之前的文本
                while (this.speechBubble.firstChild && this.speechBubble.firstChild.tagName !== 'DIV') {
                    this.speechBubble.removeChild(this.speechBubble.firstChild);
                }
                
                // 创建新文本元素
                const newTextElement = document.createElement('div');
                newTextElement.className = 'speech-text';
                newTextElement.innerHTML = text;
                newTextElement.style.cssText = 'margin-bottom: 5px;';
                this.speechBubble.insertBefore(newTextElement, this.speechBubble.lastChild);
            }
            
            // 显示气泡
            this.speechBubble.style.opacity = '1';
            
            // 切换到说话状态
            const previousState = this.state;
            this.state = 'talk';
            this.lastState = 'talk'; // 更新lastState，防止连续相同动作
            
            // 如果是页面相关内容，设置标志
            if (isPageContent) {
                this.isSpeakingPageContent = true;
            }
            
            // 根据文字长度计算张嘴次数
            const textLength = text.length;
            const mouthOpenCount = Math.ceil(textLength / 2);
            
            // 计算每次张嘴闭嘴的时间间隔
            const mouthInterval = duration / (mouthOpenCount * 2);
            
            // 初始化张嘴状态
            let isMouthOpen = false;
            let currentCount = 0;
            
            // 说话动画
            const mouthTimer = setInterval(() => {
                if (isMouthOpen) {
                    // 张嘴状态
                    this.pet.style.backgroundImage = `url('animation/${this.direction}_open_mouth.webp')`;
                } else {
                    // 闭嘴状态
                    this.pet.style.backgroundImage = `url('animation/${this.direction}.webp')`;
                    currentCount++;
                }
                
                // 切换状态
                isMouthOpen = !isMouthOpen;
                
                // 达到指定次数或时间结束
                if (currentCount >= mouthOpenCount) {
                    clearInterval(mouthTimer);
                    // 恢复原状态
                    this.speechBubble.style.opacity = '0';
                    this.state = previousState;
                    this.updatePetState();
                    
                    // 重置页面内容说话标志
                    if (isPageContent) {
                        this.isSpeakingPageContent = false;
                    }
                }
            }, mouthInterval);
        },
        
        // 更新宠物状态和方向 - 添加跑步、说话和跳舞动画
        updatePetState: function() {
            // 缓存当前时间，减少重复计算
            const now = Date.now();
            let imagePath = 'animation/';
            let newImagePath = '';
            
            // 缓存方向的小写形式
            const dir = this.direction.toLowerCase();
            
            // 跑步状态下添加更自然的跑步动画
            if (this.state === 'run') {
                // 调整跑步帧间隔，让跑步看起来更流畅自然
                const runFrameInterval = 150; // 调整跑步帧间隔，平衡流畅度和速度
                
                // 每隔一段时间切换一次帧
                if (now - this.lastFrameChange > runFrameInterval) {
                    this.isRunningFrame = !this.isRunningFrame;
                    this.lastFrameChange = now;
                }
                
                // 按照用户要求的跑步动画逻辑：
                // 1. 原地站立的图片位置是1
                // 2. 跑步的图片位置是位置2
                // 3. 然后位置3是站立
                // 以此类推，形成自然的跑步姿态切换
                if (this.isRunningFrame) {
                    // 跑步姿态（位置2）
                    newImagePath = imagePath + dir + '_run.webp';
                } else {
                    // 站立姿态（位置1、3等）
                    newImagePath = imagePath + dir + '.webp';
                }
            } 
            // 说话状态下添加张嘴闭嘴动画
            else if (this.state === 'talk') {
                // 每隔一段时间切换一次帧
                if (now - this.lastFrameChange > this.frameInterval) {
                    this.isRunningFrame = !this.isRunningFrame;
                    this.lastFrameChange = now;
                }
                
                // 根据当前帧选择图片
                newImagePath = imagePath + dir + (this.isRunningFrame ? '_open_mouth.webp' : '.webp');
            } 
            // 跳舞状态下按照严格的序列执行：左右站立 → 右左张嘴 → 左右跑步 → 右左站立...
            else if (this.state === 'dance') {
                // 每隔一段时间切换一次跳舞帧
                if (now - this.lastDanceFrameChange > this.danceInterval) {
                    // 循环跳舞序列
                    this.danceFrameIndex = (this.danceFrameIndex + 1) % this.danceSequence.length;
                    this.lastDanceFrameChange = now;
                }
                
                // 获取当前跳舞帧，包含方向和动作
                const currentFrame = this.danceSequence[this.danceFrameIndex];
                
                // 更新人物方向
                this.direction = currentFrame.direction;
                
                // 根据当前动作选择图片
                const action = currentFrame.action;
                const danceDir = this.direction.toLowerCase();
                
                if (action === 'open_mouth') {
                    newImagePath = imagePath + danceDir + '_open_mouth.webp';
                } else if (action === 'run') {
                    newImagePath = imagePath + danceDir + '_run.webp';
                } else {
                    newImagePath = imagePath + danceDir + '.webp';
                }
            } 
            // 站立状态下保持静止
            else {
                newImagePath = imagePath + dir + '.webp';
                // 重置宠物位置，确保站立时回到正常位置
                if (this.pet) {
                    this.pet.style.transform = 'translateY(0) translateZ(0)';
                }
            }
            
            // 获取当前背景图片URL，用于比较
            const currentStyle = this.pet.style.backgroundImage;
            const currentPath = currentStyle.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
            
            // 只在图片路径变化且图片已缓存时才更新DOM
            if (currentPath !== newImagePath) {
                // 检查图片是否已缓存
                if (!this.imageCache || !this.imageCache[newImagePath]) {
                    // 如果图片未缓存，先预加载
                    const img = new Image();
                    img.onload = () => {
                        // 图片加载完成后更新DOM
                        this.pet.style.backgroundImage = `url('${newImagePath}')`;
                        // 缓存图片
                        this.imageCache = this.imageCache || {};
                        this.imageCache[newImagePath] = img;
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image: ${newImagePath}`);
                        // 加载失败时使用默认图片
                        this.pet.style.backgroundImage = `url('${newImagePath}')`;
                    };
                    img.src = newImagePath;
                } else {
                    // 图片已缓存，直接更新DOM，避免闪烁
                    this.pet.style.backgroundImage = `url('${newImagePath}')`;
                }
            }
        },
        
        // 从API获取夸人句子
        fetchRainbowPhrase: function() {
            return new Promise((resolve, _reject) => {
                // 使用用户提供的API
                const apiUrl = 'https://v1.hitokoto.cn';
                
                fetch(apiUrl)
                    .then(response => {
                        if (!response.ok) {
                            return Promise.resolve({ hitokoto: '' });
                        }
                        return response.json();
                    })
                    .then(data => {
                        
                        
                        // 解析API响应，获取hitokoto字段
                        let phrase = '';
                        if (data && data.hitokoto) {
                            phrase = data.hitokoto.trim();
                        } else {
                            phrase = '';
                        }
                        
                        
                        
                        // 去重处理
                        if (this.usedRainbowPhrases.has(phrase) || phrase === '') {
                            // 如果已使用或为空，重新获取
                            return this.fetchRainbowPhrase();
                        }
                        
                        resolve(phrase);
                    })
                    .catch(_error => {
                        
                        
                        // 失败时使用本地夸人库
                        const localPraisePhrases = [
                            "您的选型眼光真的太棒了！",
                            "您对产品的理解真的很深刻！",
                            "您的需求分析非常专业！",
                            "您的选择一定不会错！",
                            "您对产品的要求真的很精准！",
                            "您的选型思路非常清晰！",
                            "您对产品的了解真的很全面！",
                            "您的需求描述非常详细！",
                            "您的选型决策非常明智！",
                            "您对产品的期待非常合理！",
                            "您的选型过程真的很严谨！",
                            "您对产品的评价真的很客观！",
                            "您的需求真的很有代表性！",
                            "您的选型结果一定很完美！",
                            "您对产品的认知真的很到位！"
                        ];
                        
                        // 随机选择一个本地夸人句
                        const randomIndex = Math.floor(Math.random() * localPraisePhrases.length);
                        const phrase = localPraisePhrases[randomIndex];
                        
                        // 去重处理
                        if (this.usedRainbowPhrases.has(phrase)) {
                            // 如果已使用，重新获取
                            return this.fetchRainbowPhrase();
                        }
                        
                        resolve(phrase);
                    });
            });
        },
        
        // 从缓存获取彩虹屁
        getCachedRainbowPhrase: function() {
            if (this.rainbowCache.length === 0) {
                return null;
            }
            
            // 随机从缓存中获取一个
            const randomIndex = Math.floor(Math.random() * this.rainbowCache.length);
            const phrase = this.rainbowCache[randomIndex];
            
            // 从缓存中移除该短语，确保不会重复使用
            this.rainbowCache.splice(randomIndex, 1);
            
            return phrase;
        },
        
        // 更新彩虹屁缓存
        updateRainbowCache: function() {
            // 清空现有缓存，保留已使用集合（防止重复）
            this.rainbowCache = [];
            
            // 批量获取彩虹屁并添加到缓存
            const fetchPromises = [];
            for (let i = 0; i < this.cacheSize; i++) {
                fetchPromises.push(this.fetchRainbowPhrase());
            }
            
            Promise.all(fetchPromises)
                .then(phrases => {
                    // 将获取到的短语添加到缓存
                    phrases.forEach(phrase => {
                        if (phrase && !this.usedRainbowPhrases.has(phrase)) {
                            this.rainbowCache.push(phrase);
                            this.usedRainbowPhrases.add(phrase);
                        }
                    });
                    
                })
                .catch(_error => {
                    
                });
        },
        
        // 说出统计信息
        speakStatistics: function() {
            // 计算页面使用时间（分钟）
            const now = Date.now();
            const minutesOnPage = Math.floor((now - this.pageLoadTime) / (1000 * 60));
            
            // 生成统计信息文本
            const statisticsText = `您已经在页面上停留了${minutesOnPage}分钟，点击了${this.mouseClickCount}次鼠标。`;
            
            // 宠物说话，说完后延迟2秒再触发API说话
            this.speak(statisticsText, 5000);
            
            // 延迟2秒后触发API说话
            setTimeout(() => {
                this.speak(null); // null表示从API获取彩虹屁
            }, 5000 + 2000); // 统计信息显示时间5秒 + 延迟2秒
        },
        
        // 切换状态
        toggleState: function() {
            const states = ['stand', 'talk', 'run', 'dance'];
            const currentIndex = states.indexOf(this.state);
            const nextIndex = (currentIndex + 1) % states.length;
            
            this.state = states[nextIndex];
            this.updatePetState();
        },
        
        // 切换方向
        toggleDirection: function() {
            this.direction = this.direction === 'right' ? 'left' : 'right';
            this.updatePetState();
        },
        
        // 动画循环 - 使用requestAnimationFrame替代setInterval
        animationLoop: function() {
            // 只在非拖动状态下更新动画
            if (!this.isDragging) {
                this.updatePetState();
            }
            // 继续下一帧
            this.animationInterval = requestAnimationFrame(() => this.animationLoop());
        },
        
        // 启动动画循环
        startAnimation: function() {
            // 如果已经有动画定时器，先清除
            if (this.animationInterval) {
                cancelAnimationFrame(this.animationInterval);
            }
            
            // 启动requestAnimationFrame循环
            this.animationLoop();
        },
        
        // 自动移动 - 只在跑步状态下移动
        startAutoMove: function() {
            // 添加穿越状态变量
            this.isCrossing = false;
            
            // 缓存窗口和宠物尺寸，减少重复计算
            let lastWindowWidth = window.innerWidth;
            let lastWindowHeight = window.innerHeight;
            let lastPetWidth = 0;
            let lastPetHeight = 0;
            let lastScale = 0;
            
            this.autoMoveInterval = setInterval(() => {
                if (!this.isDragging && !this.isSpeakingPageContent) {
                    // 确保宠物在移动时处于跑步状态，但说话时保持说话状态
                    if (this.autoMove && !this.isCrossing && this.state !== 'talk') {
                        // 强制设置为跑步状态
                        this.state = 'run';
                        this.updatePetState();
                        
                        // 调整跑步速度，使其更合理，与跑步动画帧匹配
                        const moveSpeed = this.speed * 3; // 增加跑步速度，增强前进感
                        
                        // 只在窗口尺寸或缩放比例变化时重新计算尺寸
                        const currentScale = this.sizeRatio / 100;
                        const currentWindowWidth = window.innerWidth;
                        const currentWindowHeight = window.innerHeight;
                        
                        if (currentScale !== lastScale || currentWindowWidth !== lastWindowWidth || currentWindowHeight !== lastWindowHeight) {
                            lastScale = currentScale;
                            lastWindowWidth = currentWindowWidth;
                            lastWindowHeight = currentWindowHeight;
                            lastPetWidth = 120 * currentScale;
                            lastPetHeight = 200 * currentScale;
                        }
                        
                        // 更新位置
                        let newX = this.currentX;
                        if (this.direction === 'right') {
                            newX += moveSpeed;
                            // 边界检查
                            if (newX + lastPetWidth > lastWindowWidth) {
                                // 随机决定是穿越还是改变方向（50%概率）
                                const shouldCross = Math.random() < 0.5;
                                
                                if (!shouldCross) {
                                    // 改变方向
                                    this.currentX = lastWindowWidth - lastPetWidth;
                                    this.direction = 'left';
                                    this.updatePosition();
                                    
                                } else {
                                    // 简化穿越条件：只要角色边缘超出屏幕就触发穿越
                                    if (newX + lastPetWidth > lastWindowWidth) {
                                        // 角色边缘超出屏幕，执行穿越
                                        
                                        this.isCrossing = true;
                                        const self = this;
                                        
                                        // 先让角色完全走出屏幕（快速移动）
                                        const moveOutInterval = setInterval(() => {
                                            self.currentX += moveSpeed * 2; // 加速走出屏幕
                                            self.updatePosition();
                                            
                                            // 完全走出屏幕后停止移动
                                            if (self.currentX > lastWindowWidth + lastPetWidth) {
                                                clearInterval(moveOutInterval);
                                                
                                                // 短暂延迟后从左侧进入
                                                setTimeout(() => {
                                                    // 设置从左侧屏幕外开始进入
                                                    self.currentX = -lastPetWidth;
                                                    self.isCrossing = false;
                                                    
                                                    // 添加快速进入动画，确保角色完整显示在屏幕上
                                                    const enterSpeed = moveSpeed * 3;
                                                    let step = 0;
                                                    const maxSteps = 10; // 最多10步完成进入
                                                    
                                                    const enterInterval = setInterval(() => {
                                                        step++;
                                                        self.currentX += enterSpeed;
                                                        self.updatePosition();
                                                        
                                                        // 检查是否已经完全进入屏幕或达到最大步数
                                                        if (self.currentX >= 0 || step >= maxSteps) {
                                                            clearInterval(enterInterval);
                                                            // 确保角色完全进入屏幕
                                                            if (self.currentX < 0) {
                                                                self.currentX = 0;
                                                                self.updatePosition();
                                                            }
                                                        }
                                                    }, 20); // 每20ms更新一次，快速进入
                                                }, 200); // 200ms延迟
                                            }
                                        }, 20); // 每20ms更新一次，快速移动
                                    }
                                }
                            } else {
                                // 只有位置变化时才更新
                                if (newX !== this.currentX) {
                                    this.currentX = newX;
                                    this.updatePosition();
                                }
                            }
                        } else {
                            newX -= moveSpeed;
                            // 边界检查
                            if (newX < 0) {
                                // 随机决定是穿越还是改变方向（50%概率）
                                const shouldCross = Math.random() < 0.5;
                                
                                if (!shouldCross) {
                                    // 改变方向
                                    this.currentX = 0;
                                    this.direction = 'right';
                                    this.updatePosition();
                                    
                                } else {
                                    // 简化穿越条件：只要角色边缘超出屏幕就触发穿越
                                    if (newX < 0) {
                                        // 角色边缘超出屏幕，执行穿越
                                        
                                        this.isCrossing = true;
                                        const self = this;
                                        
                                        // 先让角色完全走出屏幕（快速移动）
                                        const moveOutInterval = setInterval(() => {
                                            self.currentX -= moveSpeed * 2; // 加速走出屏幕
                                            self.updatePosition();
                                            
                                            // 完全走出屏幕后停止移动
                                            if (self.currentX < -lastPetWidth) {
                                                clearInterval(moveOutInterval);
                                                
                                                // 短暂延迟后从右侧进入
                                                setTimeout(() => {
                                                    // 设置从右侧屏幕外开始进入
                                                    self.currentX = lastWindowWidth;
                                                    self.isCrossing = false;
                                                    
                                                    // 添加快速进入动画，确保角色完整显示在屏幕上
                                                    const enterSpeed = moveSpeed * 3;
                                                    let step = 0;
                                                    const maxSteps = 10; // 最多10步完成进入
                                                    
                                                    const enterInterval = setInterval(() => {
                                                        step++;
                                                        self.currentX -= enterSpeed;
                                                        self.updatePosition();
                                                        
                                                        // 检查是否已经完全进入屏幕或达到最大步数
                                                        if (self.currentX + lastPetWidth <= lastWindowWidth || step >= maxSteps) {
                                                            clearInterval(enterInterval);
                                                            // 确保角色完全进入屏幕
                                                            if (self.currentX + lastPetWidth > lastWindowWidth) {
                                                                self.currentX = lastWindowWidth - lastPetWidth;
                                                                self.updatePosition();
                                                            }
                                                        }
                                                    }, 20); // 每20ms更新一次，快速进入
                                                }, 200); // 200ms延迟
                                            }
                                        }, 20); // 每20ms更新一次，快速移动
                                    }
                                }
                            } else {
                                // 只有位置变化时才更新
                                if (newX !== this.currentX) {
                                    this.currentX = newX;
                                    this.updatePosition();
                                }
                            }
                        }
                        
                        // 确保垂直位置也在屏幕内，考虑缩放后的尺寸
                        const newY = Math.max(0, Math.min(this.currentY, lastWindowHeight - lastPetHeight));
                        if (newY !== this.currentY) {
                            this.currentY = newY;
                            this.updatePosition();
                        }
                    }
                }
            }, 80); // 每80ms更新一次，约12.5fps，增加移动流畅度，与跑步动画匹配
        },
        
        // 自动状态切换 - 实现静止、说话、动作、跳舞的随机循环
        startAutoStateChange: function() {
            this.autoStateChangeInterval = setInterval(() => {
                if (!this.isDragging && !this.isSpeakingPageContent) {
                    // 调整状态权重，减少跑步状态的概率和持续时间
            const weightedStates = [
                'stand', 'stand', 'stand', // 增加静止状态权重，提高为3次
                'talk', // 说话状态保持不变
                'run', 'run', 'run', // 减少跑步状态权重，降低为3次
                'dance', 'dance', 'dance' // 增加跳舞状态权重，提高为3次
            ];
                    
                    // 随机选择一个状态，确保不与上次状态相同
                    let nextState = '';
                    let attempts = 0;
                    const maxAttempts = 10;
                    
                    do {
                        const randomIndex = Math.floor(Math.random() * weightedStates.length);
                        nextState = weightedStates[randomIndex];
                        attempts++;
                    } while (nextState === this.lastState && attempts < maxAttempts);
                    
                    // 如果多次尝试后仍为相同状态，强制切换到其他状态
                    if (nextState === this.lastState) {
                        const otherStates = weightedStates.filter(state => state !== this.lastState);
                        if (otherStates.length > 0) {
                            nextState = otherStates[Math.floor(Math.random() * otherStates.length)];
                        }
                    }
                    
                    // 更新上次状态
                    this.lastState = nextState;
                    
                    // 如果选择了说话状态，说彩虹屁
                    if (nextState === 'talk') {
                        this.speak(null, 2000); // null表示从API获取彩虹屁
                    } 
                    // 如果选择了其他状态，直接切换
                    else {
                        this.state = nextState;
                        this.updatePetState();
                    }
                }
            }, 4000); // 减少状态切换间隔，从6秒改为4秒，增加状态变化频率
        },
        
        // 处理菜单项点击
        handleMenuItemClick: function(itemId) {
            switch(itemId) {
                case 'static':
                    // 静止：停止自动移动和状态切换
                    this.autoMove = false;
                    this.state = 'stand';
                    this.lastState = 'stand'; // 更新lastState，防止连续相同动作
                    this.updatePetState();
                    // 停止自动状态切换
                    if (this.autoStateChangeInterval) {
                        clearInterval(this.autoStateChangeInterval);
                        this.autoStateChangeInterval = null;
                    }
                    break;
                case 'normal':
                    // 正常：恢复自动移动和状态切换
                    this.autoMove = true;
                    // 重新启动自动状态切换
                    if (!this.autoStateChangeInterval) {
                        this.startAutoStateChange();
                    }
                    break;
                case 'dance':
                    // 跳舞：切换到跳舞状态
                    this.autoMove = false;
                    this.state = 'dance';
                    this.lastState = 'dance'; // 更新lastState，防止连续相同动作
                    this.updatePetState();
                    // 停止自动状态切换
                    if (this.autoStateChangeInterval) {
                        clearInterval(this.autoStateChangeInterval);
                        this.autoStateChangeInterval = null;
                    }
                    break;
                case 'hide':
                    // 隐藏：跑步到屏幕边缘然后隐藏
                    this.hidePet();
                    break;
            }
        },
        
        // 隐藏宠物
        hidePet: function() {
            // 停止所有定时器
            if (this.autoMoveInterval) {
                clearInterval(this.autoMoveInterval);
                this.autoMoveInterval = null;
            }
            if (this.autoStateChangeInterval) {
                clearInterval(this.autoStateChangeInterval);
                this.autoStateChangeInterval = null;
            }
            
            // 停止自动移动
            this.autoMove = false;
            
            // 获取窗口和宠物尺寸
            const windowWidth = window.innerWidth;
            const petWidth = 120;
            
            // 判断到左右边缘的距离
            const distanceToLeft = this.currentX;
            const distanceToRight = windowWidth - (this.currentX + petWidth);
            
            // 选择更近的边缘
            const targetEdge = distanceToLeft < distanceToRight ? 'left' : 'right';
            
            // 重置跑步动画帧
            this.isRunningFrame = false;
            this.lastFrameChange = Date.now();
            
            // 设置方向和跑步状态
            this.direction = targetEdge;
            this.state = 'run';
            this.updatePetState();
            
            // 移动到屏幕外 - 使用更快的移动速度和更频繁的更新
            const moveInterval = setInterval(() => {
                if (targetEdge === 'left') {
                            this.currentX -= 8; // 增加移动速度，使动画更流畅
                            if (this.currentX + petWidth < 0) {
                                // 完全移出屏幕
                                clearInterval(moveInterval);
                                this.container.style.display = 'none';
                            }
                        } else {
                            this.currentX += 8; // 增加移动速度，使动画更流畅
                            if (this.currentX > windowWidth) {
                                // 完全移出屏幕
                                clearInterval(moveInterval);
                                this.container.style.display = 'none';
                            }
                        }
                this.updatePosition();
                this.updatePetState(); // 持续更新跑步动画帧
            }, 30); // 减少间隔时间，使动画更流畅
        },
        
        // 重置空闲定时器
        resetIdleTimer: function() {
            // 清除现有的定时器
            if (this.idleTimer) {
                clearTimeout(this.idleTimer);
                this.idleTimer = null;
            }
        },
        
        // 显示宠物
        showPet: function() {
            // 确保宠物容器存在
            if (!this.container) {
                return;
            }
            
            // 显示宠物容器
            this.container.style.display = 'block';
            
            // 获取窗口和宠物尺寸
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const scale = this.sizeRatio / 100;
            const petWidth = 120 * scale;
            const petHeight = 200 * scale;
            const bottomPadding = 20;
            
            // 随机选择从左侧或右侧进入
            const enterFromLeft = Math.random() < 0.5;
            
            // 设置初始位置
            this.currentX = enterFromLeft ? -petWidth : windowWidth;
            this.currentY = windowHeight - petHeight - bottomPadding;
            this.direction = enterFromLeft ? 'right' : 'left';
            this.state = 'run';
            
            // 重置跑步动画变量，确保跑步动画能正常启动
            this.isRunningFrame = false;
            this.lastFrameChange = Date.now();
            
            // 更新位置和状态
            this.updatePosition();
            this.updatePetState();
            
            // 目标中间位置
            const targetX = (windowWidth - petWidth) / 2;
            
            // 开始移动到中间
            const moveInterval = setInterval(() => {
                // 计算移动距离
                const moveSpeed = 8;
                
                if (enterFromLeft) {
                    // 从左侧进入，向右移动
                    this.currentX += moveSpeed;
                    if (this.currentX >= targetX) {
                        // 到达中间位置
                        clearInterval(moveInterval);
                        this.currentX = targetX;
                        this.updatePosition();
                        
                        // 切换到正常状态
                        this.state = 'stand';
                        this.updatePetState();
                        
                        // 恢复自动移动和状态切换
                        this.autoMove = true;
                        if (!this.autoStateChangeInterval) {
                            this.startAutoStateChange();
                        }
                        if (!this.autoMoveInterval) {
                            this.startAutoMove();
                        }
                        
                        // 重启空闲检测定时器
                        this.resetIdleTimer();
                    }
                } else {
                    // 从右侧进入，向左移动
                    this.currentX -= moveSpeed;
                    if (this.currentX <= targetX) {
                        // 到达中间位置
                        clearInterval(moveInterval);
                        this.currentX = targetX;
                        this.updatePosition();
                        
                        // 切换到正常状态
                        this.state = 'stand';
                        this.updatePetState();
                        
                        // 恢复自动移动和状态切换
                        this.autoMove = true;
                        if (!this.autoStateChangeInterval) {
                            this.startAutoStateChange();
                        }
                        if (!this.autoMoveInterval) {
                            this.startAutoMove();
                        }
                        
                        // 重启空闲检测定时器
                        this.resetIdleTimer();
                    }
                }
                
                // 更新位置
                this.updatePosition();
                // 确保在移动过程中更新跑步动画
                this.updatePetState();
            }, 30);
        },
        
        // 公开方法
        setStand: function() { this.state = 'stand'; this.updatePetState(); },
        setTalk: function() { this.state = 'talk'; this.updatePetState(); },
        setRun: function() { this.state = 'run'; this.updatePetState(); },
        toggleAutoMove: function() { this.autoMove = !this.autoMove; }
    };
    
    // 页面加载完成后初始化，使用setTimeout确保所有依赖模块都已加载完成
    function initPetController() {
        try {
            PetController.init();
        } catch (error) {
            
            // 如果初始化失败，不再重试，直接跳过，确保页面能正常加载
            return;
        }
    }
    
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                // 延迟100ms，确保所有依赖模块都已加载完成
                setTimeout(initPetController, 100);
            });
        } else {
            // 延迟100ms，确保所有依赖模块都已加载完成
            setTimeout(initPetController, 100);
        }
    } catch (error) {
        
        // 发生任何错误都直接跳过，确保页面能正常加载
    }
    
    try {
        // 导出到全局
        window.PetController = PetController;
        
        
    } catch (error) {
        
        // 发生任何错误都直接跳过，确保页面能正常加载
    }
})();