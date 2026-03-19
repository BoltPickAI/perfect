// 对比功能模块
class ProductCompare {
    constructor() {
        this.compareData = []; // 存储对比数据
        this.currentProductType = ''; // 当前对比的产品类型
    }

    // 初始化对比页面
    initComparePage() {
        const compareContent = document.getElementById('compareContent');
        compareContent.innerHTML = `
            <div id="compareTableContainer" class="compare-table-container">
                <p class="no-data">暂无对比数据，请从筛选结果页面添加产品进行对比</p>
            </div>
        `;
        
        // 使用当前对比数据更新页面
        this.updateComparePage();
    }

    // 添加产品到对比
    addToCompare(productData, productType) {
        // 检查产品类型是否一致
        if (this.currentProductType && this.currentProductType !== productType) {
            // 类型不一致，清空现有数据
            this.compareData = [];
        }
        
        // 更新当前产品类型
        this.currentProductType = productType;
        
        // 检查产品是否已存在
        const existingIndex = this.compareData.findIndex(item => item.model === productData.model);
        if (existingIndex === -1) {
            // 添加新产品
            this.compareData.push(productData);
        }
        
        // 更新对比页面
        this.updateComparePage();
    }

    // 更新对比页面
    updateComparePage() {
        // 检查元素是否存在
        const compareTableContainer = document.getElementById('compareTableContainer');
        if (!compareTableContainer) {
            // 如果元素不存在，说明用户还没有进入对比页面，不需要更新
            console.log('对比表格容器不存在，跳过更新');
            return;
        }
        
        if (this.compareData.length === 0) {
            compareTableContainer.innerHTML = `<p class="no-data">暂无对比数据，请从筛选结果页面添加产品进行对比</p>`;
            return;
        }
        
        // 添加CSS样式
        const styleHTML = `
            <style>
                .compare-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 14px;
                    text-align: left;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    overflow-x: auto;
                    display: block;
                    transition: all 0.3s ease;
                }
                
                .compare-table th,
                .compare-table td {
                    padding: 12px 15px;
                    border: 1px solid var(--border-color);
                    min-width: 120px;
                    transition: all 0.3s ease;
                }
                
                .compare-table thead {
                    background-color: var(--card-bg);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                .compare-table th {
                    font-weight: 600;
                    color: var(--text-color);
                    background-color: var(--card-bg);
                    border-bottom: 2px solid var(--border-color);
                    white-space: nowrap;
                }
                
                .compare-table tr:nth-child(even) {
                    background-color: var(--card-bg);
                }
                
                .compare-table tr:hover {
                    background-color: var(--hover-bg);
                }
                
                .compare-table .param-name {
                    font-weight: 600;
                    background-color: var(--secondary-bg);
                    white-space: nowrap;
                    min-width: 150px;
                    color: var(--text-color);
                }
                
                .compare-table-container {
                    overflow-x: auto;
                    margin: 20px 0;
                }
                
                .compare-table td {
                    color: var(--text-color);
                }
                
                .no-data {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-color);
                    font-size: 16px;
                }
                
                /* 深色主题适配 */
                body.dark-mode .compare-table {
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
                }
                
                body.dark-mode .compare-table th,
                body.dark-mode .compare-table td {
                    border-color: var(--border-color);
                }
                
                body.dark-mode .compare-table thead {
                    background-color: var(--card-bg);
                }
                
                body.dark-mode .compare-table th {
                    background-color: var(--card-bg);
                    color: var(--text-color);
                }
                
                body.dark-mode .compare-table tr:nth-child(even) {
                    background-color: var(--card-bg);
                }
                
                body.dark-mode .compare-table tr:hover {
                    background-color: var(--hover-bg);
                }
                
                body.dark-mode .compare-table .param-name {
                    background-color: var(--secondary-bg);
                    color: var(--text-color);
                }
                
                body.dark-mode .no-data {
                    color: var(--text-color);
                }
            </style>
        `;
        
        // 生成对比表格
        let tableHTML = `
            ${styleHTML}
            <div class="compare-table-wrapper">
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th>参数</th>
        `;
        
        // 添加产品型号列
        this.compareData.forEach(product => {
            tableHTML += `<th>${product.model}</th>`;
        });
        
        tableHTML += `</tr></thead><tbody>`;
        
        // 获取所有产品的公共属性
        const allProperties = this.getAllProperties();
        
        // 生成对比行
        allProperties.forEach(prop => {
            tableHTML += `<tr>
                <td class="param-name">${this.getParamChineseName(prop)}</td>`;
            
            this.compareData.forEach(product => {
                const value = product[prop] || '-';
                tableHTML += `<td>${value}</td>`;
            });
            
            tableHTML += `</tr>`;
        });
        
        tableHTML += `</tbody></table>
            </div>`;
        
        compareTableContainer.innerHTML = tableHTML;
    }

