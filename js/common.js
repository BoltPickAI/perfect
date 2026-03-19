// 通用功能模块

// 加载完成后隐藏加载动画
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // 主页面显示后，动态加载ExcelJS库
    try {
        loadExcelJS();
    } catch (error) {
        console.error('加载ExcelJS库失败:', error);
    }
}

// 简化的ExcelJS加载函数
function loadExcelJS() {
    // 初始化加载状态
    if (!window.ExcelJS_Status) {
        window.ExcelJS_Status = {
            loaded: false,
            loading: false,
            failed: false
        };
    }
    
    // 如果已经加载或正在加载，直接返回
    if (window.ExcelJS_Status.loaded || window.ExcelJS_Status.loading) {
        return;
    }
    
    // 标记为正在加载
    window.ExcelJS_Status.loading = true;
    window.ExcelJS_Status.failed = false;
    
    // CDN链接列表
    const cdnUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js',
        'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js',
        'https://unpkg.com/exceljs@4.3.0/dist/exceljs.min.js'
    ];
    
    // 尝试加载函数
    function tryLoad(index) {
        if (index >= cdnUrls.length) {
            // 所有CDN都失败
            window.ExcelJS_Status.loading = false;
            window.ExcelJS_Status.failed = true;
            console.error('Failed to load ExcelJS from all CDN sources');
            return;
        }
        
        const script = document.createElement('script');
        script.src = cdnUrls[index];
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            window.ExcelJS_Status.loading = false;
            window.ExcelJS_Status.loaded = true;
            console.log('ExcelJS loaded successfully');
        };
        
        script.onerror = () => {
            console.warn(`Failed to load ExcelJS from ${cdnUrls[index]}, trying next...`);
            tryLoad(index + 1);
        };
        
        document.body.appendChild(script);
    }
    
    // 开始加载
    tryLoad(0);
}

// 在使用ExcelJS之前检查并确保其已加载
function ensureExcelJSLoaded() {
    // 初始化状态
    if (!window.ExcelJS_Status) {
        window.ExcelJS_Status = {
            loaded: false,
            loading: false,
            failed: false
        };
    }
    
    // 如果已经加载完成，直接返回成功
    if (window.ExcelJS_Status.loaded) {
        return Promise.resolve(true);
    }
    
    // 如果加载失败，重新尝试
    if (window.ExcelJS_Status.failed) {
        loadExcelJS();
    }
    
    // 如果还没开始加载，开始加载
    if (!window.ExcelJS_Status.loading) {
        loadExcelJS();
    }
    
    // 等待加载完成
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (!window.ExcelJS_Status.loading) {
                clearInterval(checkInterval);
                resolve(window.ExcelJS_Status.loaded);
            }
        }, 100);
        
        // 设置超时
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve(window.ExcelJS_Status.loaded);
        }, 8000);
    });
}

