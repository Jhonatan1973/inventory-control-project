
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/home"
  },
  {
    "renderMode": 2,
    "route": "/stock"
  },
  {
    "renderMode": 2,
    "route": "/register"
  },
  {
    "renderMode": 2,
    "route": "/config"
  },
  {
    "renderMode": 2,
    "route": "/user"
  },
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 962, hash: '6c2178f2d69b214e36c48529ad4e691ca4ae555ddce338847285e8b213b79562', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1475, hash: 'f636c800c7f70847e9d4a443a5e5c04d9a185c1ad6fbd0a85585478c3bb2b799', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'home/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'stock/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/stock_index_html.mjs').then(m => m.default)},
    'user/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/user_index_html.mjs').then(m => m.default)},
    'config/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/config_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 6535, hash: '707c62084b54f61b17458272b7e4c266f3b6ef068f7ddfe9886ed9021f08323a', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
