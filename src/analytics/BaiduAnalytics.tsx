import { useEffect } from 'react';

declare global {
  interface Window {
    _hmt?: unknown[];
  }
}

/**
 * 百度统计加载器。只在环境变量 VITE_BAIDU_SITE_ID 存在时注入脚本——
 *   - 官方 Vercel / GH Pages 部署：在平台 secrets 里设置变量 → 生效
 *   - 开源贡献者本地跑 / fork 部署：没设置 → 完全不加载脚本，数据不会
 *     混进原作者的统计账户
 */
export function BaiduAnalytics() {
  const siteId = import.meta.env.VITE_BAIDU_SITE_ID;

  useEffect(() => {
    if (!siteId || typeof window === 'undefined') return;
    // 幂等：避免热更新 / 重复 mount 时重复插脚本
    if (document.querySelector(`script[data-baidu-hm="${siteId}"]`)) return;

    window._hmt = window._hmt || [];
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://hm.baidu.com/hm.js?${siteId}`;
    s.setAttribute('data-baidu-hm', siteId);
    document.head.appendChild(s);
  }, [siteId]);

  return null;
}
