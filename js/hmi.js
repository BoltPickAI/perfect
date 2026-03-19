// HMI模块 - 优化版，兼容路由系统
window.hmiData = window.hmiData || {};
window.hmiType = window.hmiType || {};

// 筛选相关变量
let hmiSelectedFilters = {};

// 预定义HMI系列屏幕尺寸选项
const hmiSeriesScreenSizeOptions = {
   
    'ITS7000': ['7寸标准版', '7寸标准版灰色', '7寸高清版', '7寸高清版灰色', '7寸网口版', '7寸网口版灰色', '7寸网口高清款', '7寸网口高清款灰色', '10寸标准版', '10寸标准版灰色', '10寸网口版', '10寸网口版灰色', '15寸网口版']
};

console.log('HMI模块已加载');

// ===== HMI弹窗模块 =====
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
                category: 'HMI',
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

    window.HMIModals = { openQuantityModal };
})();

// 初始化HMI相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 监听路由系统的筛选确认事件
    document.addEventListener('showFilterResults', function(e) {
        if (e.detail.productType === 'HMI') {
            showHMIResults(e.detail.filterData || hmiSelectedFilters);
        }
    });
    
    // 初始化筛选界面
    initHMIFilterModal();

    const hmiResultContainer = document.getElementById('hmiResultContent');
    if (hmiResultContainer) {
        hmiResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const payload = {
                id: btn.dataset.id || '-',
                model: btn.dataset.model || '-',
                category: btn.dataset.category || '人机界面',
                name: btn.dataset.name || btn.dataset.model || '-',
                price: btn.dataset.price || '',
                description: btn.dataset.description || ''
            };
                // 优先使用HMI专用的模态框，然后再尝试使用全局的BOMModals
                if (window.HMIModals && window.HMIModals.openQuantityModal) {
                    window.HMIModals.openQuantityModal(payload);
                } else {
                    console.warn('HMI专用模态框模块未加载，无法打开数量选择弹窗');
                }
            }
        });
    }
});

// 更新屏幕尺寸选项的函数
function updateHmiScreenSizeOptions(selectedSeries) {
    const screenSizeOptionsContainer = document.getElementById('hmiScreenSizeOptions');
    const screenSizeSection = document.getElementById('hmiScreenSizeSection');
    
    if (!selectedSeries || !hmiSeriesScreenSizeOptions[selectedSeries]) {
        screenSizeSection.style.display = 'none';
        return;
    }
    
    // 使用固定对象获取屏幕尺寸选项
    const screenSizeList = hmiSeriesScreenSizeOptions[selectedSeries];
    
    if (screenSizeList.length > 0) {
        screenSizeSection.style.display = 'block';
        screenSizeOptionsContainer.innerHTML = screenSizeList.map(size => `
            <label class="radio-option">
                <input type="radio" name="screenSize" value="${size}">
                <span>${size}</span>
            </label>
        `).join('');
        
        // 为屏幕尺寸选项绑定事件
        screenSizeOptionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                hmiSelectedFilters.screenSize = [this.value];
            });
        });
    } else {
        screenSizeSection.style.display = 'none';
    }
}

