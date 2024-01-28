use std::{fs, path::PathBuf};

use serde::{Deserialize, Serialize};

use crate::{
    constant::error::{OptionError, TauriError},
    utils::mime::{get_filetype_from_path, SupportedFileTypes},
};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImageCompression {
    pub name: String,

    pub state: CompressState,

    #[serde(default)]
    pub path: String,

    #[serde(default)]
    pub mem: Option<Vec<u8>>,

    #[serde(default)]
    pub r#type: SupportedFileTypes,

    #[serde(default)]
    pub quality: i8,

    #[serde(default, rename(serialize = "origin"))]
    pub before_size: u64,
    #[serde(default, rename(serialize = "compress"))]
    pub after_size: usize,

    #[serde(default)]
    pub rate: i8,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")] // 序列化枚举为小写字符串
pub enum CompressState {
    #[default]
    Ready,
    Compressing,
    Done,
}

impl ImageCompression {
    pub fn new(path: String, quality: i8) -> Self {
        let file_type = get_filetype_from_path(&path);

        let path_buf = PathBuf::from(&path);
        let file_name = path_buf.file_name().ok_or(OptionError::NoValue).unwrap().to_string_lossy().to_string();

        let before_size = fs::metadata(&path_buf).unwrap().len();

        Self {
            name: file_name,
            r#type: file_type,
            quality,
            before_size,
            path,
            // 没有初始化的字段使用默认值
            ..Default::default()
        }
    }
}
