use std::mem;

use libc::free;
use mozjpeg_sys::{
    boolean, c_int, c_void, jpeg_compress_struct, jpeg_create_compress, jpeg_create_decompress, jpeg_decompress_struct, jpeg_destroy_compress,
    jpeg_destroy_decompress, jpeg_finish_compress, jpeg_finish_decompress, jpeg_mem_dest, jpeg_mem_src, jpeg_read_header, jpeg_read_scanlines,
    jpeg_save_markers, jpeg_set_defaults, jpeg_set_quality, jpeg_start_compress, jpeg_start_decompress, jpeg_std_error, jpeg_write_scanlines, J_DCT_METHOD,
};

use super::common::{error_handler, error_message_handler, set_chroma_subsampling, write_metadata, ChromaSubsampling, Props};

/// # Safety
pub unsafe fn lossy(mem: Vec<u8>, props: &Props) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut decompress_info: jpeg_decompress_struct = mem::zeroed();
    let mut compress_info: jpeg_compress_struct = mem::zeroed();

    let mut decompress_err = mem::zeroed();
    decompress_info.common.err = jpeg_std_error(&mut decompress_err);
    (*decompress_info.common.err).error_exit = Some(error_handler);
    (*decompress_info.common.err).output_message = Some(error_message_handler);

    let mut compress_err = mem::zeroed();
    compress_info.common.err = jpeg_std_error(&mut compress_err);
    (*compress_info.common.err).error_exit = Some(error_handler);
    (*compress_info.common.err).output_message = Some(error_message_handler);

    jpeg_create_decompress(&mut decompress_info);
    jpeg_create_compress(&mut compress_info);

    jpeg_mem_src(&mut decompress_info, mem.as_ptr(), mem.len() as _);

    if props.keep_metadata {
        jpeg_save_markers(&mut decompress_info, 0xFE, 0xFFFF);
        for m in 0..16 {
            jpeg_save_markers(&mut decompress_info, 0xE0 + m, 0xFFFF);
        }
    }

    jpeg_read_header(&mut decompress_info, true as boolean);

    let width = decompress_info.image_width;
    let height = decompress_info.image_height;
    let color_space = decompress_info.jpeg_color_space;
    decompress_info.out_color_space = color_space;

    jpeg_start_decompress(&mut decompress_info);
    let row_stride = decompress_info.image_width as usize * decompress_info.output_components as usize;
    let buffer_size = row_stride * decompress_info.image_height as usize;
    let mut buffer = vec![0u8; buffer_size];

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
        _ => 3,
    };
    let mut buf_size = 0;
    let mut buf = mem::zeroed();
    jpeg_mem_dest(&mut compress_info, &mut buf, &mut buf_size);

    compress_info.image_width = width;
    compress_info.image_height = height;
    compress_info.in_color_space = color_space;
    compress_info.input_components = input_components as c_int;
    jpeg_set_defaults(&mut compress_info);

    if input_components == 3 && props.jpeg.chroma_subsampling != ChromaSubsampling::Auto {
        set_chroma_subsampling(props.jpeg.chroma_subsampling, &mut compress_info);
    }

    let row_stride = compress_info.image_width as usize * compress_info.input_components as usize;
    compress_info.dct_method = J_DCT_METHOD::JDCT_ISLOW;
    compress_info.optimize_coding = i32::from(true);
    jpeg_set_quality(&mut compress_info, props.jpeg.quality as i32, false as boolean);

    jpeg_start_compress(&mut compress_info, true as boolean);

    if props.keep_metadata {
        write_metadata(&mut decompress_info, &mut compress_info);
    }

    while compress_info.next_scanline < compress_info.image_height {
        let offset = compress_info.next_scanline as usize * row_stride;
        let jsamparray = [buffer[offset..].as_ptr()];
        jpeg_write_scanlines(&mut compress_info, jsamparray.as_ptr(), 1);
    }

    jpeg_finish_decompress(&mut decompress_info);
    jpeg_destroy_decompress(&mut decompress_info);
    jpeg_finish_compress(&mut compress_info);
    jpeg_destroy_compress(&mut compress_info);

    let slice = std::slice::from_raw_parts(buf, buf_size as usize);

    let result = slice.to_vec();

    free(buf as *mut c_void);

    Ok(result)
}
