#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"
DATA_DIR="$SCRIPT_DIR/data"
TEMPLATE_DIR="$DATA_DIR/templates"

for lib in os packages user build template services avahi; do
  source "$LIB_DIR/$lib.sh"
done

source "$REPO_ROOT/.env.example"
source "$REPO_ROOT/audio_engine/.env.example"

GUITARIAN_USER="guitarian"
GUITARIAN_HOME="/var/lib/guitarian"
INSTALL_DIR="/opt/guitarian"

os::require_root
os::require_debian

pkg::install "$DATA_DIR/packages.list"

user::create "$GUITARIAN_USER" "$GUITARIAN_HOME"
user::enable_linger "$GUITARIAN_USER"

build::compile "$REPO_ROOT"
build::install_binaries "$REPO_ROOT" "$INSTALL_DIR" "$GUITARIAN_USER"
build::write_manual_env "$REPO_ROOT" "$INSTALL_DIR"

services::install "$INSTALL_DIR" "$GUITARIAN_USER" "$GUITARIAN_HOME" "$TEMPLATE_DIR"
avahi::install "$TEMPLATE_DIR"

echo "guitarian installed."
echo "start it with:"
echo "  sudo -u $GUITARIAN_USER XDG_RUNTIME_DIR=/run/user/$(id -u "$GUITARIAN_USER") systemctl --user enable --now guitarian-audio-engine.service guitarian-server.service"
