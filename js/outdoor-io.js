// 全局柜外IO数据和类型定义
window.outdoorIoData = window.outdoorIoData || {};
window.outdoorIoType = window.outdoorIoType || {};

// 柜外IO筛选相关变量
let outdoorIoSelectedFilters = {};

// 预定义柜外IO系列子类别选项
const outdoorIoSeriesSubCategoryOptions = {
  'GS20系列': ['主站', '数字量从站', '级联数字量从站', '模拟量', '配件线缆']
};

// 线缆配件数据
const outdoorIoCableAccessoriesData = [
  {
    type: 'PLC网口连接到主站的通信线缆',
    model: 'CAB-RJ45-M12DMS4',
    description: '线缆组件-EtherCAT线缆-公直头- 26AWG-黑色-RJ45-80℃ (PLC网口连接到主站的通信线缆)'
  },
  {
    type: '多个主站级联的通信线缆',
    model: 'CAB-M12DMS4-M12DMS4',
    description: '线缆组件-EtherCAT线缆-公直头- 22AWG-绿色-公直头-80℃ (用于多个 IO-Link主站级联的线缆 (通信级联))'
  },
  {
    type: '为主站供电的线缆',
    model: 'CAB-7/8FL5',
    description: '线缆组件-7/8电源线缆-母弯头-16AWG-黑色-NA-80℃ (用于为主站供电的线缆)'
  },
  {
    type: '多个主站的电源级联的线缆',
    model: 'CAB-7/8FL5-7/8ML5',
    description: '线缆组件-7/8电源线缆-公弯头-16AWG-黑色-母弯头-80℃ (用于多个主站电源级联的线缆)'
  },
  {
    type: '主站连接从站的线缆通讯',
    model: 'CAB-M12AMS4-M12AFL4',
    description: '线缆组件-IO-Link线缆-公直头-22AWG-黑色-母弯头-85℃-高柔线缆, 可300~ 500万次 (IO-Link主站连接IO-Link从站的线缆 (高柔线缆-T-taiyo, 可进拖链))'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AFS4',
    description: '4芯母直头插头, 可自行接线'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AFL4',
    description: '4芯母弯头插头, 可自行接线'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AMS5',
    description: '5芯公直头插头, 可自行接线'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AML5',
    description: '5芯公弯头插头, 可自行接线'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AMS5-YF5',
    description: '5芯一公转5芯两母Y型接头, 用于M12接头转两路M12 DIO'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AFL4-L',
    description: '4芯母弯头插头, 可自行接线 (适用于GR20-16EMNL/GR20-16EMPL自行接线)'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AMS4-YM8F3',
    description: 'Y型分支器, 一分二接头, M12 (5芯) 公直头 CODE-A转M8 (3芯) 母头'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AMS4-YM8F4',
    description: 'Y型分支器, 一分二接头, M12 (5芯) 公直头 CODE-A转M8 (4芯) 母头'
  },
  {
    type: '接插头组件',
    model: 'CON-M8AMS3',
    description: 'M8接头, 三芯, 组装式接头'
  },
  {
    type: '接插头组件',
    model: 'CON-M8AMS4',
    description: 'M8接头, 四芯, 组装式接头'
  },
  {
    type: '接插头组件',
    model: 'CON-M12AFS5-YM5',
    description: '5芯一母转5芯两公直头, 用于CLASS A主站连接从站CLASS B阀岛'
  },
  {
    type: 'IO-LINK阀岛线缆配件',
    model: 'IPT210-A-CAB-M12AMS5-M12AFS5',
    description: '5芯公直头转5芯母直头, 用于IO-LINK主站连接阀岛的线缆'
  },
  {
    type: 'IO-LINK阀岛线缆配件',
    model: 'IPT210-A-CAB-M12AFS5',
    description: '5芯母直头转散线, 用于阀岛供电'
  }
];

