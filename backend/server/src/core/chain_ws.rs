use axum::{
  extract::{
    State, WebSocketUpgrade,
    ws::{Message, WebSocket},
  },
  response::Response,
};
use futures::{SinkExt, stream::StreamExt};

use crate::{
  context::AppContext, engine_client::engine_clinet::EngineClient,
  models::dto::plugins::WebSocketClientMessage,
};

pub async fn handle_ws_request(ws: WebSocketUpgrade, State(ctx): State<AppContext>) -> Response {
  ws.on_upgrade(move |socket| ws_hanlder(socket, ctx))
}

pub async fn ws_hanlder(socket: WebSocket, ctx: AppContext) {
  let mut subscriber = EngineClient::get_engine_subbscriber();

  let (mut ws_tx, mut ws_rx) = socket.split();

  tokio::spawn(async move {
    subscriber.subscribe().await;

    while let Some(event) = subscriber.recv().await {
      if let Ok(json_string) = serde_json::to_string(&event) {
        ws_tx.send(Message::Text(json_string.into())).await.ok();
      }
    }
  });

  tokio::spawn(async move {
    while let Some(result) = ws_rx.next().await {
      let message = match result {
        Ok(msg) => msg,
        Err(e) => {
          eprintln!("Lost socket connection! {}", e);
          break;
        }
      };

      let text = match message {
        Message::Text(t) => t,
        Message::Close(_cf) => {
          println!("Socket closed!");
          break;
        }
        _ => continue,
      };

      let parsed_msg = match serde_json::from_str::<WebSocketClientMessage>(&text) {
        Ok(msg) => msg,
        Err(e) => {
          eprintln!("failed to parse JSON {}", e);
          continue;
        }
      };

      match parsed_msg {
        WebSocketClientMessage::SetParam {
          plugin_id,
          port_id,
          value,
        } => {
          ctx
            .engine_client
            .set_plugin_param(plugin_id, port_id, value)
            .await;
        }
      }
    }
  });
}
