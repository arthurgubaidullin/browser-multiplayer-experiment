import * as Automerge from "@automerge/automerge/next";
import { computed, signal, Signal, type ReadonlySignal } from "@preact/signals";

type CounterDocument = {
  counter: Automerge.Counter;
};

export class Counter {
  #state: Signal<Automerge.Doc<CounterDocument> | null>;
  #socket: WebSocket;

  constructor() {
    const state = signal<Automerge.Doc<CounterDocument> | null>(null);

    this.#state = state;

    this.#socket = new WebSocket("ws://localhost:3000/ws");

    this.#socket.addEventListener("open", function () {
      console.debug("Socket connected!");
    });

    this.#socket.addEventListener("close", function () {
      console.debug("Socket disconnected!");
    });

    this.#socket.addEventListener(
      "message",
      async function (event: MessageEvent<Blob>) {
        console.debug("Message received via web socket.");

        const otherValue = Automerge.load<CounterDocument>(
          new Uint8Array(await event.data.arrayBuffer())
        );

        const stateValue = state.peek();

        if (stateValue === null) {
          state.value = otherValue;
          return;
        }

        state.value = Automerge.merge(stateValue, otherValue);
      }
    );
  }

  get value(): ReadonlySignal<number | null> {
    return computed(() => this.#state.value?.counter.value ?? null);
  }

  increment(this: this) {
    const stateValue = this.#state.peek();

    if (stateValue == null) {
      return;
    }

    this.#state.value = Automerge.change(stateValue, (doc) => {
      doc.counter.increment(1);
    });

    this.send();
  }

  private send() {
    const stateValue = this.#state.peek();

    if (stateValue === null) {
      return;
    }

    const bytes = Automerge.save(stateValue);
    this.#socket.send(bytes);

    console.debug("Message sent via web socket.");
  }
}
