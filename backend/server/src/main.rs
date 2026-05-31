use std::sync::Arc;

use axum::Router;

use crate::{context::AppContextInner, engine_client::engine_clinet::EngineClient};

mod api;
mod context;
mod engine_client;

pub mod models;
pub mod core;

#[tokio::main]
async fn main() {
  dotenvy::from_filename("./.env").ok();
  dotenvy::from_filename("../.env").ok();

  let mut engine_client = EngineClient::new();
  engine_client.connect().await;

  let context = AppContextInner { engine_client };

  let app = Router::new()
    .merge(api::router())
    .with_state(Arc::new(context));

  let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
  axum::serve(listener, app).await.unwrap();
}
