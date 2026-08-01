build::compile() {
  local repo_root="$1"

  if ! command -v cargo >/dev/null 2>&1; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
    source "$HOME/.cargo/env"
  fi

  (cd "$repo_root" && cargo build --release --bin audio_engine --bin server)
}

build::install_binaries() {
  local repo_root="$1" install_dir="$2" owner="$3"

  install -d -m 755 "$install_dir/bin"
  install -m 755 "$repo_root/target/release/audio_engine" "$install_dir/bin/audio_engine"
  install -m 755 "$repo_root/target/release/server" "$install_dir/bin/server"
  chown -R "$owner:$owner" "$install_dir"
}

build::write_manual_env() {
  local repo_root="$1" install_dir="$2"

  {
    grep -v '^\s*#' "$repo_root/.env.example"
    grep -v '^\s*#' "$repo_root/audio_engine/.env.example"
  } >"$install_dir/bin/.env"
}
