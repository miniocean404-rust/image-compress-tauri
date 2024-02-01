use std::future::Future;

use tokio::task::JoinSet;

#[derive(Debug, Default)]
pub struct TokioPool<T> {
    pub max_task: usize,
    pub sets: JoinSet<T>,
}

impl<T: 'static> TokioPool<T> {
    pub async fn new(max: usize) -> Self {
        Self {
            max_task: max,
            sets: JoinSet::new(),
        }
    }

    pub async fn start_task<F>(&mut self, tasks: Vec<F>)
    where
        F: Future<Output = T>,
        F: Send + 'static,
        T: Send,
    {
        for task in tasks.into_iter() {
            while self.sets.len() >= self.max_task {
                self.sets.join_next().await;
            }

            self.sets.spawn(task);
        }

        while !self.sets.is_empty() {
            self.sets.join_next().await;
        }
    }
}
