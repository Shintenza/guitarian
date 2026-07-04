use axum::{Json, extract::State, http::StatusCode};
use axum_extra::extract::Query;
use shared::data::{PluginFilters, PluginQuery};

use crate::{
  context::AppContext,
  models::dto::plugins::{ListPluginsQuery, ListPluginsResponse},
};

pub async fn list_plugins(
  State(ctx): State<AppContext>,
  Query(query): Query<ListPluginsQuery>,
) -> Result<Json<ListPluginsResponse>, StatusCode> {
  let query = PluginQuery {
    filters: Some(PluginFilters {
      name: query.name,
      class: query.class,
      uri: query.uri,
    }),
    ..Default::default()
  };

  match ctx.engine_client.get_available_plugins(query).await {
    Ok(plugins) => {
      let _plugins_len = plugins.len();
      let plugins_response = ListPluginsResponse { plugins };
      Ok(Json(plugins_response))
    }
    Err(_e) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}
