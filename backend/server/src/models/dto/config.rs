use serde::{Deserialize, Serialize};
use shared::data::BufferSize;

#[derive(Serialize)]
pub struct CurrentEngineConfigResponse {
  pub sample_rate: u32,
  pub buffer_size: u32,
  pub available_buffer_sizes: Vec<BufferSize>,
}

#[derive(Deserialize)]
pub struct SetBufferSizeRequest {
  pub buffer_size: BufferSize,
}
