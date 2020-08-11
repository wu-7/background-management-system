module.exports = {
  configureWebpack:{
    resolve: {
      alias: {
        'assets': '@/assets',  // 已经先设置src为@
        'common': '@/common',
        'components': '@/components',
        'network': '@/network',
        'views': '@/views',
      }
    }
  }
}