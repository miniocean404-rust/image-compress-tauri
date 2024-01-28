// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;

use image_compress_tauri::{
    __cmd__close_splashscreen, __cmd__get_drag_files,
    utils::log::tracing::init_tracing,
    window::command::{custom::close_splashscreen, drag::get_drag_files},
    window::{
        menu::{event::menu_event, index::get_menu},
        setup::setup,
        tray::index::{create_sys_tray, system_tray_event},
    },
};

fn main() -> Result<(), Box<dyn Error>> {
    let _guard = init_tracing()?;

    tauri::Builder::default()
        .setup(setup)
        .system_tray(create_sys_tray())
        .on_system_tray_event(system_tray_event)
        // 注册命令、方法
        .invoke_handler(tauri::generate_handler![close_splashscreen, get_drag_files])
        // 添加菜单
        .menu(get_menu())
        // 监听自定义菜单事件
        .on_menu_event(menu_event())
        .run(tauri::generate_context!())
        .expect("运行 tauri 应用程序时出错");

    Ok(())
}
