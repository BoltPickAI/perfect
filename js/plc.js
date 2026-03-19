// 全局PLC数据和类型定义
window.plcData = window.plcData || {};
window.plcType = window.plcType || {};

// PLC筛选相关变量
let plcSelectedFilters = {};

// 预定义PLC系列轴数选项
const plcSeriesAxisOptions = {
    '小型PLC': ['4路脉冲轴', '5路脉冲轴', '8轴(脉冲轴+EtherCAT轴)', '16轴(脉冲轴+EtherCAT轴)', '32轴(脉冲轴+EtherCAT轴)'],
    '中型PLC': ['0', '8', '16', '32', '64', '96', '128'],
    '智能型PLC': ['0', '16', '32', '48', '64', '128', '256', '512']
};

// ===== PLC弹窗模块 =====
;(function(){
    const bomModal = document.getElementById('bomAddModal');
    const bomTitle = document.getElementById('bomAddTitle');
    const bomBody = document.getElementById('bomAddBody');
    const bomConfirm = document.getElementById('bomAddConfirm');
    const bomCancel = document.getElementById('bomAddCancel');
    const bomClose = document.getElementById('bomAddClose');

    function showModal(){ if (bomModal) bomModal.classList.add('show'); }
    function hideModal(){ if (bomModal) bomModal.classList.remove('show'); }

    function openQuantityModal(product) {
        if (!bomModal || !product) return;
        
        bomTitle.textContent = `添加 ${product.model} 到BOM表`;
        bomBody.innerHTML = `
            <div class="form-group">
                <label>数量</label>
                <input type="number" id="bomQty" class="inline-input" min="0" value="1" title="数量" placeholder="数量" />
            </div>

            <div class="form-group">
                <label>备注</label>
                <input type="text" id="bomRemark" class="inline-input" placeholder="可选" title="备注" />
            </div>
        `;

        bomConfirm.onclick = () => {
            const qty = Math.max(0, parseInt((document.getElementById('bomQty')||{}).value || '0', 10));
            const remark = (document.getElementById('bomRemark')||{}).value || '';
            
            // 构建产品描述
            let description = product.description || '';
            if (remark) {
                description = description ? `${description} ${remark}` : remark;
            }
            
            // 添加到BOM表
            window.BOM && window.BOM.addItem({
                id: product.id || product.model,
                model: product.model,
                category: 'PLC',
                name: product.name || product.model,
                description: description,
                price: product.price || 0,
                quantity: qty
            });

            hideModal();
            if (window.BOM && typeof window.BOM.showSuccessMessage === 'function') {
                window.BOM.showSuccessMessage('添加成功');
            }
        };

        bomCancel.onclick = hideModal;
        bomClose.onclick = hideModal;
        showModal();
    }

    window.PLCModals = { openQuantityModal };
})();

console.log('PLC模块已加载');

// 初始化PLC相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 绑定返回主页按钮事件
    const backToMainBtn = document.querySelector('#plcResultPage .back-to-main');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            // 隐藏结果页面，显示主内容区域
            document.getElementById('plcResultPage').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            
            // 更新侧边栏活动状态
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.nav-item[href="#"]').closest('li').querySelector('.nav-item').classList.add('active');
        });
    }
    // 绑定PLC产品卡片点击事件
    const plcCard = document.querySelector('.product-card[data-type="PLC"]');
    if (plcCard) {
        plcCard.addEventListener('click', function(e) {
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showPLCFilterModal();
            }
        });
    }
    
    // 绑定侧边栏PLC链接点击事件
    const plcLink = document.querySelector('.product-link[data-type="PLC"]');
    if (plcLink) {
        plcLink.addEventListener('click', function(e) {
            e.preventDefault();
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showPLCFilterModal();
            }
        });
    }
    
    // 绑定PLC弹窗关闭事件
    const plcCloseBtn = document.querySelector('.close-plc');
    if (plcCloseBtn) {
        plcCloseBtn.addEventListener('click', function() {
            document.getElementById('plcFilterModal').classList.remove('show');
        });
    }
    
    // 确认筛选按钮会在showPLCFilterModal函数中动态创建并绑定事件
    const plcResultContainer = document.getElementById('plcResultContent');
    if (plcResultContainer) {
        plcResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const payload = {
                    id: btn.dataset.id || '-',
                    model: btn.dataset.model || '-',
                    category: btn.dataset.category || 'PLC控制器',
                    name: btn.dataset.name || btn.dataset.model || '-',
                    price: parseFloat(btn.dataset.price || '0'),
                    description: btn.dataset.description || ''
                };
                // 优先使用PLC专用的模态框，然后再尝试使用全局的BOMModals
                if (window.PLCModals && window.PLCModals.openQuantityModal) {
                    window.PLCModals.openQuantityModal(payload);
                } else {
                    console.warn('PLC专用模态框模块未加载，无法打开数量选择弹窗');
                }
            }
        });
    }
});

