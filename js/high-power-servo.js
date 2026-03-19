// 全局大功率伺服系统数据和类型定义
window.highPowerServoSystemData = window.highPowerServoSystemData || {};
window.highPowerServoType = window.highPowerServoType || {};

console.log('大功率伺服系统模块已加载');

// 全局错误处理
// 全局错误处理已移至error-handler.js模块

// 大功率伺服系统筛选相关变量
let highPowerServoSelectedFilters = {
    topSeries: [],
    subSeries: [],
    powers: {},

    brakeOptions: []
};

// 预定义子系列功率选项
const highPowerSubSeriesPowerOptions = {
    'ISMG': [7.9, 10.5, 11.8, 14.5, 15.7, 18.1, 19.3, 24.1, 23.6, 31.4, 27, 36.1, 35.6, 44.8, 48.2, 53.4, 17.2, 18.8, 22, 45, 55, 92.7]
};

// 预定义子系列名称映射
const highPowerSubSeriesNames = {
    'ISMG': '高惯量大容量'
};

// 初始化大功率伺服相关事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 绑定返回主页按钮事件
    const highPowerServoResultPage = document.getElementById('highPowerServoResultPage');
    if (highPowerServoResultPage) {
        const backToMainBtn = highPowerServoResultPage.querySelector('.back-to-main');
        
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', function() {
                console.log('点击返回主页按钮');
                highPowerServoResultPage.style.display = 'none';
                console.log('已隐藏大功率伺服结果页面');
                
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
        console.log('大功率伺服结果页面不存在，跳过返回主页按钮绑定');
    }
    
    // 绑定大功率伺服产品卡片点击事件
    const highPowerServoCard = document.querySelector('.product-card[data-type="HighPowerServo"]');
    if (highPowerServoCard) {
        highPowerServoCard.addEventListener('click', function(e) {
            if (e.isTrusted) {
                showHighPowerServoFilterModal();
            }
        });
    }
    
    // 绑定侧边栏大功率伺服链接点击事件
    const highPowerServoLink = document.querySelector('.product-link[data-type="HighPowerServo"]');
    if (highPowerServoLink) {
        highPowerServoLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (e.isTrusted) {
                showHighPowerServoFilterModal();
            }
        });
    }
    
    // 绑定大功率伺服弹窗关闭事件
    const highPowerServoCloseBtn = document.querySelector('.close-high-power-servo');
    if (highPowerServoCloseBtn) {
        highPowerServoCloseBtn.addEventListener('click', function() {
            document.getElementById('highPowerServoFilterModal').classList.remove('show');
        });
    }
    
    const highPowerServoResultContainer = document.getElementById('highPowerServoResultContent');
    if (highPowerServoResultContainer) {
        highPowerServoResultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.add-to-bom-btn');
            if (btn) {
                const targetIdOrModel = btn.dataset.id || btn.dataset.model || '';
                const productSeries = btn.dataset.series || '';
                const productSubSeries = btn.dataset.subseries || '';
                
                let foundProduct = null;
                let context = { seriesName: productSeries, subSeries: productSubSeries, accessory: {} };
                try {
                    if (productSeries && productSubSeries && window.highPowerServoSystemData[productSeries] && window.highPowerServoSystemData[productSeries][productSubSeries]) {
                        const series = window.highPowerServoSystemData[productSeries];
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
                    
                    if (!foundProduct) {
                        Object.entries(window.highPowerServoSystemData || {}).forEach(([seriesKey, series]) => {
                            Object.entries(series).forEach(([subKey, subData]) => {
                                if (subData && subData['伺服电机'] && (subData['伺服电机'].id === targetIdOrModel || subData['伺服电机'].model === targetIdOrModel)) {
                                    foundProduct = subData['伺服电机'];
                                    context.seriesName = seriesKey;
                                    context.subSeries = subKey;
                                    context.accessory = subData.accessories || {};
                                } else if (typeof subData === 'object') {
                                    Object.values(subData).forEach(item => {
                                        if (item && item['伺服电机'] && (item['伺服电机'].id === targetIdOrModel || item['伺服电机'].model === targetIdOrModel)) {
                                            foundProduct = item['伺服电机'];
                                            context.seriesName = seriesKey;
                                            context.subSeries = subKey;
                                            context.accessory = item.accessories || {};
                                        }
                                    });
                                }
                            });
                        });
                    }
                } catch (_) {}

                if (foundProduct && window.HighPowerServoModals && window.HighPowerServoModals.openAccessoryModal) {
                    window.HighPowerServoModals.openAccessoryModal(foundProduct, context);
                } else {
                    const payload = {
                        id: btn.dataset.id || '-',
                        model: btn.dataset.model || '-',
                        category: btn.dataset.category || '大功率伺服系统',
                        name: btn.dataset.name || btn.dataset.model || '-',
                        price: btn.dataset.price || ''
                    };
                    if (window.HighPowerServoModals && window.HighPowerServoModals.openQuantityModal) {
                        window.HighPowerServoModals.openQuantityModal(payload);
                    } else {
                        console.warn('大功率伺服专用模态框模块未加载，无法打开数量选择弹窗');
                    }
                }
            }
        });
    }
});

