// 页面路由管理器 - 优化页面跳转逻辑
// 使用构造函数模式替代class，兼容旧浏览器
function PageRouter() {
  // 初始化属性
  this.currentPage = 'main';
  this.pages = {
    main: document.getElementById('mainPanel'),
    hmiResult: document.getElementById('hmiResultPage'),
    plcResult: document.getElementById('plcResultPage'),
    servoResult: document.getElementById('servoResultPage'),
    highPowerServoResult: document.getElementById('highPowerServoResultPage'),
    inverterResult: document.getElementById('inverterResultPage'),
    ioResult: document.getElementById('ioResultPage'),
    robotResult: document.getElementById('robotResultPage'),
    bom: document.getElementById('bomPage'),
    compare: document.getElementById('comparePage')
  };
  
  this.modals = {
    hmi: document.getElementById('hmiFilterModal'),
    plc: document.getElementById('plcFilterModal'),
    servo: document.getElementById('servoFilterModal'),
    highpowerservo: document.getElementById('highPowerServoFilterModal'),
    inverter: document.getElementById('inverterFilterModal'),
    io: document.getElementById('ioFilterModal'),
    outdoorio: document.getElementById('outdoorIoFilterModal'),
    robot: document.getElementById('robotFilterModal')
  };
  
  // 初始化方法
  this.init();
}
  
// 原型方法定义
PageRouter.prototype.init = function() {
  // 确保所有页面元素存在
  this.validatePages();
  
  this.hideAllPages();
  this.showPage('main');
  
  // 立即绑定基础事件
  this.bindCoreEvents();
  
  // 监听DOMContentLoaded事件，确保所有模块都已加载完成
  if (document.readyState === 'loading') {
    var self = this;
    this.domReadyListener = function() {
      self.bindEvents();
      console.log('页面路由管理器初始化完成');
    };
    document.addEventListener('DOMContentLoaded', this.domReadyListener);
  } else {
    // 页面已经加载完成，直接绑定事件
    this.bindEvents();
    console.log('页面路由管理器初始化完成');
  }
  
  // 添加页面卸载事件监听器，清理资源
  var self = this;
  this.beforeUnloadListener = function() {
    self.cleanupResources();
  };
  window.addEventListener('beforeunload', this.beforeUnloadListener);
};

// 验证页面元素是否存在
PageRouter.prototype.validatePages = function() {
  // 检查所有页面元素是否存在，不存在则记录警告
  Object.keys(this.pages).forEach(function(pageName) {
    if (!this.pages[pageName]) {
      console.warn('页面元素未找到:', pageName);
    }
  }, this);
  
  // 检查所有模态框元素是否存在，不存在则记录警告
  Object.keys(this.modals).forEach(function(modalType) {
    if (!this.modals[modalType]) {
      console.warn('模态框元素未找到:', modalType);
    }
  }, this);
};
  
// 清理资源 - 简化版本
PageRouter.prototype.cleanupResources = function() {
  console.log('Cleaning up router resources...');
  
  // 移除事件监听器
  if (this.domReadyListener) {
    document.removeEventListener('DOMContentLoaded', this.domReadyListener);
    this.domReadyListener = null;
  }
  
  // 移除核心事件监听器
  if (this.coreKeydownListener) {
    document.removeEventListener('keydown', this.coreKeydownListener);
    this.coreKeydownListener = null;
  }
  
  // 移除页面卸载事件监听器
  if (this.beforeUnloadListener) {
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
    this.beforeUnloadListener = null;
  }
  
  console.log('Router resources cleaned up successfully');
};
  
// 绑定核心事件（不需要等待其他模块加载的事件）
PageRouter.prototype.bindCoreEvents = function() {
  // ESC键关闭模态框事件 - 全局事件，不需要等待其他模块
  var self = this;
  this.coreKeydownListener = function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      Object.keys(self.modals).forEach(function(type) {
        var modal = self.modals[type];
        if (modal && modal.classList.contains('show')) {
          self.closeFilterModal(type);
        }
      });
    }
  };
  
  document.addEventListener('keydown', this.coreKeydownListener);
};
  
