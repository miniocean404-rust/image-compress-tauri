#![feature(c_unwind)]
#![allow(unused_attributes)]

use std::error::Error;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::panic::catch_unwind;

use super::common::ChromaSubsampling;
use super::{lossless, lossy};

pub fn compress(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let out_buffer = to_mem(input, false)?;
    let mut out_file = File::create(output)?;
    out_file.write_all(&out_buffer)?;

    Ok(())
}

pub fn to_mem(input: &str, lossless: bool) -> Result<Vec<u8>, Box<dyn Error>> {
    let in_file = fs::read(input)?;

    unsafe {
        catch_unwind(|| -> Result<Vec<u8>, Box<dyn Error>> {
            if lossless {
                lossless::lossless(in_file, false)
            } else {
                lossy::lossy(in_file, false, 80, ChromaSubsampling::Auto)
            }
        })
        .expect("执行 jpeg_sys panic 了")
    }
}
