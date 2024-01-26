use std::error::Error;

use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

use crate::constant::error::TauriError;

pub fn create_sys_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏");

    let tray_menu = SystemTrayMenu::new()
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    let exec = || -> Result<(), Box<dyn Error>> {
        let window = app.get_window("main").ok_or(TauriError::NoWindow)?;

        match event {
            SystemTrayEvent::LeftClick { position: _, size: _, .. } => {
                if (cfg!(target_os = "windows")) {
                    if !window.is_visible()? {
                        window.show()?;
                        window.set_focus()?;
                    } else {
                        window.hide()?;
                    }
                }

                println!("左键点击了系统托盘");
            }
            SystemTrayEvent::RightClick { position: _, size: _, .. } => {
                println!("右键点击了系统托盘");
            }
            SystemTrayEvent::DoubleClick { position: _, size: _, .. } => {
                println!("双击了系统托盘");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                // app.tray_handle() 可以动态设置图片及修改菜单项描述字
                let menu_item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        window.hide()?;
                        menu_item_handle.set_title("hide")?
                    }
                    _ => {}
                }
            }
            _ => {}
        }
        Ok(())
    };

    exec().expect("执行系统托盘事件时出错");
}
