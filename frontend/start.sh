#!/usr/bin/env bash

set -euo pipefail

pnpm run dev &
DEV_PID=$!
node watcher.cjs &
WATCHER_PID=$!

terminate_tree() {
    local pid="$1"
    local signal="${2:-TERM}"
    local child

    while read -r child; do
        [ -n "$child" ] && terminate_tree "$child" "$signal"
    done < <(pgrep -P "$pid" 2>/dev/null || true)

    kill "-$signal" "$pid" 2>/dev/null || true
}

wait_for_exit() {
    local pid="$1"
    for _ in $(seq 1 30); do
        kill -0 "$pid" 2>/dev/null || return 0
        sleep 0.1
    done
    return 1
}

cleanup() {
    trap - INT TERM EXIT

    terminate_tree "$DEV_PID" TERM
    terminate_tree "$WATCHER_PID" TERM

    wait_for_exit "$DEV_PID" || terminate_tree "$DEV_PID" KILL
    wait_for_exit "$WATCHER_PID" || terminate_tree "$WATCHER_PID" KILL

    wait 2>/dev/null || true
}

trap cleanup EXIT
trap 'cleanup; exit 0' INT TERM
wait "$DEV_PID" "$WATCHER_PID"
