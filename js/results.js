// 结果页面功能模块

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有筛选结果需要显示
    var urlParams, productType, filters;
    if (window.URLSearchParams) {
        urlParams = new URLSearchParams(window.location.search);
        productType = urlParams.get('type');
        filters = urlParams.get('filters');
    } else {
        // 兼容旧浏览器的URL参数解析
        var search = window.location.search.substring(1);
        var params = search.split('&');
        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            if (decodeURIComponent(pair[0]) === 'type') {
                productType = decodeURIComponent(pair[1]);
            } else if (decodeURIComponent(pair[0]) === 'filters') {
                filters = decodeURIComponent(pair[1]);
            }
        }
    }
    
    if (productType && filters) {
        // 显示筛选结果
        displayResultsFromUrl(productType, filters);
    }
});

// 从URL参数获取筛选结果并显示
function displayResultsFromUrl(productType, filters) {
    // 解析筛选条件
    var filterObj = {};
    try {
        filterObj = JSON.parse(decodeURIComponent(filters));
    } catch (e) {
        return;
    }
    
    // 根据产品类型获取数据并筛选
    var productData, displayParams, productTypeName;
    switch(productType) {
        case 'HMI':
            productData = window.hmiData || {};
            displayParams = (window.hmiType && window.hmiType.displayParams) || ['型号', '屏幕尺寸', '价格'];
            productTypeName = (window.hmiType && window.hmiType.name) || '人机界面';
            break;
        case 'PLC':
            productData = window.plcData || {};
            displayParams = (window.plcType && window.plcType.displayParams) || ['型号', 'CPU型号', '运动控制轴数', '价格'];
            productTypeName = (window.plcType && window.plcType.name) || 'PLC控制器';
            break;
        case 'Servo':
            productData = window.servoSystemData || {};
            displayParams = (window.servoType && window.servoType.displayParams) || ['型号', '额定功率', '额定电压', '额定转矩', '价格'];
            productTypeName = (window.servoType && window.servoType.name) || '伺服系统';
            break;
        case 'Inverter':
            productData = window.inverterData || {};
            displayParams = (window.inverterType && window.inverterType.displayParams) || ['型号', '功率范围', '电压等级', '控制方式', '价格'];
            productTypeName = (window.inverterType && window.inverterType.name) || '变频器';
            break;
        case 'IO':
            productData = window.ioData || {};
            displayParams = (window.ioType && window.ioType.displayParams) || ['型号', '描述', '价格'];
            productTypeName = (window.ioType && window.ioType.name) || 'IO模块';
            break;
        case 'OutdoorIO':
            productData = window.outdoorIoData || {};
            displayParams = (window.outdoorIoType && window.outdoorIoType.displayParams) || ['型号', '描述', '价格'];
            productTypeName = (window.outdoorIoType && window.outdoorIoType.name) || '柜外IO模块';
            break;
        case 'HighPowerServo':
            productData = window.highPowerServoSystemData || {};
            displayParams = (window.highPowerServoType && window.highPowerServoType.displayParams) || ['型号', '额定功率', '额定电压', '额定转矩', '价格'];
            productTypeName = (window.highPowerServoType && window.highPowerServoType.name) || '大功率伺服系统';
            break;
        default:
            var resultContent = document.getElementById('resultContent');
            if (resultContent) {
                resultContent.innerHTML = '<div class="error-message">不支持的产品类型</div>';
            }
            return;
    }
    
    // 筛选数据
    var filteredData = filterProductData(productData, filterObj, productType);
    
    // 显示结果
    displayResults('resultContent', filteredData, displayParams, productTypeName);
}

