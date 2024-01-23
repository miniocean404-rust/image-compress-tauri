use tauri::WindowMenuEvent;

pub fn menu_event() -> impl Fn(WindowMenuEvent) + Send + Sync + 'static {
    |event: WindowMenuEvent| match event.menu_item_id() {
        "quit" => {
            std::process::exit(0);
        }
        "close" => {
            event.window().close().unwrap();
        }
        _ => {}
    }
}
