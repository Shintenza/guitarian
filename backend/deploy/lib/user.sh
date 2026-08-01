user::create() {
  local username="$1" home_dir="$2"

  if id "$username" >/dev/null 2>&1; then
    return
  fi

  useradd \
    --system \
    --create-home \
    --home-dir "$home_dir" \
    --shell /usr/sbin/nologin \
    --groups audio \
    "$username"
}

user::enable_linger() {
  local username="$1"

  loginctl enable-linger "$username"
  systemctl start "user@$(id -u "$username").service"
}
