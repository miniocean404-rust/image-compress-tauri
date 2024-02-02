// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, error::Error};

use image_compress_tauri::{
    __cmd__close_splashscreen, __cmd__get_drag_files, __cmd__start_compress,
    window::command::{
        drag::{get_drag_files, start_compress},
        splash::close_splashscreen,
    },
    window::{
        menu::{event::menu_event, index::get_menu},
        setup::setup,
        tray::index::{create_sys_tray, system_tray_event},
    },
};
use tracing::warn;

fn main() -> Result<(), Box<dyn Error>> {
    let num = num_cpus::get();
    println!("num: {}", num);

    let rt = tokio::runtime::Builder::new_multi_thread()
        .thread_name("image-compress-tauri-async")
        // 开启所有特性
        .enable_all()
        // 监听线程停止
        .on_thread_stop(async_thread_stop)
        // 构建 runtime
        .build()?;

    // 等价于 #[tokio::main()]
    rt.block_on(async_main())?;

    Ok(())
}

async fn async_main() -> Result<(), Box<dyn Error>> {
    tauri::Builder::default()
        // 定义安装 hook
        .setup(setup)
        .system_tray(create_sys_tray())
        .on_system_tray_event(system_tray_event)
        // 注册命令、方法
        .invoke_handler(tauri::generate_handler![close_splashscreen, get_drag_files, start_compress])
        // 添加菜单
        .menu(get_menu())
        // 监听自定义菜单事件
        .on_menu_event(menu_event())
        .run(tauri::generate_context!())
        .expect("运行 tauri 应用程序时出错");

    Ok(())
}

fn async_thread_stop() {
    warn!("异步线程停止了");
}