// 导出全局函数，供其他模块使用
window.ensureExcelJSLoaded = ensureExcelJSLoaded;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 主题切换功能
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        var themeIcon = themeToggle.querySelector('i');
        
        // 检查当前主题状态（从documentElement获取，因为已经在页面加载前初始化）
        var isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // 更新主题图标
        if (isDarkMode) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        themeToggle.addEventListener('click', function() {
            // 添加过渡效果
            document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            
            // 切换主题类
            document.documentElement.classList.toggle('dark-mode');
            isDarkMode = document.documentElement.classList.contains('dark-mode');
            
            // 保存主题偏好
            localStorageManager.setItem('theme', isDarkMode ? 'dark' : 'light');
            
            // 更新主题图标
            if (isDarkMode) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            
            // 触发自定义事件 - 兼容旧浏览器
            var themeChangeEvent;
            if (typeof CustomEvent === 'function') {
                themeChangeEvent = new CustomEvent('themeChange', { 
                    detail: { theme: isDarkMode ? 'dark' : 'light' } 
                });
            } else {
                // 兼容IE11等旧浏览器
                themeChangeEvent = document.createEvent('CustomEvent');
                themeChangeEvent.initCustomEvent('themeChange', true, true, {
                    theme: isDarkMode ? 'dark' : 'light'
                });
            }
            document.dispatchEvent(themeChangeEvent);
        });
    }
    
    // 侧边栏导航项点击事件 - 兼容旧浏览器
    var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    for (var i = 0; i < navItems.length; i++) {
        var item = navItems[i];
        if (!item.querySelector('.dropdown-icon')) {
            item.addEventListener('click', function(e) {
                // 移除所有活动状态
                var allNavItems = document.querySelectorAll('.nav-item');
                for (var j = 0; j < allNavItems.length; j++) {
                    allNavItems[j].classList.remove('active');
                }
                // 设置当前项为活动状态
                this.classList.add('active');
                // 控制面板进入主页
                if (this.getAttribute('data-page') === 'main' && window.pageRouter) {
                    window.pageRouter.backToMain();
                }
                // 侧栏产品类型打开筛选弹窗
                var type = this.getAttribute('data-type');
                if (type && window.pageRouter) {
                    window.pageRouter.openFilterModal(type);
                }
            });
        }
    }
    

    
    // 检查URL参数，如果有的话显示结果 - 兼容旧浏览器
    var productType = '';
    var filters = '';
    if (window.URLSearchParams) {
        var urlParams = new URLSearchParams(window.location.search);
        productType = urlParams.get('type');
        filters = urlParams.get('filters');
    } else {
        // 兼容旧浏览器的URL参数解析
        var search = window.location.search.substring(1);
        var params = search.split('&');
        for (var k = 0; k < params.length; k++) {
            var pair = params[k].split('=');
            if (decodeURIComponent(pair[0]) === 'type') {
                productType = decodeURIComponent(pair[1]);
            } else if (decodeURIComponent(pair[0]) === 'filters') {
                filters = decodeURIComponent(pair[1]);
            }
        }
    }
    
    if (productType && filters) {
        // 使用pageRouter显示结果，避免直接操作DOM
        if (window.pageRouter) {
            // 先显示结果页面
            var resultPageMap = {
                'hmi': 'hmiResult',
                'plc': 'plcResult',
                'servo': 'servoResult',
                'inverter': 'inverterResult',
                'io': 'ioResult',
                'robot': 'robotResult'
            };
            var pageName = resultPageMap[productType.toLowerCase()];
            if (pageName) {
                window.pageRouter.showPage(pageName);
                // 解析筛选条件
                try {
                    var filterData = JSON.parse(decodeURIComponent(filters));
                    // 触发筛选事件 - 兼容旧浏览器
                    var event;
                    if (typeof CustomEvent === 'function') {
                        event = new CustomEvent('showFilterResults', {
                            detail: {
                                productType: productType,
                                filterData: filterData
                            }
                        });
                    } else {
                        event = document.createEvent('CustomEvent');
                        event.initCustomEvent('showFilterResults', true, true, {
                            productType: productType,
                            filterData: filterData
                        });
                    }
                    document.dispatchEvent(event);
                } catch (e) {
                    console.error('解析筛选条件失败:', e);
                }
            }
        }
    }
    
    // 修复:has()选择器兼容性问题 - 使用事件委托为复选框和单选框添加事件监听
    function setupCheckboxRadioEventListeners() {
        // 为所有模态框内容添加事件委托，处理复选框和单选框的change事件
        document.addEventListener('change', function(e) {
            var target = e.target;
            
            // 处理复选框
            if (target.type === 'checkbox' && target.parentElement.classList.contains('checkbox-option')) {
                var parent = target.parentElement;
                if (target.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
            }
            
            // 处理单选框
            if (target.type === 'radio' && target.parentElement.classList.contains('radio-option')) {
                // 移除同组所有单选框的选中状态
                var name = target.name;
                var sameNameRadios = document.querySelectorAll('input[type="radio"][name="' + name + '"]');
                for (var k = 0; k < sameNameRadios.length; k++) {
                    sameNameRadios[k].parentElement.classList.remove('checked');
                }
                // 为当前选中的单选框添加选中状态
                target.parentElement.classList.add('checked');
            }
        });
        
        // 为筛选选项添加点击事件委托
        document.addEventListener('click', function(e) {
            var target = e.target;
            if (target.classList.contains('filter-option')) {
                var parent = target.parentElement;
                var siblings = parent.querySelectorAll('.filter-option');
                for (var m = 0; m < siblings.length; m++) {
                    siblings[m].classList.remove('selected');
                }
                target.classList.add('selected');
            }
        });
    }
    
    // 初始化处理
    setupCheckboxRadioEventListeners();
});

