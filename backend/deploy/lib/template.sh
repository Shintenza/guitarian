tmpl::render() {
  local template="$1" dest="$2"
  shift 2

  local content
  content="$(cat "$template")"

  local kv key value
  for kv in "$@"; do
    key="${kv%%=*}"
    value="${kv#*=}"
    content="${content//@@${key}@@/${value}}"
  done

  printf '%s\n' "$content" >"$dest"
}
