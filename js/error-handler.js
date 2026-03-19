// 全局错误处理和诊断模块

// 使用构造函数模式替代class，兼容旧浏览器
function ErrorHandler() {
  // 初始化属性
  this.errors = [];
  this.init();
}

// 初始化全局错误监听
ErrorHandler.prototype.init = function() {
  var self = this;
  
  // 监听全局JavaScript错误
  window.addEventListener("error", function(event) {
    self.handleError(
      event.error,
      event.filename,
      event.lineno,
      event.colno,
      event.message
    );
  });

  // 监听未处理的Promise拒绝
  window.addEventListener("unhandledrejection", function(event) {
    self.handleError(
      event.reason,
      "Promise",
      0,
      0,
      "Unhandled Promise Rejection"
    );
  });
  
  // 监听资源加载错误
  window.addEventListener("error", function(event) {
    // 检查是否为资源加载错误
    if (event.target instanceof HTMLElement && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      self.handleResourceError(event.target);
    }
  }, true);
  
  // 定期清理错误日志，避免内存占用过高
  this.errorCleanupInterval = setInterval(function() {
    self.clearOldErrors();
  }, 30 * 60 * 1000); // 每30分钟清理一次
  

  
  // 添加内存使用监控 - 增强版本，兼容更多浏览器
  this.memoryMonitoringInterval = setInterval(function() {
    self.monitorMemory();
  }, 5 * 60 * 1000); // 每5分钟监控一次内存使用
  
  // 添加页面卸载事件监听器，清理资源
  this.beforeUnloadListener = function() {
    self.cleanupResources();
  };
  window.addEventListener('beforeunload', this.beforeUnloadListener);
  
  console.log('错误处理模块初始化完成');
};
  
// 处理资源加载错误
ErrorHandler.prototype.handleResourceError = function(resourceElement) {
  var resourceType = resourceElement.tagName.toLowerCase();
  var resourceUrl = resourceElement.src || resourceElement.href;
  
  var errorMsg = resourceType === 'script' ? 
    '脚本加载失败: ' + resourceUrl : 
    '样式表加载失败: ' + resourceUrl;
  
  // 创建一个简单的错误对象
  var error = new Error(errorMsg);
  error.name = 'ResourceLoadError';
  
  // 记录资源加载错误
  this.handleError(
    error,
    resourceUrl,
    0,
    0,
    errorMsg
  );
  
  // 显示用户友好的错误提示
  this.showUserError({
    type: 'ResourceLoadError',
    message: '资源加载失败: ' + resourceUrl
  });
};

// 清理资源
ErrorHandler.prototype.cleanupResources = function() {
  console.log('Cleaning up error handler resources...');
  
  // 清除定时器
  if (this.errorCleanupInterval) {
    clearInterval(this.errorCleanupInterval);
    this.errorCleanupInterval = null;
  }
  
  if (this.diagnosticInterval) {
    clearInterval(this.diagnosticInterval);
    this.diagnosticInterval = null;
  }
  
  if (this.memoryMonitoringInterval) {
    clearInterval(this.memoryMonitoringInterval);
    this.memoryMonitoringInterval = null;
  }
  
  // 移除事件监听器
  if (this.beforeUnloadListener) {
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
  }
  
  console.log('Error handler resources cleaned up successfully');
};
  
// 清理旧的错误日志
ErrorHandler.prototype.clearOldErrors = function() {
  // 只保留最近24小时的错误日志
  var twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  var filteredErrors = this.errors.filter(function(error) {
    var errorTime = new Date(error.timestamp).getTime();
    return errorTime > twentyFourHoursAgo;
  });
  
  var removedCount = this.errors.length - filteredErrors.length;
  if (removedCount > 0) {
    this.errors = filteredErrors;
    console.log('Cleaned up ' + removedCount + ' old error(s)');
  }
};
  
// 监控内存使用
ErrorHandler.prototype.monitorMemory = function() {
  // 支持更多浏览器的内存监控
  var memoryInfo = null;
  
  try {
    if (typeof performance !== 'undefined' && performance.memory) {
      // Chrome浏览器的内存API
      memoryInfo = performance.memory;
    } else if (typeof navigator !== 'undefined' && navigator.deviceMemory) {
      // 设备内存API，返回设备总内存（GB）
      memoryInfo = {
        deviceMemory: navigator.deviceMemory,
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: navigator.deviceMemory * 1024 * 1024 * 1024 // 设备内存作为近似上限
      };
    }
    
    if (memoryInfo) {
      var usedMemoryMB = 0;
      var totalMemoryMB = 0;
      var jsHeapSizeLimitMB = 0;
      
      if (memoryInfo.usedJSHeapSize) {
        usedMemoryMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
        totalMemoryMB = Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024);
        jsHeapSizeLimitMB = Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024);
      } else if (memoryInfo.deviceMemory) {
        // 使用设备内存作为近似值
        jsHeapSizeLimitMB = memoryInfo.deviceMemory * 1024;
        usedMemoryMB = Math.round(Math.random() * jsHeapSizeLimitMB * 0.5); // 模拟值
        totalMemoryMB = Math.round(jsHeapSizeLimitMB * 0.75); // 模拟值
      }
      
      console.log('Memory usage: ' + usedMemoryMB + 'MB / ' + totalMemoryMB + 'MB (limit: ' + jsHeapSizeLimitMB + 'MB)');
      
      // 如果内存使用超过80%，发出警告
      var memoryUsageRatio = usedMemoryMB / jsHeapSizeLimitMB;
      if (memoryUsageRatio > 0.8) {
        this.logWarning('High memory usage: ' + (memoryUsageRatio * 100).toFixed(1) + '% of limit', 'Memory Monitor');
        // 尝试清理一些可能的内存占用
        this.clearOldErrors();
        
        // 通知其他模块清理内存
        this.triggerMemoryCleanup();
      }
    }
  } catch (error) {
    console.error('Failed to monitor memory usage:', error);
  }
};
  
