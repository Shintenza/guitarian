use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct MessageHandlerController {
  token: CancellationToken,
}

impl MessageHandlerController {
  pub fn new(token: CancellationToken) -> Self {
    Self { token }
  }
  pub fn shut_down(&self) {
    self.token.cancel();
  }
}