// 显示PLC筛选弹窗
function showPLCFilterModal() {
    const modal = document.getElementById('plcFilterModal');
    const filterOptions = document.getElementById('plcFilterOptions');
    
    // 清空之前的筛选选项
    filterOptions.innerHTML = '';
    
    // 使用固定对象获取所有系列
    const seriesList = Object.keys(plcSeriesAxisOptions);
    
    // 设置弹窗标题
    modal.querySelector('h2').textContent = 'PLC可编程控制器筛选';
    
    // 创建系列筛选选项
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    seriesCategory.innerHTML = `
        <h3>选择系列</h3>
        <div class="series-group filter-options">
            ${seriesList.map(series => `
                <label class="radio-option">
                    <input type="radio" name="series" value="${series}">
                    <span class="series-name">${series}</span>
                </label>
            `).join('')}
        </div>
    `;
    filterOptions.appendChild(seriesCategory);
    
    // 创建轴数筛选选项容器（先不填充内容）
    const axesCategory = document.createElement('div');
    axesCategory.className = 'filter-section';
    axesCategory.id = 'plcAxesSection';
    axesCategory.style.display = 'none';
    axesCategory.innerHTML = `
        <h3>轴数</h3>
        <div id="plcAxesOptions" class="filter-options"></div>
    `;
    filterOptions.appendChild(axesCategory);
    
    // 为系列选项绑定事件
    seriesCategory.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            plcSelectedFilters.series = [this.value];
            plcSelectedFilters.axes = []; // 清除轴数选择
            updatePlcAxesOptions(this.value);
        });
    });
    
    // 更新轴数选项的函数
    function updatePlcAxesOptions(selectedSeries) {
        const axesOptionsContainer = document.getElementById('plcAxesOptions');
        const axesSection = document.getElementById('plcAxesSection');
        
        if (!selectedSeries || !plcSeriesAxisOptions[selectedSeries]) {
            axesSection.style.display = 'none';
            return;
        }
        
        // 使用固定对象获取轴数选项
        const axesList = plcSeriesAxisOptions[selectedSeries];
        
        if (axesList.length > 0) {
            axesSection.style.display = 'block';
            axesOptionsContainer.innerHTML = axesList.map(axes => `
                <label class="radio-option">
                    <input type="radio" name="axes" value="${axes}">
                    <span>${axes}</span>
                </label>
            `).join('');
            
            // 为轴数选项绑定事件
            axesOptionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    plcSelectedFilters.axes = [this.value];
                });
            });
        } else {
            axesSection.style.display = 'none';
        }
    }
    
    // 添加按钮容器
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';
    actionsDiv.innerHTML = `
        <button id="plcCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="plcConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(actionsDiv);
    
    // 绑定确认筛选按钮事件：直接应用筛选并显示结果
    document.getElementById('plcConfirmFilter').addEventListener('click', function() {
        applyPLCFilters();
    });
    
    // 绑定取消按钮事件
    document.getElementById('plcCancelFilter').addEventListener('click', function() {
        modal.classList.remove('show');
    });
    
    // 显示弹窗
    modal.classList.add('show');
    
    // 重置筛选条件
    plcSelectedFilters = {};
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', function plcModalClickHandler(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
            window.removeEventListener('click', plcModalClickHandler);
        }
    });
}

// 暴露到全局供路由调用
if (typeof window !== 'undefined') {
    window.showPLCFilterModal = showPLCFilterModal;
}

// 应用PLC筛选条件并显示结果
function applyPLCFilters() {
    // 关闭弹窗
    document.getElementById('plcFilterModal').classList.remove('show');
    
    // 使用路由显示结果页面
    if (window.pageRouter) {
        window.pageRouter.showPage('plcResult');
    }
    
    // 获取PLC数据
    const productData = window.plcData || {};
    const displayParams = (window.plcType && window.plcType.displayParams) || ['型号', '运动控制轴数', '价格'];
    const productTypeName = (window.plcType && window.plcType.name) || 'PLC控制器';
    
    // 更新顶部栏标题
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`${productTypeName}筛选结果 (${Object.keys(productData).length ? filterPLCProductData(productData, plcSelectedFilters).length : 0})`);
    }
    
    // 筛选数据
    const filteredData = filterPLCProductData(productData, plcSelectedFilters);
    
    // 显示结果
    displayResults('plcResultContent', filteredData, displayParams, productTypeName);
}

// 筛选PLC产品数据
function filterPLCProductData(data, filters) {
    const filteredData = [];
    
    // 如果没有筛选条件，返回所有数据
    if (Object.keys(filters).length === 0) {
        Object.values(data).forEach(series => {
            Object.values(series).forEach(product => {
                filteredData.push(product);
            });
        });
        return filteredData;
    }
    
    // 根据系列筛选
    let seriesFilteredData = [];
    if (filters.series && filters.series.length > 0) {
        filters.series.forEach(seriesName => {
            if (data[seriesName]) {
                Object.values(data[seriesName]).forEach(product => {
                    seriesFilteredData.push(product);
                });
            }
        });
    } else {
        // 如果没有选择系列，使用所有数据
        Object.values(data).forEach(series => {
            Object.values(series).forEach(product => {
                seriesFilteredData.push(product);
            });
        });
    }
    
    // 如果没有其他筛选条件，直接返回系列筛选结果
    if (Object.keys(filters).length === (filters.series ? 1 : 0)) {
        return seriesFilteredData;
    }
    
    // 根据其他参数筛选
    let finalFilteredData = seriesFilteredData;
    
    Object.keys(filters).forEach(param => {
        // 跳过系列参数，已经处理过了
        if (param === 'series') return;
        
        // 特殊处理model参数，使用包含匹配
        if (param === 'model') {
            const normalizedModel = filters[param].trim().toUpperCase();
            finalFilteredData = finalFilteredData.filter(product => 
                product.model && product.model.toUpperCase().includes(normalizedModel)
            );
        } else if (param === 'axes' && filters.axes && filters.axes.length > 0) {
            // 特殊处理axes参数，映射到motionControlAxes
            finalFilteredData = finalFilteredData.filter(product => {
                const productValue = product.motionControlAxes;
                return productValue !== undefined && filters.axes.includes(String(productValue));
            });
        } else if (filters[param] && filters[param].length > 0) {
            finalFilteredData = finalFilteredData.filter(product => {
                const productValue = product[param] || product[getParamKey(param)];
                return productValue !== undefined && filters[param].includes(String(productValue));
            });
        }
    });
    
    return finalFilteredData;
}

// 提供给路由的筛选选择获取函数
window.getPlcFilterSelections = function() {
    return plcSelectedFilters || {};
};

// 监听路由分发的结果展示事件
document.addEventListener('showFilterResults', function(e) {
    if (e.detail && e.detail.productType === 'PLC') {
        const productData = window.plcData || {};
        const displayParams = (window.plcType && window.plcType.displayParams) || ['型号', '运动控制轴数', '价格'];
        const productTypeName = (window.plcType && window.plcType.name) || 'PLC控制器';
        const filterData = e.detail.filterData || plcSelectedFilters || {};

        if (typeof window.setTopBarTitle === 'function') {
            window.setTopBarTitle(`${productTypeName}筛选结果 (${filterData && Object.keys(filterData).length ? filterPLCProductData(productData, filterData).length : filterPLCProductData(productData, {}).length})`);
        }
        const filteredData = filterPLCProductData(productData, filterData);
        displayResults('plcResultContent', filteredData, displayParams, productTypeName);
    }
});