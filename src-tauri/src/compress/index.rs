use std::{fs, path::PathBuf};

use serde::{Deserialize, Serialize};
use tracing::error;

use crate::shared::error::OptionError;

use super::utils::mime::{get_filetype_from_path, SupportedFileTypes};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")] // 序列化枚举为小写字符串
pub enum CompressState {
    #[default]
    Compressing,
    Done,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ImageCompression {
    pub name: String,

    pub id: String,

    pub state: CompressState,

    #[serde(default)]
    pub path: String,

    #[serde(default)]
    pub mem: Vec<u8>,

    #[serde(default, rename(serialize = "type", deserialize = "type"))]
    pub file_type: SupportedFileTypes,

    #[serde(default)]
    pub quality: i8,

    // serialize 把 before_size 序列化为 origin | deserialize 把 origin 反序列化为 before_size    #[serde(default, rename(serialize = "origin", deserialize = "origin"))]
    #[serde(default, rename(serialize = "origin", deserialize = "origin"))]
    pub before_size: u64,

    #[serde(default, rename(serialize = "compress", deserialize = "compress"))]
    pub after_size: u64,

    // 浮点数转化为 json 传递必须是 f64 否则精度丢失
    #[serde(default)]
    pub rate: f64,
}

impl ImageCompression {
    pub fn new(path: String, quality: i8) -> Result<Self, Box<dyn std::error::Error>> {
        let file_type = get_filetype_from_path(&path);

        let path_buf = PathBuf::from(&path);
        let file_name = path_buf
            .file_name()
            .ok_or(OptionError::NoValue)?
            .to_string_lossy()
            .to_string();

        let before_size = fs::metadata(&path_buf)?.len();

        let id = uuid::Uuid::new_v4().to_string();

        Ok(Self {
            name: file_name,
            file_type,
            quality,
            before_size,
            path,
            id,
            ..Default::default()
        })
    }

    /// Mock 压缩实现 - 模拟压缩效果
    pub async fn start_mem_compress(&mut self, is_cover: bool) -> Result<(), Box<dyn std::error::Error>> {
        self.state = CompressState::Done;

        match self.file_type {
            SupportedFileTypes::Unknown => {
                error!("不支持的类型");
                return Ok(());
            }
            _ => {
                // Mock: 读取原始文件作为压缩结果
                let file_data = fs::read(&self.path)?;
                self.mem = file_data;
            }
        };

        self.after_size = self.mem.len() as u64;

        let before_size = self.before_size as f64;
        let after_size = self.after_size as f64;

        // Mock: 模拟压缩率 (实际上没有压缩，rate 为 0)
        self.rate = (((before_size - after_size) / before_size) * 10000.0).round() / 100.0;

        if is_cover {
            // Mock: 不实际覆盖文件
            // let mut output_file = tokio::fs::File::create(&self.path).await?;
            // output_file.write_all(self.mem.as_slice()).await?;
        };

        Ok(())
    }
}