// 绑定所有事件 - 简化版本
PageRouter.prototype.bindEvents = function() {
  var self = this;
  
  // 产品卡片点击事件
  var productCards = document.querySelectorAll('.product-card');
  productCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      var productType = this.getAttribute('data-type');
      self.openFilterModal(productType);
    });
  });
  
  // 侧边栏产品链接点击事件
  var productLinks = document.querySelectorAll('.product-link');
  productLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      var productType = this.getAttribute('data-type');
      self.openFilterModal(productType);
    });
  });
  
  // 模态框关闭事件
  Object.keys(this.modals).forEach(function(type) {
    var modal = self.modals[type];
    if (!modal) return;
    
    var closeBtn = modal.querySelector('.close-' + type.toLowerCase());
    if (closeBtn) {
      // 点击关闭按钮
      closeBtn.addEventListener('click', function() {
        self.closeFilterModal(type);
      });
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        self.closeFilterModal(type);
      }
    });
  });
  
  // 返回主页按钮事件
  var backButtons = document.querySelectorAll('.back-to-main');
  backButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      self.showPage('main');
    });
  });

  // BOM导航事件
  var bomNav = document.getElementById('bomNav');
  if (bomNav) {
    bomNav.addEventListener('click', function(e) {
      e.preventDefault();
      self.showPage('bom');
    });
  }
  
  // 对比页面导航事件
  var compareNav = document.getElementById('compareNav');
  if (compareNav) {
    compareNav.addEventListener('click', function(e) {
      e.preventDefault();
      self.showPage('compare');
    });
  }
  
  // 筛选确认事件（需要在各产品模块中调用）
  this.bindFilterConfirmEvents();
};
  
// 绑定筛选确认事件
PageRouter.prototype.bindFilterConfirmEvents = function() {
  // 为每个产品类型创建确认按钮事件
  var self = this;
  Object.keys(this.modals).forEach(function(type) {
    var modal = self.modals[type];
    if (!modal) return;
    
    var confirmBtn = modal.querySelector('.confirm-filter, .confirm-filter-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        self.confirmFilter(type);
      });
    }
  });
};
  
// 隐藏所有页面
PageRouter.prototype.hideAllPages = function() {
  // 隐藏所有结果页面
  Object.values(this.pages).forEach(function(page) {
    if (page) page.style.display = 'none';
  });
  
  // 同时隐藏结果容器
  var resultsContainer = document.getElementById('resultsContainer');
  if (resultsContainer) {
    resultsContainer.classList.remove('show');
  }
  
  // 确保所有模态框都关闭
  Object.keys(this.modals).forEach(function(type) {
    var modal = this.modals[type];
    if (modal) {
      modal.classList.remove('show');
    }
  }, this);
  
  // 恢复body滚动
  document.body.style.overflow = 'auto';
};
  
// 显示指定页面
PageRouter.prototype.showPage = function(pageName, productType) {
  // 验证页面名称是否有效
  if (!this.pages[pageName] && pageName !== 'main') {
    console.error('无效的页面名称:', pageName);
    return;
  }
  
  this.hideAllPages();
  
  if (pageName === 'main') {
    // 显示主面板
    if (this.pages.main) {
      this.pages.main.style.display = 'block';
    }
    if (window.setTopBarBackVisible) window.setTopBarBackVisible(false);
    if (window.setTopBarTitle) window.setTopBarTitle('智能产品选型系统');
  } else {
    // 显示结果页面
    var resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
      resultsContainer.classList.add('show');
    }
    
    if (this.pages[pageName]) {
      this.pages[pageName].style.display = 'block';
    }
    if (window.setTopBarBackVisible) window.setTopBarBackVisible(true);
  }
  
  this.currentPage = pageName;
  
  // 更新侧边栏活动状态
  this.updateSidebarActive(pageName, productType);
  
  console.log('切换到页面: ' + pageName);
  
  // 触发自定义事件 - 兼容旧浏览器
  try {
    var event;
    if (typeof CustomEvent === 'function') {
      event = new CustomEvent('pageChange', { detail: { page: pageName, productType: productType } });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('pageChange', true, true, { page: pageName, productType: productType });
    }
    document.dispatchEvent(event);
  } catch (e) {
    console.error('触发页面切换事件失败:', e.message);
  }
};
  
