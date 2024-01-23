use tauri::{CustomMenuItem, Menu, Submenu};

pub fn create_custom_menu() -> Submenu {
    let close = CustomMenuItem::new("close".to_string(), "关闭窗口");
    let quit = CustomMenuItem::new("quit".to_string(), "退出程序");

    let submenu_customer: Submenu =
        Submenu::new("自定义", Menu::new().add_item(close).add_item(quit));

    submenu_customer
}
