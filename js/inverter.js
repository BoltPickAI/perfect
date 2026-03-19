// 全局变频器数据和类型定义
window.inverterData = window.inverterData || {};
window.inverterType = window.inverterType || {};

// 变频器筛选相关变量
let inverterSelectedFilters = {};

// 预定义变频器系列电压选项
const inverterSeriesVoltageOptions = {
    'MD605': ['三相380', '单相220'],
    'MD630': ['三相380VAC~480VAC'],
    'MD290': ['单相220V', '三相220V', '三相380V'],
    'MD520': ['三相380', '三相220', '单相220'],
    'MD810整流': ['三相380V']
};

// 预定义变频器系列功率选项（按电压分类）
const inverterSeriesPowerOptions = {
    'MD605': {
        '三相380': [0.37, 0.75, 1.5, 2.2, 4, 5.5],
        '单相220': [0.37, 0.75, 1.5, 2.2]
    },
    'MD290': {
        '单相220V': [0.4, 0.75, 1.5, 2.2, 3],
        '三相220V': [0.4, 0.75, 1.1, 1.5, 2.2, 3.7, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55],
        '三相380V': [0.4, 0.75, 1.1, 1.5, 2.2, 3, 3.7, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 220, 250, 280, 315, 355, 400, 450, 500, 560, 630, 710, 800]
    },
    'MD520': {
        '三相380': [0.4, 0.8, 1.1, 1.5, 2.2, 3, 3.7, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 220, 250, 280, 315, 355, 400, 500, 560, 630],
        '三相220': [0.4, 0.8, 1.1, 1.5, 2.2, 3.7, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200],
        '单相220': [0.4, 0.7, 1.5, 2.2]
    },
    'MD810整流': {
        '三相380V': [22, 45, 110, 160, 355]
    },
    'MD630': {
        '三相380VAC~480VAC': [0.37, 0.75, 1.5, 2.2, 3.0, 4.0, 5.5, 7.5, 11.0, 15.0, 18.5, 22.0, 30, 37, 45, 55, 75, 90]
    }
};

