// 用于语句上是否执行
// #[cfg(debug_assertions)] debug
// #[cfg(not(debug_assertions))] release

pub fn is_debug() -> bool {
    cfg!(debug_assertions)
}

pub fn is_release() -> bool {
    cfg!(not(debug_assertions))
}
