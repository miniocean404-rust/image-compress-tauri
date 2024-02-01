use mozjpeg_sys::*;
use std::{mem, ptr, slice};

use super::common::write_metadata;

struct JPEGOptimizer {
    srcinfo: jpeg_decompress_struct,
    dstinfo: jpeg_compress_struct,
}

impl JPEGOptimizer {
    unsafe fn new() -> JPEGOptimizer {
        JPEGOptimizer {
            srcinfo: mem::zeroed(),
            dstinfo: mem::zeroed(),
        }
    }
}

impl Drop for JPEGOptimizer {
    fn drop(&mut self) {
        unsafe {
            jpeg_destroy_decompress(&mut self.srcinfo);
            jpeg_destroy_compress(&mut self.dstinfo);
        }
    }
}

// https://github.com/imazen/imageflow/blob/9ca1dbd50c7390d5953d711bf78b49ea5217aa60/imageflow_core/src/codecs/mozjpeg_decoder.rs#L17
// This function losslessly optimizes jpegs.
// Based on the jpegtran.c example program in libjpeg.
pub fn optimize_lossless_jpeg(bytes: &[u8], keep_metadata: bool) -> std::thread::Result<&mut [u8]> {
    unsafe {
        std::panic::catch_unwind(|| {
            let mut info = JPEGOptimizer::new();
            let mut err = create_error_handler();
            info.srcinfo.common.err = &mut err;
            jpeg_create_decompress(&mut info.srcinfo);
            jpeg_mem_src(&mut info.srcinfo, bytes.as_ptr(), bytes.len() as c_ulong);

            // 原本没有
            if keep_metadata {
                jpeg_save_markers(&mut info.srcinfo, 0xFE, 0xFFFF);
                for m in 0..16 {
                    jpeg_save_markers(&mut info.srcinfo, 0xE0 + m, 0xFFFF);
                }
            }

            info.dstinfo.optimize_coding = 1;
            info.dstinfo.common.err = &mut err;
            jpeg_create_compress(&mut info.dstinfo);
            jpeg_read_header(&mut info.srcinfo, 1);

            let src_coef_arrays = jpeg_read_coefficients(&mut info.srcinfo);
            jpeg_copy_critical_parameters(&info.srcinfo, &mut info.dstinfo);

            let mut buf = ptr::null_mut();
            let mut outsize: c_ulong = 0;

            jpeg_mem_dest(&mut info.dstinfo, &mut buf, &mut outsize);
            // jpeg_set_quality(&mut info.dstinfo, 80, false as boolean);
            jpeg_write_coefficients(&mut info.dstinfo, src_coef_arrays);

            if keep_metadata {
                write_metadata(&mut info.srcinfo, &mut info.dstinfo);
            }

            jpeg_finish_compress(&mut info.dstinfo);
            jpeg_finish_decompress(&mut info.srcinfo);

            slice::from_raw_parts_mut(buf, outsize as usize)
        })
    }
}

unsafe fn create_error_handler() -> jpeg_error_mgr {
    let mut err: jpeg_error_mgr = mem::zeroed();
    jpeg_std_error(&mut err);
    err.error_exit = Some(unwind_error_exit);
    err.emit_message = Some(silence_message);
    err
}

// 处理错误退出消息
extern "C-unwind" fn unwind_error_exit(cinfo: &mut jpeg_common_struct) {
    let message = unsafe {
        let err = cinfo.err.as_ref().unwrap();
        match err.format_message {
            Some(fmt) => {
                let buffer = mem::zeroed();
                fmt(cinfo, &buffer);
                let len = buffer.iter().take_while(|&&c| c != 0).count();
                String::from_utf8_lossy(&buffer[..len]).into()
            }
            None => format!("libjpeg error: {}", err.msg_code),
        }
    };
    std::panic::resume_unwind(Box::new(message))
}

extern "C-unwind" fn silence_message(_cinfo: &mut jpeg_common_struct, _level: c_int) {}
