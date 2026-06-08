/**
 * 省份 3D 下钻统一配置
 * 每增加一个省份下钻只需在此添加一条配置 + 提供城市数据和 GeoJSON
 */
import {
  guangdongCities, jiangsuCities, zhejiangCities, shandongCities,
  henanCities, sichuanCities, hubeiCities, hunanCities, hebeiCities,
  fujianCities, anhuiCities, liaoningCities, shaanxiCities, jiangxiCities,
  guangxiCities, yunnanCities, guizhouCities, shanxiCities, heilongjiangCities,
  jilinCities, gansuCities, xinjiangCities, innerMongoliaCities, hainanCities
} from '../mock/provinceCityData.js'

export const PROVINCE_DRILLDOWN_CONFIG = {
  '广东省': {
    adcode: '440000',
    mapName: 'guangdong',
    levelKey: 'guangdong',
    viewControl: { distance: 160, alpha: 75, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: guangdongCities
  },
  '江苏省': {
    adcode: '320000',
    mapName: 'jiangsu',
    levelKey: 'jiangsu',
    viewControl: { distance: 150, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: jiangsuCities
  },
  '浙江省': {
    adcode: '330000',
    mapName: 'zhejiang',
    levelKey: 'zhejiang',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: zhejiangCities
  },
  '山东省': {
    adcode: '370000',
    mapName: 'shandong',
    levelKey: 'shandong',
    viewControl: { distance: 155, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: shandongCities
  },
  '河南省': {
    adcode: '410000',
    mapName: 'henan',
    levelKey: 'henan',
    viewControl: { distance: 155, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: henanCities
  },
  '四川省': {
    adcode: '510000',
    mapName: 'sichuan',
    levelKey: 'sichuan',
    viewControl: { distance: 165, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: sichuanCities
  },
  '湖北省': {
    adcode: '420000',
    mapName: 'hubei',
    levelKey: 'hubei',
    viewControl: { distance: 150, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: hubeiCities
  },
  '湖南省': {
    adcode: '430000',
    mapName: 'hunan',
    levelKey: 'hunan',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: hunanCities
  },
  '河北省': {
    adcode: '130000',
    mapName: 'hebei',
    levelKey: 'hebei',
    viewControl: { distance: 150, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: hebeiCities
  },
  '福建省': {
    adcode: '350000',
    mapName: 'fujian',
    levelKey: 'fujian',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: fujianCities
  },
  '安徽省': {
    adcode: '340000',
    mapName: 'anhui',
    levelKey: 'anhui',
    viewControl: { distance: 150, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: anhuiCities
  },
  '辽宁省': {
    adcode: '210000',
    mapName: 'liaoning',
    levelKey: 'liaoning',
    viewControl: { distance: 155, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: liaoningCities
  },
  '陕西省': {
    adcode: '610000',
    mapName: 'shaanxi',
    levelKey: 'shaanxi',
    viewControl: { distance: 160, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: shaanxiCities
  },
  '江西省': {
    adcode: '360000',
    mapName: 'jiangxi',
    levelKey: 'jiangxi',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: jiangxiCities
  },
  '广西壮族自治区': {
    adcode: '450000',
    mapName: 'guangxi',
    levelKey: 'guangxi',
    viewControl: { distance: 150, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: guangxiCities
  },
  '云南省': {
    adcode: '530000',
    mapName: 'yunnan',
    levelKey: 'yunnan',
    viewControl: { distance: 160, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: yunnanCities
  },
  '贵州省': {
    adcode: '520000',
    mapName: 'guizhou',
    levelKey: 'guizhou',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: guizhouCities
  },
  '山西省': {
    adcode: '140000',
    mapName: 'shanxi',
    levelKey: 'shanxi',
    viewControl: { distance: 155, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: shanxiCities
  },
  '黑龙江省': {
    adcode: '230000',
    mapName: 'heilongjiang',
    levelKey: 'heilongjiang',
    viewControl: { distance: 170, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: heilongjiangCities
  },
  '吉林省': {
    adcode: '220000',
    mapName: 'jilin',
    levelKey: 'jilin',
    viewControl: { distance: 145, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: jilinCities
  },
  '甘肃省': {
    adcode: '620000',
    mapName: 'gansu',
    levelKey: 'gansu',
    viewControl: { distance: 160, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: gansuCities
  },
  '新疆维吾尔自治区': {
    adcode: '650000',
    mapName: 'xinjiang',
    levelKey: 'xinjiang',
    viewControl: { distance: 185, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: xinjiangCities
  },
  '内蒙古自治区': {
    adcode: '150000',
    mapName: 'innerMongolia',
    levelKey: 'innerMongolia',
    viewControl: { distance: 185, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: innerMongoliaCities
  },
  '海南省': {
    adcode: '460000',
    mapName: 'hainan',
    levelKey: 'hainan',
    viewControl: { distance: 130, alpha: 72, beta: 0, center: [0, 0, 0] },
    regionHeight: 2.6,
    cities: hainanCities
  }
}

/** 根据省份名获取下钻配置，未配置下钻的省份返回 null */
export function getDrillConfig(provinceName) {
  return PROVINCE_DRILLDOWN_CONFIG[provinceName] || null
}
