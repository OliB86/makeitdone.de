"""Schreibt die fertig aufgebaute Seite als normales HTML in <div id="app">.

Warum: Die Seiten werden im Browser aus einer Vorlage (<template id="tpl">) aufgebaut.
Google führt das Skript aus, viele KI-Dienste lesen aber nur den Quelltext. Mit diesem
Skript steht der Text direkt im HTML. dc-lite übernimmt die vorhandenen Elemente beim
Laden (morph), Besucher sehen also dasselbe wie vorher.

Aufruf (aus dem Repo-Ordner):  python3 tools/prerender.py entwurf/c
Nach jeder Textänderung an einer Seite und vor dem Livegang erneut ausführen.
"""
import functools, http.server, pathlib, re, sys, threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FOLDER = sys.argv[1] if len(sys.argv) > 1 else "entwurf/c"
SKIP = {"vorschau-aussagen.html"}
# Nur dc-lite und die Seitenlogik laufen lassen, keine Effekte, Tracking oder Formulare.
BLOCK = re.compile(r"/(effects|c-flow|c-aussagen|c-reviews|c-faq|c-tracking|c-story|lead|cursor)\.js")
APP = re.compile(r'<!--prerender-->\n<div id="app">.*?</div>\n<!--/prerender-->|<div id="app"></div>', re.S)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    pages = sorted(p for p in (ROOT / FOLDER).glob("*.html") if p.name not in SKIP)
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = br.new_context(viewport={"width": 1280, "height": 900}, java_script_enabled=True)
        ctx.route(BLOCK, lambda r: r.abort())
        ctx.route(re.compile(r"^https?://(?!127\.0\.0\.1)"), lambda r: r.abort())
        for p in pages:
            src = p.read_text(encoding="utf-8")
            if 'id="tpl"' not in src or '<div id="app">' not in src:
                print("übersprungen", p.name)
                continue
            # Vorher vorgerenderten Inhalt entfernen, damit die Vorlage frisch aufgebaut wird.
            clean = APP.sub('<div id="app"></div>', src, count=1)
            p.write_text(clean, encoding="utf-8")
            page = ctx.new_page()
            page.goto(f"http://127.0.0.1:{port}/{p.relative_to(ROOT).as_posix()}", wait_until="load")
            page.wait_for_function("document.getElementById('app').children.length > 0", timeout=10000)
            page.wait_for_timeout(300)
            inner = page.evaluate("document.getElementById('app').innerHTML")
            page.close()
            if "{{" in inner:
                print("WARNUNG: Platzhalter übrig in", p.name)
            out = APP.sub(lambda m: '<!--prerender-->\n<div id="app">' + inner + '</div>\n<!--/prerender-->', clean, count=1)
            p.write_text(out, encoding="utf-8")
            text = re.sub(r"<[^>]+>", " ", re.sub(r"<(style|script)[^>]*>.*?</\1>", " ", inner, flags=re.S))
            print(f"{p.name}: {len(text.split())} Wörter")
        br.close()
    srv.shutdown()


if __name__ == "__main__":
    main()