// ===== 变频器弹窗模块 =====
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
        
        // 解析型号中的基础部分、括号内容和括号后面的内容（处理多个括号的情况）
        const originalModel = product.model || '';
        
        // 提取基础型号（括号之前的部分）
        const baseModel = originalModel.split('(')[0].trim();
        
        // 提取括号后面的内容
        let afterBrackets = '';
        const lastBracketIndex = originalModel.lastIndexOf(')');
        if (lastBracketIndex !== -1 && lastBracketIndex < originalModel.length - 1) {
            afterBrackets = originalModel.substring(lastBracketIndex + 1).trim();
        }
        
        // 检查是否为MD290或MD520系列变频器
        const isMD290orMD520 = originalModel.includes('MD290') || originalModel.includes('MD520');
        
        // 只有MD290和MD520系列才显示控制方式选项
        const showControlMethod = isMD290orMD520;
        
        // 匹配所有括号内容
        const bracketMatches = originalModel.match(/\(([^)]+)\)/g) || [];
        
        // 合并所有括号中的内容（选配的功能代码）
        let combinedBracketContent = '';
        bracketMatches.forEach(match => {
            // 移除括号
            const content = match.replace(/[()]/g, '');
            combinedBracketContent += content;
        });
        
        // 检查括号中是否包含任何功能代码（只有括号里的才需要显示勾选选项）
        const hasOptionalFunctionCode = combinedBracketContent.includes('S') || combinedBracketContent.includes('B') || 
                                      combinedBracketContent.includes('-T') || combinedBracketContent.includes('-L') || 
                                      combinedBracketContent.includes('-A');
        
        // 生成功能选项HTML，只有当括号中有功能代码时才显示
        let functionOptions = '';
        if (hasOptionalFunctionCode) {
            // 每个功能选项都用单独的form-group包裹，直接将复选框放在label内
            functionOptions = '';
            
            // 按照固定顺序生成功能选项：B -> S -> -T/-L/-A
            const fixedOrder = ['B', 'S', '-T', '-L', '-A'];
            
            // 定义功能选项的文本映射
            const funcTextMap = {
                'S': 'S 含 STO 功能',
                'B': 'B 含制动单元',
                '-T': '-T 含直流电抗器',
                '-L': '-L 含输出交流电抗器',
                '-A': '-A 带辅助配电柜'
            };
            
            // 定义功能选项的ID映射
            const funcIdMap = {
                'S': 'func-sto',
                'B': 'func-brake',
                '-T': 'func-dc-reactor',
                '-L': 'func-ac-reactor',
                '-A': 'func-aux-cabinet'
            };
            
            // 按照固定顺序生成功能选项
            fixedOrder.forEach(code => {
                if (combinedBracketContent.includes(code)) {
                    functionOptions += `
                        <div class="form-group">
                            <label><input type="checkbox" id="${funcIdMap[code]}" value="${code}" checked /> ${funcTextMap[code]}</label>
                        </div>
                    `;
                }
            });
        }
        
        // 生成控制方式HTML，只有MD290和MD520系列才显示
        let controlMethodHTML = '';
        if (showControlMethod) {
            controlMethodHTML = `
            <div class="form-group">
                <label>控制方式</label>
                <select id="controlMethod" class="inline-input" title="控制方式">
                    <option value="">标准</option>
                    <option value="面板控制">面板控制</option>
                    <option value="外部端子控制">外部端子控制</option>
                    <option value="通讯控制">通讯控制</option>
                    <option value="通讯控制|MD38TX1">通讯控制 - MD38TX1 (485、Modbus-RTU、Modbus-ASCII)</option>  
                    <option value="通讯控制|MD500-PN1">通讯控制 - MD500-PN1 (PROFINET 1)</option>
                    <option value="通讯控制|MD500-PN2">通讯控制 - MD500-PN2 (PROFINET 2)</option>
                    <option value="通讯控制|MD500-ECAT">通讯控制 - MD500-ECAT (EtherCAT)</option>
                    <option value="通讯控制|MD500-EN1">通讯控制 - MD500-EN1 (EtherNet/IP)</option>
                    <option value="通讯控制|MD500-EM1">通讯控制 - MD500-EM1 (ModbusTCP)</option>
                    <option value="通讯控制|MD-SI-DP2">通讯控制 - MD-SI-DP2 (PROFIBUSDP)</option>
                     <option value="通讯控制|MD38CAN1">通讯控制 - MD38CAN1 (CANlink、CANopen)</option>
                </select>
            </div>`;
        }
        
        bomBody.innerHTML = `
            <div class="form-group">
                <label>数量</label>
                <input type="number" id="bomQty" class="inline-input" min="0" value="1" title="数量" placeholder="数量" />
            </div>
            ${controlMethodHTML}
            ${functionOptions}
            <div class="form-group">
                <label>备注</label>
                <input type="text" id="bomRemark" class="inline-input" placeholder="可选" title="备注" />
            </div>
        `;

        bomConfirm.onclick = () => {
            const qty = Math.max(0, parseInt((document.getElementById('bomQty')||{}).value || '0', 10));
            let controlMethod = (document.getElementById('controlMethod')||{}).value || '';
            const remark = (document.getElementById('bomRemark')||{}).value || '';
            
            // 解析控制方式，提取通讯扩展卡信息
            let selectedCommCard = '';
            let cardDesc = '';
            if (controlMethod.includes('|')) {
                const parts = controlMethod.split('|');
                controlMethod = parts[0] || '';
                selectedCommCard = parts[1] || '';
                // 根据通讯扩展卡型号获取描述
                const commCardDescMap = {
                    'MD38CAN1': 'CANlink、CANopen通讯协议扩展卡',
                    'MD38TX1': 'Modbus-RTU、Modbus-ASCII通讯协议扩展卡',
                    'MD-SI-DP2': 'PROFIBUSDP通讯协议扩展卡',
                    'MD500-PN1': 'PROFINET通讯协议扩展卡1',
                    'MD500-PN2': 'PROFINET通讯协议扩展卡2',
                    'MD500-ECAT': 'EtherCAT通讯协议扩展卡',
                    'MD500-EN1': 'EtherNet/IP通讯协议扩展卡',
                    'MD500-EM1': 'ModbusTCP通讯协议扩展卡'
                };
                cardDesc = commCardDescMap[selectedCommCard] || '';
            }
            
            // 收集所有功能代码：包括基础型号中的默认功能和括号中的选配功能
            const allFunctions = [];
            const fixedOrder = ['B', 'S', '-T', '-L', '-A'];
            
            // 1. 提取基础型号中的默认功能代码
            const baseWithDefault = baseModel + afterBrackets;
            
            // 2. 收集括号中的选配功能代码（已选中的）
            const selectedOptionalFunctions = [];
            if (hasOptionalFunctionCode) {
                // 检查每个功能代码是否被选中，按照固定顺序
                fixedOrder.forEach(code => {
                    if (combinedBracketContent.includes(code)) {
                        let checkboxElement = null;
                        
                        switch(code) {
                            case 'S': checkboxElement = document.getElementById('func-sto'); break;
                            case 'B': checkboxElement = document.getElementById('func-brake'); break;
                            case '-T': checkboxElement = document.getElementById('func-dc-reactor'); break;
                            case '-L': checkboxElement = document.getElementById('func-ac-reactor'); break;
                            case '-A': checkboxElement = document.getElementById('func-aux-cabinet'); break;
                        }
                        
                        if (checkboxElement && checkboxElement.checked) {
                            selectedOptionalFunctions.push(code);
                        }
                    }
                });
            }
            
            // 3. 合并所有功能代码，按照固定顺序，避免重复
            const allFunctionsSet = new Set();
            
            // 先添加基础型号中的默认功能代码
            fixedOrder.forEach(code => {
                if (baseWithDefault.includes(code)) {
                    allFunctionsSet.add(code);
                }
            });
            
            // 再添加选中的选配功能代码
            selectedOptionalFunctions.forEach(code => {
                allFunctionsSet.add(code);
            });
            
            // 按照固定顺序构建最终功能代码列表
            fixedOrder.forEach(code => {
                if (allFunctionsSet.has(code)) {
                    allFunctions.push(code);
                }
            });
            
            // 构建最终型号：基础型号 + 选中的功能代码（按固定顺序） + 括号后面的内容
            let finalModel = baseModel;
            if (selectedOptionalFunctions.length > 0) {
                const newFunctionStr = selectedOptionalFunctions.join('');
                finalModel = `${finalModel}${newFunctionStr}`;
            }
            
            // 添加括号后面的内容
            if (afterBrackets) {
                finalModel = `${finalModel}${afterBrackets}`;
            }
            
            // 构建功能选项描述，使用"/"分隔不同功能
            let functionsDesc = '';
            if (allFunctions.length > 0) {
                functionsDesc = allFunctions.map(func => {
                    // 只有当S功能被选中时，才添加S功能的描述
                    if (func === 'S') {
                        // 检查S功能是否被勾选
                        const isSChecked = selectedOptionalFunctions.includes('S');
                        return isSChecked ? 'S 含 STO 功能' : '';
                    }
                    switch(func) {
                        case 'B': return 'B 含制动单元';
                        case '-T': return '-T 含直流电抗器';
                        case '-L': return '-L 含输出交流电抗器';
                        case '-A': return '-A 带辅助配电柜';
                        default: return func;
                    }
                }).filter(Boolean).join('/'); // 过滤掉空字符串
            }
            
            // 构建产品描述
            let description = product.description || '';
            
            // 检测当前型号，添加MD605系列的默认通讯协议描述
            const productModel = product.model || '';
            if (productModel.includes('MD605S')) {
                description = description ? `${description}/自带485Modbus-RTU` : '自带485Modbus-RTU';
            } else if (productModel.includes('MD605A')) {
                description = description ? `${description}/自带CANlink、CANopen` : '自带CANlink、CANopen';
            }
            
            if (controlMethod) {
                description = description ? `${description}/${controlMethod}` : controlMethod;
            }
            if (functionsDesc) {
                description = description ? `${description}/${functionsDesc}` : functionsDesc;
            }
            if (remark) {
                description = description ? `${description}/${remark}` : remark;
            }
            
            // 添加到BOM表
            window.BOM && window.BOM.addItem({
                id: product.id || product.model,
                model: finalModel,
                category: product.model && product.model.includes('20M') ? '整流单元' : '变频器',
                name: product.name || product.model,
                description: description,
                price: product.price || 0,
                quantity: qty
            });

            // 添加选中的通讯扩展卡到BOM表
            if (selectedCommCard) {
                window.BOM && window.BOM.addItem({
                    id: selectedCommCard,
                    model: selectedCommCard,
                    category: '变频器通讯卡',
                    name: selectedCommCard,
                    description: cardDesc,
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

    window.InverterModals = { openQuantityModal };
})();

console.log('变频器模块已加载');

// 初始化变频器相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 绑定返回主页按钮事件
    const backToMainBtn = document.querySelector('#inverterResultPage .back-to-main');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            // 隐藏结果页面，显示主内容区域
            document.getElementById('inverterResultPage').style.display = 'none';
            document.querySelector('.main-content').style.display = 'block';
            
            // 更新侧边栏活动状态
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.nav-item[href="#"]').closest('li').querySelector('.nav-item').classList.add('active');
        });
    }
    // 绑定变频器产品卡片点击事件
    const inverterCard = document.querySelector('.product-card[data-type="Inverter"]');
    if (inverterCard) {
        inverterCard.addEventListener('click', function(e) {
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showInverterFilterModal();
            }
        });
    }
    
    // 绑定侧边栏变频器链接点击事件
    const inverterLink = document.querySelector('.product-link[data-type="Inverter"]');
    if (inverterLink) {
        inverterLink.addEventListener('click', function(e) {
            e.preventDefault();
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showInverterFilterModal();
            }
        });
    }
    
    // 绑定变频器弹窗关闭事件
    const inverterCloseBtn = document.querySelector('.close-inverter');
    if (inverterCloseBtn) {
        inverterCloseBtn.addEventListener('click', function() {
            document.getElementById('inverterFilterModal').classList.remove('show');
        });
    }
    
    // 确认筛选按钮会在showInverterFilterModal函数中动态创建并绑定事件
    const inverterResultContainer = document.getElementById('inverterResultContent');
    if (inverterResultContainer) {
        inverterResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const payload = {
                    id: btn.dataset.id || '-',
                    model: btn.dataset.model || '-',
                    category: btn.dataset.category || '变频器',
                    name: btn.dataset.name || btn.dataset.model || '-',
                    price: btn.dataset.price || '',
                    description: btn.dataset.description || ''
                };
                // 只使用变频器专用的模态框
                if (window.InverterModals && window.InverterModals.openQuantityModal) {
                    window.InverterModals.openQuantityModal(payload);
                } else {
                    console.warn('变频器专用模态框模块未加载，无法打开数量选择弹窗');
                }
            }
        });
    }
});

