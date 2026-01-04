pub mod compress;
pub mod shared;
pub mod utils;
pub mod window;

// 重新导出 command 函数以便 main.rs 使用
pub use window::command::drag::{get_drag_files, start_compress};
pub use window::command::js2rs::js2rs;
pub use window::command::splash::close_splashscreen;