// 顶部栏标题更新
window.setTopBarTitle = function(title) {
    var titleEl = document.querySelector('.page-title');
    if (titleEl) titleEl.textContent = title;
};

// 顶部栏返回按钮显示/隐藏
window.setTopBarBackVisible = function(visible) {
    var btn = document.getElementById('topbarBackBtn');
    if (!btn) return;
    btn.style.display = visible ? 'inline-block' : 'none';
};

// 顶部栏返回按钮事件
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('topbarBackBtn');
    if (btn) {
        btn.addEventListener('click', function() {
            if (window.pageRouter) {
                window.pageRouter.backToMain();
            }
        });
    }
});

// 全局产品类型数据
window.productTypes = window.productTypes || {};

console.log('通用模块已加载');

// ==================== 通用工具函数 ====================

// 获取参数键名的映射函数
function getParamKey(displayName) {
    // 参数键名映射表
    const paramKeyMap = {
        // HMI相关参数
        '型号': 'model',
        '屏幕尺寸': 'screenSize',
        '分辨率': 'resolution',
        '价格': 'price',
        '描述': 'description',
        
        // PLC相关参数
        '输入点数': 'inputPoints',
        '输出点数': 'outputPoints',
        'CPU型号': 'cpuModel',
        '内存容量': 'memory',
        '本地扩展模块数': 'localExpansionModules',
        '程序存储空间': 'programStorage',
        '数据存储空间': 'dataStorage',
        '掉电数据保存大小': 'powerFailureDataSize',
        '运动控制轴数': 'motionControlAxes',
        '高速I/O功能': 'highSpeedIO',
        '软元件特性': 'softElementFeatures',
        '本体输出类型': 'mainOutputType',
        'EtherCAT': 'ethercat',
        'CANopen/CANlink': 'canOpenCanlink',
        'ModbusTCP': 'modbusTCP',
        'Modbus（串口）': 'modbusSerial',
        'EtherNet/IP': 'etherNetIP',
        
        // 伺服系统相关参数
        '额定功率': 'ratedPower',
        '额定电压': 'ratedVoltage',
        '额定转矩': 'ratedTorque',
        
        // 变频器相关参数
        '功率范围': 'powerRange',
        '电压等级': 'voltage',
        
        // 机器人相关参数
        '臂展': 'armLength',
        '最大负载': 'maxLoad'
    };
    
    return paramKeyMap[displayName] || displayName;
}