// 更新侧边栏活动状态
PageRouter.prototype.updateSidebarActive = function(pageName, productType) {
  try {
    // 清除所有活动状态
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('active');
    }
    
    // 设置对应的活动状态
    if (pageName === 'main') {
      var mainNavItem = document.querySelector('.nav-item[data-page="main"]') || document.querySelector('.nav-item');
      if (mainNavItem) mainNavItem.classList.add('active');
    } else if (pageName === 'bom') {
      var bomNav = document.getElementById('bomNav');
      if (bomNav) bomNav.classList.add('active');
    } else if (pageName === 'compare') {
      var compareNav = document.getElementById('compareNav');
      if (compareNav) compareNav.classList.add('active');
    } else {
      // 处理结果页面，根据页面名称和产品类型设置对应的产品导航按钮为活动状态
      var resultPageMap = {
        'hmiResult': 'HMI',
        'plcResult': 'PLC',
        'servoResult': 'Servo',
        'highPowerServoResult': 'HighPowerServo',
        'inverterResult': 'Inverter',
        'ioResult': 'IO',
        'robotResult': 'Robot'
      };
      
      // 优先使用传入的productType，如果没有则使用默认映射
      var targetProductType = productType && productType.toLowerCase() === 'outdoorio' ? 'OutdoorIO' : resultPageMap[pageName];
      if (targetProductType) {
        // 查找对应的产品导航按钮
        var productNavItem = document.querySelector('.product-link[data-type="' + targetProductType + '"]');
        if (productNavItem) {
          productNavItem.classList.add('active');
        }
      }
    }
  } catch (e) {
    console.error('更新侧边栏活动状态失败:', e.message);
  }
};
  
