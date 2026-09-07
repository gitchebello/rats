# servidor do Rats! — igual ao http.server, mas PROIBINDO cache.
# Sem isso o navegador segura o index.html antigo e a versão nova não aparece.
import http.server, socketserver, sys

PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8123

class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORTA), SemCache) as s:
    print('Rats! em http://localhost:%d/index.html (sem cache)' % PORTA, flush=True)
    s.serve_forever()
