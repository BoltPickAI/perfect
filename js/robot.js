// 机器人模块 - 优化版，兼容路由系统
window.robotData = window.robotData || {};
window.robotType = window.robotType || {};

// 筛选相关变量
let robotSelectedFilters = {};

// 预定义机器人系列选项
const robotSeriesOptions = [
    'Robot6Axis',
    'Robot4Axis'
];

// 预定义机器人参数选项对象
const robotParamOptions = {
  "Robot6Axis": {
    "armLengths": ["545.7mm", "560.6mm", "722.3mm", "901.9mm", "911.9mm", "1101.6mm", "1201.2mm", "1422mm", "1783mm", "1856mm", "2010mm", "2107mm", "2109mm", "2509mm", "2698mm", "2701mm", "3094mm", "3096mm"], // 6轴机器人臂展选项
    "maxLoads": ["4kg", "7kg", "10kg", "11.3kg", "12kg", "16kg", "25kg", "30kg", "35kg", "50kg", "60kg", "80kg", "130kg", "170kg", "220kg", "245kg", "300kg"]    // 6轴机器人最大负载选项
  },
  "Robot4Axis": {
    "armLengths": ["350mm", "400mm", "500mm", "550mm", "600mm", "620mm", "700mm", "800mm", "1000mm", "1200mm"], // 4轴机器人臂展选项
    "maxLoads": ["4kg", "5kg", "7kg", "8kg", "10kg", "20kg", "25kg", "35kg", "50kg", "60kg"]    // 4轴机器人最大负载选项
  }
};

console.log('机器人模块已加载');

