"""Regenerate the OpenAPI schema whenever a backend route or schema changes.

Pairs with frontend/watcher.js — the schema written by this watcher triggers
the frontend client regeneration. End result: edit a Pydantic schema in the
backend, see typed frontend changes a couple of seconds later, no commit
required.
"""

import re
import subprocess
import time
from threading import Timer

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

WATCH_ROOT = "src"
TRIGGER_PATTERN = re.compile(r"(main\.py|router\.py|schemas\.py)$")
DEBOUNCE_SECONDS = 1.0


class SchemaRegenHandler(FileSystemEventHandler):
    def __init__(self) -> None:
        self._timer: Timer | None = None

    def on_modified(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return
        src_path = (
            event.src_path.decode()
            if isinstance(event.src_path, bytes)
            else event.src_path
        )
        if not TRIGGER_PATTERN.search(src_path):
            return
        if self._timer is not None:
            self._timer.cancel()
        self._timer = Timer(DEBOUNCE_SECONDS, self._regenerate, [src_path])
        self._timer.start()

    @staticmethod
    def _regenerate(src_path: str) -> None:
        print(f"[watcher] {src_path} changed — regenerating OpenAPI schema")
        result = subprocess.run(
            ["uv", "run", "python", "-m", "commands.generate_openapi_schema"],
            check=False,
        )
        if result.returncode != 0:
            print(f"[watcher] schema generation failed (exit {result.returncode})")


if __name__ == "__main__":
    observer = Observer()
    observer.schedule(SchemaRegenHandler(), WATCH_ROOT, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
