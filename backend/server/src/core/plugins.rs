use axum::{
  Json,
  extract::{State, WebSocketUpgrade, ws::WebSocket},
  http::StatusCode,
  response::Response,
};
use futures::stream::StreamExt;

use crate::{
  context::AppContext,
  engine_client::engine_clinet::EngineClient,
  models::dto::plugins::{AddPluginRequest, AddPluginResponse, ListPluginsResponse},
};

pub async fn list_plugins(
  State(ctx): State<AppContext>,
) -> Result<Json<ListPluginsResponse>, StatusCode> {
  match ctx.engine_client.get_available_plugins().await {
    Ok(plugins) => {
      let _plugins_len = plugins.len();
      let plugins_response = ListPluginsResponse { plugins };
      Ok(Json(plugins_response))
    }
    Err(_e) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}

pub async fn add_plugin(
  State(ctx): State<AppContext>,
  Json(payload): Json<AddPluginRequest>,
) -> Result<Json<AddPluginResponse>, StatusCode> {
  match ctx
    .engine_client
    .load_plugin(payload.plugin_uri, payload.position as usize)
    .await
  {
    Ok(plugin) => {
      let response = AddPluginResponse { plugin };
      Ok(Json(response))
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

    while let Some(event) = subscriber.recv().await {}
  });

  tokio::spawn(async move {});
}
