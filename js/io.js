// 全局IO数据和类型定义
window.ioData = window.ioData || {};
window.ioType = window.ioType || {};

// IO筛选相关变量
let ioSelectedFilters = {};

// 预定义IO系列子类别选项
const ioSeriesSubCategoryOptions = {
    'GL20系列': ['耦合器', '数字量模块', '模拟量模块', '温度测量模块', '温控模块', '电源模块', '等电位模块', '工艺模块', '通信模块'],
    'GL20S系列': ['数字量模块', '模拟量模块', '温度测量模块', '电源模块'],
    'GR20T系列': ['数字量模块', '配件']
};

// ===== IO弹窗模块 =====
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
                category: 'IO',
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

    window.IOModals = { openQuantityModal };
})();

console.log('IO模块已加载');

// 初始化IO相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 绑定返回主页按钮事件
    const backToMainBtn = document.querySelector('#ioResultPage .back-to-main');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            // 隐藏结果页面，显示主内容区域
            document.getElementById('ioResultPage').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            
            // 更新侧边栏活动状态
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.nav-item[href="#"]').closest('li').querySelector('.nav-item').classList.add('active');
        });
    }
    // 绑定IO产品卡片点击事件
    const ioCard = document.querySelector('.product-card[data-type="IO"]');
    if (ioCard) {
        ioCard.addEventListener('click', function(e) {
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showIOFilterModal();
            }
        });
    }
    
    // 绑定侧边栏IO链接点击事件
    const ioLink = document.querySelector('.product-link[data-type="IO"]');
    if (ioLink) {
        ioLink.addEventListener('click', function(e) {
            e.preventDefault();
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showIOFilterModal();
            }
        });
    }
    
    // 绑定IO弹窗关闭事件
    const ioCloseBtn = document.querySelector('.close-io');
    if (ioCloseBtn) {
        ioCloseBtn.addEventListener('click', function() {
            document.getElementById('ioFilterModal').classList.remove('show');
        });
    }
    
    // 确认筛选按钮会在showIOFilterModal函数中动态创建并绑定事件
    const ioResultContainer = document.getElementById('ioResultContent');
    if (ioResultContainer) {
        ioResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const payload = {
                    id: btn.dataset.id || '-',
                    model: btn.dataset.model || '-',
                    category: btn.dataset.category || 'IO模块',
                    name: btn.dataset.name || btn.dataset.model || '-',
                    price: parseFloat(btn.dataset.price || '0'),
                    description: btn.dataset.description || ''
                };
                // 优先使用IO专用的模态框，然后再尝试使用全局的BOMModals
                if (window.IOModals && window.IOModals.openQuantityModal) {
                    window.IOModals.openQuantityModal(payload);
                } else {
                    console.warn('IO专用模态框模块未加载，无法打开数量选择弹窗');
                }
            }
        });
    }
});

