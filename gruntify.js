export function gruntify(config) {
  var gruntConfig = {
    parseFiles: true,
    customTests: [],
    devFile: '/PATH/TO/modernizr-dev.js',
    outputFile: '/PATH/TO/modernizr-output.js',
    extensibility: config.options,
    uglify: config.minify,
    tests: config['feature-detects'].map((test) => test.replace(/^test\//, ''))
  };

  return JSON.stringify(gruntConfig, 0, 2);
}
