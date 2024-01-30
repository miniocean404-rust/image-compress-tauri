#![feature(c_unwind)]
#![allow(unused_attributes)]

use std::error::Error;
use std::ffi::c_void;

use std::fs::File;
use std::io::Write;
use std::panic::catch_unwind;
use std::{fs, mem, ptr};

use libc::free;
use mozjpeg_sys::*;

use super::common::{error_handler, error_message_handler, write_metadata};

pub fn to_mem(input: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let in_file = fs::read(input)?;

    unsafe { catch_unwind(|| -> Result<Vec<u8>, Box<dyn Error>> { lossless(in_file, false) }).expect("执行 jpeg_sys panic 了") }
}

pub fn to_file(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let out_buffer = to_mem(input)?;
    let mut out_file = File::create(output)?;
    out_file.write_all(&out_buffer)?;

    Ok(())
}

/// # Safety
pub unsafe fn lossless(mem: Vec<u8>, keep_metadata: bool) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // 创建压缩数据指针
    let mut decompress_info: jpeg_decompress_struct = mem::zeroed();
    let mut compress_info: jpeg_compress_struct = mem::zeroed();

    // 设置解压缩错图提示
    let mut decompress_err = mem::zeroed();
    decompress_info.common.err = jpeg_std_error(&mut decompress_err);
    (*decompress_info.common.err).error_exit = Some(error_handler);
    (*decompress_info.common.err).output_message = Some(error_message_handler);

    // 设置压缩错误提示
    let mut compress_err = mem::zeroed();
    compress_info.common.err = jpeg_std_error(&mut compress_err);
    (*compress_info.common.err).error_exit = Some(error_handler);
    (*compress_info.common.err).output_message = Some(error_message_handler);

    // 初始化压缩解压缩
    jpeg_create_decompress(&mut decompress_info);
    jpeg_create_compress(&mut compress_info);

    // 设置解压缩 vec 数据到 decompress_info
    jpeg_mem_src(&mut decompress_info, mem.as_ptr(), mem.len() as c_ulong);

    if keep_metadata {
        jpeg_save_markers(&mut decompress_info, 0xFE, 0xFFFF);
        for m in 0..16 {
            jpeg_save_markers(&mut decompress_info, 0xE0 + m, 0xFFFF);
        }
    }

    jpeg_read_header(&mut decompress_info, true as boolean);

    // 读取系数
    let src_coef_arrays = jpeg_read_coefficients(&mut decompress_info);
    jpeg_copy_critical_parameters(&decompress_info, &mut compress_info);
    let dst_coef_arrays = src_coef_arrays;

    // 设置优化编码
    compress_info.optimize_coding = i32::from(true);

    // 开始写入 buf 及系数
    let mut buf = ptr::null_mut();
    let mut buf_size = 0;
    jpeg_mem_dest(&mut compress_info, &mut buf, &mut buf_size);
    jpeg_write_coefficients(&mut compress_info, dst_coef_arrays);

    if keep_metadata {
        write_metadata(&mut decompress_info, &mut compress_info);
    }

    // 完成压缩
    jpeg_finish_compress(&mut compress_info);
    jpeg_destroy_compress(&mut compress_info);
    jpeg_finish_decompress(&mut decompress_info);
    jpeg_destroy_decompress(&mut decompress_info);

    let slice = std::slice::from_raw_parts(buf, buf_size as usize);

    let result = slice.to_vec();

    free(buf as *mut c_void);

    Ok(result)
}
