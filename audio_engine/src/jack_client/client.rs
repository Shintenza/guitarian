use ::log::info;
use ctrlc;
use jack::{AudioIn, AudioOut, Client, ClientOptions};
use std::env;
use std::sync::mpsc::channel;

use crate::jack_client::audio_processor::AudioProcessor;
use crate::jack_client::notification_handler::NotificationHandler;

pub struct AudioEngine {
  client: Client,
  processor: AudioProcessor,
  notification_handler: NotificationHandler,
}

const DEFAULT_NAME_SERVER_NAME: &str = "guitarian";

impl AudioEngine {
  pub fn new() -> Self {
    let name =
      env::var("JACK_CLIENT_NAME").unwrap_or_else(|_| DEFAULT_NAME_SERVER_NAME.to_string());
    let (client, _status) = Client::new(&name, ClientOptions::default()).unwrap();
    let audio_in = client.register_port("in", AudioIn::default()).unwrap();
    let audio_out = client.register_port("out", AudioOut::default()).unwrap();
    let sample_rate = client.sample_rate();

    let processor = AudioProcessor::new(audio_in, audio_out, sample_rate);
    let notification_handler = NotificationHandler;

    Self {
      client,
      processor,
      notification_handler,
    }
  }

  pub fn get_sample_rate(&self) -> u32 {
    self.client.sample_rate()
  }

  pub fn run(self) {
    let (tx, rx) = channel();
    let active_client = self
      .client
      .activate_async(self.notification_handler, self.processor)
      .unwrap();

    info!("started jack client");
    ctrlc::set_handler(move || tx.send(()).expect("Could not send signal on channel.")).ok();

    rx.recv().ok();

    if let Err(err) = active_client.deactivate() {
      info!("jack client deactivated");
      eprintln!("JACK exited with error: {err}");
    }
  }
}