// 打开筛选模态框
PageRouter.prototype.openFilterModal = function(productType) {
  var modalKey = productType.toLowerCase();
  var modal = this.modals[modalKey];
  if (!modal) {
    console.error('未找到对应的模态框:', productType);
    return;
  }
  
  // 先确保弹窗内容已构建
  var type = productType.toLowerCase();
  var contentInitialized = false;
  
  try {
    // 使用映射表替代if-else语句
    const modalInitializers = {
      'plc': ['showPLCFilterModal', 'initPLCFilterModal'],
      'inverter': ['showInverterFilterModal', 'initInverterFilterModal'],
      'servo': ['showServoFilterModal', 'initServoFilterModal'],
      'hmi': ['showHMIFilterModal', 'initHMIFilterModal'],
      'io': ['showIOFilterModal', 'initIOFilterModal'],
      'outdoorio': ['showOutdoorIOFilterModal'],
      'robot': ['showRobotFilterModal', 'initRobotFilterModal'],
      'highpowerservo': ['showHighPowerServoFilterModal']
    };
    
    const initializers = modalInitializers[type];
    if (initializers) {
      for (const funcName of initializers) {
        if (typeof window[funcName] === 'function') {
          window[funcName]();
          contentInitialized = true;
          break;
        }
      }
    }
  } catch (err) {
    console.warn('构建筛选内容失败:', err.message);
  }

  // 如果内容未初始化，尝试延迟显示弹窗
  if (!contentInitialized) {
    var self = this;
    console.log('筛选内容未初始化，尝试延迟显示弹窗:', productType);
    // 延迟100ms后再次尝试初始化并显示弹窗
    setTimeout(function() {
      self.openFilterModal(productType);
    }, 100);
    return;
  }

  // 显示弹窗
  modal.classList.add('show');
  // 保存当前body的overflow状态，以便关闭模态框时恢复
  this._originalBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  
  console.log('打开' + productType + '筛选模态框');
  
  // 触发弹窗打开事件，供其他模块监听
  try {
    var event;
    if (typeof CustomEvent === 'function') {
      event = new CustomEvent('modalOpen', { 
        detail: { 
          productType: productType, 
          modalType: 'filter'
        } 
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('modalOpen', true, true, {
        productType: productType,
        modalType: 'filter'
      });
    }
    document.dispatchEvent(event);
  } catch (e) {
    console.error('触发模态框打开事件失败:', e.message);
  }
};
  
// 关闭筛选模态框
PageRouter.prototype.closeFilterModal = function(productType) {
  var modal = this.modals[productType.toLowerCase()];
  if (!modal) {
    console.error('未找到对应的模态框:', productType);
    return;
  }
  
  modal.classList.remove('show');
  // 恢复原始的body overflow状态
  document.body.style.overflow = this._originalBodyOverflow || 'auto';
  console.log('关闭' + productType + '筛选模态框');
};
  
// 确认筛选
PageRouter.prototype.confirmFilter = function(productType) {
  console.log('确认筛选: ' + productType);
  
  // 获取筛选条件（各产品模块需要实现getFilterSelections函数）
  var filterData = {};
  
  // 根据不同产品类型获取筛选数据
  try {
    // 使用映射表替代switch语句
    const filterSelectionMap = {
      'hmi': 'getHmiFilterSelections',
      'plc': 'getPlcFilterSelections',
      'servo': 'getServoFilterSelections',
      'inverter': 'getInverterFilterSelections',
      'io': 'getIoFilterSelections',
      'robot': 'getRobotFilterSelections',
      'highpowerservo': 'getHighPowerServoFilterSelections'
    };
    
    const funcName = filterSelectionMap[productType.toLowerCase()];
    if (funcName && typeof window[funcName] === 'function') {
      filterData = window[funcName]();
    }
  } catch (e) {
    console.error('获取筛选条件失败:', e.message);
    filterData = {};
  }
  
  console.log(productType + '筛选条件:', filterData);
  
  // 先关闭模态框
  this.closeFilterModal(productType);
  
  // 延迟显示结果页面，确保模态框已关闭
  var self = this;
  setTimeout(function() {
    // 显示结果页面
    self.showResultPage(productType, filterData);
  }, 100);
};
  
// 显示结果页面
  PageRouter.prototype.showResultPage = function(productType, filterData) {
    var resultPageMap = {
      'hmi': 'hmiResult',
      'plc': 'plcResult',
      'servo': 'servoResult',
      'highpowerservo': 'highPowerServoResult',
      'inverter': 'inverterResult',
      'io': 'ioResult',
      'outdoorio': 'ioResult',
      'robot': 'robotResult'
    };
    
    var pageName = resultPageMap[productType.toLowerCase()];
  if (pageName) {
    // 传递productType参数，确保导航栏直接选中正确的产品类型
    this.showPage(pageName, productType);
    
    // 触发筛选事件，让各产品模块处理数据显示
    try {
      var event;
      if (typeof CustomEvent === 'function') {
        event = new CustomEvent('showFilterResults', {
          detail: {
            productType: productType,
            filterData: filterData
          }
        });
      } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent('showFilterResults', true, true, {
          productType: productType,
          filterData: filterData
        });
      }
      document.dispatchEvent(event);
    } catch (e) {
      console.error('触发筛选结果事件失败:', e.message);
    }
  }
};
  
// 返回主页
PageRouter.prototype.backToMain = function() {
  this.showPage('main');
};

// 获取当前页面
PageRouter.prototype.getCurrentPage = function() {
  return this.currentPage;
};

// 检查是否有打开的模态框
PageRouter.prototype.hasOpenModal = function() {
  var modals = Object.values(this.modals);
  for (var i = 0; i < modals.length; i++) {
    if (modals[i] && modals[i].classList.contains('show')) {
      return true;
    }
  }
  return false;
};

// 确保DOM完全加载后再初始化路由管理器
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.pageRouter = new PageRouter();
  });
} else {
  // 页面已经加载完成，直接初始化
  window.pageRouter = new PageRouter();
}

// 全局页面跳转函数
function navigateToPage(pageName) {
  if (window.pageRouter) {
    window.pageRouter.showPage(pageName);
  }
}

// 全局模态框控制函数
function openModal(productType) {
  if (window.pageRouter) {
    window.pageRouter.openFilterModal(productType);
  }
}

function closeModal(productType) {
  if (window.pageRouter) {
    window.pageRouter.closeFilterModal(productType);
  }
}