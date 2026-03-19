// 全局伺服系统数据和类型定义
window.servoSystemData = window.servoSystemData || {};
window.servoType = window.servoType || {};

console.log('伺服系统模块已加载');




// 伺服系统筛选相关变量
let servoSelectedFilters = {
    topSeries: [],
    subSeries: [],
    powers: {},
    voltages: [],
    brakeOptions: []
};

// 预定义子系列功率选项
const subSeriesPowerOptions = {
    'MS1H2': [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
    'MS1H3': [0.85, 1.3, 1.8, 2.9, 4.4, 5.5, 7.5],
    'MS1H4': [0.05, 0.1, 0.2, 0.4, 0.55, 0.75, 1.0],
    'A3_SV670': [0.2, 0.4, 0.55, 0.75, 0.85, 0.9, 1.0, 1.3, 1.6, 1.8, 2.9, 3.7, 4.4, 4.5, 5.5, 7.5],
    'A3_SV660': [0.2, 0.4, 0.55, 0.75, 0.85, 0.9, 1.0, 1.3, 1.6, 1.8, 2.9, 3.7, 4.4, 4.5, 5.5, 7.5],
    // 'A3_IS810': [0.2, 0.4, 0.55, 0.75, 0.85, 0.9, 1.0, 1.3, 1.6, 1.8, 2.9, 3.7, 4.4, 4.5, 5.5, 7.5],
    'T3_SV630': [0.2, 0.4, 0.55, 0.75, 0.85, 1.0, 1.3, 1.8, 2.9, 4.4, 5.5, 7.5]
};

// 预定义子系列名称映射
const subSeriesNames = {
    'MS1H2': '低惯量中容量',
    'MS1H3': '中惯量中容量',
    'MS1H4': '中惯量小容量',
    'A3_SV670': 'A3_SV670系列',
    'A3_SV660': 'A3_SV660系列',
    // 'A3_IS810': 'A3_IS810系列',
    'T3_SV630': 'T3_SV630系列'
};

// 初始化伺服相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 绑定返回主页按钮事件
    // 首先检查是否存在servoResultPage元素
    const servoResultPage = document.getElementById('servoResultPage');
    if (servoResultPage) {
        const backToMainBtn = servoResultPage.querySelector('.back-to-main');
       
        
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', function() {
                console.log('点击返回主页按钮');
                // 隐藏结果页面，显示主内容区域
                servoResultPage.style.display = 'none';
                console.log('已隐藏伺服结果页面');
                
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.style.display = 'block';
                    console.log('已显示主页');
                }
                
                // 更新侧边栏活动状态
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                try {
                    const activeNavItem = document.querySelector('.nav-item[href="#"]')?.closest('li')?.querySelector('.nav-item');
                    if (activeNavItem) {
                        activeNavItem.classList.add('active');
                        console.log('已更新侧边栏活动状态');
                    }
                } catch (e) {
                    console.log('更新侧边栏活动状态失败，使用备用选择器');
                    // 尝试备用选择器
                    const backupNavItem = document.querySelector('.nav-item[data-main="true"]');
                    if (backupNavItem) {
                        backupNavItem.classList.add('active');
                        console.log('使用备用选择器更新侧边栏活动状态');
                    }
                }
            });
            console.log('已绑定返回主页按钮事件');
        }
    } else {
        console.log('伺服结果页面不存在，跳过返回主页按钮绑定');
    }
    // 绑定伺服产品卡片点击事件
    const servoCard = document.querySelector('.product-card[data-type="Servo"]');
    if (servoCard) {
        servoCard.addEventListener('click', function(e) {
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showServoFilterModal();
            }
        });
    }
    
    // 绑定侧边栏伺服链接点击事件
    const servoLink = document.querySelector('.product-link[data-type="Servo"]');
    if (servoLink) {
        servoLink.addEventListener('click', function(e) {
            e.preventDefault();
            // 确保是用户点击事件，而不是程序触发
            if (e.isTrusted) {
                showServoFilterModal();
            }
        });
    }
    
    // 绑定伺服弹窗关闭事件
    const servoCloseBtn = document.querySelector('.close-servo');
    if (servoCloseBtn) {
        servoCloseBtn.addEventListener('click', function() {
            document.getElementById('servoFilterModal').classList.remove('show');
        });
    }
    const servoResultContainer = document.getElementById('servoResultContent');
        if (servoResultContainer) {
            servoResultContainer.addEventListener('click', function(e) {
                const btn = e.target.closest('.add-to-bom-btn');
                if (btn) {
                    const targetIdOrModel = btn.dataset.id || btn.dataset.model || '';
                    // 从按钮数据中获取产品的系列和子系列信息
                    const productSeries = btn.dataset.series || '';
                    const productSubSeries = btn.dataset.subseries || '';
                    
                    let foundProduct = null;
                    let context = { seriesName: productSeries, subSeries: productSubSeries, accessory: {} };
                    try {
                        // 优先在指定的系列和子系列中查找产品
                        if (productSeries && productSubSeries && window.servoSystemData[productSeries] && window.servoSystemData[productSeries][productSubSeries]) {
                            const series = window.servoSystemData[productSeries];
                            const subData = series[productSubSeries];
                            
                            if (subData && subData['伺服电机'] && (subData['伺服电机'].id === targetIdOrModel || subData['伺服电机'].model === targetIdOrModel)) {
                                foundProduct = subData['伺服电机'];
                                context.accessory = subData.accessories || {};
                            } else if (typeof subData === 'object') {
                                Object.values(subData).forEach(item => {
                                    if (item && item['伺服电机'] && (item['伺服电机'].id === targetIdOrModel || item['伺服电机'].model === targetIdOrModel)) {
                                        foundProduct = item['伺服电机'];
                                        context.accessory = item.accessories || {};
                                    }
                                });
                            }
                        }
                        
                        // 如果在指定的系列和子系列中没有找到产品，再全局查找
                        if (!foundProduct) {
                            Object.entries(window.servoSystemData || {}).forEach(([seriesKey, series]) => {
                                Object.entries(series).forEach(([subKey, subData]) => {
                                    if (subData && subData['伺服电机'] && (subData['伺服电机'].id === targetIdOrModel || subData['伺服电机'].model === targetIdOrModel)) {
                                        foundProduct = subData['伺服电机'];
                                        context.seriesName = seriesKey;
                                        context.subSeries = subKey; // 添加子系列信息
                                        context.accessory = subData.accessories || {};
                                    } else if (typeof subData === 'object') {
                                        Object.values(subData).forEach(item => {
                                            if (item && item['伺服电机'] && (item['伺服电机'].id === targetIdOrModel || item['伺服电机'].model === targetIdOrModel)) {
                                                foundProduct = item['伺服电机'];
                                                context.seriesName = seriesKey;
                                                context.subSeries = subKey; // 添加子系列信息
                                                context.accessory = item.accessories || {};
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    } catch (_) {}

                    if (foundProduct && window.ServoModals && window.ServoModals.openAccessoryModal) {
                        window.ServoModals.openAccessoryModal(foundProduct, context);
                    } else {
                        const payload = {
                            id: btn.dataset.id || '-',
                            model: btn.dataset.model || '-',
                            category: btn.dataset.category || '伺服系统',
                            name: btn.dataset.name || btn.dataset.model || '-',
                            price: btn.dataset.price || ''
                        };
                        // 只使用伺服专用的模态框
                        if (window.ServoModals && window.ServoModals.openQuantityModal) {
                            window.ServoModals.openQuantityModal(payload);
                        } else {
                            console.warn('伺服专用模态框模块未加载，无法打开数量选择弹窗');
                        }
                    }
                }
            });
        }
});

// ===== 伺服系统弹窗模块 =====
// 注意：此模块在系统中有实际应用，请勿删除
// 它被导出到window.ServoModals对象并在多处被调用
;(function(){
    const bomModal = document.getElementById('bomAddModal');
    const bomTitle = document.getElementById('bomAddTitle');
    const bomBody = document.getElementById('bomAddBody');
    const bomConfirm = document.getElementById('bomAddConfirm');
    const bomCancel = document.getElementById('bomAddCancel');
    const bomClose = document.getElementById('bomAddClose');

    function showModal(){ if (bomModal) bomModal.classList.add('show'); }
    function hideModal(){ if (bomModal) bomModal.classList.remove('show'); }
    
    // 伺服系统专用数量输入弹窗
    function openAccessoryModal(product, context){
        if (!bomModal) return;
        const seriesName = context && context.seriesName || '';
        const accessory = context && context.accessory || {};
        const powerCables = (accessory['动力线缆'] || []);
        const encoderCables = (accessory['编码器线缆'] || []);
        const cn1Plugs = (accessory['CN1插头'] || []);
        const batteryBox = accessory['电池盒'] || null;

        // 从子系列名称或产品型号中提取驱动器系列（用于EX_d防爆系列）
        let extractedDriverSeries = '';
        if (seriesName === 'EX_d') {
            // 获取子系列信息，从context或product.model中提取
            const subSeries = context && context.subSeries || '';
            const productModel = product.model || '';
            
            console.log('EX_d系列驱动器系列提取开始:', {
                subSeries,
                productModel
            });
            
            // 定义优先级，确保正确的系列被优先匹配
            const driverSeriesPriority = ['SV670', 'SV660', 'SV630', /*'IS810',*/ 'SV67'];
            
            // 初始化可能的系列匹配结果
            let possibleMatches = [];
            
            // 1. 检查产品型号，从型号中提取驱动器系列
            for (const series of driverSeriesPriority) {
                const regex = new RegExp(`(?:[^A-Z0-9]|^)${series}(?:[^A-Z0-9]|$)`, 'i');
                if (regex.test(productModel)) {
                    possibleMatches.push(series);
                    console.log('产品型号匹配到系列:', series);
                }
            }
            
            // 2. 检查子系列名称，从子系列中提取驱动器系列
            for (const series of driverSeriesPriority) {
                const regex = new RegExp(series, 'i');
                if (regex.test(subSeries)) {
                    possibleMatches.push(series);
                    console.log('子系列匹配到系列:', series);
                }
            }
            
            // 3. 从可能的匹配结果中选择优先级最高的系列
            for (const series of driverSeriesPriority) {
                if (possibleMatches.includes(series)) {
                    extractedDriverSeries = series;
                    console.log('最终选择的驱动器系列:', extractedDriverSeries);
                    break;
                }
            }
            
            // 4. 如果没有找到匹配的系列，尝试从子系列名称中拆分获取
            if (!extractedDriverSeries) {
                const subSeriesStr = String(subSeries || '');
                const subSeriesParts = subSeriesStr.split(/[_-]/);
                for (const part of subSeriesParts) {
                    for (const series of driverSeriesPriority) {
                        if (part.toUpperCase() === series) {
                            extractedDriverSeries = series;
                            console.log('从子系列拆分中提取到驱动器系列:', extractedDriverSeries);
                            break;
                        }
                    }
                    if (extractedDriverSeries) break;
                }
            }
            
            // 5. 最后，检查产品型号中是否包含特定的驱动器系列关键词
            if (!extractedDriverSeries) {
                if (productModel.includes('SV670') || productModel.includes('SV67')) {
                    extractedDriverSeries = 'SV670';
                } else if (productModel.includes('SV660')) {
                    extractedDriverSeries = 'SV660';
                } else if (productModel.includes('SV630')) {
                    extractedDriverSeries = 'SV630';
                // } else if (productModel.includes('IS810')) {
                //     extractedDriverSeries = 'IS810';
                }
                console.log('从产品型号关键词中提取到驱动器系列:', extractedDriverSeries);
            }
            
            // 6. 确保提取到的驱动器系列是有效的
            if (!extractedDriverSeries || !driverSeriesPriority.includes(extractedDriverSeries)) {
                // 默认使用SV670作为后备，因为它是最常用的防爆系列
                extractedDriverSeries = 'SV670';
                console.log('使用默认驱动器系列:', extractedDriverSeries);
            }
        }
        
        const driverOptions = (() => {
            // 处理防爆电机系列
            if (seriesName === 'EX_d') {
                // 根据提取的驱动器系列返回相应的驱动器选项
                switch (extractedDriverSeries) {
                    case 'SV630': return [
                        { value: 'SV630N', label: 'EtherCAT通信型' },
                        { value: 'SV630P', label: '脉冲/Modbus-RTU' },
                        { value: 'SV630A', label: 'CANlink型' },
                        { value: 'SV630C', label: 'CANopen型' }
                    ];
                    case 'SV660': return [
                        { value: 'SV660N', label: 'EtherCAT通信型' },
                        { value: 'SV660F', label: 'PROFINET通信型' },
                        { value: 'SV660P', label: '脉冲/Modbus-RTU' },
                        { value: 'SV660A', label: 'CANlink型' },
                        { value: 'SV660C', label: 'CANopen型' }
                    ];
                    case 'SV670': return [
                        { value: 'SV670N', label: 'EtherCAT通信型' },
                        { value: 'SV670P', label: '脉冲/Modbus-RTU' }
                    ];
                    /*case 'IS810': return [
                        { value: 'IS810N', label: '标准型' }
                    ];*/
                    default: return [
                        { value: 'SV', label: '型' }
                    ];
                }
            }
            
            // 处理普通系列
            switch (seriesName) {
            case 'T3': return [
                { value: 'SV630N', label: 'EtherCAT通信型' },
                { value: 'SV630P', label: '脉冲/Modbus-RTU' },
                { value: 'SV630A', label: 'CANlink型' },
                { value: 'SV630C', label: 'CANopen型' }
            ];
            case 'A3': return [
                { value: 'SV660N', label: 'EtherCAT通信型' },
                { value: 'SV660F', label: 'PROFINET通信型' },
                { value: 'SV670N', label: 'EtherCAT通信型' },
                { value: 'SV670P', label: '脉冲/Modbus-RTU' },
                { value: 'SV660P', label: '脉冲/Modbus-RTU' },
                { value: 'SV660A', label: 'CANlink型' },
                { value: 'SV660C', label: 'CANopen型' }
            ];
            case 'A6':
            case 'S6': return [
                { value: 'SV680N', label: 'EtherCAT通信型' },
                { value: 'SV680F', label: 'PROFINET通信型' },
                { value: 'SV680P', label: '脉冲/Modbus-RTU' }
            ];
            default: return [ 
                 { value: 'SV', label: '型' }
             ];
            }
        })();

        const driverOptionsHtml = driverOptions.map(o => `<option value="${o.value}">${o.value} - ${o.label}</option>`).join('');
        // 合并线缆类型选项，只显示名称（前出线、后出线、甩线）
        const cableTypeOptionsHtml = powerCables.map((c,i) => `<option value="${i}">${c.name || '未知类型'}</option>`).join('');

        bomTitle.textContent = `添加 ${product.model} 到BOM表`;
        bomBody.innerHTML = `
            <div class="form-group">
                <label>数量</label>
                <input type="number" id="bomQty" class="inline-input" min="0" step="1" value="1" title="数量" placeholder="数量" />
            </div>
            <div class="form-group">
                <label>驱动器型号</label>
                <select id="driverSelect" class="inline-input" title="驱动器型号">${driverOptionsHtml}</select>
            </div>
            ${(seriesName === 'A3' || seriesName === 'T3' || seriesName === 'EX_d') ? `
            <div class="form-group">
                <label>驱动器选配</label>
                <select id="driverOption" class="inline-input" title="驱动器选配">
                    <option value="">默认标准</option>
                    <option value="-FH">-FH 高防护</option>
                    <option value="-FS">-FS 带STO安全功能</option>
                </select>
            </div>
            ` : ''}
            ${(seriesName === 'A6' || seriesName === 'S6') ? `
            <div class="form-group">
                <label>场景使用</label>
                <select id="usageScenario" class="inline-input" title="使用场景">
                    <option value="standard">标准</option>
                    <option value="gantry">龙门使用场景</option>
                    <option value="international">国际版GINT通用型（国际版）</option>
                </select>
            </div>
            ` : ''}
            <div class="form-group">
                <label>线缆长度(米)</label>
                <input type="number" id="cableLength" class="inline-input" min="1" step="0.1" value="3" title="线缆长度" placeholder="线缆长度" />
                
            </div>
            <div class="form-group">
                <label>线缆类型</label>
                <select id="cableType" class="inline-input" title="线缆类型">${cableTypeOptionsHtml}</select>
            </div>
            <div class="form-group" id="dangleCableLengthGroup" style="display: none;">
                <label>甩线长度(米)注：电机端的线缆长度</label>
                <input type="number" id="dangleCableLength" class="inline-input" min="0.1" step="0.1" value="0.5" title="甩线长度" placeholder="甩线长度" />
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="cn1PlugChecked" checked /> 添加CN1插头</label>
            </div>
            <div class="form-group" id="cn7DividerGroup" style="display: none;">
                <label><input type="checkbox" id="cn7DividerChecked" checked /> 添加CN7分频输出</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="batteryBoxChecked" checked /> 添加电池盒</label>
            </div>
        `;

        // 添加线缆类型选择事件监听
        const cableTypeSelect = document.getElementById('cableType');
        const dangleCableLengthGroup = document.getElementById('dangleCableLengthGroup');
        if (cableTypeSelect) {
            cableTypeSelect.addEventListener('change', () => {
                const selectedIndex = cableTypeSelect.selectedIndex;
                const selectedCableType = powerCables[selectedIndex]?.name || '';
                if (selectedCableType === '甩线') {
                    dangleCableLengthGroup.style.display = 'block';
                } else {
                    dangleCableLengthGroup.style.display = 'none';
                }
            });
            // 初始化时检查当前选择
            const initialIndex = cableTypeSelect.selectedIndex;
            const initialCableType = powerCables[initialIndex]?.name || '';
            if (initialCableType === '甩线') {
                dangleCableLengthGroup.style.display = 'block';
            }
        }

        // 添加驱动器选择事件监听，显示/隐藏CN7分频输出选项
        const driverSelect = document.getElementById('driverSelect');
        const cn7DividerGroup = document.getElementById('cn7DividerGroup');
        if (driverSelect && cn7DividerGroup) {
            const updateCn7DividerVisibility = () => {
                const selectedDriver = driverSelect.value || '';
                if (selectedDriver.startsWith('SV670') || selectedDriver.startsWith('SV680')) {
                    cn7DividerGroup.style.display = 'block';
                } else {
                    cn7DividerGroup.style.display = 'none';
                }
            };
            
            // 添加事件监听
            driverSelect.addEventListener('change', updateCn7DividerVisibility);
            
            // 初始化时检查当前选择
            updateCn7DividerVisibility();
        }

        bomConfirm.onclick = () => {
            const qty = Math.max(0, parseInt((document.getElementById('bomQty')||{}).value || '0', 10));
            const selectedDriver = (document.getElementById('driverSelect')||{}).value || '';
            const driverOption = (document.getElementById('driverOption')||{}).value || '';
            const usageScenario = (document.getElementById('usageScenario')||{}).value || 'standard';
            const cableLen = Math.max(1, parseFloat((document.getElementById('cableLength')||{}).value || '5') || 5);
            const cableIdx = parseInt((document.getElementById('cableType')||{}).value || '0', 10) || 0;
            const selectedCableType = powerCables[cableIdx]?.name || '';
            const dangleCableLength = parseFloat((document.getElementById('dangleCableLength')||{}).value || '0.3') || 0.3;
            // 使用相同的索引获取动力线缆和编码器线缆
            const addCn1 = !!(document.getElementById('cn1PlugChecked')||{}).checked;
            const addCn7 = !!(document.getElementById('cn7DividerChecked')||{}).checked;
            const addBattery = !!(document.getElementById('batteryBoxChecked')||{}).checked;
            
            // 根据场景计算数量
            const getQty = () => {
                if (usageScenario === 'gantry') {
                    return qty * 2;
                }
                return qty;
            };

            const motorDescParts = [];
            if (product.ratedPower !== undefined) motorDescParts.push(`${product.ratedPower}KW`);
            if (product.ratedTorque !== undefined) motorDescParts.push(`${product.ratedTorque}N·m`);
            // 在额定转矩后面添加额定转速和转子惯量
            if (product.ratedSpeed) motorDescParts.push(`${product.ratedSpeed}rpm`);
            if (product.rotorInertia) motorDescParts.push(`${product.rotorInertia}kg·c㎡`);
            // 删除电压参数
            if (product.encoderPrecision) motorDescParts.push(`${product.encoderPrecision}`);
            // 判断电机型号的第18个字符，添加带抱闸或无抱闸描述
            let brakeInfo = '';
            if (product.model && product.model.length >= 18) {
                const eighteenthChar = product.model.charAt(17); // 第18个字符，索引为17
                if (eighteenthChar === '4' || eighteenthChar === '2') {
                    brakeInfo = '带抱闸';
                } else if (eighteenthChar === '1' || eighteenthChar === '0') {
                    brakeInfo = '无抱闸';
                }
            }
            motorDescParts.push(brakeInfo);
            
            // 处理国际版电机后缀和描述
            let finalMotorModel = product.model;
            if (usageScenario === 'international') {
                finalMotorModel += '-INT';
                motorDescParts.push('通用性国际版');
            }
            const motorDesc = motorDescParts.join('/');
            
            // 生成带功率标识的ID，格式为"0.1KWP1"、"0.1KWP2"等
            const powerId = product.ratedPower ? `${product.ratedPower}KW` : '';
            // 获取当前BOM表的长度，作为套件编号
            // 这样可以确保每次添加新的组件套装时使用递增的序号
            const currentBomItems = window.BOM && window.BOM.load ? window.BOM.load() : [];
            // 计算当前电机类别的数量，作为套件编号
            const motorCount = currentBomItems.filter(item => item.category === '伺服电机').length + 1;
            const kitNumber = motorCount;
            const bomIdPrefix = `${powerId}P${kitNumber}`;
            
            // 处理驱动器选项
            let finalDriverModel = selectedDriver;
            const driverLabel = (driverOptions.find(d=>d.value===selectedDriver)||{}).label || '';
            const driverDescParts = [];
            if (product.ratedVoltage) driverDescParts.push(product.ratedVoltage);
            if (product.encoderPrecision) driverDescParts.push(product.encoderPrecision);
            driverDescParts.push(driverLabel);
            
            // 处理驱动器选项描述
            switch (driverOption) {
                case '-FH':
                    driverDescParts.push('高防护');
                    break;
                case '-FS':
                    driverDescParts.push('带STO安全功能');
                    break;
            }
            
            window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${product.id}-${Date.now()}`, model: finalMotorModel, category: '伺服电机', name: product.name || product.model, description: motorDesc, price: product.price || 0, quantity: getQty() });

            // 获取电机对应的驱动器信息
            if (accessory && accessory['驱动器'] && accessory['驱动器'].length > 0) {
                // 正确的型号应该是选中的值加上model字段的值，然后加上选配选项
                finalDriverModel = `${finalDriverModel}${accessory['驱动器'][0].model}${driverOption}`;
            } else {
                // 添加驱动器选配选项到驱动器型号末尾
                finalDriverModel += driverOption;
            }
            
            // 处理国际版驱动器后缀（在所有其他后缀之后添加）
            if (usageScenario === 'international') {
                finalDriverModel += '-GINT';
                driverDescParts.push('通用性国际版');
            }
            const driverDesc = driverDescParts.join('/');
            window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${finalDriverModel}-${Date.now()}`, model: finalDriverModel, category: '驱动器', name: `${product.name || ''} 驱动器`, description: driverDesc, price: 0, quantity: getQty() });

            if (powerCables[cableIdx]) {
                const cable = powerCables[cableIdx];
                // 格式化线缆长度，保留1位小数
                const formattedCableLen = cableLen.toFixed(1);
                const finalPrice = (parseFloat(String(cable.price).replace(/[^0-9.]/g,'')) || 0) * cableLen / 5;
                // 判断动力线缆model字段的第六个字符，添加带抱闸或无抱闸描述
                let brakeInfo = '';
                if (cable.model && cable.model.length >= 6) {
                    const sixthChar = cable.model.charAt(5); // 第六个字符，索引为5
                    if (sixthChar === 'B') {
                        brakeInfo = '带抱闸';
                    } else if (sixthChar === 'M') {
                        brakeInfo = '无抱闸';
                    }
                }
                const description = `动力线缆${formattedCableLen}米/T:高柔/${brakeInfo}`;
                window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${cable.id}-${formattedCableLen}M-${Date.now()}`, model: `${cable.model}-${formattedCableLen}-T`, category: '动力线缆', name: cable.name || '动力线缆', description: description, price: finalPrice, quantity: getQty() });
                
                // 如果选择了甩线类型，添加甩线动力线缆电机端（放在动力线缆下面）
                if (selectedCableType === '甩线') {
                    // 格式化甩线长度，保留一位小数
                    const formattedLength = dangleCableLength.toFixed(1);
                    
                    // 添加甩线动力线缆电机端
                    window.BOM && window.BOM.addItem({ 
                        id: `${bomIdPrefix}-S6-C23-${formattedLength}-power-${Date.now()}`, 
                        model: `S6-C23-${formattedLength}`, 
                        category: '动力线缆', 
                        name: '甩线动力线缆电机端', 
                        description: `甩线动力线缆电机端/${formattedLength}米`, 
                        price: 0, 
                        quantity: getQty() 
                    });
                }
            }
            if (encoderCables[cableIdx]) {
                const cable = encoderCables[cableIdx];
                // 格式化线缆长度，保留1位小数
                const formattedCableLen = cableLen.toFixed(1);
                const finalPrice = (parseFloat(String(cable.price).replace(/[^0-9.]/g,'')) || 0) * cableLen / 5;
                window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${cable.id}-${formattedCableLen}M-${Date.now()}`, model: `${cable.model}-${formattedCableLen}-T`, category: '编码器线缆', name: cable.name || '编码器线缆', description: `编码器线缆${formattedCableLen}米/T:高柔`, price: finalPrice, quantity: getQty() });
                
                // 如果选择了甩线类型，添加甩线编码器线缆电机端（放在编码器线缆下面）
                if (selectedCableType === '甩线') {
                    // 格式化甩线长度，保留一位小数
                    const formattedLength = dangleCableLength.toFixed(1);
                    
                    // 添加甩线编码器线缆电机端
                    window.BOM && window.BOM.addItem({ 
                        id: `${bomIdPrefix}-S6-C23-${formattedLength}-encoder-${Date.now()}`, 
                        model: `S6-C23-${formattedLength}`, 
                        category: '编码器线缆', 
                        name: '甩线编码器线缆电机端', 
                        description: `甩线编码器线缆电机端/${formattedLength}米`, 
                        price: 0, 
                        quantity: getQty() 
                    });
                }
            }
            if (addCn1) {
                let plug;
                // 使用完整的switch语句实现本地数据映射
                switch (selectedDriver) {
                    case 'SV680F':
                        // 直接使用固定型号，不从数据库查找
                        plug = {
                            id: 'S6-C74-3.0',
                            model: 'S6-C74-3.0',
                            name: 'DB26-标准CN1插头',
                            price: 0,
                            description: 'DB26-标准CN1插头'
                        };
                        break;
                    case 'SV680N':
                    case 'SV670N':
                        // 直接使用固定型号，不从数据库查找
                        plug = {
                            id: '本体自带',
                            model: '本体自带',
                            name: '本体自带',
                            price: 0,
                            description: '本体自带'
                        };
                        break;
                    case 'SV680P':
                    case 'SV670P':
                    case 'SV660P':
                    case 'SV660A':
                    case 'SV660C':
                    case 'SV630P':
                    case 'SV630A':
                    case 'SV630C':
                        plug = {
                            id: 'S6-C8-3.0(TY)',
                            model: 'S6-C8-3.0(TY)',
                            name: 'DB44-脉冲CN1插头',
                            price: 0,
                            description: 'DB44-脉冲CN1插头'
                        };
                        break;
                    case 'SV660N':
                    case 'SV660F':
                    case 'SV630N':
                        plug = {
                            id: 'S6-C6-3.0(MH)',
                            model: 'S6-C6-3.0(MH)',
                            name: 'DB15-标准CN1插头',
                            price: 0,
                            description: 'DB15-标准CN1插头'
                        };
                        break;
                   
                    default:
                        // 对于其他驱动器型号，使用默认CN1插头
                        plug = {
                            id: '错误型号',
                            model: '错误型号',
                            name: '错误型号',
                            price: 0,
                            description: '错误型号'
                        };
                        break;
                }
                
                if (plug) {
                    window.BOM && window.BOM.addItem({ 
                        id: `${bomIdPrefix}-${plug.id}-${Date.now()}`, 
                        model: plug.model, 
                        category: 'CN1插头', 
                        name: plug.name || 'CN1插头', 
                        description: plug.description || '标准CN1插头', 
                        price: 0, 
                        quantity: getQty() 
                    });
                }
            }
            if (addCn7) {
                // 添加CN7分频插头
                window.BOM && window.BOM.addItem({ 
                    id: `${bomIdPrefix}-S6-C6-3.0(MH)-CN7-${Date.now()}`, 
                    model: 'S6-C6-3.0(MH)', 
                    category: 'CN7插头', 
                    name: 'DB15-标准CN7分频插头', 
                    description: 'DB15-标准CN7分频插头', 
                    price: 0, 
                    quantity: getQty() 
                });
            }
            if (addBattery) {
                // 直接添加固定的电池盒，不从数据库读取
                window.BOM && window.BOM.addItem({ 
                    id: `${bomIdPrefix}-S6-C4A-${Date.now()}`, 
                    model: 'S6-C4A', 
                    category: '电池盒', 
                    name: '电池盒', 
                    description: '电池盒', 
                    price: 0, 
                    quantity: getQty() 
                });
            }
            
            // 如果是龙门场景，添加S6-L-CN7-0.5型号
            if (usageScenario === 'gantry') {
                window.BOM && window.BOM.addItem({ 
                    id: `${bomIdPrefix}-S6-L-CN7-0.5-${Date.now()}`, 
                    model: 'S6-L-CN7-0.5', 
                    category: 'CN7线缆', 
                    name: 'S6-L-CN7-0.5线缆', 
                    description: '龙门场景专用线缆', 
                    price: 0, 
                    quantity: qty 
                });
            }

            hideModal();
            if (window.BOM && typeof window.BOM.showSuccessMessage === 'function') {
                window.BOM.showSuccessMessage('添加成功');
            } else {
                console.log('添加成功');
            }
        };

        bomCancel.onclick = hideModal;
        bomClose.onclick = hideModal;
        showModal();
    }

    window.ServoModals = { openAccessoryModal  };
})();

// 显示伺服筛选弹窗
function showServoFilterModal() {
    console.log('显示伺服筛选弹窗');
    
    const modal = document.getElementById('servoFilterModal');
    if (!modal) {
        return;
    }
    
    const filterOptions = document.getElementById('servoFilterOptions');
    if (!filterOptions) {
        return;
    }
    
    // 清空现有内容
    filterOptions.innerHTML = '';
    console.log('已清空筛选选项');
    
    // 设置弹窗标题
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = '伺服系统系列筛选';
        console.log('已设置弹窗标题');
    }
    
    // 伺服系统特殊处理：使用顶级系列和子系列结构
    const topSeriesList = ['A3', 'T3', 'A6', 'S6', 'EX_d'];
    console.log('顶级系列列表:', topSeriesList);
    
    // 创建系列筛选选项
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    // 为每个系列添加描述信息
    const seriesDescriptions = {
        'A3': '通用型伺服系统',
        'T3': '经济型伺服系统',
        'A6': '高端伺服系统',
        'S6': '高性能伺服系统',
        'EX_d': '防爆伺服电机（隔爆型）'
    };
    seriesCategory.innerHTML = `
        <div class="series-group filter-options">
            <select name="topSeries" class="inline-input">
                ${topSeriesList.map(series => `
                    <option value="${series}" ${series === 'A3' ? 'selected' : ''}>${series} - ${seriesDescriptions[series]}</option>
                `).join('')}
            </select>
        </div>
        
        <!-- 电压筛选 -->
        <div class="voltage-filter" style="margin-top: var(--spacing-sm);">
            <div class="filter-options" style="display: flex; gap: var(--spacing-md);">
                <label class="checkbox-option">
                    <input type="checkbox" name="voltage" value="单相220V">
                    <span>单相220V</span>
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" name="voltage" value="三相220V">
                    <span>三相220V</span>
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" name="voltage" value="三相380V">
                    <span>三相380V</span>
                </label>
            </div>
        </div>
        
        <!-- 抱闸筛选 -->
        <div class="brake-filter" style="margin-top: var(--spacing-sm);">
            <div class="filter-options" style="display: flex; gap: var(--spacing-md);">
                <label class="checkbox-option">
                    <input type="checkbox" name="brake" value="with">
                    <span>带抱闸</span>
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" name="brake" value="without">
                    <span>不带抱闸</span>
                </label>
            </div>
        </div>
    `;
    filterOptions.appendChild(seriesCategory);
    console.log('已创建系列筛选选项');
    
    // 创建子系列和功率筛选选项容器
    const powerSection = document.createElement('div');
    powerSection.className = 'filter-section';
    const powerGroupsContainer = document.createElement('div');
    powerGroupsContainer.className = 'power-groups';
    powerGroupsContainer.id = 'servo-power-groups';
    powerSection.appendChild(powerGroupsContainer);
    filterOptions.appendChild(powerSection);
    
    // 函数：根据选中的顶级系列生成对应的子系列功率选项
    function generatePowerGroups(selectedTopSeries) {
        console.log('生成功率组，选中的顶级系列:', selectedTopSeries);
        
        // 清空现有功率组
        powerGroupsContainer.innerHTML = '';
        
        // 定义MS1H系列和EX_d系列的子系列
        const ms1hSubSeries = Object.keys(subSeriesNames).filter(key => key.startsWith('MS1H'));
        
        // 根据选中的顶级系列确定要显示的子系列
        let subSeriesToShow = ms1hSubSeries;
        if (selectedTopSeries === 'EX_d') {
            // EX_d系列特殊处理：直接获取数据中的子系列
            subSeriesToShow = Object.keys(window.servoSystemData.EX_d || {});
        }
        
        console.log('要显示的子系列:', subSeriesToShow);
        
        // 生成功率组HTML
        subSeriesToShow.forEach(subSeries => {
            // 为EX_d系列的子系列生成名称
            let subSeriesName = subSeriesNames[subSeries] || subSeries;
            if (selectedTopSeries === 'EX_d') {
                subSeriesName = `${subSeries} (防爆系列)`;
            }
            
            // 生成功率选项：对于EX_d系列，从实际数据中提取功率
            let powerOptions = subSeriesPowerOptions[subSeries] || [];
            if (selectedTopSeries === 'EX_d') {
                // 从EX_d系列数据中提取唯一的功率值
                const exdData = window.servoSystemData.EX_d[subSeries] || {};
                const powerSet = new Set();
                Object.values(exdData).forEach(product => {
                    if (product && product['伺服电机'] && product['伺服电机'].ratedPower) {
                        powerSet.add(product['伺服电机'].ratedPower);
                    }
                });
                powerOptions = Array.from(powerSet).sort((a, b) => a - b);
            }
            
            // 所有系列都使用复选框
            const inputType = 'checkbox';
            const inputName = 'subSeriesToggle';
            const isDefaultSelected = false;
            
            // 初始隐藏功率选项
            const powerOptionsDisplay = 'none';
            
            const powerGroupHTML = `
                <div class="power-group" data-subseries="${subSeries}">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                        <label class="checkbox-option" style="width: auto; min-width: auto; margin-right: var(--spacing-md);">
                            <input type="${inputType}" name="${inputName}" value="${subSeries}" ${isDefaultSelected ? 'checked' : ''}>
                            <span class="subseries-name">${subSeriesName} (${subSeries})</span>
                            ${powerOptions.length > 0 ? `<span style="margin-left: var(--spacing-sm); color: #666; font-size: 0.9em;">功率：${Math.min(...powerOptions)}KW - ${Math.max(...powerOptions)}KW</span>` : ''}
                        </label>
                        <label class="checkbox-option select-all-label" style="width: auto; min-width: auto; display: none;">
                            <input type="checkbox" name="subSeriesSelectAll" value="${subSeries}">
                            <span>全选</span>
                        </label>
                    </div>
                    <div class="power-options filter-options" style="display: ${powerOptionsDisplay};">
                        ${powerOptions.map(power => `
                            <label class="checkbox-option power-checkbox">
                                <input type="checkbox" name="power" value="${power}" data-subseries="${subSeries}">
                                <span>${power}KW</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            
            powerGroupsContainer.innerHTML += powerGroupHTML;
        });
        
        // 重新绑定子系列展开/收起事件
        powerGroupsContainer.querySelectorAll('input[name="subSeriesToggle"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.value;
                const powerGroup = this.closest('.power-group');
                const powerOptions = powerGroup.querySelector('.power-options');
                const selectAllLabel = powerGroup.querySelector('.select-all-label');
                
                // 为选中的复选框父元素添加或移除checked类，显示颜色提示
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
                // 显示或隐藏功率段和全选按钮
                if (this.checked) {
                    powerOptions.style.display = 'grid';
                    selectAllLabel.style.display = 'inline-flex';
                } else {
                    powerOptions.style.display = 'none';
                    selectAllLabel.style.display = 'none';
                }
                
                console.log('子系列展开/收起:', subSeries, '状态:', this.checked);
            });
        });
        
        // 重新绑定子系列全选按钮事件
        powerGroupsContainer.querySelectorAll('input[name="subSeriesSelectAll"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.value;
                const powerCheckboxes = powerGroupsContainer.querySelectorAll(`input[name="power"][data-subseries="${subSeries}"]`);
                
                // 为全选复选框父元素添加或移除checked类
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
                // 全选或取消全选功率段
                powerCheckboxes.forEach(powerCheckbox => {
                    powerCheckbox.checked = this.checked;
                    // 为功率选项父元素添加或移除checked类
                    const powerParent = powerCheckbox.parentElement;
                    if (this.checked) {
                        powerParent.classList.add('checked');
                    } else {
                        powerParent.classList.remove('checked');
                    }
                });
                
                // 更新筛选条件
                updatePowerFilters();
                console.log('子系列全选状态变更:', subSeries, '状态:', this.checked);
            });
        });
        
        // 重新绑定功率选项事件
        powerGroupsContainer.querySelectorAll('input[name="power"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.dataset.subseries;
                const allPowerCheckboxes = powerGroupsContainer.querySelectorAll(`input[name="power"][data-subseries="${subSeries}"]`);
                const selectAllCheckbox = powerGroupsContainer.querySelector(`input[name="subSeriesSelectAll"][value="${subSeries}"]`);
                
                // 为功率选项父元素添加或移除checked类
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
                // 检查是否所有功率选项都被勾选
                const allChecked = Array.from(allPowerCheckboxes).every(cb => cb.checked);
                
                // 更新全选复选框状态
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allChecked;
                    // 为全选复选框父元素添加或移除checked类
                    const selectAllParent = selectAllCheckbox.parentElement;
                    if (allChecked) {
                        selectAllParent.classList.add('checked');
                    } else {
                        selectAllParent.classList.remove('checked');
                    }
                }
                
                updatePowerFilters();
                console.log('功率选项变更:', this.value, '子系列:', subSeries, '选中状态:', this.checked);
            });
        });
    }
    
    // 为顶级系列下拉框绑定事件
    const topSeriesSelect = seriesCategory.querySelector('select[name="topSeries"]');
    topSeriesSelect.addEventListener('change', function() {
        const selectedSeries = this.value;
        servoSelectedFilters.topSeries = [selectedSeries];
        console.log('选中顶级系列:', selectedSeries);
        console.log('当前顶级系列筛选条件:', servoSelectedFilters.topSeries);
        
        // 根据选中的顶级系列重新生成功率组
        generatePowerGroups(selectedSeries);
    });
    
    // 为电压和抱闸复选框绑定事件
    seriesCategory.querySelectorAll('input[name="voltage"], input[name="brake"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 为选中的复选框父元素添加或移除checked类，显示颜色提示
            const parent = this.parentElement;
            if (this.checked) {
                parent.classList.add('checked');
            } else {
                parent.classList.remove('checked');
            }
            
            // 更新筛选条件
            updatePowerFilters();
        });
    });
    
    // 默认选择A3系列，初始生成MS1H功率组
    servoSelectedFilters.topSeries = ['A3'];
    generatePowerGroups('A3');
    
    // 直接添加按钮，不使用modal-actions div
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        padding: var(--spacing-sm) 0;
    `;
    buttonsContainer.innerHTML = `
        <button id="servoCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="servoConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(buttonsContainer);
    console.log('已添加按钮');
    
    // 调整弹窗内容的上下间距
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.cssText = `
            padding-top: var(--spacing-md);
            padding-bottom: var(--spacing-md);
        `;
    }
    
    // 绑定确认筛选按钮事件，交给路由统一处理
    const confirmBtn = document.getElementById('servoConfirmFilter');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log('点击确认筛选按钮');
            if (window.pageRouter) {
                window.pageRouter.confirmFilter('Servo');
            }
        });
        console.log('已绑定确认筛选按钮事件');
    }
    
    // 绑定取消按钮事件
    const cancelBtn = document.getElementById('servoCancelFilter');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('点击取消按钮');
            modal.classList.remove('show');
        });
        console.log('已绑定取消按钮事件');
    }
    
    // 显示弹窗
    modal.classList.add('show');
    console.log('已显示伺服筛选弹窗');
    
    // 重置筛选条件，默认选择A3系列
    servoSelectedFilters = {
        topSeries: ['A3'],
        subSeries: [],
        powers: {},
        voltages: [],
        brakeOptions: []
    };
    console.log('已重置筛选条件，默认选择A3系列');
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', function servoModalClickHandler(event) {
        if (event.target === modal) {
            console.log('点击弹窗外部，关闭弹窗');
            modal.classList.remove('show');
            window.removeEventListener('click', servoModalClickHandler);
        }
    });
}

