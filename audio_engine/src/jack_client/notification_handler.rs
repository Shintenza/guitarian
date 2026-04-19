use jack::{Client, Control};

pub struct NotificationHandler;

impl jack::NotificationHandler for NotificationHandler {
  fn xrun(&mut self, _: &Client) -> Control {
    log::warn!("xrun occured");

    Control::Continue
  }
}
