use std::time::Duration;

use zeromq::{Socket, ZmqError};

const CONNECT_RETRY_INTERVAL: Duration = Duration::from_millis(250);
const CONNECT_RETRY_TIMEOUT: Duration = Duration::from_secs(30);

pub async fn connect_retrying<S: Socket>(socket: &mut S, endpoint: &str, label: &str) {
  let deadline = tokio::time::Instant::now() + CONNECT_RETRY_TIMEOUT;
  let mut waiting_logged = false;

  loop {
    match socket.connect(endpoint).await {
      Ok(()) => return,
      Err(ZmqError::Network(e)) if e.kind() == std::io::ErrorKind::NotFound => {
        if tokio::time::Instant::now() >= deadline {
          panic!("timed out waiting for the {label} socket to appear at {endpoint}");
        }
        if !waiting_logged {
          eprintln!("waiting for the {label} socket at {endpoint} to appear...");
          waiting_logged = true;
        }
        tokio::time::sleep(CONNECT_RETRY_INTERVAL).await;
      }
      Err(e) => panic!("failed to connect with the {label} socket: {e}"),
    }
  }
}

#[macro_export]
macro_rules! define_command {
    (
        $struct_name:ident { $field1:ident : $ftype1:ty $(, $field:ident : $ftype:ty )* $(,)? }
        => req: $req_variant:ident
        => res: $res_variant:ident($res_type:ty)
    ) => {
        pub struct $struct_name {
            pub $field1: $ftype1,
            $( pub $field: $ftype ),*
        }
        impl EngineCommand for $struct_name {
            type Response = $res_type;
            fn to_command(self) -> RequestCommand {
                RequestCommand::$req_variant( self.$field1 $(, self.$field)* )
            }
            fn extract_response(res: RequestCommandResponse) -> Option<Self::Response> {
                if let RequestCommandResponse::$res_variant(data) = res { Some(data) } else { None }
            }
        }
    };

    (
        $struct_name:ident {}
        => req: $req_variant:ident
        => res: $res_variant:ident($res_type:ty)
    ) => {
        pub struct $struct_name {}
        impl EngineCommand for $struct_name {
            type Response = $res_type;
            fn to_command(self) -> RequestCommand {
                RequestCommand::$req_variant
            }
            fn extract_response(res: RequestCommandResponse) -> Option<Self::Response> {
                if let RequestCommandResponse::$res_variant(data) = res { Some(data) } else { None }
            }
        }
    };

    (
        $struct_name:ident { $field1:ident : $ftype1:ty $(, $field:ident : $ftype:ty )* $(,)? }
        => req: $req_variant:ident
        => res: $res_variant:ident
    ) => {
        pub struct $struct_name {
            pub $field1: $ftype1,
            $( pub $field: $ftype ),*
        }
        impl EngineCommand for $struct_name {
            type Response = ();
            fn to_command(self) -> RequestCommand {
                RequestCommand::$req_variant( self.$field1 $(, self.$field)* )
            }
            fn extract_response(res: RequestCommandResponse) -> Option<Self::Response> {
                if let RequestCommandResponse::$res_variant = res { Some(()) } else { None }
            }
        }
    };

    (
        $struct_name:ident {}
        => req: $req_variant:ident
        => res: $res_variant:ident
    ) => {
        pub struct $struct_name {}
        impl EngineCommand for $struct_name {
            type Response = ();
            fn to_command(self) -> RequestCommand {
                RequestCommand::$req_variant
            }
            fn extract_response(res: RequestCommandResponse) -> Option<Self::Response> {
                if let RequestCommandResponse::$res_variant = res { Some(()) } else { None }
            }
        }
    };
}
