use axum::{Router, extract::State, routing::get};
use shared::commands::{GetAvailablePlugins, RequestCommandError};

use crate::engine_client::engine_clinet::EngineClinet;

mod engine_client;

#[derive(Clone)]
pub struct Context {
  pub engine_client: EngineClinet
}

async fn get_plugins_handler(State(ctx): State<Context>) -> String {
    // We access the audio_engine through the context and use our strongly-typed command!
    match ctx.engine_client.send_request_command(GetAvailablePlugins).await {
        Ok(plugins) => {
          let plugins_len = plugins.len();
          println!("RECEIVED PLUGINS!!!! {}", plugins_len);
        },
        Err(err) => {match err {
          RequestCommandError::DataFormatError => {
            println!("DATA ERROR");
          } 
          RequestCommandError::ConnectionError => {
            println!("CONNECTION");
          }
        }
        },
    }
    "this is a test".to_string()
}

#[tokio::main]
async fn main() {
  dotenvy::from_filename("./.env").ok();
  dotenvy::from_filename("../.env").ok();

  let mut engine_client = EngineClinet::new();
  engine_client.connect().await;

  let context = Context {
    engine_client
  };

  let app = Router::new().route("/plugins", get(get_plugins_handler)).with_state(context);

  let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