// 显示柜外IO筛选弹窗
function showOutdoorIOFilterModal() {
  const modal = document.getElementById('outdoorIoFilterModal');
  const filterOptions = document.getElementById('outdoorIoFilterOptions');
  
  // 清空之前的筛选选项
  filterOptions.innerHTML = '';
  
  // 使用固定对象获取所有系列
  const seriesList = Object.keys(outdoorIoSeriesSubCategoryOptions);
  
  // 设置弹窗标题
  modal.querySelector('h2').textContent = '柜外IO模块筛选';
  
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
      outdoorIoSelectedFilters.series = [this.value];
      
      // 当选择系列时，动态加载该系列的子类别
      loadOutdoorIOSubCategories(this.value, true);
    });
  });
  
  // 添加按钮容器
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'modal-actions';
  actionsDiv.innerHTML = `
      <button id="outdoorIoCancelFilter" class="cancel-filter-btn">取消</button>
      <button id="outdoorIoConfirmFilter" class="confirm-filter-btn">应用筛选</button>
  `;
  filterOptions.appendChild(actionsDiv);
  
  // 绑定确认筛选按钮事件：直接应用筛选并显示结果
  document.getElementById('outdoorIoConfirmFilter').addEventListener('click', function() {
      applyOutdoorIOFilters();
  });
  
  // 绑定取消按钮事件
  document.getElementById('outdoorIoCancelFilter').addEventListener('click', function() {
      modal.classList.remove('show');
  });
  
  // 重置筛选条件
  outdoorIoSelectedFilters = {};
  
  // 默认选中GS20系列
  const gs20Radio = seriesCategory.querySelector('input[type="radio"][value="GS20系列"]');
  if (gs20Radio) {
      gs20Radio.checked = true;
      gs20Radio.parentElement.classList.add('checked');
      outdoorIoSelectedFilters.series = ['GS20系列'];
      loadOutdoorIOSubCategories('GS20系列', true);
  }
  
  // 显示弹窗
  modal.classList.add('show');
  
  // 点击弹窗外部关闭弹窗
  window.addEventListener('click', function outdoorIoModalClickHandler(event) {
      if (event.target === modal) {
          modal.classList.remove('show');
          window.removeEventListener('click', outdoorIoModalClickHandler);
      }
  });
}

// 加载柜外IO子类别
function loadOutdoorIOSubCategories(series, isChecked) {
  const subCategoryOptions = document.getElementById('outdoorIoFilterOptions');
  if (!subCategoryOptions) return;
  
  if (!outdoorIoSelectedFilters.series || outdoorIoSelectedFilters.series.length === 0) {
      subCategoryOptions.innerHTML = '<p>请先选择系列</p>';
      return;
  }
  
  const currentSeries = outdoorIoSelectedFilters.series[0];
  
  // 使用固定对象获取子类别选项
  const subCategories = outdoorIoSeriesSubCategoryOptions[currentSeries] || [];
  
  // 显示子类别选项和按钮容器
  subCategoryOptions.innerHTML = `
      <h3>选择子类别</h3>
      <div class="sub-category-group filter-options">
          ${subCategories.map(subCategory => `
              <label class="checkbox-option">
                  <input type="checkbox" name="subCategory" value="${subCategory}">
                  <span class="sub-category-name">${subCategory}</span>
              </label>
          `).join('')}
      </div>
      <div class="modal-actions">
          <button id="outdoorIoCancelFilter" class="cancel-filter-btn">取消</button>
          <button id="outdoorIoConfirmFilter" class="confirm-filter-btn">应用筛选</button>
      </div>
  `;
  
  // 为子类别选项绑定事件
  subCategoryOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          // 如果是配件线缆，打开线缆配件弹窗
          if (this.value === '配件线缆') {
              // 关闭柜外IO模块筛选弹窗
              const outdoorIoModal = document.getElementById('outdoorIoFilterModal');
              if (outdoorIoModal) {
                  outdoorIoModal.classList.remove('show');
              }
              showOutdoorIoCableAccessoriesModal();
              // 阻止默认的复选框行为
              this.checked = false;
              return;
          }
          
          if (!outdoorIoSelectedFilters.subCategory) {
              outdoorIoSelectedFilters.subCategory = [];
          }
          if (this.checked) {
              outdoorIoSelectedFilters.subCategory.push(this.value);
          } else {
              outdoorIoSelectedFilters.subCategory = outdoorIoSelectedFilters.subCategory.filter(item => item !== this.value);
          }
      });
  });
  
  // 绑定确认筛选按钮事件：直接应用筛选并显示结果
  document.getElementById('outdoorIoConfirmFilter').addEventListener('click', function() {
      applyOutdoorIOFilters();
  });
  
  // 绑定取消按钮事件
  document.getElementById('outdoorIoCancelFilter').addEventListener('click', function() {
      const modal = document.getElementById('outdoorIoFilterModal');
      modal.classList.remove('show');
  });
}

