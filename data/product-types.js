// 产品类型定义
const ProductTypes = {
  // 产品类型定义，包含英文键和中文名
  HMI: {
    key: 'HMI',
    name: '人机界面'
  },
  PLC: {
    key: 'PLC',
    name: 'PLC控制器'
  },
  Inverter: {
    key: 'Inverter',
    name: '变频器'
  },
  Servo: {
    key: 'Servo',
    name: '伺服系统（更新版）'
  },
  HighPowerServo: {
    key: 'HighPowerServo',
    name: '大功率伺服系统'
  },
  IO: {
    key: 'IO',
    name: 'IO模块'
  },
  OutdoorIO: {
    key: 'OutdoorIO',
    name: '柜外IO模块'
  },
  Robot: {
    key: 'Robot',
    name: '机器人'
  }
};

// 导出到全局对象
if (typeof window !== 'undefined') {
  window.ProductTypes = ProductTypes;
  // 添加小写版本以保持向后兼容
  window.productTypes = ProductTypes;
}