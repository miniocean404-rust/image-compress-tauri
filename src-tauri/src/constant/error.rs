use std::io;

use thiserror::Error;

// 模拟从其他库中导入的错误类型

#[derive(Error, Debug)]
pub enum TauriError {
    #[error("没有获取窗口")]
    NoWindow,
}

#[derive(Error, Debug)]
pub enum WebpError {
    #[error("webp 解码错误")]
    DecodeError,

    #[error("webp 编码错误")]
    EncodeError,

    #[error("webp 压缩出错")]
    CompressError,

    #[error("webp io 写入错误")]
    WriteError(#[from] io::Error),
}
