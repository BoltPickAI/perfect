// IO模块数据 - 从Excel转换生成
const ioData = {
  "GL20系列": {
    "耦合器": {
      "GL20-RTU-PN": {
        "id": "GL20-RTU-PN",
        "model": "GL20-RTU-PN",
        "description": "PROFINET 通信接口模块",
        "price": 0
      },
      "GL20-RTU-ECT32": {
        "id": "GL20-RTU-ECT32",
        "model": "GL20-RTU-ECT32",
        "description": "EtherCAT 通信接口模块(支持32个模块)",
        "price": 0
      },
      "GL20-RTU-EIP": {
        "id": "GL20-RTU-EIP",
        "model": "GL20-RTU-EIP",
        "description": "Ethernet/IP 通信接口模块",
        "price": 0
      }
    },
    "数字量模块": {
      "GL20-0016ETP": {
        "id": "GL20-0016ETP",
        "model": "GL20-0016ETP",
        "description": "16点数字量输出 (PNP)",
        "price": 0
      },
      "GL20-1600END": {
        "id": "GL20-1600END",
        "model": "GL20-1600END",
        "description": "16点数字量输入",
        "price": 0
      },
      "GL20-0016ETN": {
        "id": "GL20-0016ETN",
        "model": "GL20-0016ETN",
        "description": "16点数字量输出 (NPN)",
        "price": 0
      },
      "GL20-0800END": {
        "id": "GL20-0800END",
        "model": "GL20-0800END",
        "description": "8点数字量输入",
        "price": 0
      },
      "GL20-0800ENA": {
        "id": "GL20-0800ENA",
        "model": "GL20-0800ENA",
        "description": "8点数字量输入 (120VAC~230V AC)",
        "price": 0
      },
      "GL20-0008ETP": {
        "id": "GL20-0008ETP",
        "model": "GL20-0008ETP",
        "description": "8点数字量输出 (PNP)",
        "price": 0
      },
      "GL20-0008ETN": {
        "id": "GL20-0008ETN",
        "model": "GL20-0008ETN",
        "description": "8点数字量输出 (NPN)",
        "price": 0
      },
      "GL20-0808ETN": {
        "id": "GL20-0808ETN",
        "model": "GL20-0808ETN",
        "description": "8点数字量输入, 8点数字量输出 (NPN)",
        "price": 0
      },
      "GL20-0008ER": {
        "id": "GL20-0008ER",
        "model": "GL20-0008ER",
        "description": "8点继电器输出模块",
        "price": 0
      },
      "GL20-3232ETN-M": {
        "id": "GL20-3232ETN-M",
        "model": "GL20-3232ETN-M",
        "description": "32点数字量输入, 32点数字量输出 (NPN) 外引端子排接线",
        "price": 0
      },
      "GL20-3200END-M": {
        "id": "GL20-3200END-M",
        "model": "GL20-3200END-M",
        "description": "32点数字量输入外引端子排接线",
        "price": 0
      },
      "GL20-3200END": {
        "id": "GL20-3200END",
        "model": "GL20-3200END",
        "description": "32点数字量输入",
        "price": 0
      },
      "GL20-0032ETN-M": {
        "id": "GL20-0032ETN-M",
        "model": "GL20-0032ETN-M",
        "description": "32点数字量输出外引端子排接线",
        "price": 0
      },
      "GL20-0032ETN": {
        "id": "GL20-0032ETN",
        "model": "GL20-0032ETN",
        "description": "32点数字量输出 (NPN)",
        "price": 0
      },
      "GL20-0004ER": {
        "id": "GL20-0004ER",
        "model": "GL20-0004ER",
        "description": "4点继电器输出模块",
        "price": 0
      },
      "GL20-0404ETP-5V": {
        "id": "GL20-0404ETP-5V",
        "model": "GL20-0404ETP-5V",
        "description": "5V DC, 4点数字量输入, 4点数字量输出",
        "price": 0
      },
      "GL20-0004ETP-2A": {
        "id": "GL20-0004ETP-2A",
        "model": "GL20-0004ETP-2A",
        "description": "4点数字量输出, 每点 2A 大电流输出 (PNP)",
        "price": 0
      }
    },
    "模拟量模块": {
      "GL20-4AD": {
        "id": "GL20-4AD",
        "model": "GL20-4AD",
        "description": "4路模拟量输入 (采样周期 1ms/ 通道)",
        "price": 0
      },
      "GL20-4AD-DZ": {
        "id": "GL20-4AD-DZ",
        "model": "GL20-4AD-DZ",
        "description": "4路模拟量输入 (采样周期 60μs/ 通道)",
        "price": 0
      },
      "GL20-4AD-DFI": {
        "id": "GL20-4AD-DFI",
        "model": "GL20-4AD-DFI",
        "description": "4路模拟量输入 (差分型, 采样周期 1ms/ 通道)",
        "price": 0
      },
      "GL20-4DA": {
        "id": "GL20-4DA",
        "model": "GL20-4DA",
        "description": "4路模拟量输出",
        "price": 0
      },
      "GL20-8ADI": {
        "id": "GL20-8ADI",
        "model": "GL20-8ADI",
        "description": "8路电流型模拟量输入",
        "price": 0
      },
      "GL20-8ADV": {
        "id": "GL20-8ADV",
        "model": "GL20-8ADV",
        "description": "8路电压型模拟量输入",
        "price": 0
      },
      "GL20-8DAI": {
        "id": "GL20-8DAI",
        "model": "GL20-8DAI",
        "description": "8路电流型模拟量输出",
        "price": 0
      },
      "GL20-8DAV": {
        "id": "GL20-8DAV",
        "model": "GL20-8DAV",
        "description": "8路电压型模拟量输出",
        "price": 0
      }
    },
    "温度测量模块": {
      "GL20-4PT": {
        "id": "GL20-4PT",
        "model": "GL20-4PT",
        "description": "4路热电阻输入型",
        "price": 0
      },
      "GL20-4TC": {
        "id": "GL20-4TC",
        "model": "GL20-4TC",
        "description": "4路热电偶输入型",
        "price": 0
      },
      "GL20-4PT-ISO": {
        "id": "GL20-4PT-ISO",
        "model": "GL20-4PT-ISO",
        "description": "4路热电阻输入型, 隔离型",
        "price": 0
      },
      "GL20-4TC-ISO": {
        "id": "GL20-4TC-ISO",
        "model": "GL20-4TC-ISO",
        "description": "4路热电偶输入型, 隔离型",
        "price": 0
      },
      "GL20-8TC": {
        "id": "GL20-8TC",
        "model": "GL20-8TC",
        "description": "8路热电偶输入型",
        "price": 0
      }
    },
    "温控模块": {
      "GL20-8TC-PID": {
        "id": "GL20-8TC-PID",
        "model": "GL20-8TC-PID",
        "description": "8路集成PID算法热电偶输入型",
        "price": 0
      },
      "GL20-4LC-PID": {
        "id": "GL20-4LC-PID",
        "model": "GL20-4LC-PID",
        "description": "4路集成 PID算法热电阻/热电偶混合输入型",
        "price": 0
      }
    },
    "电源模块": {
      "GL20-PS2": {
        "id": "GL20-PS2",
        "model": "GL20-PS2",
        "description": "本地模块中继电源模块",
        "price": 0
      }
    },
    "等电位模块": {
      "GL20-16AUX-24V": {
        "id": "GL20-16AUX-24V",
        "model": "GL20-16AUX-24V",
        "description": "16路24V等电位模块",
        "price": 0
      },
      "GL20-16AUX-0V": {
        "id": "GL20-16AUX-0V",
        "model": "GL20-16AUX-0V",
        "description": "16路 0V 等电位模块",
        "price": 0
      },
      "GL20-0808AUX": {
        "id": "GL20-0808AUX",
        "model": "GL20-0808AUX",
        "description": "8路等电位模块",
        "price": 0
      }
    },
    "工艺模块": {
      "GL20-2SSI": {
        "id": "GL20-2SSI",
        "model": "GL20-2SSI",
        "description": "2路SSI通信",
        "price": 0
      },
      "GL20-2HC": {
        "id": "GL20-2HC",
        "model": "GL20-2HC",
        "description": "2路高速计数模块",
        "price": 0
      }
    },
    "通信模块": {
      "GL20-2S485": {
        "id": "GL20-2S485",
        "model": "GL20-2S485",
        "description": "2路485通信模块",
        "price": 0
      },
      "GL20-2S485-MDB": {
        "id": "GL20-2S485-MDB",
        "model": "GL20-2S485-MDB",
        "description": "2路485通信模块 (Modbus协议)",
        "price": 0
      },
      "GL20-2SCOM": {
        "id": "GL20-2SCOM",
        "model": "GL20-2SCOM",
        "description": "2路RS232/RS485/RS422通信模块",
        "price": 0
      },
      "GL20-2SCOM-MDB": {
        "id": "GL20-2SCOM-MDB",
        "model": "GL20-2SCOM-MDB",
        "description": "2路RS232/RS485/RS422通信模块 (Modbus 协议)",
        "price": 0
      },
      "GL20-1DNM": {
        "id": "GL20-1DNM",
        "model": "GL20-1DNM",
        "description": "1路 DeviceNet 主站通信模块",
        "price": 0
      },
      "GL20-2CAN": {
        "id": "GL20-2CAN",
        "model": "GL20-2CAN",
        "description": "2路 CAN 通信模块",
        "price": 0
      }
    }
  },
  "GL20S系列": {
    "数字量模块": {
      "GL20S-0016ETP": {
        "id": "GL20S-0016ETP",
        "model": "GL20S-0016ETP",
        "description": "16点数字量输出 (PNP)",
        "price": 0
      },
      "GL20S-1600END": {
        "id": "GL20S-1600END",
        "model": "GL20S-1600END",
        "description": "16点数字量输入",
        "price": 0
      },
      "GL20S-0016ETN": {
        "id": "GL20S-0016ETN",
        "model": "GL20S-0016ETN",
        "description": "16点数字量输出 (NPN)",
        "price": 0
      },
      "GL20S-0800END": {
        "id": "GL20S-0800END",
        "model": "GL20S-0800END",
        "description": "8点数字量输入",
        "price": 0
      },
      "GL20S-0008ETP": {
        "id": "GL20S-0008ETP",
        "model": "GL20S-0008ETP",
        "description": "8点数字量输出 (PNP)",
        "price": 0
      },
      "GL20S-0008ETN": {
        "id": "GL20S-0008ETN",
        "model": "GL20S-0008ETN",
        "description": "8点数字量输出 (NPN)",
        "price": 0
      },
      "GL20S-0808ETN": {
        "id": "GL20S-0808ETN",
        "model": "GL20S-0808ETN",
        "description": "8点数字量输入, 8点数字量输出 (NPN)",
        "price": 0
      },
      "GL20S-0008ER": {
        "id": "GL20S-0008ER",
        "model": "GL20S-0008ER",
        "description": "8点继电器输出模块",
        "price": 0
      },
      "GL20S-3232ETN-M": {
        "id": "GL20S-3232ETN-M",
        "model": "GL20S-3232ETN-M",
        "description": "32点数字量输入, 32点数字量输出 (NPN) 外引端子排接线",
        "price": 0
      },
      "GL20S-3200END-M": {
        "id": "GL20S-3200END-M",
        "model": "GL20S-3200END-M",
        "description": "32点数字量输入外引端子排接线",
        "price": 0
      },
      "GL20S-3200END": {
        "id": "GL20S-3200END",
        "model": "GL20S-3200END",
        "description": "32点数字量输入",
        "price": 0
      },
      "GL20S-0032ETN-M": {
        "id": "GL20S-0032ETN-M",
        "model": "GL20S-0032ETN-M",
        "description": "32点数字量输出外引端子排接线",
        "price": 0
      },
      "GL20S-0032ETN": {  
        "id": "GL20S-0032ETN",
        "model": "GL20S-0032ETN",
        "description": "32点数字量输出 (NPN)",
        "price": 0
      },
      "GL20S-0004ER": {
        "id": "GL20S-0004ER",
        "model": "GL20S-0004ER",
        "description": "4点继电器输出模块",
        "price": 0
      },
      "GL20S-0404ETP-5V": {
        "id": "GL20S-0404ETP-5V",
        "model": "GL20S-0404ETP-5V",
        "description": "5V DC, 4点数字量输入, 4点数字量输出",
        "price": 0
      },
      "GL20S-0004ETP-2A": {
        "id": "GL20S-0004ETP-2A",
        "model": "GL20S-0004ETP-2A",
        "description": "4点数字量输出, 每点 2A 大电流输出 (PNP)",
        "price": 0
      }
    },
    "模拟量模块": {
      "GL20S-4AD": {
        "id": "GL20S-4AD",
        "model": "GL20S-4AD",
        "description": "4路模拟量输入 (采样周期 1ms/ 通道)",
        "price": 0
      },
      "GL20S-4DA": {
        "id": "GL20S-4DA",
        "model": "GL20S-4DA",
        "description": "4路模拟量输出",
        "price": 0
      },
      "GL20S-8ADI": {
        "id": "GL20S-8ADI",
        "model": "GL20S-8ADI",
        "description": "8 路电流型模拟量输入",
        "price": 0
      },
      "GL20S-8ADV": {
        "id": "GL20S-8ADV",
        "model": "GL20S-8ADV",
        "description": "8路电压型模拟量输入",
        "price": 0
      },
      "GL20S-8DAI": {
        "id": "GL20S-8DAI",
        "model": "GL20S-8DAI",
        "description": "8 路电流型模拟量输出",
        "price": 0
      },
      "GL20S-8DAV": {
        "id": "GL20S-8DAV",
        "model": "GL20S-8DAV",
        "description": "8 路电压型模拟量输出",
        "price": 0
      }
    },
    "温度测量模块": {
      "GL20S-4PT": {
        "id": "GL20S-4PT",
        "model": "GL20S-4PT",
        "description": "4路热电阻输入型",
        "price": 0
      },
      "GL20S-4TC": {
        "id": "GL20S-4TC",
        "model": "GL20S-4TC",
        "description": "4 路热电偶输入型",
        "price": 0
      }
    },
    "电源模块": {
      "GL20S-PS2": {
        "id": "GL20S-PS2",
        "model": "GL20S-PS2",
        "description": "本地模块中继电源模块",
        "price": 0
      }
    }
  },
  "GR20T系列": {
    "数字量模块": {
      "GR20T-ECT-0808EMN": {
        "id": "GR20T-ECT-0808EMN",
        "model": "GR20T-ECT-0808EMN",
        "description": "8通道数字量输入8通道数字量输出可配置晶体管 NPN模块",
        "price": 0
      },
      "GR20T-ECT-1616EMN": {
        "id": "GR20T-ECT-1616EMN",
        "model": "GR20T-ECT-1616EMN",
        "description": "16通道数字量输入16点数字量输出可配置晶体管 NPN 模块",
        "price": 0
      },
      "GR20T-ECT-0808ETN": {
        "id": "GR20T-ECT-0808ETN",
        "model": "GR20T-ECT-0808ETN",
        "description": "8数字量输入8数字量输出晶体管NPN模块",
        "price": 0
      },
      "GR20T-ECT-1616ETN": {
        "id": "GR20T-ECT-1616ETN",
        "model": "GR20T-ECT-1616ETN",
        "description": "16点数字量输入16点数字量输出晶体管 NPN模块",
        "price": 0
      },
      "GR20T-ECT-1616EMN-E": {
        "id": "GR20T-ECT-1616EMN-E",
        "model": "GR20T-ECT-1616EMN-E",
        "description": "16 点数字量输入16 点数字量输出可配置晶体管 NPN 模块（ECON 接口，需要选配 ECON 端子）",
        "price": 0
      },
      "GR20T-ECT-1600END": {
        "id": "GR20T-ECT-1600END",
        "model": "GR20T-ECT-1600END",
        "description": "16 点数字量输入晶体管 NPN/PNP 模块",
        "price": 0
      },
      "GR20T-ECT-0016ETN": {
        "id": "GR20T-ECT-0016ETN",
        "model": "GR20T-ECT-0016ETN",
        "description": "16点数字量输出晶体管 NPN 模块",
        "price": 0
      },
      "GR20T-ECT-0016ETP": {
        "id": "GR20T-ECT-0016ETP",
        "model": "GR20T-ECT-0016ETP",
        "description": "16 点数字量输出晶体管 PNP 模块",
        "price": 0
      },
      "GR20T-ECT-3200END": {
        "id": "GR20T-ECT-3200END",
        "model": "GR20T-ECT-3200END",
        "description": "32点数字量输入晶体管 NPN/PNP模块",
        "price": 0
      },
      "GR20T-ECT-0032ETN": {
        "id": "GR20T-ECT-0032ETN",
        "model": "GR20T-ECT-0032ETN",
        "description": "32 点数字量输出晶体管 NPN 模块",
        "price": 0
      },
      "GR20T-ECT-0032ETP": {
        "id": "GR20T-ECT-0032ETP",
        "model": "GR20T-ECT-0032ETP",
        "description": "32点数字量输出晶体管 PNP 模块",
        "price": 0
      },
      "GR20T-ECT-0808EMNM8": {
        "id": "GR20T-ECT-0808EMNM8",
        "model": "GR20T-ECT-0808EMNM8",
        "description": "8 数字量输入 8 数字量输出可配置晶体管 NPN 模块（网口为 M8 航插接口，适合抗震动场景)",
        "price": 0
      },
      "GR20T-ECT-1616EMNM8": {
        "id": "GR20T-ECT-1616EMNM8",
        "model": "GR20T-ECT-1616EMNM8",
        "description": "16 点数字量输入 16 点数字量输出可配置晶体管 NPN 模块（网口为 M8 航插接口，适合抗震动场景)",
        "price": 0
      },
      "GR20T-ECT-0016ETNM8": {
        "id": "GR20T-ECT-0016ETNM8",
        "model": "GR20T-ECT-0016ETNM8",
        "description": "16点数字量输出晶体管 NPN 模块（网口为 M8 航插接口，适合抗震动场景)",
        "price": 0
      },
      "GR20T-ECT-0032ETNM8": {
        "id": "GR20T-ECT-0032ETNM8",
        "model": "GR20T-ECT-0032ETNM8",
        "description": "32点数字量输出晶体管 NPN 模块（网口为 M8 航插接口，适合抗震动场景)",
        "price": 0
      },
      "GR20T-ECTG-1616ETN": {
        "id": "GR20T-ECTG-1616ETN",
        "model": "GR20T-ECTG-1616ETN",
        "description": "16 路数字量输入 16 路数字量输出晶体管 NPN 模块(EtherCAT G 协议)",
        "price": 0
      }
    },
    "配件": {
      "GR20T-ECT-16P-FCZ": {
        "id": "GR20T-ECT-16P-FCZ",
        "model": "GR20T-ECT-16P-FCZ",
        "description": "GR20T 系列防尘罩,适用于16点系列模块",
        "price": 0
      },
      "GR20T-ECT-32P-FCZ": {
        "id": "GR20T-ECT-32P-FCZ",
        "model": "GR20T-ECT-32P-FCZ",
        "description": "GR20T 系列防尘罩,适用于32 点系列模块",
        "price": 0
      },
      "GR20T-ECT-16P-FCZB": {
        "id": "GR20T-ECT-16P-FCZB",
        "model": "GR20T-ECT-16P-FCZB",
        "description": "新款 GR20T 系列防尘罩,适用于16点系列模块(茶色外壳，橡胶塞出线)",
        "price": 0
      },
      "GR20T-ECT-32P-FCZB": {
        "id": "GR20T-ECT-32P-FCZB",
        "model": "GR20T-ECT-32P-FCZB",
        "description": "新款 GR20T 系列防尘罩，适用于 32 点系列模块（茶色外壳，橡胶塞出线)",
        "price": 0
      },
      "GR20T-ECT-32P-FCZB-RJ45": {
        "id": "GR20T-ECT-32P-FCZB-RJ45",
        "model": "GR20T-ECT-32P-FCZB-RJ45",
        "description": "新款 GR20T 系列防尘罩，适用于网口的 32 点系列模块（茶色外壳，橡胶塞出线)",
        "price": 0
      }
    }
  }
};

// 导出到全局对象
if (typeof window !== 'undefined') {
  window.ioData = ioData;
}

// IO模块类型定义
const ioModuleType = {
  name: 'IO模块',
  params: ['输入点数', '输出点数', '电压等级', '通讯接口', '防护等级'],
  displayParams: ['型号', '输入点数', '输出点数', '价格']
};

// 导出数据到全局作用域，供浏览器使用
if (typeof window !== 'undefined') {
  window.ioModuleType = ioModuleType;
}

// 同时保留CommonJS模块导出，供Node.js使用
if (typeof module !== 'undefined') {
  module.exports = { ioData, ioModuleType };
}