// 显示结果的通用函数
function displayResults(containerId, results, displayParams, productTypeName, filtersSummary = []) {
    // 将displayResults函数导出到全局作用域，供其他模块调用
    if (typeof window !== 'undefined') {
        window.displayResults = displayResults;
    }
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }
    
    container.innerHTML = '';
    
    // 设置结果标题
    
    // 更新顶部栏标题
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`${productTypeName}筛选结果 (${results.length})`);
    }
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>没有找到匹配的产品</p>
                <button id="resetFilters" class="reset-btn">重置筛选条件</button>
            </div>
        `;
        return;
    }
    
    // 创建结果卡片容器
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';
    
    // 为每个结果创建卡片
    results.forEach((product, index) => {
        try {
            const card = document.createElement('div');
            card.className = 'result-card';

            // 统一获取价格，优先使用product.price，其次使用映射后的键名
            const priceKey = getParamKey('价格');
            const rawPrice = product.price !== undefined ? product.price : product[priceKey];
            
            // 格式化价格显示
            let priceBadgeHtml = '';
            if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
                if (typeof rawPrice === 'number') {
                    // 数字类型价格，添加货币符号并格式化
                    priceBadgeHtml = `<span class="price-badge">¥${rawPrice.toLocaleString()}</span>`;
                } else {
                    // 字符串类型价格，直接显示
                    priceBadgeHtml = `<span class="price-badge">${rawPrice}</span>`;
                }
            };

            let cardContent = `
                <div class="result-card-content">
                    <div class="result-card-header">
                        <h3 class="result-card-title">${product.model || product.id || `产品 ${index + 1}`}</h3>
                        ${priceBadgeHtml}
                    </div>
                    <div class="result-card-info">
            `;

            // 过滤掉价格参数（已在头部显示）和型号（已在标题显示），确保只显示有效的参数
            const validParams = displayParams.filter(param => {
                // 只处理非空字符串和非价格、非型号参数
                return typeof param === 'string' && param.trim() !== '' && param !== '价格' && param !== '型号';
            });
            
            // 遍历显示有效参数
            validParams.forEach(param => {
                const paramKey = getParamKey(param);
                // 优先使用映射后的键名获取值，其次使用原始参数名
                const value = product[paramKey] !== undefined ? product[paramKey] : product[param] !== undefined ? product[param] : '-';
                // 为变频器的功率范围和电压等级添加着重显示样式
                const isHighlighted = (productTypeName === '变频器' && (param === '功率范围' || param === '电压等级'));
                const highlightStyle = isHighlighted ? ' style="color: var(--primary-color, #1e40af); font-weight: 600;"' : '';
                cardContent += `
                    <div class="result-info-item">
                        <strong>${param}:</strong>
                        <span${highlightStyle}>${value}</span>
                    </div>
                `;
            });

            cardContent += `
                    </div>
                </div>
                <div class="result-card-actions">
                    <a href="https://www.inovance.com/portal/allResult?key=${product.model || ''}" 
                       class="download-btn" 
                       target="_blank" 
                       rel="noopener noreferrer">资料和图纸下载</a>
                    <button class="compare-btn"
                        data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'
                        data-type="${productTypeName}">对比</button>
                    <button class="add-to-bom-btn"
                        data-id="${product.id || product.model || ''}"
                        data-model="${product.model || ''}"
                        data-category="${productTypeName}"
                        data-name="${product.name || product.model || ''}"
                        data-price="${rawPrice === undefined ? '' : (typeof rawPrice === 'number' ? rawPrice : String(rawPrice).replace(/[^0-9.]/g,''))}"
                        data-description="${(() => {
                            // 构建完整描述
                            let desc = product.description || product['描述'] || '';
                            
                            // 对于PLC包含轴数和EtherNet/IP支持信息
                            if (productTypeName === 'PLC控制器') {
                                let plcDesc = [];
                                
                                // 添加轴数信息
                                if (product.motionControlAxes) {
                                    plcDesc.push(product.motionControlAxes);
                                }
                                
                                // 添加EtherNet/IP支持信息，统一格式
                                if (product.etherNetIP) {
                                    plcDesc.push('支持EtherNet IP网口');
                                } else {
                                    plcDesc.push('不支持EtherNet IP网口');
                                }
                                
                                if (plcDesc.length > 0) {
                                    const plcDescStr = plcDesc.join('/');
                                    desc = desc ? `${desc}/${plcDescStr}` : plcDescStr;
                                }
                            }
                            
                            // 对于变频器包含电压、功率和控制方式信息
                            if (productTypeName === '变频器') {
                                const power = product.powerRange || product['功率范围'] || '';
                                const voltage = product.voltage || product['电压等级'] || '';
                                const controlMode = product.controlMode || product['控制方式'] || '';
                                if (power || voltage || controlMode) {
                                    // 确保功率单位显示为Kw
                                    let formattedPower = String(power);
                                    if (formattedPower && !formattedPower.includes('Kw') && !formattedPower.includes('KW') && !formattedPower.includes('kw')) {
                                        formattedPower = `${formattedPower}Kw`;
                                    }
                                    
                                    // 确保电压单位显示为V
                                    let formattedVoltage = String(voltage);
                                    if (formattedVoltage && !formattedVoltage.includes('V') && !formattedVoltage.includes('v')) {
                                        formattedVoltage = `${formattedVoltage}V`;
                                    }
                                    
                                    // 构建变频器描述，顺序为：功率/电压/控制方式
                                    const descParts = [];
                                    if (formattedPower) descParts.push(formattedPower);
                                    if (formattedVoltage) descParts.push(formattedVoltage);
                                    if (controlMode) descParts.push(controlMode);
                                    
                                    const inverterDesc = descParts.join('/').trim();
                                    desc = desc ? `${desc}/${inverterDesc}` : inverterDesc;
                                }
                            }
                            
                            // 对于机器人包含臂展和负载信息
                            if (productTypeName === '机器人') {
                                // 判断轴数：Robot6Axis为6轴，Robot4Axis为4轴
                                let axisType = '';
                                if (product.series === 'Robot6Axis') {
                                    axisType = '6轴';
                                } else if (product.series === 'Robot4Axis') {
                                    axisType = '4轴';
                                }
                                
                                const maxLoad = product['最大负载'] || '';
                                const armLength = product['臂展'] || '';
                                
                                const descParts = [];
                                if (axisType) descParts.push(axisType);
                                if (maxLoad) descParts.push(`最大负载:${maxLoad}`);
                                if (armLength) descParts.push(`臂展:${armLength}`);
                                
                                const robotDesc = descParts.join('/').trim();
                                desc = robotDesc;
                            }
                            
                            return desc;
                        })()}">
                        + 添加到BOM
                    </button>
                </div>
            `;

            card.innerHTML = cardContent;
            resultsContainer.appendChild(card);
        } catch (error) {
        }
    });
    
    // 将容器添加到结果区域
    container.appendChild(resultsContainer);
    
    // 显示筛选条件摘要
    if (Array.isArray(filtersSummary) && filtersSummary.length > 0) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'filters-summary';
        summaryDiv.innerHTML = filtersSummary.map(item => `<span class="filter-chip">${item.label}: ${item.value}</span>`).join('');
        container.appendChild(summaryDiv);
    }
}

// ==================== 本地存储管理类 ====================
// 本地存储管理类，简化设计，增强可靠性 - 使用构造函数模式兼容旧浏览器
function LocalStorageManager() {
    this.reservedKeys = ['petSettings', 'theme', 'productSearchHistory', 'usageStats', 'clickCounts'];
    this.expirationTime = 30 * 24 * 60 * 60 * 1000; // 30天过期
    this.isAvailableCache = null; // 缓存可用性检查结果
}

// 检查localStorage是否可用，带缓存
LocalStorageManager.prototype.isAvailable = function() {
    if (this.isAvailableCache !== null) {
        return this.isAvailableCache;
    }
    
    try {
        var testKey = '__localStorage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        this.isAvailableCache = true;
        return true;
    } catch (e) {
        console.warn('LocalStorage is not available:', e.message);
        this.isAvailableCache = false;
        return false;
    }
};

// 清理过期的本地存储数据
LocalStorageManager.prototype.cleanup = function() {
    if (!this.isAvailable()) return;
    
    try {
        var now = Date.now();
        var keys = Object.keys(localStorage);
        
        // 遍历所有键，找出需要清理的键
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            // 保留指定的键
            if (this.reservedKeys.indexOf(key) !== -1) continue;
            
            try {
                var item = JSON.parse(localStorage[key]);
                // 检查是否有过期时间，且已经过期
                if (item.expires && now > item.expires) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // 对于无法解析的非结构化数据，跳过
                continue;
            }
        }
    } catch (e) {
        console.error('Failed to cleanup localStorage:', e.message);
    }
};

// 设置数据到localStorage
LocalStorageManager.prototype.setItem = function(key, value, expires) {
    if (expires === undefined) {
        expires = null;
    }
    
    if (!this.isAvailable()) return false;
    
    try {
        // 包装数据，添加时间戳和过期时间
        var data = {
            value: value,
            timestamp: Date.now(),
            expires: expires ? Date.now() + expires : null
        };
        
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to set item to localStorage:', key, e.message);
        // 如果设置失败，尝试清理一些空间后再试一次
        this.cleanup();
        try {
            var data2 = {
                value: value,
                timestamp: Date.now(),
                expires: expires ? Date.now() + expires : null
            };
            localStorage.setItem(key, JSON.stringify(data2));
            return true;
        } catch (e2) {
            console.error('Failed to set item to localStorage after cleanup:', key, e2.message);
            return false;
        }
    }
};

// 从localStorage获取数据
LocalStorageManager.prototype.getItem = function(key) {
    if (!this.isAvailable()) return null;
    
    try {
        var itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            // 尝试解析为包装后的JSON格式
            var item = JSON.parse(itemStr);
            
            // 检查是否为包装格式（包含value属性）
            if (item && typeof item === 'object' && 'value' in item) {
                // 检查是否过期
                if (item.expires && Date.now() > item.expires) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                return item.value;
            } else {
                // 如果不是包装格式，直接返回解析结果
                return item;
            }
        } catch (jsonError) {
            // 如果JSON解析失败，返回原始字符串
            return itemStr;
        }
    } catch (e) {
        console.error('Failed to get item from localStorage:', key, e.message);
        return null;
    }
};

// 从localStorage移除数据
LocalStorageManager.prototype.removeItem = function(key) {
    if (!this.isAvailable()) return;
    
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Failed to remove item from localStorage:', key, e.message);
    }
};

// 清空localStorage
LocalStorageManager.prototype.clear = function() {
    if (!this.isAvailable()) return;
    
    try {
        // 保存保留的键
        var reservedData = {};
        for (var i = 0; i < this.reservedKeys.length; i++) {
            var key = this.reservedKeys[i];
            var value = this.getItem(key);
            if (value !== null) {
                reservedData[key] = value;
            }
        }
        
        // 清空localStorage
        localStorage.clear();
        
        // 恢复保留的键
        for (var key in reservedData) {
            if (reservedData.hasOwnProperty(key)) {
                this.setItem(key, reservedData[key]);
            }
        }
    } catch (e) {
        console.error('Failed to clear localStorage:', e.message);
    }
};

// 导出本地存储管理器到全局
window.localStorageManager = new LocalStorageManager;

// ==================== 设置管理器 ====================
// 设置管理器对象，负责处理设置按钮的功能
var SettingsManager = {
    // 设置相关变量
    settings: {
        showPetByDefault: true, // 默认显示人物
        sizeRatio: 80 // 默认大小比例80%
    },
    
    // 初始化设置
    initSettings: function() {
        // 从localStorage加载设置
        var savedSettings = window.localStorageManager.getItem('petSettings');
        if (savedSettings) {
            try {
                // 合并设置对象 - 兼容旧浏览器
                for (var key in savedSettings) {
                    if (savedSettings.hasOwnProperty(key)) {
                        this.settings[key] = savedSettings[key];
                    }
                }
            } catch (e) {
                console.error('Failed to parse settings:', e);
                this.settings = { showPetByDefault: true, sizeRatio: 100 };
            }
        }
        
        // 宠物容器可能还未创建，所以这里不做显示控制，由pet-drag-only.js在创建后处理
        
        // 清理过期的本地存储数据
        window.localStorageManager.cleanup();
    },
    
    // 保存设置到localStorage
    saveSettings: function() {
        try {
            // 保存设置到localStorage，不设置过期时间
            window.localStorageManager.setItem('petSettings', this.settings);
        } catch (e) {
            console.error('Failed to save settings to localStorage:', e);
        }
    },
    
    // 显示设置弹窗
    showSettingsModal: function() {
        var modal = document.getElementById('settingsModal');
        var toggle = document.getElementById('pet-default-toggle');
        
        // 设置开关状态
        toggle.checked = this.settings.showPetByDefault;
        
        // 显示弹窗
        modal.style.display = 'block';
    },
    
    // 隐藏设置弹窗
    hideSettingsModal: function() {
        var modal = document.getElementById('settingsModal');
        modal.style.display = 'none';
    },
    
    // 绑定设置相关事件
    bindSettingsEvents: function() {
        // 设置按钮点击事件
        var settingsBtn = document.getElementById('settings-toggle');
        var self = this;
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                self.showSettingsModal();
            });
        }
        
        // 设置弹窗关闭事件
        var closeBtn = document.getElementById('settingsClose');
        var modal = document.getElementById('settingsModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                self.hideSettingsModal();
            });
        }
        
        // 点击弹窗外部关闭
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                self.hideSettingsModal();
            }
        });
        
        // 保存设置按钮点击事件
        var saveBtn = document.getElementById('settingsSave');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var toggle = document.getElementById('pet-default-toggle');
                self.settings.showPetByDefault = toggle.checked;
                self.saveSettings();
                
                // 更新当前宠物显示状态
                var petContainer = document.getElementById('pet-container');
                if (petContainer) {
                    petContainer.style.display = self.settings.showPetByDefault ? 'block' : 'none';
                }
                
                self.hideSettingsModal();
            });
        }
        
        // 清理过期的本地存储数据，但保留主题和人物设置
        window.localStorageManager.cleanup();
    },
    
    // 更新设置（用于宠物隐藏时调用）
    updateSetting: function(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    },
    
    // 获取当前设置
    getSetting: function(key) {
        return this.settings[key];
    }
};

// 导出设置管理器到全局
window.SettingsManager = SettingsManager;

// 在DOM加载完成后初始化设置
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        SettingsManager.initSettings();
        SettingsManager.bindSettingsEvents();
    });
} else {
    SettingsManager.initSettings();
    SettingsManager.bindSettingsEvents();
}


