use ::log::info;
use jack::{AsyncClient, AudioIn, AudioOut, Client, ClientOptions};
use ringbuf::{HeapRb, traits::*};
use std::env;

use crate::jack_client::audio_processor::AudioProcessor;
use crate::jack_client::notification_handler::NotificationHandler;
use crate::plugin_manager::audio_plugins::AudioCommand;
use crate::plugin_manager::manager::PluginManager;

struct AudioEngineInternals {
  client: Client,
  notification_handler: NotificationHandler,
  processor: AudioProcessor,
}

pub struct AudioEngine {
  internals: Option<AudioEngineInternals>,
  async_client: Option<AsyncClient<NotificationHandler, AudioProcessor>>,
  plugin_manager: PluginManager,
}

const DEFAULT_NAME_SERVER_NAME: &str = "guitarian";

impl AudioEngine {
  pub fn new() -> Self {
    let name =
      env::var("JACK_CLIENT_NAME").unwrap_or_else(|_| DEFAULT_NAME_SERVER_NAME.to_string());
    let (client, _status) = Client::new(&name, ClientOptions::default()).unwrap();

    let audio_in = client.register_port("in", AudioIn::default()).unwrap();
    let audio_out = client.register_port("out", AudioOut::default()).unwrap();

    let rb = HeapRb::<AudioCommand>::new(128);
    let (producer, consumer) = rb.split();

    let sample_rate = client.sample_rate();

    let plugin_manager = PluginManager::new(sample_rate, producer);
    let atom_seq_ports = plugin_manager.create_atom_seq_ports();

    let processor = AudioProcessor::new(audio_in, audio_out, atom_seq_ports, consumer);
    let notification_handler = NotificationHandler;

    let internals = AudioEngineInternals {
      client,
      processor,
      notification_handler,
    };

    Self {
      internals: Some(internals),
      async_client: None,
      plugin_manager,
    }
  }

  pub fn get_plugin_manager(&mut self) -> &mut PluginManager {
    &mut self.plugin_manager
  }

  pub fn run(&mut self) {
    let internals = self.internals.take().expect("failed to obtain internals");
    let pending_client = internals.client;
    let pending_processor = internals.processor;
    let pending_notification_handler = internals.notification_handler;

    let async_client = pending_client
      .activate_async(pending_notification_handler, pending_processor)
      .unwrap();
    self.async_client = Some(async_client);

    info!("started jack client");
  }

  pub fn deactivate(&mut self) {
    let running_client = self.async_client.take();

    match running_client {
      Some(client) => {
        let (client, notification_handler, processor) = client
          .deactivate()
          .expect("failed to deactivate the client");
        self.internals = Some(AudioEngineInternals {
          client,
          notification_handler,
          processor,
        })
      }
      None => {}
    }
  }
}
