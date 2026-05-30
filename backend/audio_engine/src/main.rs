mod jack_client;
mod message_handler;
mod plugin_manager;

use std::sync::{Arc, atomic::AtomicBool, atomic::Ordering};

use crate::{jack_client::client::AudioEngine, message_handler::MessageHandler};

#[tokio::main]
async fn main() {
  dotenvy::from_filename("./.env").ok();
  dotenvy::from_filename("../.env").ok();

  env_logger::init();

  let mut audio_engine = AudioEngine::new();

  let plugin_manager = audio_engine
    .get_plugin_manager()
    .expect("failed to take the plugin_manager");
  let mut message_handler = MessageHandler::new(plugin_manager);

  ctrlc::set_handler(move || {
    message_handler.shut_down();
  })
  .expect("failed setting SIGINT handler");

  audio_engine.run();

  message_handler.listen().await;


  audio_engine.deactivate();
}
