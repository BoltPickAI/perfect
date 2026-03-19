// 人机界面数据 - 从Excel转换生成
const hmiData = {
  "ITS7000": {
    "ITS7070S": {
      "price": 0,
      "id": "ITS7070S",
      "model": "ITS7070S",
      "screenSize": "7寸标准版",
      "description": "7寸标准版",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070S-G": {
      "price": 0,
      "id": "ITS7070S-G",
      "model": "ITS7070S-G",
      "screenSize": "7寸标准版灰色",
      "description": "7寸标准版灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070SH": {
      "price": 0,
      "id": "ITS7070SH",
      "model": "ITS7070SH",
      "screenSize": "7寸高清版",
      "description": "7寸高清版",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070SH-G": {
      "price": 0,
      "id": "ITS7070SH-G",
      "model": "ITS7070SH-G",
      "screenSize": "7寸高清版灰色",
      "description": "7寸高清版灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070E": {
      "price": 0,
      "id": "ITS7070E",
      "model": "ITS7070E",
      "screenSize": "7寸网口版",
      "description": "7寸网口版",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070E-G": {
      "price": 0,
      "id": "ITS7070E-G",
      "model": "ITS7070E-G",
      "screenSize": "7寸网口版灰色",
      "description": "7寸网口版灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070EH": {
      "price": 0,
      "id": "ITS7070EH",
      "model": "ITS7070EH",
      "screenSize": "7寸网口高清款",
      "description": "7寸网口高清款",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7070EH-G": {
      "price": 0,
      "id": "ITS7070EH-G",
      "model": "ITS7070EH-G",
      "screenSize": "7寸网口高清款灰色",
      "description": "7寸网口高清款灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7100S": {
      "price": 0,
      "id": "ITS7100S",
      "model": "ITS7100S",
      "screenSize": "10寸标准版",
      "description": "10寸标准版",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7100S-G": {
      "price": 0,
      "id": "ITS7100S-G",
      "model": "ITS7100S-G",
      "screenSize": "10寸标准版灰色",
      "description": "10寸标准版灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7100E": {
      "price": 0,
      "id": "ITS7100E",
      "model": "ITS7100E",
      "screenSize": "10寸网口版",
      "description": "10寸网口版",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7100E-G": {
      "price": 0,
      "id": "ITS7100E-G",
      "model": "ITS7100E-G",
      "screenSize": "10寸网口版灰色",
      "description": "10寸网口版灰色",
      "resolution": "",
      "interface": "",
      "protection": ""
    },
    "ITS7156E": {
      "price": 0,
      "id": "ITS7156E",
      "model": "ITS7156E",
      "screenSize": "15寸网口版",
      "description": "15寸网口版",
      "resolution": "",
      "interface": "",
      "protection": ""
    }
  }
};

// 导出到全局对象
if (typeof window !== 'undefined') {
  window.hmiData = hmiData;
}

// 人机界面类型定义
const hmiType = {
  name: '人机界面',
  params: ['屏幕尺寸', '分辨率', '通讯接口', '防护等级'],
  displayParams: ['型号', '屏幕尺寸', '价格']
};

// 导出数据到全局作用域，供浏览器使用
if (typeof window !== 'undefined') {
  window.hmiType = hmiType;
}