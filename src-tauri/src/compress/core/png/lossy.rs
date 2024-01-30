use std::fs::File;
use std::io::Write;

// https://github.com/valterkraemer/imagequant-wasm/blob/main/src/lib.rs
pub fn to_file(input: &str, output: &str) -> Result<(), Box<dyn std::error::Error>> {
    let png_vec = to_mem(input)?;

    let mut output_file = File::create(output)?;
    output_file.write_all(png_vec.as_slice())?;

    Ok(())
}

pub fn to_mem(input: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let image = lodepng::decode32_file(input)?;
    let rgba = image.buffer;
    let width = image.width;
    let height = image.height;

    let mut lib = imagequant::new();
    lib.set_speed(4)?;
    lib.set_quality(0, 80)?;
    // lib.set_max_colors(128)?;

    let mut img = lib.new_image(rgba, width, height, 0.0)?;

    let mut res = lib.quantize(&mut img)?;
    // res.set_dithering_level(1.0)?;

    let (palette, pixels) = res.remapped(&mut img)?;

    let mut encoder = lodepng::Encoder::new();
    encoder.set_palette(palette.as_slice())?;

    // 写入文件
    // encoder.encode_file(output, pixels.as_slice(), width, height)?;
    let png_vec = encoder.encode(pixels.as_slice(), width, height)?;

    Ok(png_vec)
}
