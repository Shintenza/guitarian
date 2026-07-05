use std::collections::HashSet;

pub enum PortType {
  Input,
  Output,
}

/* Returns vector of unique ports. Output ports of the same devices (e.g audio interfaces)
* are considered unique, however left/right ports of input ports (e.g headphones)
* belong to the same device */
pub fn extract_unique_ports(ports: Vec<String>, port_type: PortType) -> Vec<String> {
  let mut set: HashSet<String> = HashSet::new();

  for port in ports {
    match port_type {
      PortType::Output => {
        if let Some((base, port_name)) = port.split_once(':') {
          let full_name = format!("{base}:{port_name}");
          set.insert(full_name);
        }
      }
      PortType::Input => {
        if let Some((base, _)) = port.split_once(":") {
          set.insert(base.to_string());
        }
      }
    }
  }

  set.into_iter().collect()
}