    // 参数名映射表，将英文键名映射到中文名称
    getParamNameMap() {
        return {
            // 通用参数
            'model': '型号',
            'name': '名称',
            'price': '价格',
            'description': '描述',
            
            // HMI参数
            'screenSize': '屏幕尺寸',
            'resolution': '分辨率',
            'interface': '通讯接口',
            'protection': '防护等级',
            
            // PLC参数
            'inputPoints': '输入点数',
            'outputPoints': '输出点数',
            'cpuModel': 'CPU型号',
            'memory': '内存容量',
            'localExpansionModules': '本地扩展模块数',
            'programStorage': '程序存储空间',
            'dataStorage': '数据存储空间',
            'powerFailureDataSize': '掉电数据保存大小',
            'motionControlAxes': '运动控制轴数',
            'highSpeedIO': '高速I/O功能',
            'softElementFeatures': '软元件特性',
            'mainOutputType': '本体输出类型',
            'ethercat': 'EtherCAT',
            'canOpenCanlink': 'CANopen/CANlink',
            'modbusTCP': 'ModbusTCP',
            'modbusSerial': 'Modbus（串口）',
            'etherNetIP': 'EtherNet/IP',
            
            // 伺服系统参数
            'ratedPower': '额定功率',
            'ratedVoltage': '额定电压',
            'ratedTorque': '额定转矩',
            'ratedSpeed': '额定转速',
            'maxTorque': '最大转矩',
            'maxSpeed': '最大转速',
            'encoderPrecision': '编码器精度',
            'rotorInertia': '转子转动惯量',
            'frameSize': '机座号',
            'hasBrake': '是否带刹车',
            'torqueCoefficient': '力矩系数',
            'inertiaCapacity': '惯量、容量',
            
            // 变频器参数
            'powerRange': '功率范围',
            'voltage': '电压等级',
            'controlMode': '控制方式',
            'communication': '通讯功能'
        };
    }
    
    // 获取所有产品的公共属性
    getAllProperties() {
        const propertiesSet = new Set();
        
        // 收集所有产品的属性
        this.compareData.forEach(product => {
            Object.keys(product).forEach(key => {
                // 排除不需要显示的属性
                if (key !== 'id' && key !== 'type' && key !== 'image') {
                    propertiesSet.add(key);
                }
            });
        });
        
        // 转换为数组并排序
        return Array.from(propertiesSet).sort();
    }
    
    // 获取参数的中文名称
    getParamChineseName(param) {
        const paramMap = this.getParamNameMap();
        return paramMap[param] || param;
    }

    // 清空对比数据
    clearCompare() {
        this.compareData = [];
        this.currentProductType = '';
        this.updateComparePage();
    }

    // 获取对比数据
    getCompareData() {
        return this.compareData;
    }

    // 获取当前产品类型
    getCurrentProductType() {
        return this.currentProductType;
    }
}

// 初始化对比功能
const productCompare = new ProductCompare();

// 绑定对比按钮点击事件
document.addEventListener('click', (e) => {
    console.log('全局点击事件触发');
    console.log('点击目标:', e.target);
    console.log('目标类名:', e.target.className);
    
    // 使用事件委托，检查目标元素或其父元素是否为对比按钮
    let compareBtn = null;
    if (e.target.classList.contains('compare-btn')) {
        compareBtn = e.target;
    } else {
        compareBtn = e.target.closest('.compare-btn');
    }
    
    if (compareBtn) {
        console.log('找到对比按钮:', compareBtn);
        try {
            const productDataStr = compareBtn.dataset.product;
            console.log('产品数据字符串:', productDataStr);
            
            // 替换HTML实体
            const cleanedStr = productDataStr.replace(/&apos;/g, "'");
            console.log('清理后的字符串:', cleanedStr);
            
            const productData = JSON.parse(cleanedStr);
            console.log('解析后的产品数据:', productData);
            
            const productType = compareBtn.dataset.type;
            console.log('产品类型:', productType);
            
            productCompare.addToCompare(productData, productType);
            
            // 显示成功提示
            if (window.BOM && typeof window.BOM.showSuccessMessage === 'function') {
                window.BOM.showSuccessMessage('产品已添加到对比');
            } else {
                console.log('产品已成功添加到对比');
            }
        } catch (error) {

            alert('添加到对比失败: ' + error.message);
        }
    }
});

// 页面切换事件监听
document.addEventListener('pageChange', (e) => {
    if (e.detail.page === 'compare') {
        productCompare.initComparePage();
        
        // 更新顶部栏标题
        if (typeof window.setTopBarTitle === 'function') {
            window.setTopBarTitle('产品对比页面');
        }
        
        // 将清空对比按钮添加到顶部栏
        const topBarActions = document.querySelector('.top-bar-actions');
        if (topBarActions) {
            // 移除已存在的清空对比按钮
            const existingBtn = document.getElementById('topbarClearCompareBtn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            // 创建新的清空对比按钮
            const clearCompareBtn = document.createElement('button');
            clearCompareBtn.id = 'topbarClearCompareBtn';
            clearCompareBtn.className = 'clear-compare-btn';
            clearCompareBtn.textContent = '清空对比';
            clearCompareBtn.style.marginRight = '8px';
            
            // 绑定点击事件
            clearCompareBtn.addEventListener('click', () => {
                productCompare.clearCompare();
            });
            
            // 将按钮添加到顶部栏，放在返回按钮和主题按钮之间
            const backBtn = document.getElementById('topbarBackBtn');
            if (backBtn) {
                topBarActions.insertBefore(clearCompareBtn, backBtn.nextSibling);
            } else {
                topBarActions.insertBefore(clearCompareBtn, topBarActions.firstChild);
            }
        }
    } else {
        // 移除清空对比按钮
        const existingBtn = document.getElementById('topbarClearCompareBtn');
        if (existingBtn) {
            existingBtn.remove();
        }
    }
});

// 导出对比功能实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = productCompare;
}