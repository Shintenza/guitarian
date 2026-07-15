use std::path::PathBuf;

pub fn append_suffix(path: &PathBuf, suffix: &str) -> Option<PathBuf> {
  let stem = path.file_stem()?.to_str()?;

  let new_name = match path.extension().and_then(|e| e.to_str()) {
    Some(ext) => format!("{}{}.{}", stem, suffix, ext),
    None => format!("{}{}", stem, suffix),
  };

  Some(path.with_file_name(new_name))
}