// ===== 机器人弹窗模块 =====
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
                <input type="number" id="bomQty" class="inline-input" min="0" value="1" title="数量" placeholder="数量" />            </div>
            <div class="form-group">
                <label>通讯选择</label>
                <select id="bomCommunication" class="inline-input">
                    <option value="default" selected>默认 (EtherNet/IP, TCP/IP自定义协议, MC)</option>
                    <option value="ect">EtherCAT通讯</option>
                    <option value="pn">PN通讯</option>
                </select>
            </div>
            <div class="form-group">                <label>备注</label>
                <input type="text" id="bomRemark" class="inline-input" placeholder="可选" title="备注" />
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="bomTeachPendant" checked>
                    示教器配件 (IR-TP200-L5)
                </label>
                <p style="font-size: 12px; color: #666; margin-top: 4px;">机器人示教器\\线缆长度5米</p>
            </div>
        `;

        bomConfirm.onclick = () => {
            const qty = Math.max(0, parseInt((document.getElementById('bomQty')||{}).value || '0', 10));
            const remark = (document.getElementById('bomRemark')||{}).value || '';
            const communication = (document.getElementById('bomCommunication')||{}).value || '';
            const includeTeachPendant = (document.getElementById('bomTeachPendant')||{}).checked;
            
            // 构建产品描述
            let description = product.description || '';
            if (remark) {
                description = description ? `${description} ${remark}` : remark;
            }
            
            // 处理通讯选择
            let robotModel = product.model;
            if (communication === 'ect') {
                robotModel += '-E';
            }
            
            // 添加到BOM表
            window.BOM && window.BOM.addItem({
                id: product.id || robotModel,
                model: robotModel,
                category: '机器人',
                name: product.name || robotModel,
                description: description,
                price: product.price || 0,
                quantity: qty
            });
            
            // 添加PN通讯卡到BOM表
            if (communication === 'pn') {
                window.BOM && window.BOM.addItem({
                    id: 'IRCB501-2PN-BD',
                    model: 'IRCB501-2PN-BD',
                    category: '机器人配件',
                    name: 'PROFINET通讯卡',
                    description: 'PROFINET通讯卡',
                    price: 0,
                    quantity: qty
                });
            }
            
            // 添加示教器配件到BOM表
            if (includeTeachPendant) {
                window.BOM && window.BOM.addItem({
                    id: 'IR-TP200-L5',
                    model: 'IR-TP200-L5',
                    category: '机器人示教器',
                    name: '示教器配件',
                    description: '机器人示教器\\线缆长度5米',
                    price: 0,
                    quantity: qty
                });
            }

            hideModal();
            if (window.BOM && typeof window.BOM.showSuccessMessage === 'function') {
                window.BOM.showSuccessMessage('添加成功');
            }
        };

        bomCancel.onclick = hideModal;
        bomClose.onclick = hideModal;
        showModal();
    }

    window.RobotModals = { openQuantityModal };
})();

// 初始化机器人相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 监听路由系统的筛选确认事件
    document.addEventListener('showFilterResults', function(e) {
        if (e.detail.productType === 'Robot') {
            showRobotResults(e.detail.filterData || robotSelectedFilters);
        }
    });
    
    // 初始化筛选界面
    initRobotFilterModal();

    const robotResultContainer = document.getElementById('robotResultContent');
    if (robotResultContainer) {
        robotResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const payload = {
                id: btn.dataset.id || '-',
                model: btn.dataset.model || '-',
                category: btn.dataset.category || '机器人',
                name: btn.dataset.name || btn.dataset.model || '-',
                price: btn.dataset.price || '',
                description: btn.dataset.description || ''
            };
                // 优先使用机器人专用的模态框，然后再尝试使用全局的BOMModals
                if (window.RobotModals && window.RobotModals.openQuantityModal) {
                    window.RobotModals.openQuantityModal(payload);
                } else {
                    console.warn('机器人专用模态框模块未加载，无法打开数量选择弹窗');
                }
            }
        });
    }
});

// 加载机器人臂展选项
function loadRobotArmLengths(series) {
  const armLengthOptions = document.getElementById('robotArmLengthOptions');
  if (!armLengthOptions) return;
  
  // 获取当前系列的臂展选项
  const armLengths = robotParamOptions[series]?.armLengths || [];
  
  // 显示臂展选项
  armLengthOptions.innerHTML = `
      ${armLengths.map(length => `
          <label class="checkbox-option">
              <input type="checkbox" name="armLength" value="${length}">
              <span>${length}</span>
          </label>
      `).join('')}
  `;
  
  // 为臂展选项绑定事件
  armLengthOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          if (!robotSelectedFilters.armLength) {
              robotSelectedFilters.armLength = [];
          }
          
          if (this.checked) {
              robotSelectedFilters.armLength.push(this.value);
          } else {
              robotSelectedFilters.armLength = robotSelectedFilters.armLength.filter(item => item !== this.value);
          }
      });
  });
}

// 加载机器人负载选项
function loadRobotMaxLoads(series) {
  const maxLoadOptions = document.getElementById('robotMaxLoadOptions');
  if (!maxLoadOptions) return;
  
  // 获取当前系列的最大负载选项
  const maxLoads = robotParamOptions[series]?.maxLoads || [];
  
  // 显示负载选项
  maxLoadOptions.innerHTML = `
      ${maxLoads.map(load => `
          <label class="checkbox-option">
              <input type="checkbox" name="maxLoad" value="${load}">
              <span>${load}</span>
          </label>
      `).join('')}
  `;
  
  // 为负载选项绑定事件
  maxLoadOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          if (!robotSelectedFilters.maxLoad) {
              robotSelectedFilters.maxLoad = [];
          }
          
          if (this.checked) {
              robotSelectedFilters.maxLoad.push(this.value);
          } else {
              robotSelectedFilters.maxLoad = robotSelectedFilters.maxLoad.filter(item => item !== this.value);
          }
      });
  });
}

// 初始化机器人筛选模态框
function initRobotFilterModal() {
    const modal = document.getElementById('robotFilterModal');
    const filterOptions = document.getElementById('robotFilterOptions');
    
    if (!modal || !filterOptions) return;
    
    // 1. 重置筛选选择对象
    robotSelectedFilters = {};
    
    // 2. 清空并重新构建筛选界面
    filterOptions.innerHTML = '';
    
    // 创建系列筛选选项
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    seriesCategory.innerHTML = `
        <h3>选择系列</h3>
        <div class="filter-options">
            ${robotSeriesOptions.map(series => `
                <label class="radio-option">
                    <input type="radio" name="series" value="${series}"><span>${series === 'Robot6Axis' ? '6轴机器人' : '4轴机器人'}</span>
                </label>
            `).join('')}
        </div>
    `;
    filterOptions.appendChild(seriesCategory);
    
    // 添加负载筛选区域
    const maxLoadSection = document.createElement('div');
    maxLoadSection.className = 'filter-section';
    maxLoadSection.innerHTML = `
        <h3>选择最大负载</h3>
        <div id="robotMaxLoadOptions" class="filter-options">
            <p>请先选择系列</p>
        </div>
    `;
    filterOptions.appendChild(maxLoadSection);
    
    // 添加臂展筛选区域
    const armLengthSection = document.createElement('div');
    armLengthSection.className = 'filter-section';
    armLengthSection.innerHTML = `
        <h3>选择臂展</h3>
        <div id="robotArmLengthOptions" class="filter-options">
            <p>请先选择系列</p>
        </div>
    `;
    filterOptions.appendChild(armLengthSection);
    
    seriesCategory.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            robotSelectedFilters.series = [this.value];
            
            // 动态加载臂展和负载选项
            loadRobotArmLengths(this.value);
            loadRobotMaxLoads(this.value);
        });
    });
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';
    actionsDiv.innerHTML = `
        <button id="robotCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="robotConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(actionsDiv);

    const confirmBtn = document.getElementById('robotConfirmFilter');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (window.pageRouter) {
                window.pageRouter.confirmFilter('Robot');
            }
        });
    }

    const cancelBtn = document.getElementById('robotCancelFilter');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modalEl = document.getElementById('robotFilterModal');
            if (modalEl) modalEl.classList.remove('show');
        });
    }
}

