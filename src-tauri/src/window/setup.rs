use std::error::Error;

use tauri::App;

pub fn setup(_app: &mut App) -> Result<(), Box<dyn Error>> {
    // let _docs_window = tauri::WindowBuilder::new(app, "external", tauri::WindowUrl::External("https://tauri.app/".parse()?)).build()?;
    // let _local_window = tauri::WindowBuilder::new(app, "local", tauri::WindowUrl::App("splash.html".into())).build()?;

    Ok(())
}
