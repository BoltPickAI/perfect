// 柜外IO模块数据 - 从Excel转换生成
const outdoorIoData = {
  "GS20系列": {
    "主站": {
      "GS20-ECT-8L": {
        "id": "GS20-ECT-8L",
        "model": "GS20-ECT-8L",
        "description": "ECT转8路10-Link主站, 支持16路DIO, CLASSA,IP67 (合金外壳)",
        "price": 0
      },
      "GS20-PN-8L": {
        "id": "GS20-PN-8L",
        "model": "GS20-PN-8L",
        "description": "PN转8路10-Link主站, 支持16路DIO, CLASSA, IP67 (合金外壳)",
        "price": 0
      },
      "GS20-EIP-8L": {
        "id": "GS20-EIP-8L",
        "model": "GS20-EIP-8L",
        "description": "EIP转8路10-Link主站, 支持16路DIO, CLASSA,IP67 (合金外壳)",
        "price": 0
      }
    },
    "数字量从站": {
      "GS20-16EMNL": {
        "id": "GS20-16EMNL",
        "model": "GS20-16EMNL",
        "description": "16路DIO可配置从站, NPN, IP67 (合金外壳)",
        "price": 0
      },
      "GS20-16EMPL": {
        "id": "GS20-16EMPL",
        "model": "GS20-16EMPL",
        "description": "16路DIO可配置从站, PNP, IP67 (合金外壳)",
        "price": 0
      },
      "GR20-16EMNL": {
        "id": "GR20-16EMNL",
        "model": "GR20-16EMNL",
        "description": "16路DIO可配置从站, NPN(IP20)",
        "price": 0
      },
      "GR20-16EMPL": {
        "id": "GR20-16EMPL",
        "model": "GR20-16EMPL",
        "description": "16路DIO可配置从站, PNP (IP20)",
        "price": 0
      },
      "GS20-16EMNL-S": {
        "id": "GS20-16EMNL-S",
        "model": "GS20-16EMNL-S",
        "description": "小体积16路DIO可配置从站, NPN, IP67 (PPE外壳)",
        "price": 0
      },
      "GS20-16EMPL-S": {
        "id": "GS20-16EMPL-S",
        "model": "GS20-16EMPL-S",
        "description": "小体积16路DIO可配置从站, PNP, IP67 (PPE外壳)",
        "price": 0
      }
    },
    "级联数字量从站": {
      "GS20-IOL-16EMPHC": {
        "id": "GS20-IOL-16EMPHC",
        "model": "GS20-IOL-16EMPHC",
        "description": "小体积16路DIO可配置从站, PNP, IP67可级联 (PPE外壳)",
        "price": 0
      },
      "GS20-IOL-16EMNHC": {
        "id": "GS20-IOL-16EMNHC",
        "model": "GS20-IOL-16EMNHC",
        "description": "小体积16路DIO可配置从站, NPN, IP67可级联 (PPE外壳)",
        "price": 0
      }
    },
    "模拟量": {
      "GS20-IOL-8ADH": {
        "id": "GS20-IOL-8ADH",
        "model": "GS20-IOL-8ADH",
        "description": "8路电流/电压输入可配置, IP67 (PPE外壳)",
        "price": 0
      },
      "GS20-IOL-12ENP2DAH": {
        "id": "GS20-IOL-12ENP2DAH",
        "model": "GS20-IOL-12ENP2DAH",
        "description": "小体积, 12路DIO可配置从站, PNP, 2路电流/电压输出, IP67",
        "price": 0
      }
    }
  }
};

// 柜外IO模块类型定义
const outdoorIoModuleType = {
  name: '柜外IO模块',
  params: ['输入点数', '输出点数', '电压等级', '通讯接口', '防护等级'],
  displayParams: ['型号', '输入点数', '输出点数', '价格']
};

// 导出到全局对象
if (typeof window !== 'undefined') {
  window.outdoorIoData = outdoorIoData;
  window.outdoorIoModuleType = outdoorIoModuleType;
}

// 同时保留CommonJS模块导出，供Node.js使用
if (typeof module !== 'undefined') {
  module.exports = { outdoorIoData, outdoorIoModuleType };
}
