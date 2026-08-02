services::user_systemctl() {
  local username="$1"
  shift
  runuser -l -s /bin/bash "$username" -c "XDG_RUNTIME_DIR=/run/user/\$(id -u) systemctl --user $*"
}

services::install() {
  local install_dir="$1" username="$2" home_dir="$3" template_dir="$4"
  local unit_dir="$home_dir/.config/systemd/user"

  install -d -m 755 -o "$username" -g "$username" "$unit_dir"

  tmpl::render "$template_dir/guitarian-audio-engine.service" "$unit_dir/guitarian-audio-engine.service" \
    "INSTALL_DIR=$install_dir" "JACK_CLIENT_NAME=$JACK_CLIENT_NAME" "RUST_LOG=$RUST_LOG"

  tmpl::render "$template_dir/guitarian-server.service" "$unit_dir/guitarian-server.service" \
    "INSTALL_DIR=$install_dir" "BIND_ADDRESS=$BIND_ADDRESS" "RUST_LOG=$RUST_LOG"

  chown "$username:$username" "$unit_dir"/*.service

  services::user_systemctl "$username" daemon-reload
}
