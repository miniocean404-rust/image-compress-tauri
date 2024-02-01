use oxipng::OutFile;
use serde::{Deserialize, Serialize};
use std::{
    any::Any,
    fs,
    future::Future,
    path::{Path, PathBuf},
    process::Output,
    sync::Arc,
};
use tokio::sync::{mpsc, RwLock};

use crate::{
    compress::{index::ImageCompression, utils::dir::glob_dir},
    shared::error::TauriError,
    utils::pool::TokioPool,
};

#[derive(Serialize, Deserialize)]
pub struct DragFiles {
    pub files: Vec<String>,
}

// !不知道为什么这么返回错误类型
#[tauri::command]
pub fn get_drag_files(files: Vec<String>, quality: i32) -> Result<Vec<ImageCompression>, TauriError> {
    let f = files
        .iter()
        .map(|file| {
            let metadata = fs::metadata(file).unwrap();

            if metadata.is_file() {
                let extension = Path::new(file).extension().and_then(|ext| ext.to_str()).unwrap();

                match extension {
                    "webp" | "png" | "gif" | "jpg" | "jpeg" => Some(vec![ImageCompression::new(file.to_string(), quality).unwrap_or_default()]),
                    _ => None,
                }
                .unwrap()
            } else {
                let path = PathBuf::from(file);
                let files = glob_dir("*.{png,webp,gif,jpg,jpeg}", path.to_str().unwrap()).unwrap();
                files
                    .into_iter()
                    .map(|file| ImageCompression::new(file, quality).unwrap())
                    .collect::<Vec<ImageCompression>>()
            }
        })
        .flat_map(|e| e.into_iter())
        .collect::<Vec<ImageCompression>>();

    Ok(f)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn start_compress(info: ImageCompression, is_cover: bool) -> Result<ImageCompression, TauriError> {
    let (tx, mut r) = mpsc::channel::<ImageCompression>(1);

    let arc_info = Arc::new(RwLock::new(info));
    let clone_info = Arc::clone(&arc_info);

    // 添加任务池
    // let mut pool = TokioPool::new(20);
    // let t = async {};
    // pool.start_task(vec![t]).await;

    tokio::spawn(async move {
        let mut rw_info = clone_info.write().await;
        rw_info.start_mem_compress(is_cover).await.unwrap();
        tx.send(rw_info.to_owned()).await.unwrap();
    });

    r.recv().await.ok_or(TauriError::NoValue)
}
