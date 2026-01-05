use std::error::Error;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

use crate::shared::error::TauriError;

pub fn setup_tray(app: &mut App) -> Result<(), Box<dyn Error>> {
    let show = MenuItem::with_id(app, "show", "显示", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?;
    let close = MenuItem::with_id(app, "close", "关闭", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    let menu = if cfg!(target_os = "macos") {
        let separator2 = PredefinedMenuItem::separator(app)?;
        Menu::with_items(app, &[&show, &separator, &hide, &close, &separator2, &quit])?
    } else {
        Menu::with_items(app, &[&hide, &close, &separator, &quit])?
    };

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| {
            let exec = || -> Result<(), Box<dyn Error + Send + Sync>> {
                let window = app.get_webview_window("main").ok_or(TauriError::NoWindow)?;

                match event.id.as_ref() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        window.show()?;
                        window.set_focus()?;
                    }
                    "hide" => {
                        window.hide()?;
                        // Tauri v2 中动态修改菜单项需要通过 app.menu() 或保存菜单项引用
                        // 这里简化处理，如需动态修改标题可以使用 MenuItemExt trait
                    }
                    "close" => {
                        window.close()?;
                    }
                    _ => {}
                }
                Ok(())
            };

            exec().expect("执行托盘菜单事件时出错");
        })
        .on_tray_icon_event(|tray, event| {
            let exec = || -> Result<(), Box<dyn Error + Send + Sync>> {
                let app = tray.app_handle();
                let window = app.get_webview_window("main").ok_or(TauriError::NoWindow)?;

                match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        let is_minimized = window.is_minimized()?;
                        if window.is_visible()? && window.is_focused()? && !is_minimized {
                            window.hide()?;
                        } else {
                            if is_minimized {
                                window.unminimize()?;
                            }
                            window.show()?;
                            window.set_focus()?;
                        }
                        println!("左键点击了系统托盘");
                    }
                    TrayIconEvent::Click {
                        button: MouseButton::Right,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        println!("右键点击了系统托盘");
                    }
                    TrayIconEvent::DoubleClick { .. } => {
                        println!("双击了系统托盘");
                    }
                    _ => {}
                }
                Ok(())
            };

            exec().expect("执行系统托盘事件时出错");
        })
        .build(app)?;

    Ok(())
}