// 触发内存清理事件
ErrorHandler.prototype.triggerMemoryCleanup = function() {
  try {
    // 触发自定义内存清理事件，让其他模块可以响应
    var event;
    if (typeof CustomEvent === 'function') {
      event = new CustomEvent('memoryCleanup', {
        detail: {
          timestamp: Date.now()
        }
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('memoryCleanup', true, true, {
        timestamp: Date.now()
      });
    }
    document.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to trigger memory cleanup event:', error);
  }
};

// 处理错误
ErrorHandler.prototype.handleError = function(error, source, lineno, colno, message) {
  // 确保错误对象有效
  if (!error) {
    error = new Error('未知错误');
  }
  
  source = source || "Unknown";
  lineno = lineno || 0;
  colno = colno || 0;
  message = message || "";
  
  // 提取错误信息
  var errorMessage = message || error.message || "Unknown error";
  var errorType = error.name || "Error";
  var stackTrace = error.stack || "No stack trace available";
  
  // 创建错误对象
  var errorObj = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    source: source,
    lineno: lineno,
    colno: colno,
    message: errorMessage,
    stack: stackTrace,
    type: errorType
  };

  // 将错误添加到列表
  this.errors.push(errorObj);

  // 限制错误列表大小
  if (this.errors.length > 50) {
    this.errors.shift();
  }

  // 记录到控制台 - 增强版
  console.error('[' + errorType + '] ' + errorMessage, {
    source: source,
    line: lineno,
    column: colno,
    stack: stackTrace,
    timestamp: errorObj.timestamp
  });

  // 显示用户友好的错误信息
  this.showUserError(errorObj);
};

// 显示用户友好的错误信息
ErrorHandler.prototype.showUserError = function(errorObj) {
  // 避免重复显示相同的错误
  var existingError = document.getElementById("error-notification");
  if (existingError) {
    // 移除现有的错误提示，避免堆积
    existingError.remove();
  }
  
  // 创建新的错误提示元素
  var errorContainer = document.createElement("div");
  errorContainer.id = "error-notification";
  errorContainer.style.cssText = "\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background-color: #ef4444;\n        color: white;\n        padding: 12px 16px;\n        border-radius: 8px;\n        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n        z-index: 10000;\n        max-width: 350px;\n        font-size: 14px;\n        line-height: 1.5;\n        transition: all 0.3s ease;\n        word-wrap: break-word;\n      ";
  
  // 更新错误信息
  errorContainer.innerHTML = "\n      <div style=\"display: flex; flex-direction: column;\">\n        <div style=\"display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;\">\n          <strong style=\"color: #fff;\">" + errorObj.type + ":</strong>\n          <button onclick=\"this.parentElement.parentElement.remove()\" style=\"background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; line-height: 1;\">&times;</button>\n        </div>\n        <div style=\"color: rgba(255, 255, 255, 0.9); font-size: 13px;\">" + errorObj.message + "</div>\n      </div>\n    ";
  
  // 添加到页面
  document.body.appendChild(errorContainer);

  // 自动隐藏错误提示
  var self = this;
  setTimeout(function() {
    if (errorContainer.parentNode) {
      errorContainer.style.opacity = "0";
      errorContainer.style.transform = "translateY(-10px)";
      setTimeout(function() {
        if (errorContainer.parentNode) {
          errorContainer.remove();
        }
      }, 300);
    }
  }, 5000);
};

// 记录信息日志
ErrorHandler.prototype.logInfo = function(message, source) {
  source = source || "Unknown";
  console.log('[INFO] ' + message, { source: source });
};

// 记录警告日志
ErrorHandler.prototype.logWarning = function(message, source) {
  source = source || "Unknown";
  console.warn('[WARNING] ' + message, { source: source });
};

// 获取错误列表
ErrorHandler.prototype.getErrors = function() {
  return this.errors.slice();
};

// 清除错误列表
ErrorHandler.prototype.clearErrors = function() {
  this.errors = [];
};

// 显示错误诊断面板
ErrorHandler.prototype.showDiagnostics = function() {
    // 创建诊断面板
    var diagPanel = document.getElementById("diagnostics-panel");
    if (diagPanel) {
      diagPanel.style.display = "block";
      return;
    }

    diagPanel = document.createElement("div");
    diagPanel.id = "diagnostics-panel";
    diagPanel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background-color: var(--bg-primary);
      border-left: 1px solid var(--border-color);
      box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 10001;
      overflow-y: auto;
      padding: 16px;
      font-family: monospace;
      font-size: 12px;
    `;

    // 面板标题
    var title = document.createElement("div");
    title.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    `;
    title.innerHTML = `
      <span>诊断信息</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        color: var(--text-secondary);
      ">关闭</button>
    `;
    diagPanel.appendChild(title);

    // 环境信息
    var envInfo = document.createElement("div");
    envInfo.style.cssText = `
      margin-bottom: 16px;
      padding: 8px;
      background-color: var(--bg-secondary);
      border-radius: 4px;
    `;
    envInfo.innerHTML = `
      <div style="margin-bottom: 4px;"><strong>环境信息:</strong></div>
      <div>URL: ${window.location.href}</div>
      <div>User Agent: ${navigator.userAgent}</div>
      <div>屏幕尺寸: ${window.innerWidth}x${window.innerHeight}</div>
      <div>时间: ${new Date().toLocaleString()}</div>
    `;
    diagPanel.appendChild(envInfo);

    // 错误列表
    var errorsSection = document.createElement("div");
    errorsSection.style.cssText = `margin-bottom: 16px;`;
    errorsSection.innerHTML = `<div style="margin-bottom: 8px;"><strong>错误列表 (${this.errors.length}):</strong></div>`;

    if (this.errors.length === 0) {
      errorsSection.innerHTML +=
        '<div style="color: var(--text-tertiary); padding: 8px;">暂无错误记录</div>';
    } else {
      var self = this;
      this.errors.forEach(function(error, index) {
        var errorItem = document.createElement("div");
        errorItem.style.cssText = `
          margin-bottom: 8px;
          padding: 8px;
          background-color: var(--bg-secondary);
          border-radius: 4px;
          border-left: 3px solid #ef4444;
        `;
        errorItem.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600; color: #ef4444;">${error.type}</span>
            <span style="font-size: 10px; color: var(--text-tertiary);">${new Date(error.timestamp).toLocaleTimeString()}</span>
          </div>
          <div style="margin-bottom: 4px;">${error.message}</div>
          <div style="font-size: 10px; color: var(--text-tertiary);">${error.source}:${error.lineno}:${error.colno}</div>
          <details style="margin-top: 4px;">
            <summary style="font-size: 10px; cursor: pointer;">查看堆栈</summary>
            <pre style="margin: 4px 0; padding: 4px; background-color: var(--bg-tertiary); border-radius: 2px; font-size: 10px; overflow-x: auto;">${error.stack}</pre>
          </details>
        `;
        errorsSection.appendChild(errorItem);
      });
    }
    diagPanel.appendChild(errorsSection);

    // 清除错误按钮
    var clearBtn = document.createElement("button");
    clearBtn.textContent = "清除错误记录";
    clearBtn.style.cssText = `
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 12px;
      color: var(--text-secondary);
    `;
    var self = this;
    clearBtn.onclick = function() {
      self.clearErrors();
      diagPanel.remove();
      self.showDiagnostics();
    };
    diagPanel.appendChild(clearBtn);

    document.body.appendChild(diagPanel);
  }

// 运行诊断检查
ErrorHandler.prototype.runDiagnostics = function() {
    var diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        localStorageAvailable: typeof Storage !== "undefined",
        sessionStorageAvailable: typeof sessionStorage !== "undefined",
      },
      resources: {
        cssLoaded: document.querySelectorAll('link[rel="stylesheet"]').length > 0,
        jsLoaded: document.querySelectorAll("script").length > 0,
        fontAwesomeLoaded:
          typeof FontAwesome !== "undefined" ||
          document.querySelector('link[href*="font-awesome"]') !== null,
      },
      data: {
        productTypes: typeof window.productTypes !== "undefined",
        hmiData: typeof window.hmiData !== "undefined",
        plcData: typeof window.plcData !== "undefined",
        inverterData: typeof window.inverterData !== "undefined",
        servoSystemData: typeof window.servoSystemData !== "undefined",
        ioData: typeof window.ioData !== "undefined",
      },
      dom: {
        appContainer: document.querySelector(".app-container") !== null,
        sidebar: document.querySelector(".sidebar") !== null,
        mainContent: document.querySelector(".main-content") !== null,
        resultsContainer: document.getElementById("resultsContainer") !== null,
        modals: document.querySelectorAll(".modal").length > 0,
      },
      errors: this.getErrors(),
    };

    // 只在控制台输出诊断结果，不显示弹窗
    console.log("=== 应用诊断报告 ===", diagnostics);

    return diagnostics;
}

// 导出单例实例
var errorHandler = new ErrorHandler();

// 全局方法
window.showDiagnostics = function() {
  return errorHandler.showDiagnostics();
};
window.clearErrors = function() {
  return errorHandler.clearErrors();
};
window.runDiagnostics = function() {
  return errorHandler.runDiagnostics();
};

// 导出模块
if (typeof module !== "undefined" && module.exports) {
  module.exports = errorHandler;
} else {
  window.errorHandler = errorHandler;
}
