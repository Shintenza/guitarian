pkg::install() {
  local list_file="$1"
  local packages=()
  local line

  while IFS= read -r line; do
    line="${line%%#*}"
    line="$(echo "$line" | xargs)"
    [[ -z "$line" ]] && continue
    packages+=("$line")
  done <"$list_file"

  apt-get update
  apt-get install -y "${packages[@]}"
}