// 更新功率筛选条件
function updatePowerFilters() {
    console.log('更新功率筛选条件');
    
    const selectedSubSeries = [];
    const selectedPowers = {};
    const selectedVoltages = [];
    const selectedBrakeOptions = [];
    
    // 使用更具体的选择器，只选择普通伺服模态框内的复选框
    const modal = document.getElementById('servoFilterModal');
    if (!modal) {
        console.error('普通伺服模态框不存在');
        return;
    }
    
    // 获取选中的功率值
    modal.querySelectorAll('input[name="power"]:checked').forEach(checkbox => {
        const subSeries = checkbox.dataset.subseries;
        if (!selectedPowers[subSeries]) {
            selectedPowers[subSeries] = [];
        }
        selectedPowers[subSeries].push(parseFloat(checkbox.value));
    });
    console.log('选中的功率值:', selectedPowers);
    
    // 获取选中的电压值
    modal.querySelectorAll('input[name="voltage"]:checked').forEach(checkbox => {
        selectedVoltages.push(checkbox.value);
    });
    console.log('选中的电压值:', selectedVoltages);
    
    // 获取选中的抱闸选项
    modal.querySelectorAll('input[name="brake"]:checked').forEach(checkbox => {
        selectedBrakeOptions.push(checkbox.value);
    });
    console.log('选中的抱闸选项:', selectedBrakeOptions);
    
    // 从选中的功率值中提取子系列
    const selectedSubSeriesFromPowers = Object.keys(selectedPowers);
    console.log('从功率值中提取的子系列:', selectedSubSeriesFromPowers);
    
    servoSelectedFilters.subSeries = selectedSubSeriesFromPowers;
    servoSelectedFilters.powers = selectedPowers;
    servoSelectedFilters.voltages = selectedVoltages;
    servoSelectedFilters.brakeOptions = selectedBrakeOptions;
    
    console.log('更新后的筛选条件:', servoSelectedFilters);
}

