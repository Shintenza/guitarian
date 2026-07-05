use std::collections::HashSet;

use bincode::{Decode, Encode};
use serde::{Deserialize, Serialize};
use strum::EnumString;

#[derive(Decode, Encode, Serialize, Deserialize)]
pub enum ControlType {
  Continuous,
  Integer,
  Toggled,
  Enumeration,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct ScalePoint {
  pub label: String,
  pub value: i32,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct ControlMetadata {
  pub id: u16,
  pub name: String,
  pub default_value: f32,
  pub min_value: f32,
  pub max_value: f32,
  pub control_type: ControlType,
  pub scale_points: Vec<ScalePoint>,
}

#[derive(Decode, Encode, Serialize, Deserialize, EnumString, PartialEq)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum PluginClass {
  Simulator,
  Amplifier,
  Distortion,
  Eq,
  Chorus,
  Modulator,
  Compressor,
  Delay,
  PitchShifter,
  Expander,
  Flanger,
  Filter,
  Reverb,
  Phaser,
  Envelope,
  Gate,
  Utility,
  Other,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct PluginMetadata {
  pub name: String,
  pub uri: String,
  pub class: PluginClass,
  pub controls_metadata: Vec<ControlMetadata>,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct ControlState {
  pub id: u16,
  pub value: f32,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct ChainItem {
  pub id: u16,
  pub metadata: PluginMetadata,
  pub controls_state: Vec<ControlState>,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct PresetItem {
  pub plugin_uri: String,
  pub controls_state: Vec<ControlState>,
}

#[derive(Encode, Decode, Serialize, Deserialize)]
pub struct PluginFilters {
  pub name: Option<String>,
  pub class: Option<Vec<PluginClass>>,
  pub uri: Option<Vec<String>>,
}

#[derive(Encode, Decode, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct PluginQuery {
  pub filters: Option<PluginFilters>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Default, Encode, Decode)]
pub struct AudioConnections {
  pub input: Option<String>,
  pub outputs: Vec<String>,
}

#[derive(Serialize, Deserialize, Encode, Decode, Debug, Clone, Default)]
pub struct AvailableAudioDevices {
  pub input_ports: Vec<String>,
  pub output_devices: Vec<String>,
}
