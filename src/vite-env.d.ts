/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 百度统计 site id；不设置则不加载脚本。只在官方部署时注入。 */
  readonly VITE_BAIDU_SITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
