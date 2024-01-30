use std::{path::PathBuf, sync::Arc};

use serde::{Deserialize, Serialize};
use tokio::sync::{mpsc, RwLock};

use crate::compress::{index::ImageCompression, utils::dir::glob_dir};

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

#[tauri::command]
pub fn get_drag_files(files: Vec<String>, quality: i32) -> Vec<ImageCompression> {
    files
        .iter()
        .map(|file| {
            let path = PathBuf::from(file);
            let files = glob_dir("*.{png,webp,gif,jpg,jpeg}", path.to_str().unwrap()).unwrap();
            files
                .into_iter()
                .map(|file| ImageCompression::new(file, quality).unwrap())
                .collect::<Vec<ImageCompression>>()
        })
        .flat_map(|e| e.into_iter())
        .collect::<Vec<ImageCompression>>()
}

#[tauri::command]
pub async fn start_compress(info: ImageCompression) -> ImageCompression {
    let (tx, mut r) = mpsc::channel::<ImageCompression>(1);

    let arc_info = Arc::new(RwLock::new(info));
    let clone_info = Arc::clone(&arc_info);

    tokio::spawn(async move {
        let mut rw_info = clone_info.write().await;
        rw_info.start_mem_compress();

        tx.send(rw_info.to_owned()).await.unwrap();
    });

    r.recv().await.unwrap()
}
