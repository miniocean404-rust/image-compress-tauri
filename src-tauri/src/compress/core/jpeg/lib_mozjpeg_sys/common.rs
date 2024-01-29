use std::ffi::c_int;

use mozjpeg_sys::{jpeg_common_struct, jpeg_compress_struct, jpeg_decompress_struct, jpeg_write_marker};

#[derive(Copy, Clone)]
pub struct JpegParameters {
    pub quality: u32,
    pub chroma_subsampling: ChromaSubsampling,
}

#[derive(Copy, Clone, PartialEq)]
pub enum ChromaSubsampling {
    CS444,
    CS422,
    CS420,
    CS411,
    Auto,
}

#[derive(Copy, Clone)]
pub struct Props {
    pub jpeg: JpegParameters,
    pub keep_metadata: bool,
    pub lossless: bool,
    pub width: u32,
    pub height: u32,
    pub output_size: u32,
}

pub(crate) unsafe fn set_chroma_subsampling(subsampling: ChromaSubsampling, dst_info: &mut jpeg_compress_struct) {
    (*dst_info.comp_info.add(1)).h_samp_factor = 1;
    (*dst_info.comp_info.add(1)).v_samp_factor = 1;
    (*dst_info.comp_info.add(2)).h_samp_factor = 1;
    (*dst_info.comp_info.add(2)).v_samp_factor = 1;
    match subsampling {
        ChromaSubsampling::CS444 => {
            (*dst_info.comp_info.add(0)).h_samp_factor = 1;
            (*dst_info.comp_info.add(0)).v_samp_factor = 1;
        }
        ChromaSubsampling::CS422 => {
            (*dst_info.comp_info.add(0)).h_samp_factor = 2;
            (*dst_info.comp_info.add(0)).v_samp_factor = 1;
        }
        ChromaSubsampling::CS411 => {
            (*dst_info.comp_info.add(0)).h_samp_factor = 4;
            (*dst_info.comp_info.add(0)).v_samp_factor = 1;
        }
        ChromaSubsampling::CS420 => {
            (*dst_info.comp_info.add(0)).h_samp_factor = 2;
            (*dst_info.comp_info.add(0)).v_samp_factor = 2;
        }
        _ => {}
    }
}

pub(crate) unsafe fn write_metadata(src_info: &mut jpeg_decompress_struct, dst_info: &mut jpeg_compress_struct) {
    let mut marker = src_info.marker_list;

    while !marker.is_null() {
        jpeg_write_marker(dst_info, (*marker).marker as i32, (*marker).data, (*marker).data_length);
        marker = (*marker).next;
    }
}

static mut JPEG_ERROR: c_int = 0;

pub(crate) unsafe extern "C-unwind" fn error_handler(cinfo: &mut jpeg_common_struct) {
    JPEG_ERROR = (*cinfo.err).msg_code;
    panic!("内部 JPEG 错误: {}", JPEG_ERROR);
}

pub(crate) unsafe extern "C-unwind" fn error_message_handler(_cinfo: &mut jpeg_common_struct) {}
