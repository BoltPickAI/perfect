// 搜索功能模块
class ProductSearch {
    constructor() {
        // 初始化搜索相关元素
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.searchSuggestions = document.getElementById('search-suggestions');
        this.searchLoading = document.getElementById('search-loading');
        
        // 搜索配置
        this.MIN_INPUT_LENGTH = 2; // 最小搜索输入长度
        this.MAX_SUGGESTIONS = 8; // 最大搜索建议数量
        this.DEBOUNCE_DELAY = 200; // 防抖延迟时间（毫秒）
        
        // 搜索缓存
        this.searchCache = new Map();
        
        // 当前搜索建议索引
        this.currentSuggestionIndex = -1;
        
        // 防抖计时器
        this.debounceTimer = null;
        
        // 系列识别规则库
        this.seriesRules = {
            // HMI系列规则
            HMI: {
                patterns: [/^IT7/, /^ITS7/, /^IT9/],
                dataKey: 'hmiData'
            },
            // PLC系列规则
            PLC: {
                patterns: [/^IS2/, /^IS3/, /^IP1/, /^IP2/, /^AM/, /^AC/, /^AI/, /^PLC-/],
                dataKey: 'plcData'
            },
            // 大功率伺服系统系列规则
            HighPowerServo: {
                patterns: [/^ISMG/],
                dataKey: 'highPowerServoSystemData'
            },
            // 伺服系统系列规则
            Servo: {
                patterns: [/^SV6/, /^SV7/, /^SV8/, /^MS1/, /^S6/],
                dataKey: 'servoSystemData'
            },
            // 变频器系列规则
            Inverter: {
                patterns: [/^MD2/, /^MD3/, /^MD5/],
                dataKey: 'inverterData'
            },
            // IO模块系列规则
            IO: {
                patterns: [/^IO/, /^IS6/],
                dataKey: 'ioData'
            },
            // 柜外IO模块系列规则
            OutdoorIO: {
                patterns: [/^GS20/, /^GR20/],
                dataKey: 'outdoorIoData'
            },
            // 机器人系列规则
            Robot: {
                patterns: [/^IR-/],
                dataKey: 'robotData'
            }
        };
        
        // 初始化所有型号数据
        this.allModels = this.initializeAllModels();
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 初始化所有型号数据
    initializeAllModels() {
        const allModels = [];
        
        // 遍历所有产品类型数据
        const productTypes = ['hmiData', 'plcData', 'servoSystemData', 'highPowerServoSystemData', 'inverterData', 'ioData', 'outdoorIoData', 'robotData'];
        
        // 数据结构处理策略
        const dataStructureStrategies = {
            'ioData': (data, series, type) => {
                Object.values(data[series]).forEach(subCategory => {
                    Object.values(subCategory).forEach(product => {
                        if (product.model) {
                            allModels.push({
                                model: product.model,
                                normalizedModel: this.normalizeInput(product.model),
                                productType: this.getProductTypeFromDataKey(type),
                                dataKey: type,
                                series: series,
                                product: product
                            });
                        }
                    });
                });
            },
            'outdoorIoData': (data, series, type) => {
                Object.values(data[series]).forEach(subCategory => {
                    Object.values(subCategory).forEach(product => {
                        if (product.model) {
                            allModels.push({
                                model: product.model,
                                normalizedModel: this.normalizeInput(product.model),
                                productType: this.getProductTypeFromDataKey(type),
                                dataKey: type,
                                series: series,
                                product: product
                            });
                        }
                    });
                });
            },
            'servoSystemData': (data, series, type) => {
                Object.values(data[series]).forEach(subSeries => {
                    Object.entries(subSeries).forEach(([modelId, modelDetails]) => {
                        if (modelDetails['伺服电机'] && modelDetails['伺服电机'].model) {
                            const servoMotor = modelDetails['伺服电机'];
                            allModels.push({
                                model: servoMotor.model,
                                normalizedModel: this.normalizeInput(servoMotor.model),
                                productType: this.getProductTypeFromDataKey(type),
                                dataKey: type,
                                series: series,
                                product: servoMotor
                            });
                        }
                    });
                });
            },
            'highPowerServoSystemData': (data, series, type) => {
                Object.values(data[series]).forEach(subSeries => {
                    Object.entries(subSeries).forEach(([modelId, modelDetails]) => {
                        if (modelDetails['伺服电机'] && modelDetails['伺服电机'].model) {
                            const servoMotor = modelDetails['伺服电机'];
                            allModels.push({
                                model: servoMotor.model,
                                normalizedModel: this.normalizeInput(servoMotor.model),
                                productType: this.getProductTypeFromDataKey(type),
                                dataKey: type,
                                series: series,
                                product: servoMotor
                            });
                        }
                    });
                });
            },
            'default': (data, series, type) => {
                // 普通产品数据结构，两级结构：series → productId → product
                Object.values(data[series]).forEach(product => {
                    if (product.model) {
                        allModels.push({
                            model: product.model,
                            normalizedModel: this.normalizeInput(product.model),
                            productType: this.getProductTypeFromDataKey(type),
                            dataKey: type,
                            series: series,
                            product: product
                        });
                    }
                });
            }
        };
        
        productTypes.forEach(type => {
            const data = window[type];
            if (data) {
                // 遍历系列或类别
                Object.keys(data).forEach(series => {
                    const strategy = dataStructureStrategies[type] || dataStructureStrategies['default'];
                    strategy(data, series, type);
                });
            }
        });
        
        return allModels;
    }
    
    // 从数据键名获取产品类型
    getProductTypeFromDataKey(dataKey) {
        const typeMap = {
            'hmiData': 'HMI',
            'plcData': 'PLC',
            'servoSystemData': 'Servo',
            'highPowerServoSystemData': 'HighPowerServo',
            'inverterData': 'Inverter',
            'ioData': 'IO',
            'outdoorIoData': 'OutdoorIO',
            'robotData': 'Robot'
        };
        return typeMap[dataKey] || '';
    }
    
    // 绑定事件
    bindEvents() {
        // 搜索按钮点击事件
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // 搜索输入框事件
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.searchInput.addEventListener('focus', () => this.showSuggestions());
        
        // 清除搜索按钮事件
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        
        // 点击外部关闭搜索建议
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                this.hideSuggestions();
            }
        });
        

    }
    
    // 处理输入事件
    handleInput(e) {
        const value = e.target.value.trim();
        
        // 显示/隐藏清除按钮
        this.clearSearchBtn.style.display = value ? 'inline-block' : 'none';
        
        // 防抖处理搜索建议
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.generateSuggestions(value);
        }, this.DEBOUNCE_DELAY);
    }
    
    // 处理键盘事件
    handleKeydown(e) {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions(1, suggestions);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions(-1, suggestions);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentSuggestionIndex >= 0 && this.currentSuggestionIndex < suggestions.length) {
                    // 选择当前高亮的建议
                    this.selectSuggestion(suggestions[this.currentSuggestionIndex]);
                } else {
                    // 执行搜索
                    this.performSearch();
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }
    
    // 导航搜索建议
    navigateSuggestions(direction, suggestions) {
        if (suggestions.length === 0) return;
        
        // 移除当前高亮
        if (this.currentSuggestionIndex >= 0 && this.currentSuggestionIndex < suggestions.length) {
            suggestions[this.currentSuggestionIndex].classList.remove('highlighted');
        }
        
        // 计算新索引
        this.currentSuggestionIndex += direction;
        
        // 循环导航
        if (this.currentSuggestionIndex >= suggestions.length) {
            this.currentSuggestionIndex = 0;
        } else if (this.currentSuggestionIndex < 0) {
            this.currentSuggestionIndex = suggestions.length - 1;
        }
        
        // 添加新高亮
        suggestions[this.currentSuggestionIndex].classList.add('highlighted');
        
        // 滚动到可见区域
        suggestions[this.currentSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }
    
    // 标准化输入处理
    normalizeInput(input) {
        // 去除首尾及中间多余空格
        let normalized = input.trim().replace(/\s+/g, '');
        
        // 转换为大写格式
        normalized = normalized.toUpperCase();
        
        // 将特殊长连字符转换为普通短连字符
        normalized = normalized.replace(/‑/g, '-');
        
        // 过滤特殊字符，仅保留字母、数字和允许的符号
        normalized = normalized.replace(/[^A-Z0-9-_]/g, '');
        
        return normalized;
    }
    
    // 系列识别
    identifySeries(model) {
        // 遍历系列规则
        for (const [productType, rules] of Object.entries(this.seriesRules)) {
            for (const pattern of rules.patterns) {
                if (pattern.test(model)) {
                    return {
                        productType: productType,
                        dataKey: rules.dataKey
                    };
                }
            }
        }
        
        // 默认返回空
        return {
            productType: '',
            dataKey: ''
        };
    }
    
    // 生成搜索建议
    generateSuggestions(input) {
        console.log('Generating suggestions for:', input);
        
        if (input.length < this.MIN_INPUT_LENGTH) {
            console.log('Input too short, hiding suggestions');
            this.hideSuggestions();
            return;
        }
        
        // 标准化输入
        const normalizedInput = this.normalizeInput(input);
        console.log('Normalized input:', normalizedInput);
        
        // 检查缓存
        const cacheKey = `suggestions_${normalizedInput}`;
        if (this.searchCache.has(cacheKey)) {
            console.log('Using cached suggestions');
            this.displaySuggestions(this.searchCache.get(cacheKey));
            return;
        }
        
        // 显示加载状态
        this.showLoading();
        
        // 确保所有数据模块已加载
        this.ensureAllDataLoaded().then(() => {
            // 每次生成建议前重新初始化所有型号数据，确保获取最新数据
            this.allModels = this.initializeAllModels();
            console.log('Total models available:', this.allModels.length);
            
            // 过滤匹配的型号，使用标准化后的型号进行匹配，支持中间部分匹配
            const matchedModels = this.allModels.filter(item => {
                return item.normalizedModel.includes(normalizedInput);
            });
            
            console.log('Matched models:', matchedModels.length);
            
            // 排序并限制数量
            const sortedModels = matchedModels
                .sort((a, b) => {
                    // 优先匹配前缀，然后按匹配位置排序，最后按长度排序
                    const aPrefix = a.normalizedModel.startsWith(normalizedInput);
                    const bPrefix = b.normalizedModel.startsWith(normalizedInput);
                    if (aPrefix && !bPrefix) return -1;
                    if (!aPrefix && bPrefix) return 1;
                    
                    // 按匹配位置排序
                    const aIndex = a.normalizedModel.indexOf(normalizedInput);
                    const bIndex = b.normalizedModel.indexOf(normalizedInput);
                    if (aIndex !== bIndex) return aIndex - bIndex;
                    
                    // 按长度排序
                    return a.model.length - b.model.length;
                })
                .slice(0, this.MAX_SUGGESTIONS);
            
            console.log('Sorted and limited models:', sortedModels.length);
            
            // 缓存结果
            this.searchCache.set(cacheKey, sortedModels);
            
            // 显示建议
            this.displaySuggestions(sortedModels);
            
            // 隐藏加载状态
            this.hideLoading();
        }).catch(error => {
            console.error('Error loading data:', error);
            this.hideLoading();
        });
    }
    
    // 确保所有数据模块已加载
    ensureAllDataLoaded() {
        return new Promise((resolve, reject) => {
            // 如果没有dataLoaders，说明是未编译环境，直接返回
            if (!window.dataLoaders) {
                resolve();
                return;
            }
            
            // 需要加载的所有数据模块
            const requiredModules = ['hmi', 'plc', 'servo', 'high-power-servo', 'inverter', 'io', 'outdoor-io', 'robot'];
            
            // 检查哪些模块需要加载
            const modulesToLoad = requiredModules.filter(moduleName => !window.dataLoaders.isLoaded(moduleName));
            
            // 如果所有模块都已加载，直接返回
            if (modulesToLoad.length === 0) {
                resolve();
                return;
            }
            
            // 加载所有需要的模块
            const loadPromises = modulesToLoad.map(moduleName => {
                console.log(`Loading data module: ${moduleName}`);
                return window.dataLoaders.load(moduleName);
            });
            
            // 等待所有模块加载完成
            Promise.all(loadPromises).then(() => {
                console.log('All data modules loaded successfully');
                resolve();
            }).catch(error => {
                console.error('Error loading data modules:', error);
                reject(error);
            });
        });
    }
    
    // 显示搜索建议
    displaySuggestions(suggestions) {
        console.log('Displaying suggestions:', suggestions.length);
        
        // 清空现有建议
        this.searchSuggestions.innerHTML = '';
        
        // 确保搜索建议容器有正确的样式和位置
        this.searchSuggestions.style.display = 'block';
        this.searchSuggestions.style.position = 'absolute';
        this.searchSuggestions.style.zIndex = '1000';
        this.searchSuggestions.style.background = '#fff';
        this.searchSuggestions.style.border = '1px solid #ddd';
        this.searchSuggestions.style.borderRadius = '4px';
        this.searchSuggestions.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        this.searchSuggestions.style.maxHeight = '300px';
        this.searchSuggestions.style.overflowY = 'auto';
        this.searchSuggestions.style.minWidth = this.searchInput.offsetWidth + 'px';
        
        if (suggestions.length === 0) {
            console.log('No suggestions to display');
            return;
        }
        
        // 创建建议列表
        suggestions.forEach((item, index) => {
            console.log('Adding suggestion:', item.model);
            
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.dataset.model = item.model;
            suggestionItem.dataset.productType = item.productType;
            suggestionItem.dataset.dataKey = item.dataKey;
            suggestionItem.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s ease;
            `;
            suggestionItem.addEventListener('mouseenter', () => {
                suggestionItem.style.backgroundColor = '#f5f5f5';
            });
            suggestionItem.addEventListener('mouseleave', () => {
                suggestionItem.style.backgroundColor = '#fff';
            });
            
            // 高亮匹配部分
            const matchIndex = item.model.toUpperCase().indexOf(this.normalizeInput(this.searchInput.value));
            const modelHtml = matchIndex >= 0 
                ? `${item.model.substring(0, matchIndex)}<strong>${item.model.substring(matchIndex, matchIndex + this.searchInput.value.length)}</strong>${item.model.substring(matchIndex + this.searchInput.value.length)}`
                : item.model;
            
            suggestionItem.innerHTML = `
                <div class="suggestion-model" style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">${modelHtml}</div>
                <div class="suggestion-type" style="font-size: 12px; color: #999;">${this.getProductTypeName(item.productType)}</div>
            `;
            
            // 绑定点击事件
            suggestionItem.addEventListener('click', () => this.selectSuggestion(suggestionItem));
            
            this.searchSuggestions.appendChild(suggestionItem);
        });
        
        // 重置索引
        this.currentSuggestionIndex = -1;
    }
    
    // 获取产品类型名称
    getProductTypeName(productType) {
        const typeNames = {
            'HMI': '人机界面',
            'PLC': 'PLC控制器',
            'Servo': '伺服系统',
            'HighPowerServo': '大功率伺服系统',
            'Inverter': '变频器',
            'IO': 'IO模块',
            'OutdoorIO': '柜外IO模块',
            'Robot': '机器人'
        };
        return typeNames[productType] || productType;
    }
    
    // 选择搜索建议
    selectSuggestion(suggestionItem) {
        const model = suggestionItem.dataset.model;
        this.searchInput.value = model;
        this.hideSuggestions();
        this.performSearch();
    }
    
    // 显示搜索建议
    showSuggestions() {
        const value = this.searchInput.value.trim();
        if (value.length >= this.MIN_INPUT_LENGTH) {
            this.generateSuggestions(value);
        }
    }
    
    // 隐藏搜索建议
    hideSuggestions() {
        this.searchSuggestions.style.display = 'none';
        this.currentSuggestionIndex = -1;
    }
    
    // 显示加载状态
    showLoading() {
        this.searchLoading.style.display = 'inline-block';
    }
    
    // 隐藏加载状态
    hideLoading() {
        this.searchLoading.style.display = 'none';
    }
    
    // 执行搜索
    performSearch() {
        const input = this.searchInput.value.trim();
        if (!input) return;
        
        // 标准化输入
        const normalizedInput = this.normalizeInput(input);
        
        // 显示加载状态
        this.showLoading();
        
        // 检查缓存
        const cacheKey = `search_${normalizedInput}`;
        if (this.searchCache.has(cacheKey)) {
            this.handleSearchResults(this.searchCache.get(cacheKey));
            this.hideLoading();
            return;
        }
        
        // 模拟异步搜索
        setTimeout(() => {
            // 系列识别 - 使用原始输入进行系列识别，因为正则表达式可能依赖特定格式
            const seriesInfo = this.identifySeries(input);
            
            // 搜索结果
            let searchResults = [];
            
            if (seriesInfo.dataKey && window[seriesInfo.dataKey]) {
                // 在识别到的系列中搜索
                const data = window[seriesInfo.dataKey];
                
                // 数据搜索策略
                const searchStrategies = {
                    'ioData': (series, normalizedInput) => {
                        // 特殊处理IO模块数据，三级结构：series → subCategory → product
                        Object.values(series).forEach(subCategory => {
                            Object.values(subCategory).forEach(product => {
                                // 标准化产品型号进行匹配
                                const productNormalizedModel = this.normalizeInput(product.model);
                                if (product.model && productNormalizedModel.includes(normalizedInput)) {
                                    searchResults.push({
                                        ...product,
                                        productType: seriesInfo.productType,
                                        dataKey: seriesInfo.dataKey
                                    });
                                }
                            });
                        });
                    },
                    'outdoorIoData': (series, normalizedInput) => {
                        // 特殊处理柜外IO模块数据，三级结构：series → subCategory → product
                        Object.values(series).forEach(subCategory => {
                            Object.values(subCategory).forEach(product => {
                                // 标准化产品型号进行匹配
                                const productNormalizedModel = this.normalizeInput(product.model);
                                if (product.model && productNormalizedModel.includes(normalizedInput)) {
                                    searchResults.push({
                                        ...product,
                                        productType: seriesInfo.productType,
                                        dataKey: seriesInfo.dataKey
                                    });
                                }
                            });
                        });
                    },
                    'servoSystemData': (series, normalizedInput) => {
                        // 特殊处理伺服系统数据，四级结构：series → subSeries → modelId → details
                        Object.values(series).forEach(subSeries => {
                            Object.entries(subSeries).forEach(([modelId, modelDetails]) => {
                                if (modelDetails['伺服电机'] && modelDetails['伺服电机'].model) {
                                    const servoMotor = modelDetails['伺服电机'];
                                    // 标准化伺服电机型号进行匹配
                                    const servoNormalizedModel = this.normalizeInput(servoMotor.model);
                                    if (servoNormalizedModel.includes(normalizedInput)) {
                                        searchResults.push({
                                            ...servoMotor,
                                            productType: seriesInfo.productType,
                                            dataKey: seriesInfo.dataKey
                                        });
                                    }
                                }
                            });
                        });
                    },
                    'highPowerServoSystemData': (series, normalizedInput) => {
                        // 特殊处理大功率伺服系统数据，四级结构：series → subSeries → modelId → details
                        Object.values(series).forEach(subSeries => {
                            Object.entries(subSeries).forEach(([modelId, modelDetails]) => {
                                if (modelDetails['伺服电机'] && modelDetails['伺服电机'].model) {
                                    const servoMotor = modelDetails['伺服电机'];
                                    // 标准化伺服电机型号进行匹配
                                    const servoNormalizedModel = this.normalizeInput(servoMotor.model);
                                    if (servoNormalizedModel.includes(normalizedInput)) {
                                        searchResults.push({
                                            ...servoMotor,
                                            productType: seriesInfo.productType,
                                            dataKey: seriesInfo.dataKey
                                        });
                                    }
                                }
                            });
                        });
                    },
                    'default': (series, normalizedInput) => {
                        // 普通产品数据搜索，两级结构：series → productId → product
                        Object.values(series).forEach(product => {
                            // 标准化产品型号进行匹配
                            const productNormalizedModel = this.normalizeInput(product.model);
                            if (product.model && productNormalizedModel.includes(normalizedInput)) {
                                searchResults.push({
                                    ...product,
                                    productType: seriesInfo.productType,
                                    dataKey: seriesInfo.dataKey
                                });
                            }
                        });
                    }
                };
                
                // 遍历所有系列和产品
                Object.values(data).forEach(series => {
                    const strategy = searchStrategies[seriesInfo.dataKey] || searchStrategies['default'];
                    strategy(series, normalizedInput);
                });
            } else {
                // 全库搜索 - 使用标准化型号进行匹配
                this.allModels.forEach(item => {
                    if (item.normalizedModel.includes(normalizedInput)) {
                        searchResults.push({
                            ...item.product,
                            productType: item.productType,
                            dataKey: item.dataKey
                        });
                    }
                });
            }
            
            // 缓存结果
            this.searchCache.set(cacheKey, searchResults);
            
            // 处理搜索结果
            this.handleSearchResults(searchResults);
            
            // 隐藏加载状态
            this.hideLoading();
            

        }, 150);
    }
    
    // 处理搜索结果
    handleSearchResults(results) {
        if (results.length === 0) {
            // 无结果处理
            this.showNoResults();
        } else {
            // 获取产品类型
            const productType = results[0].productType;
            
            // 构建筛选数据，使用完全匹配的型号作为筛选条件
            const filterData = {
                model: this.searchInput.value.trim()
            };
            
            // 使用pageRouter的showResultPage方法，保持和筛选结果页面一模一样的显示效果
            if (window.pageRouter && typeof window.pageRouter.showResultPage === 'function') {
                window.pageRouter.showResultPage(productType, filterData);
            } else {
                // 如果pageRouter不存在或没有showResultPage方法，直接触发showFilterResults事件
                const event = new CustomEvent('showFilterResults', {
                    detail: {
                        productType: productType,
                        filterData: filterData
                    }
                });
                document.dispatchEvent(event);
            }
        }
    }
    
    // 显示无结果提示
    showNoResults() {
        // 显示友好的无结果提示
        this.displaySuggestions([]);
        
        // 创建无结果提示
        const noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results';
        noResultsEl.style.cssText = `
            padding: 16px;
            text-align: center;
            color: #666;
            font-size: 14px;
            background-color: #f9f9f9;
            border-radius: 4px;
        `;
        noResultsEl.innerHTML = `
            <div style="margin-bottom: 8px;">未找到匹配型号</div>
            <div style="font-size: 12px; color: #999;">可尝试模糊搜索或核对输入</div>
        `;
        
        this.searchSuggestions.appendChild(noResultsEl);
        this.searchSuggestions.style.display = 'block';
    }
    
    // 跳转到产品详情页
    navigateToProductDetail(product) {
        // 这里需要根据现有路由系统进行调整
        console.log('跳转到产品详情页:', product);
        
        // 模拟跳转
        if (window.pageRouter) {
            // 先显示结果页面
            const pageName = `${product.productType.toLowerCase()}Result`;
            window.pageRouter.showPage(pageName);
            
            // 触发自定义事件，显示产品详情
            const event = new CustomEvent('showProductDetail', {
                detail: {
                    productType: product.productType,
                    product: product
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // 跳转到筛选结果页面
    navigateToFilteredResults(results) {
        // 这里需要根据现有路由系统进行调整
        console.log('跳转到筛选结果页面:', results);
        
        // 模拟跳转
        if (window.pageRouter && results.length > 0) {
            // 先显示结果页面
            const productType = results[0].productType;
            const pageName = `${productType.toLowerCase()}Result`;
            const resultContainerId = `${productType.toLowerCase()}ResultContent`;
            
            // 显示结果页面
            window.pageRouter.showPage(pageName);
            
            // 获取产品类型名称
            const productTypeName = this.getProductTypeName(productType);
            
            // 检查结果容器是否存在
            const resultContainer = document.getElementById(resultContainerId);
            if (!resultContainer) {
                console.error('结果容器未找到:', resultContainerId);
                return;
            }
            
            // 获取显示参数
            const typeKey = `${productType.toLowerCase()}Type`;
            const displayParams = window[typeKey] && window[typeKey].displayParams ? window[typeKey].displayParams : ['型号', '价格'];
            
            // 直接使用已筛选的结果显示
            if (typeof window.displayResults === 'function') {
                window.displayResults(resultContainerId, results, displayParams, productTypeName, []);
            } else {
                // 如果window.displayResults不存在，直接调用displayResults（确保它在全局作用域中）
                displayResults(resultContainerId, results, displayParams, productTypeName, []);
            }
        }
    }
    
    // 清除搜索
    clearSearch() {
        this.searchInput.value = '';
        this.clearSearchBtn.style.display = 'none';
        this.hideSuggestions();
        this.searchInput.focus();
    }
    

}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已存在搜索实例
    if (!window.productSearch) {
        window.productSearch = new ProductSearch();
        console.log('搜索功能模块已加载');
    }
});