// 显示IO筛选弹窗
function showIOFilterModal() {
    const modal = document.getElementById('ioFilterModal');
    const filterOptions = document.getElementById('ioFilterOptions');
    
    // 清空之前的筛选选项
    filterOptions.innerHTML = '';
    
    // 使用固定对象获取所有系列
    const seriesList = Object.keys(ioSeriesSubCategoryOptions);
    
    // 设置弹窗标题
    modal.querySelector('h2').textContent = 'IO模块筛选';
    
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
    
    // 为系列选项绑定事件
    seriesCategory.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // 单选按钮只需要存储当前选中的值
            ioSelectedFilters.series = [this.value];
            
            // 当选择系列时，动态加载该系列的子类别
            loadIOSubCategories(this.value, true);
        });
    });
    
    // 添加子类别筛选区域
    const subCategorySection = document.createElement('div');
    subCategorySection.className = 'filter-section';
    subCategorySection.innerHTML = `
        <h3>选择子类别</h3>
        <div id="ioSubCategoryOptions" class="sub-category-group filter-options"></div>
    `;
    filterOptions.appendChild(subCategorySection);
    
    // 添加按钮容器
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';
    actionsDiv.innerHTML = `
        <button id="ioCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="ioConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(actionsDiv);
    
    // 绑定确认筛选按钮事件：直接应用筛选并显示结果
    document.getElementById('ioConfirmFilter').addEventListener('click', function() {
        applyIOFilters();
    });
    
    // 绑定取消按钮事件
    document.getElementById('ioCancelFilter').addEventListener('click', function() {
        modal.classList.remove('show');
    });
    
    // 重置筛选条件
    ioSelectedFilters = {};
    
    // 默认选中GL20系列
    const gl20Radio = seriesCategory.querySelector('input[type="radio"][value="GL20系列"]');
    if (gl20Radio) {
        gl20Radio.checked = true;
        // 为选中的单选按钮父元素添加checked类，显示颜色
        gl20Radio.parentElement.classList.add('checked');
        // 初始化series数组并添加GL20系列
        ioSelectedFilters.series = ['GL20系列'];
        // 加载GL20系列的子类别
        loadIOSubCategories('GL20系列', true);
    }
    
    // 显示弹窗
    modal.classList.add('show');
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', function ioModalClickHandler(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
            window.removeEventListener('click', ioModalClickHandler);
        }
    });
}

// 加载IO子类别
function loadIOSubCategories(series, isChecked) {
    const subCategoryOptions = document.getElementById('ioSubCategoryOptions');
    if (!subCategoryOptions) return;
    
    // 如果没有选择任何系列，清空子类别选项
    if (!ioSelectedFilters.series || ioSelectedFilters.series.length === 0) {
        subCategoryOptions.innerHTML = '<p>请先选择系列</p>';
        return;
    }
    
    // 获取当前选中系列的子类别
    const currentSeries = ioSelectedFilters.series[0];
    
    // 使用固定对象获取子类别选项
    const subCategories = ioSeriesSubCategoryOptions[currentSeries] || [];
    
    // 显示子类别选项
    subCategoryOptions.innerHTML = `
        ${subCategories.map(subCategory => `
            <label class="checkbox-option">
                <input type="checkbox" name="subCategory" value="${subCategory}">
                <span class="sub-category-name">${subCategory}</span>
            </label>
        `).join('')}
    `;
    
    // 为子类别选项绑定事件
    subCategoryOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (!ioSelectedFilters.subCategory) {
                ioSelectedFilters.subCategory = [];
            }
            
            if (this.checked) {
                ioSelectedFilters.subCategory.push(this.value);
            } else {
                ioSelectedFilters.subCategory = ioSelectedFilters.subCategory.filter(item => item !== this.value);
            }
        });
    });
}

// 暴露到全局供路由调用
if (typeof window !== 'undefined') {
    window.showIOFilterModal = showIOFilterModal;
}

// 应用IO筛选条件并显示结果
function applyIOFilters() {
    // 关闭弹窗
    document.getElementById('ioFilterModal').classList.remove('show');
    
    // 使用路由显示结果页面
    if (window.pageRouter) {
        window.pageRouter.showPage('ioResult');
    }
    
    // 获取IO数据
    const productData = window.ioData || {};
    const displayParams = (window.ioType && window.ioType.displayParams) || ['型号', '描述', '价格'];
    const productTypeName = (window.ioType && window.ioType.name) || 'IO模块';
    
    // 更新顶部栏标题
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`${productTypeName}筛选结果 (${Object.keys(productData).length ? filterIOProductData(productData, ioSelectedFilters).length : 0})`);
    }
    
    // 筛选数据
    const filteredData = filterIOProductData(productData, ioSelectedFilters);
    
    // 显示结果
    displayResults('ioResultContent', filteredData, displayParams, productTypeName);
}

// 筛选IO产品数据
function filterIOProductData(data, filters) {
    const filteredData = [];
    
    // 如果没有筛选条件，返回所有数据
    if (Object.keys(filters).length === 0) {
        Object.values(data).forEach(series => {
            Object.values(series).forEach(subCategory => {
                Object.values(subCategory).forEach(product => {
                    filteredData.push(product);
                });
            });
        });
        return filteredData;
    }
    
    // 确定要处理的系列
    const seriesToProcess = filters.series && filters.series.length > 0 ? filters.series : Object.keys(data);
    
    // 遍历系列
    seriesToProcess.forEach(series => {
        if (data[series]) {
            // 确定要处理的子类别
            const subCategories = filters.subCategory && filters.subCategory.length > 0 ? filters.subCategory : Object.keys(data[series]);
            
            // 遍历子类别
            subCategories.forEach(subCategory => {
                if (data[series][subCategory]) {
                    // 遍历产品
                    Object.values(data[series][subCategory]).forEach(product => {
                        filteredData.push(product);
                    });
                }
            });
        }
    });
    
    // 根据型号筛选
    if (filters.model) {
        const normalizedModel = filters.model.trim().toUpperCase();
        return filteredData.filter(product => 
            product.model && product.model.toUpperCase() === normalizedModel
        );
    }
    
    return filteredData;
}

// 提供给路由的筛选选择获取函数
window.getIoFilterSelections = function() {
    return ioSelectedFilters || {};
};

// 监听路由分发的结果展示事件
document.addEventListener('showFilterResults', function(e) {
    if (e.detail && e.detail.productType === 'IO') {
        const productData = window.ioData || {};
        const displayParams = (window.ioType && window.ioType.displayParams) || ['型号', '描述', '价格'];
        const productTypeName = (window.ioType && window.ioType.name) || 'IO模块';
        const filterData = e.detail.filterData || ioSelectedFilters || {};

        if (typeof window.setTopBarTitle === 'function') {
            window.setTopBarTitle(`${productTypeName}筛选结果 (${filterData && Object.keys(filterData).length ? filterIOProductData(productData, filterData).length : filterIOProductData(productData, {}).length})`);
        }
        const filteredData = filterIOProductData(productData, filterData);
        displayResults('ioResultContent', filteredData, displayParams, productTypeName);
    }
});