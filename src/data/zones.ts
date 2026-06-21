import type { ZoneConfig } from '@/types';

export const zones: ZoneConfig[] = [
  {
    id: 'baking',
    name: '烘焙间',
    description: '配备专业烘焙设备，适合制作面包、蛋糕、饼干等西点',
    equipment: [
      '嵌入式烤箱',
      '立式厨师机',
      '面包发酵箱',
      '电子秤',
      '烘焙工具套装',
      '冰箱冷藏区',
    ],
    capacity: 6,
    icon: 'chefHat',
    gradient: 'from-amber-400 via-orange-500 to-terracotta-500',
  },
  {
    id: 'cooking',
    name: '蒸煮间',
    description: '中式厨房配置，适合日常烹饪、聚餐宴会、传统点心制作',
    equipment: [
      '多头燃气灶',
      '大容量蒸箱',
      '智能电饭煲',
      '中式炒锅套装',
      '不锈钢操作台',
      '储物柜',
    ],
    capacity: 8,
    icon: 'cookingPot',
    gradient: 'from-emerald-400 via-green-500 to-olive-600',
  },
  {
    id: 'cleaning',
    name: '清洗区',
    description: '大容量水槽和专业消毒柜，适用于大量餐具清洗与消毒',
    equipment: [
      '三槽洗碗机',
      '高温消毒柜',
      '垃圾处理器',
      '高压水龙头',
      '沥水架',
      '清洁用品柜',
    ],
    capacity: 4,
    icon: 'sparkles',
    gradient: 'from-sky-400 via-cyan-500 to-blue-500',
  },
];

export const getZoneConfig = (id: string): ZoneConfig | undefined => {
  return zones.find(z => z.id === id);
};
