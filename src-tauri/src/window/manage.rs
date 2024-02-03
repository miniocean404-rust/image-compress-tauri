use tokio::sync::{mpsc, Mutex};

pub struct AsyncProcInputTx {
    pub inner: Mutex<mpsc::Sender<String>>,
}
