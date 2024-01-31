use tauri::Menu;

// use super::{custom::create_custom_menu, native::create_native_menu};

pub fn get_menu() -> Menu {
    Menu::new()
    // .add_submenu(create_native_menu())
    // .add_submenu(create_custom_menu())
}
