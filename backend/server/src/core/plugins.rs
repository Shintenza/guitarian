use axum::{
  Json,
  extract::{State, WebSocketUpgrade, ws::WebSocket},
  http::StatusCode,
  response::Response,
};
use futures::stream::StreamExt;
use shared::commands::GetAvailablePlugins;

use crate::{
  context::AppContext, engine_client::engine_clinet::EngineClient,
  models::dto::plugins::ListPluginsResponse,
};

pub async fn list_plugins(
  State(ctx): State<AppContext>,
) -> Result<Json<ListPluginsResponse>, StatusCode> {
  match ctx
    .engine_client
    .send_request_command(GetAvailablePlugins)
    .await
  {
    Ok(plugins) => {
      let _plugins_len = plugins.len();
      let plugins_response = ListPluginsResponse { plugins };
      Ok(Json(plugins_response))
    }
    Err(_e) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}

pub async fn handle_ws_request(ws: WebSocketUpgrade, State(ctx): State<AppContext>) -> Response {
  ws.on_upgrade(move |socket| ws_hanlder(socket, ctx))
}

pub async fn ws_hanlder(mut socket: WebSocket, ctx: AppContext) {
  let mut subscriber = EngineClient::get_engine_subbscriber();

  let (mut ws_tx, mut ws_rx) = socket.split();

  tokio::spawn(async move {
    subscriber.subscribe().await;

    while let Some(event) = subscriber.recv().await {
        
    }
  });

  tokio::spawn(async move {});
}