// 应用伺服筛选条件并显示结果
function applyServoFilters() {
    console.log('应用伺服筛选条件');
    
    // 关闭弹窗
    const modal = document.getElementById('servoFilterModal');
    if (modal) {
        modal.classList.remove('show');
        console.log('已关闭伺服筛选弹窗');
    }
    
    // 使用路由显示结果页面
    if (window.pageRouter) {
        window.pageRouter.showPage('servoResult');
    }
    
    // 获取伺服系统数据
    const productData = window.servoSystemData || {};

    
    const productTypeName = '伺服系统';
    
    // 设置结果标题
    const resultTitle = document.getElementById('servoResultTitle');
    if (resultTitle) {
        resultTitle.textContent = `${productTypeName}筛选结果`;
        console.log('已设置结果标题');
    }
    
    // 筛选数据
    const filteredData = filterServoProductData(productData, servoSelectedFilters);
   
    
    // 显示结果
    displayServoResults(filteredData);
}

// 提供给路由的筛选选择获取函数
window.getServoFilterSelections = function() {
    return servoSelectedFilters || {};
};

// 监听路由分发的结果展示事件
document.addEventListener('showFilterResults', function(e) {
    if (e.detail && e.detail.productType === 'Servo') {
        const productData = window.servoSystemData || {};
        const productTypeName = '伺服系统';
        const filterData = e.detail.filterData || servoSelectedFilters || {};

        const resultTitle = document.getElementById('servoResultTitle');
        if (resultTitle) {
            resultTitle.textContent = `${productTypeName}筛选结果`;
        }

        const filteredData = filterServoProductData(productData, filterData);
        displayServoResults(filteredData);
    }
});

