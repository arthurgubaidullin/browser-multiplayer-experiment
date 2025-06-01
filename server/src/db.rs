use automerge::{AutoCommit, ScalarValue, transaction::Transactable};
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone)]
pub struct DB {
    value: Arc<RwLock<AutoCommit>>,
}

impl DB {
    #[must_use]
    pub fn new() -> Self {
        let mut doc = AutoCommit::new();

        doc.put(automerge::ROOT, "counter", ScalarValue::Counter(0.into()))
            .unwrap();

        Self {
            value: Arc::new(RwLock::new(doc)),
        }
    }

    pub fn update(&self, data: &[u8]) {
        let mut state_value = self.value.write().unwrap();

        let mut other_state_value = AutoCommit::load(data).unwrap();

        if state_value.get_heads() == other_state_value.get_heads() {
            return;
        }

        state_value.merge(&mut other_state_value).unwrap();

        drop(state_value);
    }

    #[must_use]
    pub fn value(&self) -> Vec<u8> {
        self.value.read().unwrap().clone().save()
    }
}

impl Default for DB {
    fn default() -> Self {
        Self::new()
    }
}