// 处理页面切换和导航状态
function handleOutdoorIOPageNavigation() {
  // 手动处理页面切换和导航状态，避免闪烁
  if (window.pageRouter) {
    // 隐藏所有页面
    window.pageRouter.hideAllPages();
    
    // 显示ioResult页面
    const ioResultPage = document.getElementById('ioResultPage');
    if (ioResultPage) {
      ioResultPage.style.display = 'block';
    }
    
    // 显示结果容器
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
      resultsContainer.classList.add('show');
    }
    
    // 设置顶部栏返回按钮可见
    if (typeof window.setTopBarBackVisible === 'function') {
      window.setTopBarBackVisible(true);
    }
    
    // 更新当前页面
    window.pageRouter.currentPage = 'ioResult';
    
    // 手动更新侧边栏活动状态（直接设置柜外IO为活动状态）
    try {
      // 清除所有产品导航按钮的活动状态
      const productLinks = document.querySelectorAll('.product-link');
      productLinks.forEach(link => {
        link.classList.remove('active');
      });
      
      // 设置柜外IO导航按钮为活动状态
      const outdoorIoLink = document.querySelector('.product-link[data-type="OutdoorIO"]');
      if (outdoorIoLink) {
        outdoorIoLink.classList.add('active');
      }
    } catch (e) {
      console.error('更新侧边栏活动状态失败:', e.message);
    }
    
    console.log('切换到页面: ioResult (柜外IO)');
    
    // 触发自定义事件 - 兼容旧浏览器
    try {
      var event;
      if (typeof CustomEvent === 'function') {
        event = new CustomEvent('pageChange', { detail: { page: 'ioResult' } });
      } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent('pageChange', true, true, { page: 'ioResult' });
      }
      document.dispatchEvent(event);
    } catch (e) {
      console.error('触发页面切换事件失败:', e.message);
    }
  }
}

// 显示柜外IO筛选结果
function displayOutdoorIOFilterResults() {
  // 获取柜外IO数据
  const productData = window.outdoorIoData || {};
  const displayParams = (window.outdoorIoType && window.outdoorIoType.displayParams) || ['型号', '描述', '价格'];
  const productTypeName = (window.outdoorIoType && window.outdoorIoType.name) || '柜外IO模块';
  
  // 更新顶部栏标题
  if (typeof window.setTopBarTitle === 'function') {
    window.setTopBarTitle(`${productTypeName}筛选结果 (${Object.keys(productData).length ? filterOutdoorIOProductData(productData, outdoorIoSelectedFilters).length : 0})`);
  }
  
  // 筛选数据
  const filteredData = filterOutdoorIOProductData(productData, outdoorIoSelectedFilters);
  
  // 显示结果
  displayResults('ioResultContent', filteredData, displayParams, productTypeName);
}

// 应用柜外IO筛选条件并显示结果
function applyOutdoorIOFilters() {
  // 关闭弹窗
  document.getElementById('outdoorIoFilterModal').classList.remove('show');
  
  // 确保柜外IO数据已加载
  if (window.dataLoaders) {
    window.dataLoaders.load('outdoor-io').then(() => {
      // 处理页面导航
      handleOutdoorIOPageNavigation();
      // 显示筛选结果
      displayOutdoorIOFilterResults();
    });
  } else {
    // 兼容模式：如果没有数据加载器，直接显示结果
    // 处理页面导航
    handleOutdoorIOPageNavigation();
    // 显示筛选结果
    displayOutdoorIOFilterResults();
  }
}

