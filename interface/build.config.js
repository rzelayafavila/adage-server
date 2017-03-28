/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js',
          '!src/test_e2e/**/*.js', '!src/**/*.e2e.js' ],
    jsunit: [ 'src/**/*.spec.js' ],
    jse2e: [ 'src/test_e2e/**/*.js', 'src/**/*.e2e.js' ],

    coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],
    coffeeunit: [ 'src/**/*.spec.coffee' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    less: 'src/less/main.less'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'vendor/d3/d3.js',
      'vendor/vega/vega.js',
      'vendor/vega-lite/vega-lite.min.js',
      'vendor/vega-embed/vega-embed.min.js',
      'vendor/angular/angular.js',
      'vendor/ng-vega/dist/ng-vega.js',
      'vendor/angular-animate/angular-animate.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/angular-resource/angular-resource.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/ng-sortable/dist/ng-sortable.min.js',
      'vendor/angularjs-slider/dist/rzslider.min.js',
      'vendor/d3-tip/index.js',
      'node_modules/hclusterjs/hcluster.js',

      // Note: greenelab.stats.ttest.js and greenelab.stats.multtest.js are
      // generated via browserify.
      // Additionally, we use 'babel' (http://babeljs.io/) to transpile
      // greenelab.stats.ttest.js from ES6 to ES5 to fit with the rest of
      // our tools.
      'node_modules/ttest/greenelab.stats.ttest.js',
      'node_modules/multtest/greenelab.stats.multtest.js',

      'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js'
    ],
    css: [
      'vendor/angularjs-slider/dist/rzslider.min.css'
    ],
    assets: [
    ]
  },
};
