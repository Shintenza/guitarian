use std::sync::{Arc, Mutex};

use jack::{Client, Control, Port, Unowned};

use crate::jack_client::{
  types::{ConnectionsState, EnginePortsNames},
  utils::save_connections_state,
};

pub struct NotificationHandler {
  state: Arc<Mutex<ConnectionsState>>,
  port_names: EnginePortsNames,
}

impl NotificationHandler {
  pub fn new(port_names: EnginePortsNames, state: Arc<Mutex<ConnectionsState>>) -> Self {
    Self { port_names, state }
  }
}

impl jack::NotificationHandler for NotificationHandler {
  fn ports_connected(
    &mut self,
    client: &Client,
    port_id_a: jack::PortId,
    port_id_b: jack::PortId,
    are_connected: bool,
  ) {
    let Some(port_a) = client.port_by_id(port_id_a) else {
      return;
    };

    let Some(port_b) = client.port_by_id(port_id_b) else {
      return;
    };

    let is_a_ours = client.is_mine(&port_a);
    let is_b_ours = client.is_mine(&port_b);

    if !is_a_ours && !is_b_ours {
      return;
    }

    if let Some(mut locked_state) = self.state.lock().ok() {
      let mut update_set = |our_port: &Port<Unowned>, other_port: &Port<Unowned>| {
        let our_name = our_port.name().unwrap_or_default();
        let other_name = other_port.name().unwrap_or_default();

        if our_name == self.port_names.input {
          if are_connected {
            locked_state.connected_to_input = Some(other_name);
          } else {
            locked_state.connected_to_input = None
          }
        } else if our_name == self.port_names.output {
          if are_connected {
            locked_state.connected_to_output.insert(other_name);
          } else {
            locked_state.connected_to_output.remove(&other_name);
          }
        }
      };
      if is_a_ours {
        update_set(&port_a, &port_b)
      }
      if is_b_ours {
        update_set(&port_b, &port_a);
      }

      save_connections_state(&locked_state);
    }
  }

  fn xrun(&mut self, _: &Client) -> Control {
    log::warn!("xrun occured");

    Control::Continue
  }
}
