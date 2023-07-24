import { useContext, useEffect, useState } from "react";
import Emittery from "emittery";
import DerivAPIContext from "@/context/DerivAPIContext";
import { DerivAPI } from "./API";

const cache = new Map();

const useChangeStream = <T = any>(fn: (Deriv: DerivAPI, emitter: Emittery<{ change: T[], close: any }>, ...args: any[]) => void, ...args: any[]): T[] | undefined => {
  const Deriv = useContext(DerivAPIContext);
  const [state, setState] = useState<T[]>();

  useEffect(() => {
    let key = JSON.stringify(args);
    let emitter = cache.get(key);

    if (emitter) {
      emitter.on('change', setState);
      emitter.listenerCount++;
      setState(emitter.lastValue);
    }

    if (!emitter) {
      emitter = new Emittery<{ change: T[], close: any }>();
      emitter.listenerCount = 1;
      emitter.on('change', value => {
        emitter.lastValue = value;
      });
      cache.set(key, emitter);
      emitter.on('change', setState);

      fn(Deriv, emitter, ...args);

      Deriv.on('authorize', async () => {
        fn(Deriv, emitter, ...args);
      });
    }

    return () => {
      emitter.off('change', setState);
      emitter.listenerCount--;

      if (emitter.listenerCount === 0) {
        emitter.emit('close');
        cache.delete(key);
      }
    };
  }, [fn, ...args]);

  return state;
}

export default useChangeStream;
