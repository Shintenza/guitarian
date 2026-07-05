use serde::Deserialize;

#[derive(Deserialize)]
pub struct ConnectPortsRequest {
  pub input_device_port: String,
  pub output_devices: Vec<String>,
}
