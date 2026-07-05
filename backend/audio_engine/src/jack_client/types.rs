use std::collections::HashSet;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ConnectionsState {
  pub connected_to_input: Option<String>,
  pub connected_to_output: HashSet<String>,
}

#[derive(Clone)]
pub struct EnginePortsNames {
  pub input: String,
  pub output: String,
}
