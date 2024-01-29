#![feature(c_unwind)]
#![allow(unused_attributes)]

use std::error::Error;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::panic::catch_unwind;

use super::common::Props;
use super::{lossless, lossy};

pub fn compress(input: &str, output: &str, props: &Props) -> Result<(), Box<dyn std::error::Error>> {
    let in_file = fs::read(input)?;

    let out_buffer = to_mem(in_file, props)?;
    let mut out_file = File::create(output)?;
    out_file.write_all(&out_buffer)?;

    Ok(())
}

pub fn to_mem(in_file: Vec<u8>, props: &Props) -> Result<Vec<u8>, Box<dyn Error>> {
    unsafe {
        catch_unwind(|| -> Result<Vec<u8>, Box<dyn Error>> {
            if props.lossless {
                lossless::lossless(in_file, props)
            } else {
                lossy::lossy(in_file, props)
            }
        })
        .expect("执行 jpeg_sys panic 了")
    }
}