// 显示变频器筛选弹窗
function showInverterFilterModal() {
    const modal = document.getElementById('inverterFilterModal');
    const filterOptions = document.getElementById('inverterFilterOptions');
    
    // 清空之前的筛选选项
    filterOptions.innerHTML = '';
    
    // 使用固定对象获取所有系列
    const seriesList = Object.keys(inverterSeriesVoltageOptions);
    
    // 设置弹窗标题
    modal.querySelector('h2').textContent = '变频器筛选';
    
    // 创建系列筛选选项
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    
    // 系列功率段映射
    const seriesPowerRanges = {
        "MD605": "0.37kW - 5.5kW",
        "MD290": "0.4kW - 800kW",
        "MD520": "0.37kW - 630kW",
        "MD800": "0.75kW - 0.75kW",
        "MD810整流": "22kW - 355kW",
        "MD630": "0.37kW - 90kW"
    };
    
    // 系列控制方式映射
    const seriesControlModes = {
        "MD605": "VF/SVC",
        "MD290": "VF",
        "MD520": "VF/SVC/FVS",
        "MD810整流": "多传整流",
        "MD630": "VF/SVC"
    };
    
    seriesCategory.innerHTML = `
        <h3>选择系列</h3>
        <div class="series-group filter-options">
            ${seriesList.map(series => `
                <label class="radio-option">
                    <input type="radio" name="series" value="${series}">
                    <span class="series-name">${series} <small style="font-size: 0.875rem; color: var(--text-tertiary); font-weight: normal;">(${seriesPowerRanges[series] || '全功率段'}, ${seriesControlModes[series] || ''})</small></span>
                </label>
            `).join('')}
        </div>
    `;
    filterOptions.appendChild(seriesCategory);
    
    // 创建电压筛选选项区域
    const voltageCategory = document.createElement('div');
    voltageCategory.className = 'filter-section';
    voltageCategory.innerHTML = `
        <h3>选择电压等级</h3>
        <div id="voltageOptions" class="voltage-group filter-options">
            <p>请先选择系列</p>
        </div>
    `;
    filterOptions.appendChild(voltageCategory);
    
    // 创建功率筛选选项区域（初始隐藏）
    const powerCategory = document.createElement('div');
    powerCategory.className = 'filter-section';
    powerCategory.style.display = 'none'; // 初始隐藏，选择电压后显示
    powerCategory.innerHTML = `
        <h3>选择功率范围</h3>
        <div id="powerRangeOptions" class="power-range-group filter-options">
            <p>请先选择电压等级</p>
        </div>
    `;
    filterOptions.appendChild(powerCategory);
    
    // 获取所有电压等级的辅助函数
function getVoltagesForSeries(selectedSeries) {
    // 使用固定对象获取电压选项
    const voltages = new Set();
    
    selectedSeries.forEach(series => {
        if (inverterSeriesVoltageOptions[series]) {
            inverterSeriesVoltageOptions[series].forEach(voltage => {
                voltages.add(voltage);
            });
        }
    });
    
    return Array.from(voltages).sort();
}

// 获取所有功率范围的辅助函数（根据系列和电压过滤）
function getPowerRangesForSeries(selectedSeries, selectedVoltages) {
    // 使用固定对象获取功率选项
    const powerRanges = new Set();
    
    selectedSeries.forEach(series => {
        if (inverterSeriesPowerOptions[series]) {
            selectedVoltages.forEach(voltage => {
                if (inverterSeriesPowerOptions[series][voltage]) {
                    inverterSeriesPowerOptions[series][voltage].forEach(power => {
                        powerRanges.add(power);
                    });
                }
            });
        }
    });
    
    return Array.from(powerRanges).sort((a, b) => {
        // 处理不同类型的功率值（数值和字符串）
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        } else {
            return String(a).localeCompare(String(b));
        }
    });
}
    
    // 更新电压筛选选项的函数
    function updateVoltageOptions() {
        const selectedSeries = inverterSelectedFilters.series || [];
        const voltageOptions = document.getElementById('voltageOptions');
        
        // 重置之前的电压选择
        delete inverterSelectedFilters.voltage;
        
        if (selectedSeries.length === 0) {
            // 没有选择系列，显示提示信息
            voltageOptions.innerHTML = '<p>请先选择系列</p>';
            // 隐藏功率筛选区域
            powerCategory.style.display = 'none';
            return;
        }
        
        // 获取选中系列的所有电压等级
        const voltages = getVoltagesForSeries(selectedSeries);
        
        // 生成电压等级选项
        voltageOptions.innerHTML = voltages.map(voltage => `
            <label class="checkbox-option">
                <input type="checkbox" name="voltage" value="${voltage}">
                <span>${voltage}</span>
            </label>
        `).join('');
        
        // 为电压等级选项绑定事件
        voltageOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (!inverterSelectedFilters.voltage) {
                    inverterSelectedFilters.voltage = [];
                }
                
                if (this.checked) {
                    inverterSelectedFilters.voltage.push(this.value);
                } else {
                    inverterSelectedFilters.voltage = inverterSelectedFilters.voltage.filter(item => item !== this.value);
                }
                
                // 更新功率选项
                updatePowerRangeOptions();
            });
        });
    }
    
    // 更新功率筛选选项的函数
    function updatePowerRangeOptions() {
        const selectedSeries = inverterSelectedFilters.series || [];
        const selectedVoltages = inverterSelectedFilters.voltage || [];
        const powerRangeOptions = document.getElementById('powerRangeOptions');
        
        // 重置之前的功率选择
        delete inverterSelectedFilters.powerRange;
        
        if (selectedSeries.length === 0) {
            // 没有选择系列，显示提示信息
            powerRangeOptions.innerHTML = '<p>请先选择系列</p>';
            powerCategory.style.display = 'none';
            return;
        }
        
        if (selectedVoltages.length === 0) {
            // 没有选择电压，显示提示信息
            powerRangeOptions.innerHTML = '<p>请先选择电压等级</p>';
            powerCategory.style.display = 'block';
            return;
        }
        
        // 获取选中系列和电压的所有功率范围
        const powerRanges = getPowerRangesForSeries(selectedSeries, selectedVoltages);
        
        // 生成功率范围选项
        powerRangeOptions.innerHTML = powerRanges.map(power => `
            <label class="checkbox-option">
                <input type="checkbox" name="powerRange" value="${power}">
                <span>${power} kW</span>
            </label>
        `).join('');
        
        // 为功率范围选项绑定事件
        powerRangeOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (!inverterSelectedFilters.powerRange) {
                    inverterSelectedFilters.powerRange = [];
                }
                
                if (this.checked) {
                    inverterSelectedFilters.powerRange.push(this.value);
                } else {
                    inverterSelectedFilters.powerRange = inverterSelectedFilters.powerRange.filter(item => item !== this.value);
                }
            });
        });
        
        // 显示功率筛选区域
        powerCategory.style.display = 'block';
    }
    
    // 为系列选项绑定事件
    seriesCategory.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                inverterSelectedFilters.series = [this.value];
                
                // 更新电压和功率筛选选项
                updateVoltageOptions();
                updatePowerRangeOptions();
            }
        });
    });
    
    // 添加按钮容器
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';
    actionsDiv.innerHTML = `
        <button id="inverterCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="inverterConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(actionsDiv);
    
    // 绑定确认筛选按钮事件：直接应用筛选并显示结果
    document.getElementById('inverterConfirmFilter').addEventListener('click', function() {
        applyInverterFilters();
    });
    
    // 绑定取消按钮事件
    document.getElementById('inverterCancelFilter').addEventListener('click', function() {
        modal.classList.remove('show');
    });
    
    // 显示弹窗
    modal.classList.add('show');
    
    // 重置筛选条件
    inverterSelectedFilters = {};
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', function inverterModalClickHandler(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
            window.removeEventListener('click', inverterModalClickHandler);
        }
    });
}

// 暴露到全局供路由调用
if (typeof window !== 'undefined') {
    window.showInverterFilterModal = showInverterFilterModal;
}

// 应用变频器筛选条件并显示结果
function applyInverterFilters() {
    // 关闭弹窗
    document.getElementById('inverterFilterModal').classList.remove('show');
    
    // 使用路由显示结果页面
    if (window.pageRouter) {
        window.pageRouter.showPage('inverterResult');
    }
    
    // 获取变频器数据
    const productData = window.inverterData || {};
    const displayParams = (window.inverterType && window.inverterType.displayParams) || ['型号', '功率范围', '电压等级', '价格'];
    const productTypeName = (window.inverterType && window.inverterType.name) || '变频器';
    
    // 更新顶部栏标题
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`${productTypeName}筛选结果 (${Object.keys(productData).length ? filterInverterProductData(productData, inverterSelectedFilters).length : 0})`);
    }
    
    // 筛选数据
    const filteredData = filterInverterProductData(productData, inverterSelectedFilters);
    
    // 显示结果
    displayResults('inverterResultContent', filteredData, displayParams, productTypeName);
}

// 筛选变频器产品数据
function filterInverterProductData(data, filters) {
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
        
        // 特殊处理model参数，直接匹配型号
        if (param === 'model') {
            const normalizedModel = filters[param].trim().toUpperCase();
            finalFilteredData = finalFilteredData.filter(product => 
                product.model && product.model.toUpperCase() === normalizedModel
            );
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
window.getInverterFilterSelections = function() {
    return inverterSelectedFilters || {};
};

// 监听路由分发的结果展示事件
document.addEventListener('showFilterResults', function(e) {
    if (e.detail && e.detail.productType === 'Inverter') {
        const productData = window.inverterData || {};
        const displayParams = (window.inverterType && window.inverterType.displayParams) || ['型号', '功率范围', '电压等级', '价格'];
        const productTypeName = (window.inverterType && window.inverterType.name) || '变频器';
        const filterData = e.detail.filterData || inverterSelectedFilters || {};

        if (typeof window.setTopBarTitle === 'function') {
            window.setTopBarTitle(`${productTypeName}筛选结果 (${filterData && Object.keys(filterData).length ? filterInverterProductData(productData, filterData).length : filterInverterProductData(productData, {}).length})`);
        }
        const filteredData = filterInverterProductData(productData, filterData);
        displayResults('inverterResultContent', filteredData, displayParams, productTypeName);
    }
});