// 添加显示机器人筛选模态框函数，用于在显示前重置筛选条件
function showRobotFilterModal() {
    // 重置筛选选择
    robotSelectedFilters = {};
    
    // 确保筛选界面已初始化
    initRobotFilterModal();
    
    // 清除任何可能的选中状态
    const modal = document.getElementById('robotFilterModal');
    if (modal) {
        // 取消所有选中的单选按钮
        modal.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });
    }
}

// 获取机器人筛选选择（供路由系统调用）
window.getRobotFilterSelections = function() {
    const modal = document.getElementById('robotFilterModal');
    const checkedSeries = modal.querySelectorAll('input[name="series"]:checked');
    const checkedArmLengths = modal.querySelectorAll('input[name="armLength"]:checked');
    const checkedMaxLoads = modal.querySelectorAll('input[name="maxLoad"]:checked');
    
    const filters = { 
        series: Array.from(checkedSeries).map(i => i.value),
        armLength: Array.from(checkedArmLengths).map(i => i.value),
        maxLoad: Array.from(checkedMaxLoads).map(i => i.value)
    };
    
    // 只返回有值的筛选条件
    Object.keys(filters).forEach(key => {
        if (filters[key].length === 0) {
            delete filters[key];
        }
    });
    
    return filters;
};

// 显示机器人筛选结果
function showRobotResults(filterData) {
    // 获取机器人数据
    const productData = window.robotData || {};
    const displayParams = (window.robotType && window.robotType.displayParams) || ['型号', '臂展', '负载', '价格'];
    const productTypeName = (window.robotType && window.robotType.name) || '机器人';
    
    // 筛选数据
    const filteredData = filterRobotProductData(productData, filterData);
    
    // 显示结果，不显示筛选条件摘要
    displayResults('robotResultContent', filteredData, displayParams, productTypeName, []);
}

// 筛选机器人产品数据
function filterRobotProductData(data, filters) {
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
    
    // 根据型号筛选
    if (filters.model) {
        const searchTerm = filters.model.toLowerCase();
        filteredData = filteredData.filter(product => 
            product.model.toLowerCase().includes(searchTerm)
        );
    }
    
    // 根据系列筛选
    if (filters.series && filters.series.length > 0) {
        filteredData = filteredData.filter(product => 
            filters.series.includes(product.series)
        );
    }
    
    // 根据臂展筛选
    if (filters.armLength && filters.armLength.length > 0) {
        filteredData = filteredData.filter(product => {
            return filters.armLength.includes(product.臂展);
        });
    }
    
    // 根据最大负载筛选
    if (filters.maxLoad && filters.maxLoad.length > 0) {
        filteredData = filteredData.filter(product => {
            return filters.maxLoad.includes(product.最大负载);
        });
    }
    
    return filteredData;
}