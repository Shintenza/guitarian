use std::sync::Arc;

use crate::engine_client::engine_clinet::EngineClient;

pub type AppContext = Arc<AppContextInner>;

#[derive(Clone)]
pub struct AppContextInner {
  pub engine_client: EngineClient,
}
