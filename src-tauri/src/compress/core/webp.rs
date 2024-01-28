use std::fs::File;
use std::io::{Read, Write};
use std::ops::Deref;

use crate::constant::error::WebpError;

pub fn webp_compress(input_path: &str, output_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let compressed_image = compress_to_mem(input_path)?;
    let mut output_file = File::create(output_path)?;

    output_file.write_all(&compressed_image).map_err(WebpError::WriteError)?;

    Ok(())
}

pub fn compress_to_mem(input_path: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut input_file = File::open(input_path)?;

    let mut input_data = Vec::new();
    input_file.read_to_end(&mut input_data)?;

    let decoder = webp::Decoder::new(&input_data);

    let input_webp = decoder.decode().ok_or(WebpError::DecodeError)?;
    let input_image = input_webp.to_image();

    let encoder = webp::Encoder::from_image(&input_image).map_err(|_| WebpError::EncodeError)?;
    let encode = encoder.encode_simple(true, 75.0).map_err(|_| WebpError::CompressError)?;

    Ok(encode.deref().to_vec())
}
