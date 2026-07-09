use axum::{Json, extract::State};
use axum_extra::extract::Query;
use shared::data::{PluginFilters, PluginQuery};

use crate::{
  context::AppContext,
  engine_client::commands::{GetAvailablePlugins, RequestCommandError},
  models::dto::plugins::{ListPluginsQuery, ListPluginsResponse},
};

pub async fn list_plugins(
  State(ctx): State<AppContext>,
  Query(query): Query<ListPluginsQuery>,
) -> Result<Json<ListPluginsResponse>, RequestCommandError> {
  let query = PluginQuery {
    filters: Some(PluginFilters {
      name: query.name,
      class: query.class,
      uri: query.uri,
    }),
    ..Default::default()
  };
  let plugins = ctx
    .engine_client
    .send_request(GetAvailablePlugins { query })
    .await?;

  let plugins_response = ListPluginsResponse { plugins };
  Ok(Json(plugins_response))
}
