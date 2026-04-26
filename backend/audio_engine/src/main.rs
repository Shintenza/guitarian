mod jack_client;
mod plugin_manager;

use std::sync::{Arc, atomic::AtomicBool, atomic::Ordering};

use crate::jack_client::client::AudioEngine;

fn main() {
  dotenvy::dotenv().ok();
  env_logger::init();

  let running = Arc::new(AtomicBool::new(true));
  let mut audio_engine = AudioEngine::new();
  let running_clone = running.clone();

  ctrlc::set_handler(move || {
    running_clone.store(false, Ordering::Relaxed);
  })
  .expect("failed setting SIGINT handler");

  audio_engine.run();

  while running.load(Ordering::Relaxed) {
    // TODO listen for external commands
  }
  audio_engine.deactivate();
}
