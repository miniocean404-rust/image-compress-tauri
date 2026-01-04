// Tauri v2 中 Menu API 已完全重写
// 原 CustomMenuItem 已移除，使用 MenuItem::with_id 替代

// 旧参考: 创建自定义菜单
// 参考: https://tauri.app/learn/window-menu/
// use tauri::{CustomMenuItem, Menu, Submenu};

// pub fn create_custom_menu() -> Submenu {
//     let close = CustomMenuItem::new("close".to_string(), "关闭窗口");
//     let quit = CustomMenuItem::new("quit".to_string(), "退出程序");

//     let submenu_customer: Submenu = Submenu::new("自定义", Menu::new().add_item(close).add_item(quit));

//     submenu_customer
// }
