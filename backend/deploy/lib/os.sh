os::require_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "must be run as root (try: sudo $0)" >&2
    exit 1
  fi
}

os::require_debian() {
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "this script only supports Debian-based systems (apt-get not found)" >&2
    exit 1
  fi
}