// 筛选柜外IO产品数据
function filterOutdoorIOProductData(data, filters) {
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

// 显示提示信息
function showNotification(message, type = 'info') {
  // 创建通知容器
  const notificationContainer = document.createElement('div');
  notificationContainer.style.position = 'fixed';
  notificationContainer.style.top = '20px';
  notificationContainer.style.left = '50%';
  notificationContainer.style.transform = 'translateX(-50%) translateY(-20px)';
  notificationContainer.style.padding = '16px 24px';
  notificationContainer.style.borderRadius = '4px';
  notificationContainer.style.color = 'white';
  notificationContainer.style.fontSize = '14px';
  notificationContainer.style.fontWeight = '500';
  notificationContainer.style.zIndex = '9999';
  notificationContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notificationContainer.style.transition = 'all 0.3s ease';
  notificationContainer.style.opacity = '0';
  notificationContainer.style.textAlign = 'center';
  
  // 检查当前主题
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  
  // 根据类型和主题设置背景颜色
  switch (type) {
    case 'success':
      notificationContainer.style.backgroundColor = isDarkMode ? '#10b981' : '#10b981';
      break;
    case 'error':
      notificationContainer.style.backgroundColor = isDarkMode ? '#ef4444' : '#ef4444';
      break;
    case 'warning':
      notificationContainer.style.backgroundColor = isDarkMode ? '#f59e0b' : '#f59e0b';
      break;
    default:
      notificationContainer.style.backgroundColor = isDarkMode ? '#3b82f6' : '#3b82f6';
  }
  
  // 设置消息内容
  notificationContainer.textContent = message;
  
  // 添加到页面
  document.body.appendChild(notificationContainer);
  
  // 显示动画
  setTimeout(() => {
    notificationContainer.style.opacity = '1';
    notificationContainer.style.transform = 'translateX(-50%) translateY(0)';
  }, 100);
  
  // 3秒后隐藏
  setTimeout(() => {
    notificationContainer.style.opacity = '0';
    notificationContainer.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      notificationContainer.remove();
    }, 300);
  }, 3000);
}

