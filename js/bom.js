document.addEventListener('DOMContentLoaded', function() {
  
  // 监听页面切换事件，当切换到BOM页面时刷新总数量和总价格
  document.addEventListener('pageChange', function(e) {
    if (e.detail && e.detail.page === 'bom') {
      const items = load();
      if (typeof window.setTopBarTitle === 'function') {
        const totalQty = items.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10)), 0);
        const totalPrice = items.reduce((acc, it) => {
          const price = parsePrice(it.price);
          const qty = Math.max(0, parseInt(it.quantity || '1', 10) || 1);
          return acc + (price * qty);
        }, 0);
        window.setTopBarTitle(`BOM管理 (数量: ${totalQty}, 总价: ${fmt(totalPrice)})`);
      }
    }
  });
  


  // 内存中的临时数据，不持久化存储
  let bomData = [];

  function load() {
    return [...bomData];
  }

  function save(items) {
    try {
      // 验证数据格式
      if (!Array.isArray(items)) {
        console.error('保存失败：数据必须是数组');
        return false;
      }
      
      // 数据清理：移除无效项
      const validItems = items.filter(item => item && typeof item === 'object');
      
      // 保存数据到内存
      bomData = validItems;
      console.log('数据保存到内存，共', validItems.length, '项');
      return true;
    } catch (error) {
      console.error('保存失败：', error.message);
      return false;
    }
  }

  function parsePrice(p) {
    if (p === undefined || p === null || p === '') return 0;
    
    // 设置最大价格上限，防止大数值计算导致浏览器崩溃
    const MAX_PRICE = 99999999; // 一千万
    
    if (typeof p === 'number') {
      return isFinite(p) ? Math.min(p, MAX_PRICE) : 0;
    }
    
    const n = parseFloat(String(p).replace(/[^0-9.]/g,''));
    return isFinite(n) ? Math.min(n, MAX_PRICE) : 0;
  }
  
  // 调整单个textarea的高度
  function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto'; // 重置高度
    // 设置为内容高度，确保单行文本只显示一行（32px），多行文本正常显示
    textarea.style.height = Math.max(textarea.scrollHeight, 32) + 'px'; // 最小高度32px，与其他列保持一致
  }
  
  // 初始化并调整所有textarea的高度
  function initializeTextareasHeight() {
    const textareas = document.querySelectorAll('.inline-textarea');
    textareas.forEach(textarea => {
      adjustTextareaHeight(textarea);
    });
  }

  function addItem(item) {
    const items = load();
    const id = item.id || '-';
    const model = item.model || '-';
    const category = item.category || '';
    const name = item.name || (model || id);
    const price = parsePrice(item.price);
    const qty = Math.max(0, parseInt(item.quantity || 0, 10) || 0);
    const description = item.description || '';

    const idx = items.findIndex(i => i.id === id && i.model === model);
    if (idx >= 0) {
      items[idx].quantity = Math.max(0, parseInt((items[idx].quantity || 0) + qty, 10));
      if (category) items[idx].category = category;
      if (name) items[idx].name = name;
      if (price) items[idx].price = price;
      if (description) items[idx].description = description;
    } else {
      items.push({ id, model, category, name, description, price, quantity: qty, addedAt: Date.now() });
    }
    save(items);
  }



  function removeItem(id, model) {
    const items = load().filter(i => !(i.id === id && i.model === model));
    save(items);
  }

  function clearAll() {
    save([]);
  }

  // 生成带时间戳的文件名
  function generateFileName(baseName) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 格式化时间戳：YYYY-MM-DD_HH-MM-SS
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    
    // 返回带时间戳的文件名
    return `${baseName}_${timestamp}.csv`;
  }



  async function exportToExcel(fileName = '') {
    try {
      const items = load();
      
      // 确保ExcelJS已加载
      const isExcelJSReady = await ensureExcelJSLoaded();
      
      // 检查ExcelJS是否可用
      if (!isExcelJSReady || typeof ExcelJS === 'undefined' || (window.ExcelJS_Status && window.ExcelJS_Status.failed)) {
        console.error('ExcelJS库不可用，无法导出BOM表');
        alert('导出失败: ExcelJS库未加载，请刷新页面重试');
        return;
      }
      
      // 计算总数量和总价格
      let totalQty = 0;
      let totalPrice = 0;
    
      // 解析每个BOM项的功率标识，并按标识分组
      const powerGroups = {};
      items.forEach((it, i) => {
        // 从ID中提取功率标识，格式为"0.1KWP1"或类似格式
        const powerMatch = it.id.match(/(\d+(\.\d+)?KW)P\d+/);
        const powerId = powerMatch ? powerMatch[0] : `default-${i}`;
        
        if (!powerGroups[powerId]) {
          powerGroups[powerId] = [];
        }
        powerGroups[powerId].push(it);
      });
    
      // 生成带时间戳的文件名
      const fullFileName = generateFileName(fileName).replace('.csv', '.xlsx');
      
      // 使用ExcelJS创建工作簿
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ProSelectAI';
      workbook.lastModifiedBy = 'ProSelectAI';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // 创建工作表
      const worksheet = workbook.addWorksheet('选型表');
      
      // 设置列宽
      worksheet.columns = [
        { header: '', key: 'power', width: 10 }, // 功率列
        { header: '序号', key: 'index', width: 8 }, // 序号列
        { header: '分类', key: 'category', width: 15 }, // 分类列
        { header: '型号', key: 'model', width: 25 }, // 型号列
        { header: '描述', key: 'description', width: 50 }, // 描述列，增加宽度到50
        { header: '单价', key: 'price', width: 12 }, // 单价列
        { header: '数量', key: 'quantity', width: 10 }, // 数量列
        { header: '总价', key: 'total', width: 12 } // 总价列
      ];
      
      // 设置表头样式
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        name: 'Arial',
        size: 12,
        bold: true
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCCCCC' }
      };
      headerRow.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      // 设置淡灰色边框
      const lightBorder = {
        top: { style: 'thin', color: { argb: 'E0E0E0' } },
        left: { style: 'thin', color: { argb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
        right: { style: 'thin', color: { argb: 'E0E0E0' } }
      };
      headerRow.border = lightBorder;
      
      // 生成数据行
      let itemIndex = 0;
      let currentRow = 2; // 从第二行开始（第一行是标题）
      let startDataRow = 2; // 开始数据行
      let endDataRow = 2; // 结束数据行
      
      Object.entries(powerGroups).forEach(([powerId, groupItems]) => {
        // 解析功率值
        const powerMatch = powerId.match(/(\d+(\.\d+)?KW)/);
        const powerValue = powerMatch ? powerMatch[1] : '';
        
        // 为当前组的第一行设置功率值，其他行为空
        groupItems.forEach((it, groupIndex) => {
          const price = parsePrice(it.price);
          const qty = Math.max(0, parseInt(it.quantity || 0, 10));
          
          // 累加总数量和总价格（用于备用计算）
          totalQty += qty;
          totalPrice += price * qty;
          
          // 添加数据行
          const row = worksheet.addRow({
            power: groupIndex === 0 ? powerValue : '',
            index: itemIndex + 1,
            category: it.category || '',
            model: it.model || '',
            description: it.description || '',
            price: parseFloat(price.toFixed(2)),
            quantity: qty,
            total: 0 // 暂时设为0，后面会设置公式
          });
          
          // 设置行高
          row.height = 20;
          
          // 设置单元格样式
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // 为所有单元格添加淡灰色边框
            cell.border = lightBorder;
            
            // 序号前一列（第1列）和序号列（第2列）设置居中
            if (colNumber === 1 || colNumber === 2) {
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
              };
            }
            // 价格列（第6列）和总价列（第8列）设置垂直居中和数值格式
            else if (colNumber === 6 || colNumber === 8) {
              cell.alignment = {
                vertical: 'middle'
              };
              cell.numFmt = '0.00'; // 设置为两位小数格式
            }
            // 其他列设置垂直居中
            else {
              cell.alignment = {
                vertical: 'middle'
              };
            }
          });
          
          // 设置总价列的公式：单价*数量
          const totalCell = worksheet.getCell(`H${currentRow}`);
          totalCell.value = { formula: `F${currentRow}*G${currentRow}` };
          
          itemIndex++;
          currentRow++;
          endDataRow = currentRow - 1; // 更新结束数据行
        });
        
        // 如果当前组有多个行，需要合并首列
        if (groupItems.length > 1) {
          const startRow = currentRow - groupItems.length;
          const endRow = currentRow - 1;
          worksheet.mergeCells(`A${startRow}:A${endRow}`);
          
          // 设置合并后单元格的对齐方式
          const mergedCell = worksheet.getCell(`A${startRow}`);
          mergedCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
      });
      
      // 添加空行
      worksheet.addRow([]);
      
      // 添加总计行
      const totalRow = worksheet.addRow({
        description: '总计',
        quantity: 0, // 暂时设为0，后面会设置公式
        total: 0 // 暂时设为0，后面会设置公式
      });
      
      // 设置总计行的公式
      const totalRowNum = currentRow + 1;
      const quantityTotalCell = worksheet.getCell(`G${totalRowNum}`);
      const priceTotalCell = worksheet.getCell(`H${totalRowNum}`);
      
      // 设置总数量公式：SUM(G2:G${endDataRow})
      quantityTotalCell.value = { formula: `SUM(G${startDataRow}:G${endDataRow})` };
      
      // 设置总价格公式：SUM(H2:H${endDataRow})
      priceTotalCell.value = { formula: `SUM(H${startDataRow}:H${endDataRow})` };
      
      // 创建数据汇总工作表
      const summaryWorksheet = workbook.addWorksheet('数据汇总');
      
      // 设置汇总工作表列宽（不包含原来的A列）
      summaryWorksheet.columns = [
        { header: '序号', key: 'index', width: 8 }, // 序号列
        { header: '分类', key: 'category', width: 15 }, // 分类列
        { header: '型号', key: 'model', width: 25 }, // 型号列
        { header: '描述', key: 'description', width: 50 }, // 描述列
        { header: '单价', key: 'price', width: 12 }, // 单价列
        { header: '数量', key: 'quantity', width: 10 }, // 数量列
        { header: '总价', key: 'total', width: 12 } // 总价列
      ];
      
      // 设置汇总工作表表头样式
      summaryWorksheet.getRow(1).font = {
        name: 'Arial',
        size: 12,
        bold: true
      };
      summaryWorksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCCCCC' }
      };
      summaryWorksheet.getRow(1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      summaryWorksheet.getRow(1).border = lightBorder;
      
      // 汇总数据：按分类分组，再按型号分组，计算总数量和总价格
      const categorySummary = {};
      
      // 遍历所有项目，按分类和型号分组
      Object.entries(powerGroups).forEach(([powerId, groupItems]) => {
        groupItems.forEach((it) => {
          const category = it.category || '未分类';
          const model = it.model || '';
          if (!model) return;
          
          if (!categorySummary[category]) {
            categorySummary[category] = {};
          }
          
          if (!categorySummary[category][model]) {
            categorySummary[category][model] = {
              category: category,
              model: model,
              description: it.description || '',
              price: parsePrice(it.price),
              quantity: 0,
              total: 0
            };
          }
          
          // 累加数量
          categorySummary[category][model].quantity += Math.max(0, parseInt(it.quantity || 0, 10));
        });
      });
      
      // 计算每个型号的总价
      Object.values(categorySummary).forEach(categoryModels => {
        Object.values(categoryModels).forEach(item => {
          item.total = item.price * item.quantity;
        });
      });
      
      // 转换为数组，按分类分组排序
      const summaryItems = [];
      Object.values(categorySummary).forEach(categoryModels => {
        Object.values(categoryModels).forEach(item => {
          summaryItems.push(item);
        });
      });
      
      // 复制汇总数据到汇总工作表
      let summaryCurrentRow = 2;
      let summaryStartDataRow = 2;
      let summaryEndDataRow = 2;
      
      // 计算汇总的总数量和总价格
      let summaryTotalQty = 0;
      let summaryTotalPrice = 0;
      
      summaryItems.forEach((item, index) => {
        // 累加总数量和总价格
        summaryTotalQty += item.quantity;
        summaryTotalPrice += item.total;
        
        // 添加数据行（不包含原来的A列）
        const row = summaryWorksheet.addRow({
          index: index + 1, // 正确的序号
          category: item.category || '',
          model: item.model || '',
          description: item.description || '',
          price: parseFloat(item.price.toFixed(2)),
          quantity: item.quantity,
          total: 0 // 暂时设为0，后面会设置公式
        });
        
        // 设置行高
        row.height = 20;
        
        // 设置单元格样式
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // 为所有单元格添加淡灰色边框
          cell.border = lightBorder;
          
          // 序号列（第1列）设置居中
          if (colNumber === 1) {
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'center'
            };
          }
          // 价格列（第5列）和总价列（第7列）设置垂直居中和数值格式
          else if (colNumber === 5 || colNumber === 7) {
            cell.alignment = {
              vertical: 'middle'
            };
            cell.numFmt = '0.00'; // 设置为两位小数格式
          }
          // 其他列设置垂直居中
          else {
            cell.alignment = {
              vertical: 'middle'
            };
          }
        });
        
        // 设置总价列的公式：单价*数量（注意列号调整）
        const totalCell = summaryWorksheet.getCell(`G${summaryCurrentRow}`);
        totalCell.value = { formula: `E${summaryCurrentRow}*F${summaryCurrentRow}` };
        
        summaryCurrentRow++;
        summaryEndDataRow = summaryCurrentRow - 1; // 更新结束数据行
      });
      
      // 添加空行
      summaryWorksheet.addRow([]);
      
      // 添加总计行
      const summaryTotalRow = summaryWorksheet.addRow({
        description: '总计',
        quantity: 0, // 暂时设为0，后面会设置公式
        total: 0 // 暂时设为0，后面会设置公式
      });
      
      // 设置总计行样式
      summaryTotalRow.font = {
        bold: true
      };
      summaryTotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EEEEEE' }
      };
      summaryTotalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // 为总计行单元格添加淡灰色边框
        cell.border = lightBorder;
        
        if (colNumber >= 4 && colNumber <= 7) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
      });
      
      // 设置总计行的公式（注意列号调整）
      const summaryTotalRowNum = summaryCurrentRow + 1;
      const summaryQuantityTotalCell = summaryWorksheet.getCell(`F${summaryTotalRowNum}`);
      const summaryPriceTotalCell = summaryWorksheet.getCell(`G${summaryTotalRowNum}`);
      
      // 设置总数量公式：SUM(F2:F${summaryEndDataRow})
      summaryQuantityTotalCell.value = { formula: `SUM(F${summaryStartDataRow}:F${summaryEndDataRow})` };
      
      // 设置总价格公式：SUM(G2:G${summaryEndDataRow})
      summaryPriceTotalCell.value = { formula: `SUM(G${summaryStartDataRow}:G${summaryEndDataRow})` };
      
      // 设置总计行样式
      totalRow.font = {
        bold: true
      };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EEEEEE' }
      };
      totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // 为总计行单元格添加淡灰色边框
        cell.border = lightBorder;
        
        if (colNumber >= 5 && colNumber <= 8) {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
      });



      
      // 导出Excel文件
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // 检查blob是否成功创建
      if (!blob || blob.size === 0) {
        throw new Error('生成Excel文件失败');
      }
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fullFileName;
      
      // 触发下载
      link.click();
      
      // 等待一段时间确保文件开始下载，然后显示成功消息
      setTimeout(() => {
        // 释放URL对象
        URL.revokeObjectURL(link.href);
        // 导出完成后显示成功消息
        showSuccessMessage(`${fileName || 'BOM表'} 已成功导出`);
      }, 500);
      
    } catch (error) {
      console.error('导出BOM表失败:', error);
      alert('导出失败: ' + error.message);
    }
  }

  // 将事件监听器移到函数外部，避免重复添加
  const container = document.getElementById('bomContent');
  let fmt = null;
  
  // 初始化事件监听器
  function initEventListeners() {
    if (!container) return;
    
    fmt = n => `¥${parsePrice(n).toFixed(2)}`;
    
    // 移除任何可能存在的旧事件监听器
    // 注意：由于使用的是匿名函数，这里无法直接移除旧监听器
    // 所以我们采用一种方式，只初始化一次事件监听器
    
    // 输入事件监听
    container.addEventListener('input', handleInputEvent);
    
    // 失焦事件监听
    container.addEventListener('blur', handleBlurEvent, true);
    
    // 点击事件监听（用于移除项目）
    container.addEventListener('click', handleClickEvent);
  }
  
  // 输入事件处理函数
  function handleInputEvent(e) {
    const el = e.target;
    if (!el.classList.contains('inline-input') && !el.classList.contains('inline-textarea')) return;
    
    // 处理textarea的自动调整高度
    if (el.classList.contains('inline-textarea')) {
      adjustTextareaHeight(el);
    }
    
    const id = el.dataset.id;
    let originalModel = el.dataset.model; // 保存原始型号值
    const field = el.dataset.field;
    const currentValue = el.value; // 保存当前输入框的完整值
    
    // 立即更新data-model属性，确保在当前事件循环中就反映最新值
    if (field === 'model') {
      el.dataset.model = currentValue;
      originalModel = currentValue;
    }
    
    const list = load();
    
    // 对于型号字段的特殊处理
    if (field === 'model') {
      // 重要：只使用id查找记录，不使用型号作为查找条件
      // 这样即使型号正在被修改，也能正确找到记录
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        // 直接更新型号值
        list[idx].model = currentValue;
        
        // 使用防抖保存，优化性能
        debouncedSave(list);
        
        // 更新当前行所有相关元素的data-model属性
        const row = el.closest('tr');
        if (row) {
          const elements = row.querySelectorAll('[data-id="' + id + '"]');
          elements.forEach(element => {
            element.dataset.model = currentValue;
          });
        }
      }
      return; // 提前返回，避免后续处理
    }
    
    // 对于其他字段，使用当前元素的data-model属性（已更新为最新值）来查找记录
    const currentModel = el.dataset.model;
    const idx = list.findIndex(i => i.id === id && i.model === currentModel);
    if (idx >= 0) {
      if (field === 'price') {
        // 保存解析后的值，不在输入过程中格式化，避免删除小数点时数值突变
        list[idx].price = parsePrice(currentValue);
      } else if (field === 'quantity') {
        list[idx].quantity = Math.max(0, parseInt(currentValue || '0', 10) || 0);
      } else {
        // 保存其他字段的值
        list[idx][field] = currentValue;
      }
      
      // 使用防抖保存，优化性能
      debouncedSave(list);
      
      // 只更新必要的DOM元素，不重新渲染整个表格
      if (field === 'price' || field === 'quantity') {
        const row = el.closest('tr');
        if (row) {
          // 获取当前行的单价和数量值
          const priceVal = field === 'price' ? parsePrice(currentValue) : parsePrice(list[idx].price);
          const qtyVal = field === 'quantity' ? Math.max(0, parseInt(currentValue || 0, 10) || 0) : Math.max(0, parseInt(list[idx].quantity || 0, 10) || 0);
          
          // 只更新当前行的总价单元格
          const totalCell = row.querySelector('.total-cell');
          if (totalCell) {
            totalCell.textContent = fmt(priceVal * qtyVal);
          }
          
          // 更新页面标题中的总数量和总价格
          if (typeof window.setTopBarTitle === 'function') {
            const totalQty = list.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10) || 0), 0);
            const totalPrice = list.reduce((acc, it) => {
              const price = parsePrice(it.price);
              const qty = Math.max(0, parseInt(it.quantity || 0, 10));
              return acc + (price * qty);
            }, 0);
            window.setTopBarTitle(`BOM管理 (数量: ${totalQty}, 总价: ${fmt(totalPrice)})`);
          }
          
          // 实时更新表头中的总数量和总价格
          updateSummaryTotals(list);
        }
      }
    }
  }
  
  // 失焦事件处理函数 - 优化：确保数据立即保存，特别是描述、单价和数量等关键字段
  function handleBlurEvent(e) {
    const el = e.target;
    if (!el.classList.contains('inline-input') && !el.classList.contains('inline-textarea')) return;
    
    const id = el.dataset.id;
      const field = el.dataset.field;
      const value = el.value.trim();
      
      // 立即保存到本地存储，确保数据不丢失
      const list = load();
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) {
        // 对于不同字段进行特殊处理
        if (field === 'price') {
          // 价格字段特殊处理 - 移除非数字和小数点
          const cleanValue = value.replace(/[^\d.]/g, '');
          const parsedPrice = parsePrice(cleanValue);
          list[idx].price = parsedPrice;
          // 在失焦时格式化显示两位小数，避免输入过程中数值突变
          el.value = parsedPrice.toFixed(2); // 更新显示为两位小数
        } else if (field === 'quantity') {
          // 数量字段特殊处理 - 确保为数字且至少为0
          const qty = Math.max(0, parseInt(value || '0', 10) || 0);
          list[idx].quantity = qty.toString();
          el.value = qty.toString(); // 更新显示
        } else if (field === 'description') {
          // 描述字段处理
          list[idx].description = value;
          // 确保textarea高度合适
          if (el.classList.contains('inline-textarea')) {
            adjustTextareaHeight(el);
          }
        } else {
          list[idx][field] = value;
        }
        
        // 直接调用save函数保存，确保数据立即保存
        save(list);
        
        // 如果是价格或数量字段，更新汇总信息
        if (field === 'price' || field === 'quantity') {
          updateSummaryTotals(list);
          // 更新页面标题中的总数量和总价格
          if (typeof window.setTopBarTitle === 'function') {
            const totalQty = list.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10) || 0), 0);
            const totalPrice = list.reduce((acc, it) => {
              const price = parsePrice(it.price);
              const qty = Math.max(0, parseInt(it.quantity || 0, 10));
              return acc + (price * qty);
            }, 0);
            window.setTopBarTitle(`BOM管理 (数量: ${totalQty}, 总价: ${fmt(totalPrice)})`);
          }
        }
        
        // 显示保存成功的提示
        showSuccessMessage('数据已保存');
    }
    
    // 重要：不再调用render以避免页面跳动和数据重置
  }
  
  // 点击事件处理函数
  function handleClickEvent(e) {
    const rm = e.target.closest('.remove-item');
    if (rm) { 
      const row = rm.closest('tr');
      if (row) {
        // 添加淡出动画效果
        row.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        
        // 等待动画完成后移除行
        setTimeout(() => {
          removeItem(rm.dataset.id, rm.dataset.model); 
          row.remove();
          
          // 使用requestAnimationFrame确保序号更新在浏览器渲染帧中执行
          requestAnimationFrame(() => {
            // 手动更新剩余行的序号，避免重新渲染整个表格
            const table = document.querySelector('.bom-table');
            if (table) {
              const rows = table.querySelectorAll('tbody tr');
              rows.forEach((row, index) => {
                const serialCell = row.querySelector('td:first-child');
                if (serialCell) {
                  serialCell.textContent = index + 1;
                }
              });
            }
          });
          
          // 更新汇总信息
          const items = load();
          updateSummaryTotals(items);
          
          // 更新页面标题
          if (typeof window.setTopBarTitle === 'function') {
            const totalQty = items.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10) || 0), 0);
            const totalPrice = items.reduce((acc, it) => {
              const price = parsePrice(it.price);
              const qty = Math.max(0, parseInt(it.quantity || 0, 10));
              return acc + (price * qty);
            }, 0);
            window.setTopBarTitle(`BOM管理 (数量: ${totalQty}, 总价: ${fmt(totalPrice)})`);
          }
        }, 200);
      }
    }
  }

  function render() {
    if (!container) return;
    
    // 保存渲染前所有输入框的当前值，用于渲染后恢复
    const inputValues = {};
    const inputs = container.querySelectorAll('.inline-input, .inline-textarea');
    
    // 全面保存所有输入框的值，特别是关键字段
    inputs.forEach(input => {
      const id = input.dataset.id;
      const field = input.dataset.field;
      
      // 无论是否有焦点，都保存所有描述、单价和数量字段的值
      // 使用更简单的键格式，避免model变化导致的问题
      if (id && field) {
        // 为每个ID和字段组合创建唯一键
        const key = `${id}-${field}`;
        // 确保值不为空才保存
        if (input.value !== undefined && input.value !== null) {
          inputValues[key] = input.value;
        }
      }
    });
    
    const items = load();
    
    if (typeof window.setTopBarTitle === 'function') {
      const totalQty = items.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10) || 0), 0);
      const totalPrice = items.reduce((acc, it) => {
        const price = parsePrice(it.price);
        const qty = Math.max(0, parseInt(it.quantity || 0, 10));
        return acc + (price * qty);
      }, 0);
      window.setTopBarTitle(`BOM管理 (数量: ${totalQty}, 总价: ${fmt(totalPrice)})`);
    }

    // 将按钮添加到顶部栏的操作区域
    const topBarActions = document.querySelector('.top-bar-actions');
    if (topBarActions) {
      // 先移除可能存在的旧按钮
      const oldExportBtn = document.getElementById('bomExport');
      const oldClearBtn = document.getElementById('bomClearAll');
      if (oldExportBtn) oldExportBtn.remove();
      if (oldClearBtn) oldClearBtn.remove();
      
      // 只在BOM页面显示按钮
      if (window.location.hash === '#bom' || document.getElementById('bomContent')) {
        // 创建并添加清空按钮
        const clearBtn = document.createElement('button');
        clearBtn.id = 'bomClearAll';
        clearBtn.className = 'reset-btn';
        clearBtn.textContent = '清空';
        // 使用CSS类而不是内联样式，确保样式统一
        clearBtn.style.marginRight = '8px';
        topBarActions.insertBefore(clearBtn, topBarActions.firstChild);
        
        // 创建并添加导出BOM按钮
        const exportBtn = document.createElement('button');
        exportBtn.id = 'bomExport';
        exportBtn.className = 'primary-btn';
        exportBtn.textContent = '导出BOM';
        // 使用CSS类而不是内联样式，确保样式统一
        exportBtn.style.marginRight = '8px';
        topBarActions.insertBefore(exportBtn, topBarActions.firstChild);
        
        // 移除可能存在的旧事件监听器
        const newExportBtn = document.getElementById('bomExport');
        const newClearBtn = document.getElementById('bomClearAll');
        if (newExportBtn) {
          // 创建新的事件处理函数引用
          const handleExport = () => showExportModal();
          // 使用自定义属性存储事件处理函数引用，以便将来可能需要移除
          newExportBtn._handleExport = handleExport;
          newExportBtn.addEventListener('click', handleExport);
        }
        if (newClearBtn) {
          // 创建新的事件处理函数引用
          const handleClear = () => showClearConfirmation();
          // 使用自定义属性存储事件处理函数引用，以便将来可能需要移除
          newClearBtn._handleClear = handleClear;
          newClearBtn.addEventListener('click', handleClear);
        }
      }
    }

    // 优化1: 使用DocumentFragment减少DOM操作次数
    const fragment = document.createDocumentFragment();
    
    // 创建表格容器，提供横向滚动功能
    const tableContainer = document.createElement('div');
    tableContainer.className = 'bom-table-container';
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'bom-table';
    
    // 优化2: 设置表格固定布局和明确的样式以避免列宽跳动
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.borderSpacing = '0';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width: 40px; box-sizing: border-box;">序号</th>
        <th style="width: 100px; box-sizing: border-box;">分类</th>
        <th style="width: 170px; box-sizing: border-box;">型号</th>
        <th style="width: 280px; box-sizing: border-box;">描述</th>
        <th style="width: 90px; box-sizing: border-box;">单价</th>
        <th style="width: 80px; box-sizing: border-box;">数量</th>
        <th style="width: 100px; box-sizing: border-box;">总价</th>
        <th style="width: 100px; box-sizing: border-box;">操作</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    // 添加数据行
    items.forEach((it, i) => {
      const price = parsePrice(it.price);
      const formattedPrice = price.toFixed(2); // 格式化为两位小数
      const qty = Math.max(0, parseInt(it.quantity || 0, 10));
      const tr = document.createElement('tr');
      tr.style.boxSizing = 'border-box';
      
      // 使用模板字符串而不是innerHTML来避免HTML注入风险
      const cellsHtml = `
        <td style="box-sizing: border-box;">${i + 1}</td>
        <td style="box-sizing: border-box;"><input class="inline-input" data-id="${it.id}" data-model="${it.model}" data-field="category" value="${it.category || ''}" /></td>
        <td style="box-sizing: border-box;"><input class="inline-input" data-id="${it.id}" data-model="${it.model}" data-field="model" value="${it.model || ''}" /></td>
        <td style="box-sizing: border-box;"><textarea class="inline-textarea" data-id="${it.id}" data-model="${it.model}" data-field="description">${it.description || ''}</textarea></td>
        <td style="box-sizing: border-box;" class="price-cell"><input class="inline-input" data-id="${it.id}" data-model="${it.model}" data-field="price" value="${formattedPrice}" /></td>
        <td style="box-sizing: border-box;" class="qty-cell"><input class="inline-input" data-id="${it.id}" data-model="${it.model}" data-field="quantity" value="${qty}" /></td>
        <td style="box-sizing: border-box;" class="total-cell">${fmt(price * qty)}</td>
        <td style="box-sizing: border-box;">
          <a href="https://www.inovance.com/portal/allResult?key=${it.model || ''}" 
             class="bom-material-btn" 
             target="_blank" 
             rel="noopener noreferrer" 
             data-id="${it.id}" 
             data-model="${it.model}">资料</a>
          <button class="remove-item" data-id="${it.id}" data-model="${it.model}">移除</button>
        </td>
      `;
      tr.innerHTML = cellsHtml;
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // 将表格添加到容器中
    tableContainer.appendChild(table);
    fragment.appendChild(tableContainer);
    
    // 优化3: 一次性替换容器内容，减少重排重绘
    container.innerHTML = '';
    container.appendChild(fragment);
    
    // 优化4: 异步初始化功能，避免阻塞渲染
    setTimeout(() => {
      // 添加列宽调整功能
      addColumnResizing(table);
      
      // 初始化所有textarea高度
      initializeTextareasHeight();
      
      // 添加行拖拽排序功能
      addRowDragging(table);
      
      // 恢复渲染前保存的所有输入框的值
      Object.entries(inputValues).forEach(([key, value]) => {
        // 从键中提取ID和字段
        const parts = key.split('-');
        const id = parts[0];
        const field = parts[1];
        
        // 针对特定字段使用精确选择器
        const selector = `.inline-input[data-id="${id}"][data-field="${field}"], .inline-textarea[data-id="${id}"][data-field="${field}"]`;
        const newInput = container.querySelector(selector);
        
        // 确保找到对应的输入框后恢复其值
        if (newInput) {
          // 先保存原始值用于比较
          const originalValue = newInput.value;
          
          // 只有当保存的值与当前值不同时才恢复，避免不必要的更新
          if (value !== originalValue) {
            newInput.value = value;
            
            // 对于textarea，调整高度以适应内容
            if (newInput.tagName.toLowerCase() === 'textarea') {
              adjustTextareaHeight(newInput);
            }
          }
        }
      });
    }, 0);
  }

  document.addEventListener('pageChange', function(e) {
    if (e.detail && e.detail.page === 'bom') {
      render();
    } else {
      // 当离开BOM页面时，移除按钮
      const exportBtn = document.getElementById('bomExport');
      const clearBtn = document.getElementById('bomClearAll');
      if (exportBtn) exportBtn.remove();
      if (clearBtn) clearBtn.remove();
    }
  });

  // 添加列宽调整功能
  function addColumnResizing(table) {
    // 获取所有表头单元格
    const headers = table.querySelectorAll('thead th');
    let resizing = false;
    let currentHeader = null;
    let startX = 0;
    let startWidth = 0;
    
    // 为每个表头添加调整器
    headers.forEach((header, index) => {
      // 最后一列不添加调整器
      if (index === headers.length - 1) return;
      
      const resizer = document.createElement('div');
      resizer.className = 'column-resizer';
      
      header.style.position = 'relative';
      header.appendChild(resizer);
      
      // 鼠标按下事件
      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        resizing = true;
        currentHeader = header;
        startX = e.pageX;
        startWidth = header.offsetWidth;
        
        // 添加body的resizing类，显示全局调整光标
        document.body.classList.add('resizing');
        
        // 添加移动和释放事件监听
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
    
    // 鼠标移动事件处理
    function onMouseMove(e) {
      if (!resizing || !currentHeader) return;
      
      const width = startWidth + (e.pageX - startX);
      // 设置最小宽度限制
      if (width >= 50) {
        // 调整当前表头宽度
        currentHeader.style.width = width + 'px';
        
        // 找到当前列的索引
        const headerIndex = Array.from(headers).indexOf(currentHeader);
        
        // 调整表格中对应列的所有单元格宽度
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells[headerIndex]) {
            cells[headerIndex].style.width = width + 'px';
            // 确保单元格内容正确处理溢出
            cells[headerIndex].style.overflow = 'hidden';
            cells[headerIndex].style.textOverflow = 'ellipsis';
            cells[headerIndex].style.whiteSpace = 'nowrap';
            
            // 特殊处理描述列中的textarea
            const textarea = cells[headerIndex].querySelector('textarea.inline-textarea');
            if (textarea) {
              textarea.style.whiteSpace = 'normal';
            }
          }
        });
      }
    }
    
    // 鼠标释放事件处理
    function onMouseUp() {
      resizing = false;
      currentHeader = null;
      
      // 移除body的resizing类
      document.body.classList.remove('resizing');
      
      // 移除事件监听
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }
  
  // 添加表格行拖拽排序功能
  function addRowDragging(table) {
    let dragSrcEl = null;
    let dragOverRow = null;
    let currentIndex = -1;
    let targetIndex = -1;
    let lastTargetIndex = -1;
    let lastOverState = ''; // 'top' or 'bottom' to track last state
    
    // 添加拖拽样式
    addDraggingStyles();
    
    // 获取所有可拖拽行
    const rows = table.querySelectorAll('tbody tr');
    
    // 优化性能：缓存rows数组
    const rowsArray = Array.from(rows);
    
    // 批量处理样式更新，减少重绘
    const updateDragIndicators = (targetRow, state) => {
      // 只在状态改变时更新
      if (dragOverRow === targetRow && lastOverState === state) return;
      
      // 清除所有指示器
      rowsArray.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
      
      if (targetRow) {
        targetRow.classList.add(state === 'top' ? 'drag-over-top' : 'drag-over-bottom');
        dragOverRow = targetRow;
        lastOverState = state;
      } else {
        dragOverRow = null;
        lastOverState = '';
      }
    };
    
    rowsArray.forEach((row, index) => {
      // 设置行可拖拽
      row.draggable = true;
      row.dataset.index = index;
      
      // 拖拽开始事件 - 检查是否点击在输入框上
      row.addEventListener('dragstart', function(e) {
        // 增强检查：检查事件目标及其所有父元素是否包含输入框或文本区域
        let isInsideInput = false;
        let currentElement = e.target;
        
        // 遍历事件路径，检查是否在输入框内
        while (currentElement && currentElement !== this) {
          const tagName = currentElement.tagName;
          if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
            isInsideInput = true;
            break;
          }
          currentElement = currentElement.parentElement;
        }
        
        // 如果目标是输入框或在输入框内，完全阻止拖拽
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || isInsideInput) {
          e.stopPropagation(); // 阻止事件冒泡
          e.preventDefault();  // 阻止默认拖拽行为
          return;
        }
        
        dragSrcEl = this;
        currentIndex = parseInt(this.dataset.index);
        this.classList.add('dragging');
        
        // 确保设置正确的拖拽数据，兼容所有浏览器
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.dropEffect = 'move';
        // 使用更轻量级的数据传输
        e.dataTransfer.setData('text/plain', currentIndex.toString());
        e.dataTransfer.setData('text/html', ''); // 添加空的HTML数据，兼容某些浏览器
        
        // 设置拖拽图像以避免默认的半透明效果
        e.dataTransfer.setDragImage(this, 0, 0);
      });
      
      // 拖拽结束事件
      row.addEventListener('dragend', function() {
        // 清除所有拖拽状态
        this.classList.remove('dragging');
        rowsArray.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        
        // 重置状态变量
        dragSrcEl = null;
        dragOverRow = null;
        currentIndex = -1;
        targetIndex = -1;
        lastTargetIndex = -1;
        lastOverState = '';
      });
      
      // 拖拽经过事件 - 简化处理，确保兼容所有浏览器
      row.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move'; // 确保设置正确的dropEffect
        
        // 跳过自身
        if (this === dragSrcEl) return;
        
        // 计算鼠标在行中的位置
        const rect = this.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const halfHeight = rect.height / 2;
        
        const state = mouseY < halfHeight ? 'top' : 'bottom';
        updateDragIndicators(this, state);
      });
      
      // 拖拽离开事件 - 简化处理
      row.addEventListener('dragleave', function(e) {
        // 检查是否真正离开行（不是进入子元素）
        const relatedTarget = e.relatedTarget;
        if (!this.contains(relatedTarget) && dragOverRow === this) {
          // 延迟清除，避免快速移动时的闪烁
          setTimeout(() => {
            if (dragOverRow === this) {
              updateDragIndicators(null, '');
            }
          }, 20);
        }
      });
      
      // 拖拽放置事件 - 完全独立的处理，不依赖外部变量
      row.addEventListener('drop', function(e) {
        e.preventDefault();
        
        if (dragSrcEl === this) return;
        
        // 清除所有指示
        rowsArray.forEach(r => r.classList.remove('drag-over-top', 'drag-over-bottom'));
        
        try {
          // 获取当前拖拽的行索引
          const fromIndex = parseInt(dragSrcEl.dataset.index);
          // 获取目标行索引
          const toIndex = parseInt(this.dataset.index);
          
          // 获取数据
          const items = load();
          
          // 确定插入位置
          const rect = this.getBoundingClientRect();
          const mouseY = e.clientY - rect.top;
          const halfHeight = rect.height / 2;
          const before = mouseY < halfHeight;
          
          // 重新排序数据
          const newItems = reorderItems(items, fromIndex, toIndex, before);
          
          // 保存并渲染
          save(newItems);
          
          // 延迟渲染以避免在拖拽操作期间的布局抖动
          setTimeout(() => render(), 10);
          
        } catch (error) {
          // 即使出错也要重新渲染以保持UI一致性
          setTimeout(() => render(), 10);
        } finally {
          // 确保重置状态
          dragSrcEl = null;
          dragOverRow = null;
          lastTargetIndex = -1;
          lastOverState = '';
        }
      });
    });
  }
  
  // 重新排序数组元素 - 修复逻辑问题版本
  function reorderItems(items, fromIndex, toIndex, before) {
    try {
      // 增强的边界检查
      if (!Array.isArray(items)) {

        return items;
      }
      
      const result = [...items];
      
      // 边界检查
      if (fromIndex < 0 || fromIndex >= result.length || 
          toIndex < 0 || toIndex >= result.length) {
        return result;
      }
      
      // 从原始数组中移除要移动的元素
      const [removed] = result.splice(fromIndex, 1);
      
      // 计算新的插入索引
      let insertIndex;
      if (before) {
        // 插入到目标元素上方
        // 如果原索引在目标索引之前，移除元素后目标索引会减1
        if (fromIndex < toIndex) {
          insertIndex = toIndex - 1;
        } else {
          insertIndex = toIndex;
        }
      } else {
        // 插入到目标元素下方
        // 如果原索引在目标索引之前，移除元素后目标索引不变
        if (fromIndex < toIndex) {
          insertIndex = toIndex;
        } else {
          insertIndex = toIndex + 1;
        }
      }
      
      // 确保索引有效
      insertIndex = Math.max(0, Math.min(insertIndex, result.length));
      
      // 插入元素到新位置
      result.splice(insertIndex, 0, removed);
      
      return result;
    } catch (error) {
      return items; // 如果出错，返回原始数组
    }
  }
  
  // 更新表头汇总信息
  function updateSummaryTotals(list) {
    if (!Array.isArray(list)) return;
    
    // 计算总数量
    const totalQuantity = list.reduce((acc, it) => acc + Math.max(0, parseInt(it.quantity || 0, 10) || 0), 0);
    
    // 计算总价格
    const totalPrice = list.reduce((acc, it) => {
      const price = parsePrice(it.price);
      const qty = Math.max(0, parseInt(it.quantity || 0, 10) || 0);
      return acc + (price * qty);
    }, 0);
    
    // 更新总数量DOM元素
    const totalQuantityElement = document.getElementById('bom-total-quantity');
    if (totalQuantityElement) {
      totalQuantityElement.textContent = totalQuantity;
    }
    
    // 更新总价格DOM元素
    const totalPriceElement = document.getElementById('bom-total-price');
    if (totalPriceElement && fmt) {
      totalPriceElement.textContent = fmt(totalPrice);
    }
  }
  
  // 防抖函数 - 用于减少频繁触发的事件
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // 创建防抖版本的数据保存函数
  const debouncedSave = debounce((items) => {
    try {
      save(items);
    } catch (error) {
      console.error('保存失败:', error);
    }
  }, 200); // 200ms的延迟，平衡响应速度和性能
  

  
  // 添加拖拽相关样式
  function addDraggingStyles() {
    // 检查是否已经添加了样式
    if (document.getElementById('dragging-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'dragging-styles';
    style.textContent = `
      /* 拖拽时的光标样式 */
      [draggable="true"] {
        cursor: move;
      }
      
      /* 正在拖拽的行样式 - 移除可能导致布局变化的transform */
      tr.dragging {
        opacity: 0.5;
        background-color: var(--bg-tertiary) !important;
        /* 移除scale变换避免布局问题 */
      }
      
      /* 拖拽到行上方时的顶部边框指示 */
      tr.drag-over-top {
        border-top: 2px solid var(--primary-color);
        background-color: var(--bg-secondary) !important;
        /* 移除transition避免跳动 */
      }
      
      /* 拖拽到行下方时的底部边框指示 */
      tr.drag-over-bottom {
        border-bottom: 2px solid var(--primary-color);
        background-color: var(--bg-secondary) !important;
        /* 移除transition避免跳动 */
      }
      
      /* 拖拽时禁用文本选择 */
      .bom-table.dragging {
        user-select: none;
      }
      
      /* 拖拽过程中的其他视觉提示 */
      [draggable="true"]:hover {
        background-color: var(--bg-tertiary);
      }
      
      /* 输入框元素不继承拖拽光标 */
      .inline-input, .inline-textarea {
        cursor: text !important;
        user-select: text;
      }
      
      /* 增强插入位置的视觉反馈 */
      tr.drag-over-top {
        border-top: 3px solid var(--primary-color);
        box-shadow: none;
      }
      
      tr.drag-over-bottom {
        border-bottom: 3px solid var(--primary-color);
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);
  }
  

  
  // 显示成功提示消息
  // 支持两种调用方式：
  // 1. showSuccessMessage('添加成功') - 简单消息
  // 2. showSuccessMessage({ model: 'MS1H1-05B30CB-A330Z', name: '伺服系统', quantity: 5 }) - 详细产品信息
  // 显示导出弹窗
  function showExportModal() {
    // 检查是否已存在导出弹窗元素
    let exportModal = document.getElementById('bomExportModal');
    
    if (!exportModal) {
      // 创建导出弹窗容器
      exportModal = document.createElement('div');
      exportModal.id = 'bomExportModal';
      exportModal.className = 'bom-export-modal';
      exportModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      `;
      
      // 创建弹窗内容
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background-color: white;
        border-radius: 8px;
        padding: 24px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // 创建标题
      const modalTitle = document.createElement('h3');
      modalTitle.textContent = '导出BOM表';
      modalTitle.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      `;
      
      // 创建消息
      const modalMessage = document.createElement('p');
      modalMessage.textContent = '请输入导出表格的名称，将自动添加当前时间戳。';
      modalMessage.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      `;
      
      // 创建表格名称输入框容器
      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = `
        margin: 0 0 24px 0;
      `;
      
      // 创建输入框标签
      const inputLabel = document.createElement('label');
      inputLabel.textContent = '表格名称：';
      inputLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #333;
      `;
      
      // 创建输入框
      const tableNameInput = document.createElement('input');
      tableNameInput.id = 'bomExportTableNameInput';
      tableNameInput.type = 'text';
      tableNameInput.placeholder = '请输入表格名称';
      tableNameInput.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      `;
      
      // 组装输入框部分
      inputContainer.appendChild(inputLabel);
      inputContainer.appendChild(tableNameInput);
      
      // 创建按钮容器
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      `;
      
      // 创建取消按钮
      const cancelButton = document.createElement('button');
      cancelButton.textContent = '取消';
      cancelButton.className = 'cancel-btn';
      cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background-color: white;
        color: #666;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      `;
      cancelButton.addEventListener('click', () => {
        exportModal.style.opacity = '0';
        exportModal.style.visibility = 'hidden';
      });
      
      // 创建导出按钮
      const confirmButton = document.createElement('button');
      confirmButton.textContent = '导出';
      confirmButton.className = 'export-btn';
      confirmButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #1890ff;
        border-radius: 4px;
        background-color: #1890ff;
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      `;
      confirmButton.addEventListener('click', async () => {
        const tableName = tableNameInput.value.trim();
        try {
          await exportToExcel(tableName);
          exportModal.style.opacity = '0';
          exportModal.style.visibility = 'hidden';
          showSuccessMessage(`${tableName || 'BOM表'} 已成功导出`);
        } catch (error) {
          console.error('导出BOM表失败:', error);
          alert('导出失败: ' + error.message);
        }
      });
      
      // 组装弹窗
      buttonsContainer.appendChild(cancelButton);
      buttonsContainer.appendChild(confirmButton);
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(modalMessage);
      modalContent.appendChild(inputContainer);
      modalContent.appendChild(buttonsContainer);
      
      exportModal.appendChild(modalContent);
      
      // 添加全局点击关闭事件（点击弹窗外部时关闭）
      exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) {
          exportModal.style.opacity = '0';
          exportModal.style.visibility = 'hidden';
        }
      });
      
      // 添加键盘Esc关闭事件
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && exportModal.style.visibility === 'visible') {
          exportModal.style.opacity = '0';
          exportModal.style.visibility = 'hidden';
        }
      });
      
      document.body.appendChild(exportModal);
    }
    
    // 显示弹窗
    exportModal.style.opacity = '1';
    exportModal.style.visibility = 'visible';
  }

  // 显示清空确认弹窗
  function showClearConfirmation() {
    // 检查是否已存在确认弹窗元素
    let confirmationModal = document.getElementById('bomClearConfirmationModal');
    
    if (!confirmationModal) {
      // 创建确认弹窗容器
      confirmationModal = document.createElement('div');
      confirmationModal.id = 'bomClearConfirmationModal';
      confirmationModal.className = 'bom-confirmation-modal';
      confirmationModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      `;
      
      // 创建弹窗内容
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background-color: white;
        border-radius: 8px;
        padding: 24px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // 创建标题
      const modalTitle = document.createElement('h3');
      modalTitle.textContent = '确认清空BOM表';
      modalTitle.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      `;
      
      // 创建消息
      const modalMessage = document.createElement('p');
      modalMessage.textContent = '确定要清空BOM表吗？此操作不可撤销。';
      modalMessage.style.cssText = `
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      `;
      
      // 创建表格名称输入框容器
      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = `
        margin: 0 0 24px 0;
      `;
      
      // 创建输入框标签
      const inputLabel = document.createElement('label');
      inputLabel.textContent = '表格名称：';
      inputLabel.style.cssText = `
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #333;
      `;
      
      // 创建输入框
      const tableNameInput = document.createElement('input');
      tableNameInput.id = 'bomTableNameInput';
      tableNameInput.type = 'text';
      tableNameInput.placeholder = '请输入表格名称（可选）';
      tableNameInput.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      `;
      
      // 组装输入框部分
      inputContainer.appendChild(inputLabel);
      inputContainer.appendChild(tableNameInput);
      
      // 创建按钮容器
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      `;
      
      // 创建取消按钮
      const cancelButton = document.createElement('button');
      cancelButton.textContent = '取消';
      cancelButton.className = 'cancel-btn';
      cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background-color: white;
        color: #666;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      `;
      cancelButton.addEventListener('click', () => {
        confirmationModal.style.opacity = '0';
        confirmationModal.style.visibility = 'hidden';
      });
      
      // 创建直接删除按钮
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '直接删除';
      deleteButton.className = 'delete-btn';
      deleteButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ff4d4f;
        border-radius: 4px;
        background-color: white;
        color: #ff4d4f;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      `;
      deleteButton.addEventListener('click', () => {
        const tableName = tableNameInput.value.trim();
        clearAll();
        render();
        confirmationModal.style.opacity = '0';
        confirmationModal.style.visibility = 'hidden';
        showSuccessMessage(`${tableName || '未命名'} BOM表已清空`);
      });
      
      // 创建导出并删除按钮
      const exportDeleteButton = document.createElement('button');
      exportDeleteButton.textContent = '导出BOM再删除';
      exportDeleteButton.className = 'export-delete-btn';
      exportDeleteButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #1890ff;
        border-radius: 4px;
        background-color: #1890ff;
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      `;
      exportDeleteButton.addEventListener('click', async () => {
        const tableName = tableNameInput.value.trim();
        try {
          // 先导出BOM
          await exportToExcel(tableName);
          // 然后清空BOM表
          clearAll();
          render();
          confirmationModal.style.opacity = '0';
          confirmationModal.style.visibility = 'hidden';
          showSuccessMessage(`${tableName || '未命名'} BOM表已导出并清空`);
        } catch (error) {
          console.error('导出BOM表失败:', error);
          alert('导出失败: ' + error.message);
        }
      });
      
      // 组装弹窗
      buttonsContainer.appendChild(cancelButton);
      buttonsContainer.appendChild(deleteButton);
      buttonsContainer.appendChild(exportDeleteButton);
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(modalMessage);
      modalContent.appendChild(inputContainer);
      modalContent.appendChild(buttonsContainer);
      
      confirmationModal.appendChild(modalContent);
      
      // 添加全局点击关闭事件（点击弹窗外部时关闭）
      confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
          confirmationModal.style.opacity = '0';
          confirmationModal.style.visibility = 'hidden';
        }
      });
      
      // 添加键盘Esc关闭事件
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmationModal.style.visibility === 'visible') {
          confirmationModal.style.opacity = '0';
          confirmationModal.style.visibility = 'hidden';
        }
      });
      
      document.body.appendChild(confirmationModal);
    }
    
    // 显示弹窗
    confirmationModal.style.opacity = '1';
    confirmationModal.style.visibility = 'visible';
  }

  function showSuccessMessage(data) {
    // 检查是否已存在提示元素
    let toast = document.getElementById('successToast');
    
    if (!toast) {
      // 创建提示元素
      toast = document.createElement('div');
      toast.id = 'successToast';
      toast.className = 'success-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: -300px;
        background-color: white;
        color: #333;
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transition: all 0.3s ease;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(toast);
    }
    
    // 生成提示消息内容
    let message = '';
    if (typeof data === 'string') {
      // 简单字符串消息
      message = data;
    } else if (typeof data === 'object' && data !== null) {
      // 详细产品信息
      if (data.model || data.name) {
        const productName = data.model || data.name;
        const quantity = data.quantity || 1;
        message = `成功: ${productName} 已成功添加到BOM表${quantity > 1 ? `，数量: ${quantity}` : ''}`;
      } else {
        message = '添加成功';
      }
    } else {
      message = '添加成功';
    }
    
    // 设置消息内容，包含图标和关闭按钮
    toast.innerHTML = `
      <div style="color: #52c41a; font-size: 18px;">✓</div>
      <div style="flex: 1;">${message}</div>
      <button id="toastCloseBtn" style="
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 16px;
        padding: 2px 6px;
        border-radius: 2px;
        transition: all 0.2s ease;
      ">×</button>
    `;
    
    // 为关闭按钮添加点击事件
    const closeBtn = document.getElementById('toastCloseBtn');
    closeBtn.onclick = function() {
      hideToast();
    };
    
    // 定义隐藏toast的函数
    function hideToast() {
      toast.style.left = '-300px';
      toast.style.opacity = '0';
      // 动画结束后移除元素
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
    
    // 重置样式并显示提示
    toast.style.left = '-300px';
    toast.style.opacity = '0';
    // 使用setTimeout确保重排后再执行动画
    setTimeout(() => {
      toast.style.left = '20px';
      toast.style.opacity = '1';
    }, 10);
    
    // 2秒后自动隐藏
    setTimeout(() => {
      hideToast();
    }, 2000);
  }

  // 通用后备弹窗函数 - 当产品专用弹窗模块未加载时使用
  function openQuantityModal(payload) {
    if (!bomModal) return;
    
    // 使用更友好的标题，优先使用model
    const productIdentifier = payload.model || payload.name || payload.id;
    bomTitle.textContent = `添加 ${productIdentifier} 到BOM表`;
    
    // 添加数量输入和备注功能
    bomBody.innerHTML = `
      <div class="form-group">
        <label>数量</label>
        <input type="number" id="bomQty" class="inline-input" min="0" value="1" />
      </div>
      <div class="form-group">
        <label>备注（可选）</label>
        <input type="text" id="bomRemark" class="inline-input" placeholder="请输入备注信息" />
      </div>
    `;
    
    bomConfirm.onclick = () => {
      const qtyEl = document.getElementById('bomQty');
      const remarkEl = document.getElementById('bomRemark');
      const qty = Math.max(0, parseInt(qtyEl && qtyEl.value || '0', 10));
      const remark = remarkEl && remarkEl.value ? remarkEl.value.trim() : '';
      
      // 构建产品数据对象
      const productData = {
        ...payload,
        quantity: qty
      };
      
      // 如果有备注则添加
      if (remark) {
        productData.remark = remark;
      }
      
      // 添加到BOM表
      addItem(productData);
      hideModal();
      
      // 显示成功消息，包含产品信息
      showSuccessMessage({
        model: productData.model || productData.name,
        quantity: qty
      });
    };
    
    bomCancel.onclick = hideModal;
    bomClose.onclick = hideModal;
    showModal();
  }

  // 初始化事件监听器，确保只添加一次
  initEventListeners();
  
  window.BOMModals = { openQuantityModal };
  window.BOM = { load, addItem, removeItem, clearAll, render, showSuccessMessage };
  
  // 延迟一点时间确保DOM完全渲染后再调整textarea高度
  setTimeout(initializeTextareasHeight, 100);
});