// 显示伺服系统结果的函数 - 使用新的专用卡片布局
function displayServoResults(results) {
    // 获取结果容器
    const resultsContainer = document.getElementById('servoResultContent');
    if (!resultsContainer) {
        return;
    }
    
    // 清空结果容器
    resultsContainer.innerHTML = '';
    
    // 设置结果标题
    
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`伺服系统筛选结果 (${Array.isArray(results) ? results.length : 0})`);
    }
    
    // 验证结果数组
    if (!Array.isArray(results)) {
        resultsContainer.innerHTML = '<p class="no-results text-red-500">错误：筛选结果格式无效</p>';
        return;
    }
    
    // 如果没有结果，显示空状态
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p class="mb-4">没有找到匹配的产品</p>
                <button id="resetServoFilters" class="px-4 py-2 bg-blue-500 text-white rounded">重置筛选条件</button>
            </div>
        `;
        
        // 绑定重置按钮
        const resetBtn = document.getElementById('resetServoFilters');
        if (resetBtn && typeof resetAndShowServoFilterModal === 'function') {
            resetBtn.addEventListener('click', resetAndShowServoFilterModal);
        }
        return;
    }
    
    // 创建伺服系统专用结果卡片容器
    const container = document.createElement('div');
    container.className = 'servo-results-container';
    
    // 添加结果卡片
    let createdCards = 0;
    results.forEach((product, index) => {
        if (!product || typeof product !== 'object') {
            return;
        }
        
        try {
            // 创建伺服系统专用卡片元素
            const card = document.createElement('div');
            card.className = 'servo-result-card';
            
            // 获取电机数据
            const motorData = product['伺服电机'] || {};
            
            // 构建卡片HTML
            card.innerHTML = `
                <div class="servo-card-header">
                    <h3 class="servo-card-title">伺服电机</h3>
                    <div class="servo-card-price">¥${motorData.price || 0}.00</div>
                </div>
                <div class="servo-card-subheader">
                    <div class="servo-card-model">型号: ${product.model || '-'}</div>
                    <div class="servo-card-id">驱动器: ${getDriverInfo(product.accessories || {})}</div>
                </div>
                <div class="servo-card-content">
                    <div class="servo-info-group">
                        <h4 class="servo-info-group-title">基本参数</h4>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">功率:</span>
                            <span class="servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${motorData.ratedPower || '-'} KW</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">额定电压:</span>
                            <span class="servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${motorData.ratedVoltage || '-'}</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">机座号:</span>
                            <span class="servo-info-item-value">${motorData.frameSize || '-'}</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">是否带刹车:</span>
                            <span class="servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${motorData.hasBrake ? '是' : '否'}</span>
                        </div>
                    </div>
                    <div class="servo-info-group">
                        <h4 class="servo-info-group-title">额定性能</h4>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">额定转矩:</span>
                            <span class="servo-info-item-value">${motorData.ratedTorque || '-'} N·m</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">额定电流:</span>
                            <span class="servo-info-item-value">${motorData.ratedCurrent || '-'} A</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">额定转速:</span>
                            <span class="servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${motorData.ratedSpeed || '-'} rpm</span>
                        </div>
                    </div>
                    <div class="servo-info-group">
                        <h4 class="servo-info-group-title">极限性能</h4>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">最大转矩:</span>
                            <span class="servo-info-item-value">${motorData.maxTorque || '-'} N·m</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">最大电流:</span>
                            <span class="servo-info-item-value">${motorData.maxCurrent || '-'} A</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">最大转速:</span>
                            <span class="servo-info-item-value">${motorData.maxSpeed || '-'} rpm</span>
                        </div>
                    </div>
                    <div class="servo-info-group">
                        <h4 class="servo-info-group-title">技术参数</h4>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">编码器精度:</span>
                            <span class="servo-info-item-value">${motorData.encoderPrecision || '-'}</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">力矩系数:</span>
                            <span class="servo-info-item-value">${motorData.torqueCoefficient || '-'}</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">惯量、容量:</span>
                            <span class="servo-info-item-value">${motorData.inertiaCapacity || '-'}</span>
                        </div>
                        <div class="servo-info-item">
                            <span class="servo-info-item-label">转子转动惯量:</span>
                            <span class="servo-info-item-value">${motorData.rotorInertia || '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="servo-card-actions">
                    <a href="https://www.inovance.com/portal/allResult?key=${product.model || ''}" 
                       class="download-btn" 
                       target="_blank" 
                       rel="noopener noreferrer">资料和图纸下载</a>
                    <button class="compare-btn"
                        data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'
                        data-type="伺服系统">对比</button>
                    <button class="add-to-bom-btn" data-id="${product.id || product.model || ''}" data-model="${product.model || ''}" data-series="${product.series || ''}" data-subseries="${product.subSeries || ''}">+ 添加到BOM</button>
                </div>
            `;
      
            container.appendChild(card);
            createdCards++;
        } catch (error) {
        }
    });
    
    // 将容器添加到结果区域
    resultsContainer.appendChild(container);
    
    // 确保结果页面显示
    const servoResultPage = document.getElementById('servoResultPage');
    if (servoResultPage) {
        servoResultPage.style.display = 'block';
    }
}

// 获取驱动器信息的函数
function getDriverInfo(accessories) {
    if (!accessories || !accessories['驱动器']) {
        return '-';
    }
    
    const drivers = accessories['驱动器'];
    if (Array.isArray(drivers) && drivers.length > 0) {
        return drivers.map(driver => driver.model || driver.id || '未知').join(', ');
    }
    
    return '-';
}

// 重置并显示伺服筛选弹窗
function resetAndShowServoFilterModal() {
    console.log('重置并显示伺服筛选弹窗');
    
    // 重置筛选条件
    servoSelectedFilters = {
        topSeries: [],
        subSeries: [],
        powers: {},
        voltages: [],
        brakeOptions: []
    };
    
    console.log('已重置筛选条件:', servoSelectedFilters);
    
    // 隐藏结果页面，显示主内容
    const servoResultPage = document.getElementById('servoResultPage');
    const mainContent = document.querySelector('.main-content');
    
    if (servoResultPage) {
        servoResultPage.style.display = 'none';
        console.log('已隐藏伺服结果页面');
    }
    
    if (mainContent) {
        mainContent.style.display = 'block';
        console.log('已显示主内容');
    }
    
    // 显示筛选弹窗
    showServoFilterModal();
}

// 过滤伺服产品数据
function filterServoProductData(data, filters = {}) {
    const filteredProducts = [];
    // 确保传入的数据有效
    const validData = typeof data === 'object' && data !== null ? data : {};
    
    // 添加调试日志
    console.log('开始筛选数据，总数据层级:', Object.keys(validData).length);
    console.log('当前筛选条件:', JSON.stringify(filters));
   
    
    // 深拷贝函数，确保嵌套结构完整保留
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
       
        return clonedObj;
    }
    
    // 递归遍历所有产品数据，查找所有包含伺服电机数据的产品
    function collectAndFilterProducts(dataObj, series = null, subSeries = null) {
        if (typeof dataObj !== 'object' || dataObj === null) return;
        
        // 检查当前对象是否有伺服电机数据
        if (dataObj['伺服电机']) {
            const motorData = dataObj['伺服电机'];
            
            // 数据有效性检查
            if (!motorData || typeof motorData !== 'object') {
                console.warn(`无效的电机数据: ${dataObj['型号'] || 'Unknown'}`);
                return;
            }
            
            // 构建完整的产品对象，确保数据完整性
            const completeProduct = {
                series: series,
                subSeries: subSeries,
                // 保留完整的原始产品数据引用
                _originalData: deepClone(dataObj),
                // 添加配件信息，包括驱动器
                accessories: dataObj.accessories ? deepClone(dataObj.accessories) : {}
            };
            
            // 深拷贝伺服电机数据，保留完整嵌套结构
            completeProduct['伺服电机'] = deepClone(motorData);
            
            // 提取基本信息到顶层，尝试从多个可能的字段获取
            completeProduct.id = motorData.id || dataObj['型号'] || dataObj.model || dataObj.id || '-';
            
            // 提取其他关键信息
            completeProduct.model = motorData.model || dataObj['型号'] || dataObj.model || '-';
            completeProduct.ratedPower = motorData.ratedPower;
            completeProduct.ratedTorque = motorData.ratedTorque;
            completeProduct.ratedSpeed = motorData.ratedSpeed;
            completeProduct.rotorInertia = motorData.rotorInertia;
            completeProduct.encoderPrecision = motorData.encoderPrecision;
            completeProduct.frameSize = motorData.frameSize;
            completeProduct.ratedVoltage = motorData.ratedVoltage;
            completeProduct.hasBrake = motorData.hasBrake;
            
            // 应用筛选条件
            let shouldInclude = true;
            
            // 筛选顶级系列
            if (filters.topSeries && filters.topSeries.length > 0) {
                shouldInclude = shouldInclude && series && filters.topSeries.includes(series);
            }
            
            // 筛选子系列
            if (filters.subSeries && filters.subSeries.length > 0) {
                shouldInclude = shouldInclude && subSeries && filters.subSeries.includes(subSeries);
            }
            
            // 筛选功率
            if (filters.powers) {
                const powersForSubSeries = filters.powers[subSeries];
                if (powersForSubSeries && powersForSubSeries.length > 0) {
                    shouldInclude = shouldInclude && motorData.ratedPower !== undefined && 
                                   powersForSubSeries.includes(motorData.ratedPower);
                }
            }
            
            // 筛选电压
            if (filters.voltages && filters.voltages.length > 0) {
                shouldInclude = shouldInclude && motorData.ratedVoltage !== undefined;
                if (shouldInclude) {
                    const voltageStr = motorData.ratedVoltage.toString();
                    shouldInclude = filters.voltages.some(voltage => {
                        if (voltage === '单相220V') {
                            return voltageStr.includes('单相') && voltageStr.includes('220V') || voltageStr.includes('单相/三相220V');
                        } else if (voltage === '三相220V') {
                            return voltageStr.includes('三相') && voltageStr.includes('220V') || voltageStr.includes('单相/三相220V');
                        } else if (voltage === '三相380V') {
                            return voltageStr.includes('三相') && voltageStr.includes('380V');
                        }
                        return voltageStr.includes(voltage);
                    });
                }
            }
            
            // 筛选抱闸
            if (filters.brakeOptions && filters.brakeOptions.length > 0) {
                // 如果同时选择了带抱闸和不带抱闸，则跳过抱闸筛选
                if (!(filters.brakeOptions.includes('with') && filters.brakeOptions.includes('without'))) {
                    if (filters.brakeOptions.includes('with')) {
                        // 检查是否带抱闸：优先使用hasBrake属性，否则检查型号第18个字符
                        const hasBrake = motorData.hasBrake === true || 
                                       (completeProduct.model && completeProduct.model.length >= 18 && 
                                        (completeProduct.model.charAt(17) === '4' || completeProduct.model.charAt(17) === '2'));
                        shouldInclude = shouldInclude && hasBrake;
                    }
                    if (filters.brakeOptions.includes('without')) {
                        // 检查是否不带抱闸：优先使用hasBrake属性，否则检查型号第18个字符
                        const hasNoBrake = motorData.hasBrake === false || 
                                         (completeProduct.model && completeProduct.model.length >= 18 && 
                                          (completeProduct.model.charAt(17) === '1' || completeProduct.model.charAt(17) === '0'));
                        shouldInclude = shouldInclude && hasNoBrake;
                    }
                }
            }
            
            // 筛选型号
            if (filters.model) {
                const normalizedModel = filters.model.trim().toUpperCase();
                const productModel = completeProduct.model || '';
                shouldInclude = shouldInclude && productModel.toUpperCase().includes(normalizedModel);
            }
            
            if (shouldInclude) {
                filteredProducts.push(completeProduct);
            }
        }
        
        // 递归处理嵌套对象
        for (const key in dataObj) {
            if (Object.prototype.hasOwnProperty.call(dataObj, key) && typeof dataObj[key] === 'object' && dataObj[key] !== null) {
                // 传递系列信息给下一层
                const nextSeries = series || key;
                // 处理子系列
                let nextSubSeries = subSeries;
                
                // 如果还没有子系列，需要确定当前层级是否是子系列
                if (!nextSubSeries) {
                    // 如果是顶级系列层级（series为null），则key是系列名，不是子系列
                    if (series === null) {
                        // 系列层级，没有子系列
                        nextSubSeries = null;
                    } else {
                        // 子系列层级，key就是子系列名
                        nextSubSeries = key;
                    }
                } else if (series === 'EX_d') {
                    // 如果已经在EX_d系列中，且当前有子系列，那么下一层是具体产品，保留当前子系列
                    // 不需要更新nextSubSeries
                }
                
                collectAndFilterProducts(dataObj[key], nextSeries, nextSubSeries);
            }
        }
    }
    
    // 开始收集和筛选产品
    collectAndFilterProducts(validData);
    
    console.log('筛选完成，找到匹配产品数量:', filteredProducts.length);
   
    return filteredProducts;
}