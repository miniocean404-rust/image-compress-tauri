use std::{fs, path::PathBuf};

use serde::{Deserialize, Serialize};
use tracing::error;

use crate::constant::error::OptionError;

use super::{
    core::{png::lossless_png_mem, webp::compress_to_mem},
    utils::mime::{get_filetype_from_path, SupportedFileTypes},
};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImageCompression {
    pub name: String,

    pub state: CompressState,

    #[serde(default)]
    pub path: String,

    #[serde(default)]
    pub mem: Vec<u8>,

    #[serde(default)]
    pub r#type: SupportedFileTypes,

    #[serde(default)]
    pub quality: i8,

    // serialize 把 before_size 序列化为 origin | deserialize 把 origin 反序列化为 before_size
    #[serde(default, rename(serialize = "origin", deserialize = "origin"))]
    pub before_size: u64,

    #[serde(default, rename(serialize = "compress", deserialize = "compress"))]
    pub after_size: usize,

    #[serde(default)]
    pub rate: i8,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")] // 序列化枚举为小写字符串
pub enum CompressState {
    #[default]
    Compressing,
    Done,
}

impl ImageCompression {
    pub fn new(path: String, quality: i8) -> Result<Self, Box<dyn std::error::Error>> {
        let file_type = get_filetype_from_path(&path);

        let path_buf = PathBuf::from(&path);
        let file_name = path_buf.file_name().ok_or(OptionError::NoValue)?.to_string_lossy().to_string();

        let before_size = fs::metadata(&path_buf)?.len();

        Ok(Self {
            name: file_name,
            r#type: file_type,
            quality,
            before_size,
            path,
            // 没有初始化的字段使用默认值
            ..Default::default()
        })
    }

    pub fn start_mem_compress(&mut self) {
        self.state = CompressState::Done;

        match self.r#type {
            SupportedFileTypes::Jpeg => todo!(),
            SupportedFileTypes::Png => {
                self.mem = lossless_png_mem(&self.path).unwrap();
            }
            SupportedFileTypes::WebP => {
                self.mem = compress_to_mem(&self.path).unwrap();
            }
            SupportedFileTypes::Gif => todo!(),
            SupportedFileTypes::Unknown => {
                error!("不支持的类型")
            }
        }
    }
}
