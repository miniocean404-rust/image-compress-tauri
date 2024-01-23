use tracing::info;

#[tauri::command]
pub fn get_drag_files(files: Vec<&str>) {
    print!("get_drag_files: {:?}", files);
    info!("get_drag_files: {:?}", files);
}
