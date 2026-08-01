avahi::install() {
  local template_dir="$1"
  local port="${BIND_ADDRESS##*:}"

  tmpl::render "$template_dir/avahi-guitarian.service" /etc/avahi/services/guitarian.service \
    "PORT=$port"

  systemctl enable --now avahi-daemon
}
