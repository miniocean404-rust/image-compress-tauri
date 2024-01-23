// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use image_compress_tauri::{
    __cmd__close_splashscreen, __cmd__greet,
    window::command::custom::{close_splashscreen, greet},
    window::menu::{event::menu_event, index::get_menu},
};

fn main() {
    tauri::Builder::default()
        // 注册命令、方法
        .invoke_handler(tauri::generate_handler![greet, close_splashscreen])
        // 添加菜单
        .menu(get_menu())
        // 监听自定义菜单事件
        .on_menu_event(menu_event())
        .run(tauri::generate_context!())
        .expect("运行 tauri 应用程序时出错");
}
