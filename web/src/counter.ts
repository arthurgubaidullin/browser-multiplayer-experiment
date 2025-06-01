import "./app.css";
import * as Automerge from "@automerge/automerge/next";
import { computed, signal, Signal, type ReadonlySignal } from "@preact/signals";

type CounterDocument = {
  counter: Automerge.Counter;
};

export class Counter {
  #state: Signal<Automerge.Doc<CounterDocument>>;

  constructor() {
    const doc = Automerge.from({
      counter: new Automerge.Counter(),
    });

    this.#state = signal(doc);
  }

  get value(): ReadonlySignal<number> {
    return computed(() => this.#state.value.counter.value);
  }

  increment(this: this) {
    this.#state.value = Automerge.change(this.#state.peek(), (doc) => {
      doc.counter.increment(1);
    });
  }
}
