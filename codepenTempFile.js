export function codepenTempFile(data) {
  return `<!doctype html>
                <html>
                  <head>
                    <meta name="referrer" content="no-referrer" />
                    <title>redirecting...</title>
                  </head>
                  <body>
                    <form method="post" action="https://codepen.io/pen/define" id="form">
                      <input type="hidden" id="data" name="data" id="data" value=` + escape(JSON.stringify(data)) + `/>
                    </form>
                    <script>
                    var input = document.getElementById('data');
                    input.value = (unescape(input.value));
                    document.getElementById("form").submit()</script>
                  </body>
                </html>`
}
