mod jack_client;

use crate::jack_client::client::AudioEngine;

fn main() {
  dotenvy::dotenv().ok();
  env_logger::init();

  let audio_engine = AudioEngine::new();

  audio_engine.run();
}