// 初始化HMI筛选模态框
function initHMIFilterModal() {
    const modal = document.getElementById('hmiFilterModal');
    const filterOptions = document.getElementById('hmiFilterOptions');
    
    if (!modal || !filterOptions) return;
    
    // 1. 重置筛选选择对象
    hmiSelectedFilters = {};
    
    // 2. 清空并重新构建筛选界面
    filterOptions.innerHTML = '';
    
    // 使用固定对象获取系列列表
    const seriesList = Object.keys(hmiSeriesScreenSizeOptions);
    
    // 创建系列筛选选项
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    seriesCategory.innerHTML = `
        <h3>选择系列</h3>
        <div class="filter-options">
            ${seriesList.map(series => `
                <label class="radio-option">
                    <input type="radio" name="series" value="${series}"><span>${series}</span>
                </label>
            `).join('')}
        </div>
    `;
    filterOptions.appendChild(seriesCategory);
    
    // 创建屏幕尺寸筛选选项容器（先不填充内容）
    const screenSizeCategory = document.createElement('div');
    screenSizeCategory.className = 'filter-section';
    screenSizeCategory.id = 'hmiScreenSizeSection';
    screenSizeCategory.style.display = 'none';
    screenSizeCategory.innerHTML = `
        <h3>屏幕尺寸</h3>
        <div id="hmiScreenSizeOptions" class="filter-options"></div>
    `;
    filterOptions.appendChild(screenSizeCategory);
    
    seriesCategory.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            hmiSelectedFilters.series = [this.value];
            hmiSelectedFilters.screenSize = []; // 清除屏幕尺寸选择
            updateHmiScreenSizeOptions(this.value);
        });
    });
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';
    actionsDiv.innerHTML = `
        <button id="hmiCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="hmiConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(actionsDiv);

    const confirmBtn = document.getElementById('hmiConfirmFilter');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (window.pageRouter) {
                window.pageRouter.confirmFilter('HMI');
            }
        });
    }

    const cancelBtn = document.getElementById('hmiCancelFilter');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modalEl = document.getElementById('hmiFilterModal');
            if (modalEl) modalEl.classList.remove('show');
        });
    }
}

// 添加显示HMI筛选模态框函数，用于在显示前重置筛选条件
function showHMIFilterModal() {
    // 重置筛选选择
    hmiSelectedFilters = {};
    
    // 确保筛选界面已初始化
    initHMIFilterModal();
    
    // 清除任何可能的选中状态
    const modal = document.getElementById('hmiFilterModal');
    if (modal) {
        // 取消所有选中的单选按钮
        modal.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });
        
        // 确保屏幕尺寸选项区域隐藏
        const screenSizeSection = document.getElementById('hmiScreenSizeSection');
        if (screenSizeSection) {
            screenSizeSection.style.display = 'none';
        }
    }
}

// 获取HMI筛选选择（供路由系统调用）
window.getHmiFilterSelections = function() {
    const modal = document.getElementById('hmiFilterModal');
    const checkedSeries = modal.querySelectorAll('input[name="series"]:checked');
    const checkedScreenSize = modal.querySelectorAll('input[name="screenSize"]:checked');
    const filters = { 
        series: Array.from(checkedSeries).map(i => i.value),
        screenSize: Array.from(checkedScreenSize).map(i => i.value)
    };
    return filters;
};

// 显示HMI筛选结果
function showHMIResults(filterData) {
   
    
    // 获取HMI数据
    const productData = window.hmiData || {};
    const displayParams = (window.hmiType && window.hmiType.displayParams) || ['型号', '屏幕尺寸', '价格'];
    const productTypeName = (window.hmiType && window.hmiType.name) || '人机界面';
    
    // 筛选数据
    const filteredData = filterHMIProductData(productData, filterData);
    
    // 显示结果，不显示筛选条件摘要
    displayResults('hmiResultContent', filteredData, displayParams, productTypeName, []);
}

// 筛选HMI产品数据
function filterHMIProductData(data, filters) {
    let filteredData = [];
    
    // 先获取所有产品数据，同时添加series属性
    Object.entries(data).forEach(([seriesName, series]) => {
        Object.values(series).forEach(product => {
            // 为产品添加series属性
            filteredData.push({
                ...product,
                series: seriesName
            });
        });
    });
    
    // 如果没有筛选条件，返回所有数据
    if (Object.keys(filters).length === 0) {
        return filteredData;
    }
    
    // 根据型号筛选（使用包含匹配，而不是严格相等）
    if (filters.model) {
        const normalizedModel = filters.model.trim().toUpperCase();
        filteredData = filteredData.filter(product => 
            product.model && product.model.toUpperCase().includes(normalizedModel)
        );
    }
    
    // 根据系列筛选
    if (filters.series && filters.series.length > 0) {
        filteredData = filteredData.filter(product => 
            filters.series.includes(product.series)
        );
    }
    
    // 根据屏幕尺寸筛选
    if (filters.screenSize && filters.screenSize.length > 0) {
        filteredData = filteredData.filter(product => 
            filters.screenSize.includes(product.screenSize)
        );
    }
    
    return filteredData;
}