// 筛选产品数据
function filterProductData(data, filters, productType) {
    var filteredData = [];
    
    // Object.values()的兼容实现
    function getObjectValues(obj) {
        var values = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                values.push(obj[key]);
            }
        }
        return values;
    }
    
    // 处理IO模块和柜外IO模块的三级数据结构（系列->子类别->产品）
    if (productType === 'IO' || productType === 'OutdoorIO') {
        // 如果没有筛选条件，返回所有数据
        if (Object.keys(filters).length === 0) {
            var seriesValues = getObjectValues(data);
            for (var i = 0; i < seriesValues.length; i++) {
                var series = seriesValues[i];
                var subCategoryValues = getObjectValues(series);
                for (var j = 0; j < subCategoryValues.length; j++) {
                    var subCategory = subCategoryValues[j];
                    var productValues = getObjectValues(subCategory);
                    for (var k = 0; k < productValues.length; k++) {
                        filteredData.push(productValues[k]);
                    }
                }
            }
            return filteredData;
        }
        
        // 根据系列和子类别筛选
        var ioFilteredData = [];
        
        // 确定要处理的系列
        var seriesToProcess = filters.series && filters.series.length > 0 ? filters.series : Object.keys(data);
        
        for (var l = 0; l < seriesToProcess.length; l++) {
            var seriesName = seriesToProcess[l];
            if (data[seriesName]) {
                // 确定要处理的子类别
                var subCategories = filters.subCategory && filters.subCategory.length > 0 ? filters.subCategory : Object.keys(data[seriesName]);
                
                for (var m = 0; m < subCategories.length; m++) {
                    var subCategoryName = subCategories[m];
                    if (data[seriesName][subCategoryName]) {
                        var productValues = getObjectValues(data[seriesName][subCategoryName]);
                        for (var n = 0; n < productValues.length; n++) {
                            ioFilteredData.push(productValues[n]);
                        }
                    }
                }
            }
        }
        
        return ioFilteredData;
    }
    
    // 处理其他产品类型的两级数据结构（系列->产品）
    // 如果没有筛选条件，返回所有数据
    if (Object.keys(filters).length === 0) {
        var seriesValues = getObjectValues(data);
        for (var o = 0; o < seriesValues.length; o++) {
            var series = seriesValues[o];
            var productValues = getObjectValues(series);
            for (var p = 0; p < productValues.length; p++) {
                filteredData.push(productValues[p]);
            }
        }
        return filteredData;
    }
    
    // 根据系列筛选
    var seriesFilteredData = [];
    if (filters.series && filters.series.length > 0) {
        for (var q = 0; q < filters.series.length; q++) {
            var seriesName = filters.series[q];
            if (data[seriesName]) {
                var productValues = getObjectValues(data[seriesName]);
                for (var r = 0; r < productValues.length; r++) {
                    seriesFilteredData.push(productValues[r]);
                }
            }
        }
    } else {
        // 如果没有选择系列，使用所有数据
        var seriesValues = getObjectValues(data);
        for (var s = 0; s < seriesValues.length; s++) {
            var series = seriesValues[s];
            var productValues = getObjectValues(series);
            for (var t = 0; t < productValues.length; t++) {
                seriesFilteredData.push(productValues[t]);
            }
        }
    }
    
    // 如果没有其他筛选条件，直接返回系列筛选结果
    if (Object.keys(filters).length === (filters.series ? 1 : 0)) {
        return seriesFilteredData;
    }
    
    // 根据其他参数筛选
    var finalFilteredData = seriesFilteredData;
    
    var filterKeys = Object.keys(filters);
    for (var u = 0; u < filterKeys.length; u++) {
        var param = filterKeys[u];
        // 跳过系列参数，已经处理过了
        if (param === 'series') continue;
        
        if (filters[param] && filters[param].length > 0) {
            var tempFiltered = [];
            for (var v = 0; v < finalFilteredData.length; v++) {
                var product = finalFilteredData[v];
                var productValue = product[param] || product[getParamKey(param)];
                if (productValue !== undefined && filters[param].indexOf(String(productValue)) !== -1) {
                    tempFiltered.push(product);
                }
            }
            finalFilteredData = tempFiltered;
        }
    }
    
    return finalFilteredData;
}