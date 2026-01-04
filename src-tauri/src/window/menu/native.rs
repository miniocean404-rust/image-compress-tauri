// Tauri v2 中 Menu API 已完全重写
// 原 native menu 功能已移除，如需使用请参考新 API

// 旧参考: 创建原生菜单
// 参考: https://tauri.app/learn/window-menu/
// use tauri::{Menu, MenuItem, Submenu};

// pub fn create_native_menu() -> Submenu {
//     Submenu::new(
//         "标题",
//         Menu::new()
//             .add_native_item(MenuItem::Copy)
//             .add_native_item(MenuItem::Paste)
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Zoom)
//             .add_native_item(MenuItem::Separator)
//             .add_native_item(MenuItem::Hide)
//             .add_native_item(MenuItem::CloseWindow)
//             .add_native_item(MenuItem::Quit),
//     )
// }
