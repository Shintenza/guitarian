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
