use libc::{c_ulong, free};
use mozjpeg_sys::{
    boolean, c_void, jpeg_compress_struct, jpeg_create_compress, jpeg_create_decompress, jpeg_decompress_struct, jpeg_destroy_compress,
    jpeg_destroy_decompress, jpeg_finish_compress, jpeg_finish_decompress, jpeg_mem_dest, jpeg_mem_src, jpeg_read_header, jpeg_read_scanlines,
    jpeg_save_markers, jpeg_set_defaults, jpeg_set_quality, jpeg_start_compress, jpeg_start_decompress, jpeg_std_error, jpeg_write_scanlines, J_DCT_METHOD,
};
use std::fs;
use std::fs::File;
use std::mem;
use std::panic::catch_unwind;
use std::{error::Error, io::Write};

use super::common::{error_handler, error_message_handler, set_chroma_subsampling, write_metadata, ChromaSubsampling};

pub fn to_mem(input: &str, quality: i32) -> Result<Vec<u8>, Box<dyn Error>> {
    let in_file = fs::read(input)?;

    unsafe {
        catch_unwind(|| -> Result<Vec<u8>, Box<dyn Error>> { lossy(in_file, false, quality, ChromaSubsampling::CS420) }).expect("执行 jpeg_sys panic 了")
    }
}

pub fn to_file(input: &str, output: &str, quality: i32) -> Result<(), Box<dyn std::error::Error>> {
    let out_buffer = to_mem(input, quality)?;
    let mut out_file = File::create(output)?;
    out_file.write_all(&out_buffer)?;

    Ok(())
}

/// # Safety
pub unsafe fn lossy(mem: Vec<u8>, keep_metadata: bool, quality: i32, chroma_subsampling: ChromaSubsampling) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
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

    // 将图片解压缩给 decompress_info
    jpeg_mem_src(&mut decompress_info, mem.as_ptr(), mem.len() as c_ulong);

    if keep_metadata {
        jpeg_save_markers(&mut decompress_info, 0xFE, 0xFFFF);
        for m in 0..16 {
            jpeg_save_markers(&mut decompress_info, 0xE0 + m, 0xFFFF);
        }
    }

    jpeg_read_header(&mut decompress_info, true as boolean);

    // 设置解压缩图片信息
    let width = decompress_info.image_width;
    let height = decompress_info.image_height;
    let color_space = decompress_info.jpeg_color_space;
    decompress_info.out_color_space = color_space;

    // 解释解码图片
    jpeg_start_decompress(&mut decompress_info);
    // output_components 代表颜色类型
    let row_stride = decompress_info.image_width as usize * decompress_info.output_components as usize;
    let buffer_size = row_stride * decompress_info.image_height as usize;
    let mut buffer = vec![0u8; buffer_size];

    // 开始扫描图片信息给解压缩上
    while decompress_info.output_scanline < decompress_info.output_height {
        let offset = decompress_info.output_scanline as usize * row_stride;
        let mut jsamparray = [buffer[offset..].as_mut_ptr()];
        //Crash on very first call of this function on Android
        jpeg_read_scanlines(&mut decompress_info, jsamparray.as_mut_ptr(), 1);
    }

    let input_components = match color_space {
        mozjpeg_sys::J_COLOR_SPACE::JCS_GRAYSCALE => 1,
        mozjpeg_sys::J_COLOR_SPACE::JCS_RGB => 3,
        mozjpeg_sys::J_COLOR_SPACE::JCS_YCbCr => 3,
        mozjpeg_sys::J_COLOR_SPACE::JCS_CMYK => 4,
        mozjpeg_sys::J_COLOR_SPACE::JCS_YCCK => 4,
        mozjpeg_sys::J_COLOR_SPACE::JCS_EXT_RGBA => 4,
        _ => 3,
    };

    // 设置压缩信息
    let mut buf_size = 0;
    let mut buf = mem::zeroed();
    jpeg_mem_dest(&mut compress_info, &mut buf, &mut buf_size);

    compress_info.image_width = width;
    compress_info.image_height = height;
    compress_info.in_color_space = color_space;
    compress_info.input_components = input_components;

    // 设置压缩信息为默认值
    jpeg_set_defaults(&mut compress_info);

    // Chroma subsampling 是一种在数字图像和视频压缩中使用的技术。它涉及到减少颜色信息的采样率，以便在保持相对较高的图像质量的同时降低数据量。
    // 这种技术通常用于视频编解码和存储中，以降低文件大小并提高传输效率。Chroma subsampling 通常使用 4:4:4、4:2:2 和 4:2:0 等比例来描述不同的采样方式。
    if input_components == 3 && chroma_subsampling != ChromaSubsampling::Auto {
        set_chroma_subsampling(chroma_subsampling, &mut compress_info);
    }

    let row_stride = compress_info.image_width as usize * compress_info.input_components as usize;
    compress_info.dct_method = J_DCT_METHOD::JDCT_ISLOW;
    compress_info.optimize_coding = i32::from(true);

    jpeg_set_quality(&mut compress_info, quality, false as boolean);

    jpeg_start_compress(&mut compress_info, true as boolean);

    if keep_metadata {
        write_metadata(&mut decompress_info, &mut compress_info);
    }

    while compress_info.next_scanline < compress_info.image_height {
        let offset = compress_info.next_scanline as usize * row_stride as usize;
        let jsamparray = [buffer[offset..].as_ptr()];
        jpeg_write_scanlines(&mut compress_info, jsamparray.as_ptr(), 1);
    }

    jpeg_finish_decompress(&mut decompress_info);
    jpeg_destroy_decompress(&mut decompress_info);
    jpeg_finish_compress(&mut compress_info);
    jpeg_destroy_compress(&mut compress_info);

    let slice = std::slice::from_raw_parts(buf, buf_size.try_into()?);

    let result = slice.to_vec();

    free(buf as *mut c_void);

    Ok(result)
}
