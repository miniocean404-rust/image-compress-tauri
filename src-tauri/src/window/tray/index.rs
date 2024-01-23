use tauri::{SystemTray, SystemTrayMenu};

pub fn create_sys_tray() -> SystemTray {
    let tray_menu = SystemTrayMenu::new();

    SystemTray::new().with_menu(tray_menu)
}
