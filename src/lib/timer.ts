import { readable } from "svelte/store";

/**
 * @returns the number of seconds elapsed since the Unix epoch
 */
function getNow(): number {
  return Math.floor(Date.now() / 1000);
}

function createTimerStore() {
  let intervalID = 0;
  // FIXME: timer should fire when Date.now() % 1000 === 0
  return readable(getNow(), function start(set) {
    // Make sure we get the latest value when a component mounts
    set(getNow());
    intervalID = setInterval(() => {
      set(getNow());
    }, 1000);
    return function stop() {
      clearInterval(intervalID);
      intervalID = 0;
    };
  });
}

export const now = createTimerStore();
