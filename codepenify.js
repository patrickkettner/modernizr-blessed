export function codepenify(detects, build) {
  var data = {
    title: 'modernizr.custom.js',
    description: 'This is generated via modernizr.com/download',
    html: '<h1>Modernizr build auto generated</h1><p><a href="https://modernizr.com#' + detects.join('-') + '">Build hash</a></p>',
    css: 'ul{-webkit-column-count: 3;-moz-column-count: 3;column-count: 3;}li{color:green}',
    js: build
  };

  data.html = '<ul>' +
    detects.map((detect) => {
      data.css += '.no-' + detect + ' li.'+ detect + '{ color: red; }';

      return '<li class="' + detect + '">' + detect + '</li>';
    }) +
    '</ul>';

  return JSON.stringify(data);
}
