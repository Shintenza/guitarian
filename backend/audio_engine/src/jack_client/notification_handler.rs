use jack::{Client, Control, Port, Unowned};

use crate::jack_client::{engine_settings::EngineSettings, types::EnginePortsNames};

pub struct NotificationHandler {
  engine_settings: EngineSettings,
  port_names: EnginePortsNames,
}

impl NotificationHandler {
  pub fn new(port_names: EnginePortsNames, engine_settings: EngineSettings) -> Self {
    Self {
      port_names,
      engine_settings,
    }
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

    self.engine_settings.mutate(|settings| {
      let mut update_set = |our_port: &Port<Unowned>, other_port: &Port<Unowned>| {
        let our_name = our_port.name().unwrap_or_default();
        let other_name = other_port.name().unwrap_or_default();

        if our_name == self.port_names.input {
          if are_connected {
            settings.connections_state.connected_to_input = Some(other_name);
          } else {
            settings.connections_state.connected_to_input = None
          }
        } else if our_name == self.port_names.output_l {
          if are_connected {
            settings
              .connections_state
              .connected_to_output_l
              .insert(other_name);
          } else {
            settings
              .connections_state
              .connected_to_output_l
              .remove(&other_name);
          }
        } else if our_name == self.port_names.output_r {
          if are_connected {
            settings
              .connections_state
              .connected_to_output_r
              .insert(other_name);
          } else {
            settings
              .connections_state
              .connected_to_output_r
              .remove(&other_name);
          }
        }
      };

      if is_a_ours {
        update_set(&port_a, &port_b);
      }
      if is_b_ours {
        update_set(&port_b, &port_a);
      }
    });
  }

  fn xrun(&mut self, _: &Client) -> Control {
    log::warn!("xrun occured");

    Control::Continue
  }
}