// ===== 大功率伺服系统弹窗模块 =====
;(function(){
    const bomModal = document.getElementById('bomAddModal');
    const bomTitle = document.getElementById('bomAddTitle');
    const bomBody = document.getElementById('bomAddBody');
    const bomConfirm = document.getElementById('bomAddConfirm');
    const bomCancel = document.getElementById('bomAddCancel');
    const bomClose = document.getElementById('bomAddClose');

    function showModal(){ if (bomModal) bomModal.classList.add('show'); }
    function hideModal(){ if (bomModal) bomModal.classList.remove('show'); }
    
    // 大功率伺服系统专用数量输入弹窗
    function openAccessoryModal(product, context){
        if (!bomModal) return;
        const seriesName = context && context.seriesName || '';
        const accessory = context && context.accessory || {};
        const powerCables = (accessory['动力线缆'] || []);
        const encoderCables = (accessory['编码器线缆'] || []);
        const cn1Plugs = (accessory['CN1插头'] || []);
        const batteryBox = accessory['电池盒'] || null;

        const driverOptions = (() => {
            return [
                { value: 'IS650P', label: '脉冲/Modbus-RTU' },
                { value: 'IS810N', label: 'EtherCAT通信型' },
                { value: 'IS810F', label: 'PROFINET通信型' }
            ];
        })();

        const driverOptionsHtml = driverOptions.map(o => `<option value="${o.value}">${o.value} - ${o.label}</option>`).join('');
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
            <div class="form-group">
                <label>线缆长度(米)    注：编码器线缆的长度</label>
                <input type="number" id="cableLength" class="inline-input" min="1" step="0.1" value="3" title="线缆长度" placeholder="线缆长度" />
            </div>
            <div class="form-group">
                <label>动力线缆类型</label>
                <select id="cableType" class="inline-input" title="线缆类型">${cableTypeOptionsHtml}</select>
            </div>
            <div class="form-group" id="dangleCableLengthGroup" style="display: none;">
                <label>甩线长度(米)     注：电机端的线缆长度</label>
                <input type="number" id="dangleCableLength" class="inline-input" min="0.1" step="0.1" value="0.5" title="甩线长度" placeholder="甩线长度" />
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="cn1PlugChecked" checked /> 添加CN1插头</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="batteryBoxChecked" checked /> 添加电池盒</label>
            </div>
        `;

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
            const initialIndex = cableTypeSelect.selectedIndex;
            const initialCableType = powerCables[initialIndex]?.name || '';
            if (initialCableType === '甩线') {
                dangleCableLengthGroup.style.display = 'block';
            }
        }

        bomConfirm.onclick = () => {
            const qty = Math.max(0, parseInt((document.getElementById('bomQty')||{}).value || '0', 10));
            const selectedDriver = (document.getElementById('driverSelect')||{}).value || '';
            const cableLen = Math.max(1, parseFloat((document.getElementById('cableLength')||{}).value || '5') || 5);
            const cableIdx = parseInt((document.getElementById('cableType')||{}).value || '0', 10) || 0;
            const selectedCableType = powerCables[cableIdx]?.name || '';
            const dangleCableLength = parseFloat((document.getElementById('dangleCableLength')||{}).value || '0.3') || 0.3;
            const addCn1 = !!(document.getElementById('cn1PlugChecked')||{}).checked;
            const addBattery = !!(document.getElementById('batteryBoxChecked')||{}).checked;
            
            // Check if 810 driver is selected and if MD810 rectifier is already in BOM
            const currentBomItems = window.BOM && window.BOM.load ? window.BOM.load() : [];
            const is810Selected = selectedDriver.includes('810');
            const hasMd810 = currentBomItems.some(item => item.model && item.model.includes('MD810'));
            
            // If 810 is selected but no MD810 in BOM, show warning
            if (is810Selected && !hasMd810) {
                showMd810WarningPopup(selectedDriver);
                return;
            }
            
            const motorDescParts = [];
            if (product.ratedPower !== undefined) motorDescParts.push(`${product.ratedPower}KW`);
            if (product.ratedTorque !== undefined) motorDescParts.push(`${product.ratedTorque}N·m`);
            if (product.ratedSpeed) motorDescParts.push(`${product.ratedSpeed}rpm`);
            if (product.rotorInertia) motorDescParts.push(`${product.rotorInertia}kg·c㎡`);
            if (product.encoderPrecision) motorDescParts.push(`${product.encoderPrecision}`);
            let brakeInfo = '';
            if (product.model && product.model.length >= 18) {
                const eighteenthChar = product.model.charAt(17);
                if (eighteenthChar === '4' || eighteenthChar === '2') {
                    brakeInfo = '带抱闸';
                } else if (eighteenthChar === '1' || eighteenthChar === '0') {
                    brakeInfo = '无抱闸';
                }
            }
            motorDescParts.push(brakeInfo);
            const motorDesc = motorDescParts.join('/');
            
            const powerId = product.ratedPower ? `${product.ratedPower}KW` : '';
            const motorCount = currentBomItems.filter(item => item.category === '伺服电机').length + 1;
            const kitNumber = motorCount;
            const bomIdPrefix = `${powerId}P${kitNumber}`;
            window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${product.id}-${Date.now()}`, model: product.model, category: '伺服电机', name: product.name || product.model, description: motorDesc, price: product.price || 0, quantity: qty });

            let driverModel = selectedDriver;
            if (accessory && accessory['驱动器']) {
                // 从数据库中查找相应的驱动型号
                const selectedPower = product.ratedPower;
                const drivers = accessory['驱动器'];
                
                // 构建查找键：如果选择的是IS650，查找IS650P
                let lookupKey = selectedDriver;
                if (selectedDriver === 'IS650') {
                    lookupKey = 'IS650P';
                }
                
                // 查找匹配的驱动器
                const driver = drivers[lookupKey];
                if (driver) {
                    driverModel = driver.model;
                } else {
                    // 如果没有找到匹配的驱动，尝试查找其他可能的匹配
                    const matchingDriver = Object.values(drivers).find(d => 
                        d.model.includes(selectedDriver) && d.ratedPower === selectedPower
                    );
                    if (matchingDriver) {
                        driverModel = matchingDriver.model;
                    } else {
                        // 如果仍然没有找到匹配的驱动，使用第一个驱动的型号格式
                        const firstDriver = Object.values(drivers)[0];
                        if (firstDriver) {
                            const powerSuffix = firstDriver.model.match(/-(\d+\.?\d*)K$/);
                            if (powerSuffix) {
                                driverModel = `${selectedDriver}-${selectedPower}K`;
                            }
                        }
                    }
                }
            }
            const driverLabel = (driverOptions.find(d=>d.value===selectedDriver)||{}).label || '';
            const driverDescParts = [];
            if (product.ratedVoltage) driverDescParts.push(product.ratedVoltage);
            if (product.encoderPrecision) driverDescParts.push(product.encoderPrecision);
            driverDescParts.push(driverLabel);
            const driverDesc = driverDescParts.join('/');
            window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${driverModel}-${Date.now()}`, model: driverModel, category: '驱动器', name: `${product.name || ''} 驱动器`, description: driverDesc, price: 0, quantity: qty });

            if (powerCables[cableIdx]) {
                const cable = powerCables[cableIdx];
                const formattedCableLen = cableLen.toFixed(1);
                const finalPrice = (parseFloat(String(cable.price).replace(/[^0-9.]/g,'')) || 0) * cableLen / 5;
                let brakeInfo = '';
                if (cable.model && cable.model.length >= 6) {
                    const sixthChar = cable.model.charAt(5);
                    if (sixthChar === 'B') {
                        brakeInfo = '带抱闸';
                    } else if (sixthChar === 'M') {
                        brakeInfo = '无抱闸';
                    }
                }
                const description = `动力线缆`;
                window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${cable.id}`, model: `${cable.model}`, category: '动力线缆', name: cable.name || '动力线缆', description: description, price: finalPrice, quantity: qty });
                
                if (selectedCableType === '甩线') {
                    const formattedLength = dangleCableLength.toFixed(1);
                    window.BOM && window.BOM.addItem({ 
                        id: `${bomIdPrefix}-IS-C23-${formattedLength}-power-${Date.now()}`, 
                        model: `IS-C23-${formattedLength}`, 
                        category: '动力线缆', 
                        name: '甩线动力线缆电机端', 
                        description: `甩线动力线缆电机端/${formattedLength}米`, 
                        price: 0, 
                        quantity: qty 
                    });
                }
            }
            if (encoderCables[cableIdx]) {
                const cable = encoderCables[cableIdx];
                const formattedCableLen = cableLen.toFixed(1);
                const finalPrice = (parseFloat(String(cable.price).replace(/[^0-9.]/g,'')) || 0) * cableLen / 5;
                window.BOM && window.BOM.addItem({ id: `${bomIdPrefix}-${cable.id}-${formattedCableLen}M-${Date.now()}`, model: `${cable.model}-${formattedCableLen}-T-PTC`, category: '编码器线缆', name: cable.name || '编码器线缆', description: `编码器线缆${formattedCableLen}米/T:高柔`, price: finalPrice, quantity: qty });
                
                if (selectedCableType === '甩线') {
                    const formattedLength = dangleCableLength.toFixed(1);
                    window.BOM && window.BOM.addItem({ 
                        id: `${bomIdPrefix}-IS-C23-${formattedLength}-encoder-${Date.now()}`, 
                        model: `IS-C23-${formattedLength}`, 
                        category: '编码器线缆', 
                        name: '甩线编码器线缆电机端', 
                        description: `甩线编码器线缆电机端/${formattedLength}米`, 
                        price: 0, 
                        quantity: qty 
                    });
                }
            }
            if (addCn1) {
                let plug;
                // 使用switch条件语句实现本地数据映射
                switch (selectedDriver) {
                    case 'IS650P':
                    case 'IS810F':
                        plug = {
                            id: 'S6-C8-3.0(TY)',
                            model: 'S6-C8-3.0(TY)',
                            name: 'DB44-CN1插头',
                            price: 0,
                            description: 'DB44-CN1插头'
                        };
                        break;
                    case 'IS810N':
                        plug = {
                            id: '本体自带',
                            model: '本体自带',
                            name: '本体自带',
                            price: 0,
                            description: '本体自带'
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
                        quantity: qty 
                    });
                }
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

    function showMd810WarningPopup(selectedDriver) {
        const modal = document.createElement('div');
        modal.className = 'modal md810-warning-modal show';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            width: 90%;
            max-width: 600px;
            text-align: center;
        `;
        
        // Extract driver series from selectedDriver
        const driverSeries = selectedDriver || '810系列';
        
        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">提示信息</h3>
            <p style="margin: 20px 0; color: #666; line-height: 1.5;">需要先选择MD810整流单元模块，再选择${driverSeries}逆变单元模块</p>
            <p style="margin: 20px 0; color: #666; line-height: 1.5;">您选择的是多传系列，需要整流单元来带动逆变单元</p>
            <p style="margin: 20px 0; color: #666; line-height: 1.5;">整流单元的功率计算=所有逆变单元的功率相加</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px; text-align: left;">
                <h4 style="margin-top: 0; color: #333;">MD810整流单元筛选路径：</h4>
                <p style="margin: 10px 0; color: #666; line-height: 1.5;">1. 回到主页</p>
                <p style="margin: 10px 0; color: #666; line-height: 1.5;">2. 选择「变频器」</p>
                <p style="margin: 10px 0; color: #666; line-height: 1.5;">3. 选择「MD810整流」</p>
                <p style="margin: 10px 0; color: #666; line-height: 1.5;">4. 根据总功率选择合适的整流单元</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button id="goToMd810Btn" style="
                    padding: 8px 20px;
                    background-color: #52c41a;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">前往选择MD810整流单元</button>
                <button id="md810WarningClose" style="
                    padding: 8px 20px;
                    background-color: #1890ff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">确定</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        const closeBtn = document.getElementById('md810WarningClose');
        const goToMd810Btn = document.getElementById('goToMd810Btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
        }
        
        if (goToMd810Btn) {
            goToMd810Btn.addEventListener('click', function() {
                // Close current warning modal
                document.body.removeChild(modal);
                
                // Close all other possible modals
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(modal => {
                    modal.classList.remove('show');
                });
                
                // Navigate to MD810 rectifier unit selection
                if (typeof window.showInverterFilterModal === 'function') {
                    window.showInverterFilterModal();
                } else {
                    console.warn('Inverter filter modal function not available');
                }
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    window.HighPowerServoModals = { openAccessoryModal };
})();

// 显示大功率伺服筛选弹窗
function showHighPowerServoFilterModal() {
    console.log('显示大功率伺服筛选弹窗');
    
    const modal = document.getElementById('highPowerServoFilterModal');
    if (!modal) {
        return;
    }
    
    const filterOptions = document.getElementById('highPowerServoFilterOptions');
    if (!filterOptions) {
        return;
    }
    
    filterOptions.innerHTML = '';
    console.log('已清空筛选选项');
    
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = '大功率伺服系统系列筛选';
        console.log('已设置弹窗标题');
    }
    
    const topSeriesList = ['ISMG'];
    console.log('顶级系列列表:', topSeriesList);
    
    const seriesCategory = document.createElement('div');
    seriesCategory.className = 'filter-section';
    const seriesDescriptions = {
        'ISMG': '大功率伺服系统'
    };
    seriesCategory.innerHTML = `
        <div class="series-group filter-options">
            <select name="topSeries" class="inline-input">
                ${topSeriesList.map(series => `
                    <option value="${series}" ${series === 'ISMG' ? 'selected' : ''}>${series} - ${seriesDescriptions[series]}</option>
                `).join('')}
            </select>
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
    
    const powerSection = document.createElement('div');
    powerSection.className = 'filter-section';
    const powerGroupsContainer = document.createElement('div');
    powerGroupsContainer.className = 'power-groups';
    powerGroupsContainer.id = 'highPowerServo-power-groups';
    powerSection.appendChild(powerGroupsContainer);
    filterOptions.appendChild(powerSection);
    
    function generatePowerGroups(selectedTopSeries) {
        console.log('生成功率组，选中的顶级系列:', selectedTopSeries);
        
        powerGroupsContainer.innerHTML = '';
        
        const ismgSubSeries = Object.keys(highPowerSubSeriesNames).filter(key => key.startsWith('ISMG'));
        let subSeriesToShow = ismgSubSeries;
        
        console.log('要显示的子系列:', subSeriesToShow);
        
        subSeriesToShow.forEach(subSeries => {
            let subSeriesName = highPowerSubSeriesNames[subSeries] || subSeries;
            
            let powerOptions = highPowerSubSeriesPowerOptions[subSeries] || [];
            
            const inputType = 'checkbox';
            const inputName = 'subSeriesToggle';
            const isDefaultSelected = false;
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
        
        powerGroupsContainer.querySelectorAll('input[name="subSeriesToggle"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.value;
                const powerGroup = this.closest('.power-group');
                const powerOptions = powerGroup.querySelector('.power-options');
                const selectAllLabel = powerGroup.querySelector('.select-all-label');
                
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
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
        
        powerGroupsContainer.querySelectorAll('input[name="subSeriesSelectAll"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.value;
                const powerCheckboxes = powerGroupsContainer.querySelectorAll(`input[name="power"][data-subseries="${subSeries}"]`);
                
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
                powerCheckboxes.forEach(powerCheckbox => {
                    powerCheckbox.checked = this.checked;
                    const powerParent = powerCheckbox.parentElement;
                    if (this.checked) {
                        powerParent.classList.add('checked');
                    } else {
                        powerParent.classList.remove('checked');
                    }
                });
                
                updateHighPowerServoFilters();
                console.log('子系列全选状态变更:', subSeries, '状态:', this.checked);
            });
        });
        
        powerGroupsContainer.querySelectorAll('input[name="power"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const subSeries = this.dataset.subseries;
                const allPowerCheckboxes = powerGroupsContainer.querySelectorAll(`input[name="power"][data-subseries="${subSeries}"]`);
                const selectAllCheckbox = powerGroupsContainer.querySelector(`input[name="subSeriesSelectAll"][value="${subSeries}"]`);
                
                const parent = this.parentElement;
                if (this.checked) {
                    parent.classList.add('checked');
                } else {
                    parent.classList.remove('checked');
                }
                
                const allChecked = Array.from(allPowerCheckboxes).every(cb => cb.checked);
                
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allChecked;
                    const selectAllParent = selectAllCheckbox.parentElement;
                    if (allChecked) {
                        selectAllParent.classList.add('checked');
                    } else {
                        selectAllParent.classList.remove('checked');
                    }
                }
                
                updateHighPowerServoFilters();
                console.log('功率选项变更:', this.value, '子系列:', subSeries, '选中状态:', this.checked);
            });
        });
    }
    
    const topSeriesSelect = seriesCategory.querySelector('select[name="topSeries"]');
    topSeriesSelect.addEventListener('change', function() {
        const selectedSeries = this.value;
        highPowerServoSelectedFilters.topSeries = [selectedSeries];
        console.log('选中顶级系列:', selectedSeries);
        console.log('当前顶级系列筛选条件:', highPowerServoSelectedFilters.topSeries);
        
        generatePowerGroups(selectedSeries);
    });
    
    seriesCategory.querySelectorAll('input[name="brake"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parent = this.parentElement;
            if (this.checked) {
                parent.classList.add('checked');
            } else {
                parent.classList.remove('checked');
            }
            
            updateHighPowerServoFilters();
        });
    });
    
    highPowerServoSelectedFilters.topSeries = ['HighPower'];
    generatePowerGroups('HighPower');
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        padding: var(--spacing-sm) 0;
    `;
    buttonsContainer.innerHTML = `
        <button id="highPowerServoCancelFilter" class="cancel-filter-btn">取消</button>
        <button id="highPowerServoConfirmFilter" class="confirm-filter-btn">应用筛选</button>
    `;
    filterOptions.appendChild(buttonsContainer);
    console.log('已添加按钮');
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.cssText = `
            padding-top: var(--spacing-md);
            padding-bottom: var(--spacing-md);
        `;
    }
    
    const confirmBtn = document.getElementById('highPowerServoConfirmFilter');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log('点击确认筛选按钮');
            if (window.pageRouter) {
                window.pageRouter.confirmFilter('HighPowerServo');
            }
        });
        console.log('已绑定确认筛选按钮事件');
    }
    
    const cancelBtn = document.getElementById('highPowerServoCancelFilter');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('点击取消按钮');
            modal.classList.remove('show');
        });
        console.log('已绑定取消按钮事件');
    }
    
    modal.classList.add('show');
    console.log('已显示大功率伺服筛选弹窗');
    
    highPowerServoSelectedFilters = {
        topSeries: ['HighPower'],
        subSeries: [],
        powers: {},

        brakeOptions: []
    };
    console.log('已重置筛选条件，默认选择HighPower系列');
    
    window.addEventListener('click', function highPowerServoModalClickHandler(event) {
        if (event.target === modal) {
            console.log('点击弹窗外部，关闭弹窗');
            modal.classList.remove('show');
            window.removeEventListener('click', highPowerServoModalClickHandler);
        }
    });
}

// 更新功率筛选条件
function updateHighPowerServoFilters() {
    console.log('更新大功率伺服筛选条件');
    
    const selectedSubSeries = [];
    const selectedPowers = {};
    const selectedBrakeOptions = [];
    
    // 使用更具体的选择器，只选择大功率伺服模态框内的复选框
    const modal = document.getElementById('highPowerServoFilterModal');
    if (!modal) {
        console.error('大功率伺服模态框不存在');
        return;
    }
    
    modal.querySelectorAll('input[name="power"]:checked').forEach(checkbox => {
        const subSeries = checkbox.dataset.subseries;
        if (!selectedPowers[subSeries]) {
            selectedPowers[subSeries] = [];
        }
        selectedPowers[subSeries].push(parseFloat(checkbox.value));
    });
    console.log('选中的功率值:', selectedPowers);
    
    modal.querySelectorAll('input[name="brake"]:checked').forEach(checkbox => {
        selectedBrakeOptions.push(checkbox.value);
    });
    console.log('选中的抱闸选项:', selectedBrakeOptions);
    
    const selectedSubSeriesFromPowers = Object.keys(selectedPowers);
    console.log('从功率值中提取的子系列:', selectedSubSeriesFromPowers);
    
    highPowerServoSelectedFilters.subSeries = selectedSubSeriesFromPowers;
    highPowerServoSelectedFilters.powers = selectedPowers;
    highPowerServoSelectedFilters.brakeOptions = selectedBrakeOptions;
    
    console.log('更新后的筛选条件:', highPowerServoSelectedFilters);
}

// 获取大功率伺服筛选条件
function getHighPowerServoFilterSelections() {
    console.log('获取大功率伺服筛选条件:', highPowerServoSelectedFilters);
    return highPowerServoSelectedFilters;
}

// 获取大功率伺服驱动器信息的函数
function getHighPowerDriverInfo(accessories) {
    if (!accessories || !accessories['驱动器']) {
        return '-';
    }
    
    const drivers = accessories['驱动器'];
    if (typeof drivers === 'object' && drivers !== null) {
        return Object.values(drivers).map(driver => driver.model || driver.id || '未知').join(', ');
    }
    
    return '-';
}

// 全局暴露函数
window.getHighPowerServoFilterSelections = getHighPowerServoFilterSelections;

// 监听筛选结果显示事件
document.addEventListener('showFilterResults', function(e) {
    const productType = e.detail.productType;
    const filterData = e.detail.filterData;
    
    if (productType === 'HighPowerServo') {
        console.log('显示大功率伺服筛选结果，筛选条件:', filterData);
        
        // 筛选数据
        const filteredData = filterHighPowerServoData(filterData);
        
        // 显示结果
        displayHighPowerServoResults(filteredData);
    }
});

// 筛选大功率伺服数据
function filterHighPowerServoData(filterData) {
    const allData = window.highPowerServoSystemData || {};
    const filteredData = [];
    
    console.log('开始筛选大功率伺服数据:', {
        allDataExists: !!Object.keys(allData).length,
        filterData: filterData
    });
    
    // 遍历所有数据，根据筛选条件进行筛选
    Object.entries(allData).forEach(([seriesKey, seriesData]) => {
        console.log('处理系列:', seriesKey);
        Object.entries(seriesData).forEach(([subSeriesKey, subSeriesData]) => {
            console.log('处理子系列:', subSeriesKey);
            Object.entries(subSeriesData).forEach(([modelKey, modelData]) => {
                const motorData = modelData['伺服电机'];
                if (!motorData) {
                    console.log('跳过无电机数据的项:', modelKey);
                    return;
                }
                
                console.log('检查电机:', motorData.model, { hasBrake: motorData.hasBrake });
                
                // 检查型号筛选
                if (filterData.model) {
                    const normalizedModel = motorData.model.toLowerCase().replace(/\s+/g, '');
                    const normalizedFilterModel = filterData.model.toLowerCase().replace(/\s+/g, '');
                    if (!normalizedModel.includes(normalizedFilterModel)) {
                        console.log('型号筛选不匹配:', motorData.model, filterData.model);
                        return;
                    }
                }
                
                // 检查功率筛选 - 只有当用户选择了功率选项时才进行筛选
                if (filterData.powers && Object.keys(filterData.powers).length > 0) {
                    const subSeriesPowers = filterData.powers[subSeriesKey];
                    if (!subSeriesPowers || !subSeriesPowers.includes(motorData.ratedPower)) {
                        console.log('功率筛选不匹配:', motorData.ratedPower, subSeriesPowers);
                        return;
                    }
                }
                
                // 检查抱闸筛选
                if (filterData.brakeOptions && filterData.brakeOptions.length > 0) {
                    console.log('抱闸筛选条件:', filterData.brakeOptions);
                    // 如果同时选择了带抱闸和不带抱闸，则跳过抱闸筛选
                    if (filterData.brakeOptions.includes('with') && filterData.brakeOptions.includes('without')) {
                        console.log('同时选择了带抱闸和不带抱闸，跳过抱闸筛选');
                    } else {
                        if (filterData.brakeOptions.includes('with')) {
                            console.log('检查带抱闸:', motorData.hasBrake);
                            if (!motorData.hasBrake) {
                                console.log('跳过无抱闸电机:', motorData.model);
                                return;
                            }
                        }
                        if (filterData.brakeOptions.includes('without')) {
                            console.log('检查无抱闸:', motorData.hasBrake);
                            if (motorData.hasBrake) {
                                console.log('跳过带抱闸电机:', motorData.model);
                                return;
                            }
                        }
                    }
                }
                
                // 通过所有筛选条件，添加到结果中
                console.log('添加电机到结果:', motorData.model);
                filteredData.push({
                    ...motorData,
                    series: seriesKey,
                    subSeries: subSeriesKey,
                    accessories: modelData.accessories
                });
            });
        });
    });
    
    console.log('筛选完成，结果数量:', filteredData.length);
    return filteredData;
}

// 显示大功率伺服筛选结果
function displayHighPowerServoResults(filteredData) {
    // 获取结果容器
    const resultsContainer = document.getElementById('highPowerServoResultContent');
    if (!resultsContainer) {
        return;
    }
    
    // 清空结果容器
    resultsContainer.innerHTML = '';
    
    // 设置结果标题
    if (typeof window.setTopBarTitle === 'function') {
        window.setTopBarTitle(`大功率伺服系统筛选结果 (${Array.isArray(filteredData) ? filteredData.length : 0})`);
    }
    
    // 验证结果数组
    if (!Array.isArray(filteredData)) {
        resultsContainer.innerHTML = '<p class="no-results text-red-500">错误：筛选结果格式无效</p>';
        return;
    }
    
    // 如果没有结果，显示空状态
    if (filteredData.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p class="mb-4">没有找到匹配的产品</p>
                <button id="resetHighPowerServoFilters" class="px-4 py-2 bg-blue-500 text-white rounded">重置筛选条件</button>
            </div>
        `;
        
        // 绑定重置按钮
        const resetBtn = document.getElementById('resetHighPowerServoFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (window.showHighPowerServoFilterModal) {
                    window.showHighPowerServoFilterModal();
                }
            });
        }
        return;
    }
    
    // 创建大功率伺服系统专用结果卡片容器
    const container = document.createElement('div');
    container.className = 'high-power-servo-results-container';
    
    // 添加结果卡片
    filteredData.forEach((product, index) => {
        if (!product || typeof product !== 'object') {
            return;
        }
        
        try {
            // 创建大功率伺服系统专用卡片元素
            const card = document.createElement('div');
            card.className = 'high-power-servo-result-card';
            
            // 构建卡片HTML
            card.innerHTML = `
                <div class="high-power-servo-card-header">
                    <h3 class="high-power-servo-card-title">伺服电机</h3>
                    <div class="high-power-servo-card-price">¥${product.price || 0}.00</div>
                </div>
                <div class="high-power-servo-card-subheader">
                    <div class="high-power-servo-card-model">型号: ${product.model || '-'}</div>
                    <div class="high-power-servo-card-id">驱动器: ${getHighPowerDriverInfo(product.accessories || {})}</div>
                </div>
                <div class="high-power-servo-card-content">
                    <div class="high-power-servo-info-group">
                        <h4 class="high-power-servo-info-group-title">基本参数</h4>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">功率:</span>
                            <span class="high-power-servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${product.ratedPower || '-'} KW</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">额定电压:</span>
                            <span class="high-power-servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${product.ratedVoltage || '-'}</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">机座号:</span>
                            <span class="high-power-servo-info-item-value">${product.frameSize || '-'}</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">是否带刹车:</span>
                            <span class="high-power-servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${product.hasBrake ? '是' : '否'}</span>
                        </div>
                    </div>
                    <div class="high-power-servo-info-group">
                        <h4 class="high-power-servo-info-group-title">额定性能</h4>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">额定转矩:</span>
                            <span class="high-power-servo-info-item-value">${product.ratedTorque || '-'} N·m</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">额定电流:</span>
                            <span class="high-power-servo-info-item-value">${product.ratedCurrent || '-'} A</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">额定转速:</span>
                            <span class="high-power-servo-info-item-value" style="color: var(--primary-color, #1e40af); font-weight: 600;">${product.ratedSpeed || '-'} rpm</span>
                        </div>
                    </div>
                    <div class="high-power-servo-info-group">
                        <h4 class="high-power-servo-info-group-title">极限性能</h4>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">最大转矩:</span>
                            <span class="high-power-servo-info-item-value">${product.maxTorque || '-'} N·m</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">最大电流:</span>
                            <span class="high-power-servo-info-item-value">${product.maxCurrent || '-'} A</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">最大转速:</span>
                            <span class="high-power-servo-info-item-value">${product.maxSpeed || '-'} rpm</span>
                        </div>
                    </div>
                    <div class="high-power-servo-info-group">
                        <h4 class="high-power-servo-info-group-title">技术参数</h4>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">编码器精度:</span>
                            <span class="high-power-servo-info-item-value">${product.encoderPrecision || '-'}</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">力矩系数:</span>
                            <span class="high-power-servo-info-item-value">${product.torqueCoefficient || '-'}</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">惯量、容量:</span>
                            <span class="high-power-servo-info-item-value">${product.inertiaCapacity || '-'}</span>
                        </div>
                        <div class="high-power-servo-info-item">
                            <span class="high-power-servo-info-item-label">转子转动惯量:</span>
                            <span class="high-power-servo-info-item-value">${product.rotorInertia || '-'} kg·c㎡</span>
                        </div>
                    </div>
                </div>
                <div class="high-power-servo-card-actions">
                    <a href="https://www.inovance.com/portal/allResult?key=${product.model || ''}" 
                       class="download-btn" 
                       target="_blank" 
                       rel="noopener noreferrer">资料和图纸下载</a>
                    <button class="compare-btn"
                        data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'
                        data-type="大功率伺服系统">对比</button>
                    <button class="add-to-bom-btn" data-id="${product.id || product.model || ''}" data-model="${product.model || ''}" data-series="${product.series || ''}" data-subseries="${product.subSeries || ''}">+ 添加到BOM</button>
                </div>
            `;
            
            // 添加卡片到容器
            container.appendChild(card);
        } catch (error) {
            console.error('创建大功率伺服结果卡片失败:', error);
        }
    });
    
    // 添加容器到结果容器
    resultsContainer.appendChild(container);
}
