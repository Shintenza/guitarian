use std::thread;
use std::time::Duration;

use ringbuf::{HeapCons, traits::Consumer};

use crate::plugin_manager::types::PluginGarbage;

const POLL_INTERVAL_MS: u64 = 50;

pub struct PluginReaper;

impl PluginReaper {
  pub fn new(mut consumer: HeapCons<PluginGarbage>) -> Self {
    thread::spawn(move || {
      loop {
        while let Some(garbage) = consumer.try_pop() {
          drop(garbage);
        }
        thread::sleep(Duration::from_millis(POLL_INTERVAL_MS));
      }
    });

    Self
  }
}
