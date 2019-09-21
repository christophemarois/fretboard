
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Fretboard Diagram Builder',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: '/js/mousetrap.min.js' },
      { async: true, defer: true, src: 'https://buttons.github.io/buttons.js' },
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: 'rgba(75, 71, 214, 1.0)' },
  /*
  ** Global CSS
  */
  css: [
    '~/static/css/spectre.min.css',
    '~/static/css/spectre-exp.min.css',
    '~/static/css/spectre-icons.min.css',
    '~/static/css/global.css',
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/analytics', ssr: false },
    { src: '~/plugins/shortkey', ssr: false },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  devModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },
  workbox: {
    offlineAssets: ['/css/global.css']
  },
  manifest: {
    name: 'Fretboard Diagram Builder',
    short_name: 'Fretboard',
    lang: 'en'
  },
  meta: {
    mobileAppIOS: true
  }
}