// 显示线缆配件弹窗
function showOutdoorIoCableAccessoriesModal() {
  // 创建弹窗容器
  const modalContainer = document.createElement('div');
  modalContainer.id = 'outdoorIoCableAccessoriesModal';
  modalContainer.className = 'modal';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalContainer.style.display = 'flex';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.zIndex = '1000';

  // 创建弹窗内容
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.padding = '20px';
  modalContent.style.width = '95%';
  modalContent.style.maxWidth = '1400px';
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  modalContent.style.position = 'relative';

  // 创建关闭按钮
  const closeButton = document.createElement('span');
  closeButton.className = 'close-outdoorio';
  closeButton.innerHTML = '&times;';
  closeButton.style.color = '#aaa';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '15px';
  closeButton.style.fontSize = '28px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = function() {
    modalContainer.remove();
  };
  modalContent.appendChild(closeButton);

  // 创建弹窗标题
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = '线缆配件';
  modalTitle.style.margin = '0 0 20px 0'; // 取消顶部和左右边距，只保留底部边距
  modalContent.appendChild(modalTitle);

  // 创建线缆配件表格
  const tableContainer = document.createElement('div');
  tableContainer.style.marginTop = '20px';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // 创建表头
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f2f2f2';
  headerRow.style.padding = '10px 0'; // 为表头添加垂直间距

  const headers = ['类型', '型号', '描述', '长度', '数量', '操作'];
  headers.forEach((headerText, index) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.style.border = '1px solid #ddd';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
   
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 创建表格内容
  const tbody = document.createElement('tbody');
  outdoorIoCableAccessoriesData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.style.border = '1px solid #ddd';

    // 类型
    const typeCell = document.createElement('td');
    typeCell.textContent = item.type;
    typeCell.style.border = '1px solid #ddd';
    typeCell.style.padding = '8px';
    typeCell.style.width = '220px'; // 为类型单元格设置更宽的宽度
    row.appendChild(typeCell);

    // 型号
    const modelCell = document.createElement('td');
    modelCell.textContent = item.model;
    modelCell.style.border = '1px solid #ddd';
    modelCell.style.padding = '8px';
    modelCell.style.width = '280px'; // 为型号单元格设置宽度
    row.appendChild(modelCell);

    // 描述
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = item.description;
    descriptionCell.style.border = '1px solid #ddd';
    descriptionCell.style.padding = '8px';
    row.appendChild(descriptionCell);

    // 长度输入框（接插头组件不需要）
    const lengthCell = document.createElement('td');
    if (item.type !== '接插头组件') {
      const lengthInput = document.createElement('input');
      lengthInput.type = 'number';
      lengthInput.min = '1';
      lengthInput.step = '0.1';
      lengthInput.value = '';
      lengthInput.style.width = '80px';
      lengthInput.style.padding = '4px';
      lengthInput.style.border = '1px solid #ddd';
      lengthInput.style.borderRadius = '4px';
      lengthInput.id = `length-${index}`;
      lengthCell.appendChild(lengthInput);
    } else {
      // 接插头组件显示空内容
      lengthCell.textContent = '';
    }
    lengthCell.style.border = '1px solid #ddd';
    lengthCell.style.padding = '8px';
    row.appendChild(lengthCell);

    // 数量输入框
  const quantityCell = document.createElement('td');
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '0';
  quantityInput.value = '';
  quantityInput.style.width = '80px';
  quantityInput.style.padding = '4px';
  quantityInput.style.border = '1px solid #ddd';
  quantityInput.style.borderRadius = '4px';
  quantityInput.id = `quantity-${index}`;
  quantityCell.appendChild(quantityInput);
  quantityCell.style.border = '1px solid #ddd';
  quantityCell.style.padding = '8px';
  row.appendChild(quantityCell);

  // 操作列
  const actionCell = document.createElement('td');
  actionCell.style.border = '1px solid #ddd';
  actionCell.style.padding = '8px';
  actionCell.style.width = '100px';
  actionCell.style.textAlign = 'center';
  
  // 为需要输入长度的行添加添加到BOM表按钮
  if (item.type !== '接插头组件') {
    const addButton = document.createElement('button');
    addButton.className = 'add-to-bom-btn';
    addButton.textContent = '+BOM表';
    addButton.style.padding = '4px 8px';
    addButton.style.backgroundColor = '#2563eb';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.cursor = 'pointer';
    addButton.style.fontSize = '12px';
    addButton.onclick = function() {
      const quantity = parseInt(document.getElementById(`quantity-${index}`).value);
      const lengthInput = document.getElementById(`length-${index}`);
      const length = parseFloat(lengthInput.value);
      
      if (quantity > 0 && length > 0) {
        const formattedLength = length.toFixed(1);
        const modelToAdd = `${item.model}-${formattedLength}`;
        
        // 添加到BOM表
        if (typeof window.BOM === 'object' && typeof window.BOM.addItem === 'function') {
          window.BOM.addItem({
            id: modelToAdd,
            model: modelToAdd,
            category: 'IO线缆配件',
            description: item.description,
            quantity: quantity
          });
          showNotification(`已添加 ${quantity} 个 ${modelToAdd} 到BOM表`, 'success');
        } else {
          console.log('添加到BOM表:', {
            type: item.type,
            model: modelToAdd,
            description: item.description,
            quantity: quantity,
            length: length
          });
          showNotification(`已添加 ${quantity} 个 ${modelToAdd} 到BOM表`, 'success');
        }
      } else {
        showNotification('请输入有效的数量和长度', 'warning');
      }
    };
    actionCell.appendChild(addButton);
  }
  row.appendChild(actionCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  modalContent.appendChild(tableContainer);

  // 创建按钮容器
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'modal-actions';

  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.id = 'outdoorIoCableAccessoriesCancel';
  cancelButton.className = 'cancel-filter-btn';
  cancelButton.textContent = '取消';
  cancelButton.onclick = function() {
    modalContainer.remove();
  };
  actionsDiv.appendChild(cancelButton);

  // 创建添加到BOM表按钮（仅适用于接插头组件）
  const addToBomButton = document.createElement('button');
  addToBomButton.id = 'outdoorIoAddToBom';
  addToBomButton.className = 'confirm-filter-btn';
  addToBomButton.textContent = '添加接插头组件到BOM表';
  addToBomButton.onclick = function() {
    addOutdoorIoCableAccessoriesToBom();
    modalContainer.remove();
  };
  actionsDiv.appendChild(addToBomButton);

  modalContent.appendChild(actionsDiv);
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  // 显示弹窗
  modalContainer.classList.add('show');

  // 点击弹窗外部关闭弹窗
  window.addEventListener('click', function outdoorIoCableAccessoriesModalClickHandler(event) {
    if (event.target === modalContainer) {
      modalContainer.remove();
      window.removeEventListener('click', outdoorIoCableAccessoriesModalClickHandler);
    }
  });
}

// 添加线缆配件到BOM表（仅适用于接插头组件）
function addOutdoorIoCableAccessoriesToBom() {
  const itemsToAdd = [];

  // 收集用户输入的数量信息（仅处理接插头组件）
  outdoorIoCableAccessoriesData.forEach((item, index) => {
    // 只处理接插头组件
    if (item.type === '接插头组件') {
      const quantityInput = document.getElementById(`quantity-${index}`);
      
      if (quantityInput) {
        const quantity = parseInt(quantityInput.value);
        
        // 只添加数量大于0的接插头组件
        if (quantity > 0) {
          itemsToAdd.push({
            type: item.type,
            model: item.model,
            description: item.description,
            quantity: quantity
          });
        }
      }
    }
  });

  // 将接插头组件添加到BOM表
  if (itemsToAdd.length > 0) {
    // 检查是否存在BOM表功能
    if (typeof window.BOM === 'object' && typeof window.BOM.addItem === 'function') {
      // 使用现有的BOM表功能
      itemsToAdd.forEach(item => {
        window.BOM.addItem({
          id: item.model, // 使用型号作为ID
          model: item.model,
          category: 'IO线缆配件',
          description: item.description,
          quantity: item.quantity
        });
      });
      // 显示成功消息
      showNotification(`已添加 ${itemsToAdd.length} 个接插头组件到BOM表`, 'success');
    } else {
      // 如果没有现有的BOM表功能，创建一个简单的实现
      // 这里可以根据实际的BOM表功能进行调整
      console.log('添加到BOM表:', itemsToAdd);
      showNotification(`已添加 ${itemsToAdd.length} 个接插头组件到BOM表`, 'success');
    }
  } else {
    showNotification('请至少选择一个数量大于0的接插头组件', 'warning');
  }
}

// 暴露到全局
if (typeof window !== 'undefined') {
  window.showOutdoorIOFilterModal = showOutdoorIOFilterModal;
  window.applyOutdoorIOFilters = applyOutdoorIOFilters;
  window.filterOutdoorIOProductData = filterOutdoorIOProductData;
  window.showOutdoorIoCableAccessoriesModal = showOutdoorIoCableAccessoriesModal;
  window.addOutdoorIoCableAccessoriesToBom = addOutdoorIoCableAccessoriesToBom;
}

// 监听路由分发的结果展示事件
document.addEventListener('showFilterResults', function(e) {
  if (e.detail && (e.detail.productType === 'OutdoorIO' || e.detail.productType === 'outdoorio')) {
    const productData = window.outdoorIoData || {};
    const displayParams = (window.outdoorIoType && window.outdoorIoType.displayParams) || ['型号', '描述', '价格'];
    const productTypeName = (window.outdoorIoType && window.outdoorIoType.name) || '柜外IO模块';
    const filterData = e.detail.filterData || {};

    if (typeof window.setTopBarTitle === 'function') {
      window.setTopBarTitle(`${productTypeName}筛选结果 (${filterData && Object.keys(filterData).length ? filterOutdoorIOProductData(productData, filterData).length : filterOutdoorIOProductData(productData, {}).length})`);
    }
    const filteredData = filterOutdoorIOProductData(productData, filterData);
    displayResults('ioResultContent', filteredData, displayParams, productTypeName);
  }
});
