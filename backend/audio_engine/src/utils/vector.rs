#[derive(Debug)]
pub enum MoveError {
  NotFound,
  InvalidTargetIndex,
}

pub fn move_item<T, F>(
  items: &mut Vec<T>,
  target_index: usize,
  predicate: F,
) -> Result<(), MoveError>
where
  F: Fn(&T) -> bool,
{
  let len = items.len();

  if target_index >= len {
    return Err(MoveError::InvalidTargetIndex);
  }

  let current_index = items
    .iter()
    .position(predicate)
    .ok_or(MoveError::NotFound)?;

  let item = items.remove(current_index);

  items.insert(target_index, item);

  Ok(())
}
