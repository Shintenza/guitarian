mod jack_client;
mod message_handler;
mod plugin_manager;
mod utils;

use ringbuf::{HeapRb, traits::*};

use crate::{
  jack_client::client::AudioEngine,
  message_handler::message_handler::MessageHandler,
  plugin_manager::{
    manager::PluginManager,
    types::{AudioCommand, PluginGarbage},
  },
};

#[tokio::main]
async fn main() {
  dotenvy::from_filename("./.env").ok();
  dotenvy::from_filename("../.env").ok();

  env_logger::init();

  let rb = HeapRb::<AudioCommand>::new(128);
  let (producer, consumer) = rb.split();

  let garbage_rb = HeapRb::<PluginGarbage>::new(128);
  let (garbage_producer, garbage_consumer) = garbage_rb.split();

  let audio_engine = AudioEngine::new(consumer, garbage_producer);
  let sample_rate = audio_engine.sample_rate();

  let plugin_manager = PluginManager::new(sample_rate, producer, garbage_consumer);
  let mut message_handler = MessageHandler::new(audio_engine, plugin_manager);

  let message_handler_conroller = message_handler.get_controller();

  ctrlc::set_handler(move || {
    message_handler_conroller.shut_down();
  })
  .expect("failed setting SIGINT handler");

  message_handler.listen().await;
}
