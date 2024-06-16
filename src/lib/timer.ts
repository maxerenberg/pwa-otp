import { readable } from "svelte/store";

/**
 * @returns the number of seconds elapsed since the Unix epoch
 */
function getNow(): number {
  return Math.floor(Date.now() / 1000);
}

function createTimerStore() {
  return readable(getNow(), function start(set) {
    // Make sure we get the latest value when a component mounts
    const nowMillis = Date.now();
    set(Math.floor(nowMillis / 1000));
    const millisUntilNextSecond = 1000 - (nowMillis % 1000);
    let intervalID = 0;
    // Start the interval when the next second begins
    let timeoutID = setTimeout(() => {
      set(getNow());
      intervalID = setInterval(() => {
        set(getNow());
      }, 1000);
      timeoutID = 0;
    }, millisUntilNextSecond);
    return function stop() {
      if (timeoutID) clearTimeout(timeoutID);
      if (intervalID) clearInterval(intervalID);
    };
  });
}

export const now = createTimerStore();
