import { useContext, useEffect, useState } from "react";
import Emittery from "emittery";
import DerivAPIContext from "@/context/DerivAPIContext";

const useChangeStream = <T = any>(fn: (emitter: Emittery<{ change: T[], close: any }>, ...args: any[]) => void, ...args: any[]): T[] | undefined => {
  const Deriv = useContext(DerivAPIContext);
  const [state, setState] = useState<T[]>();

  useEffect(() => {
    setState(undefined);
    const emitter = new Emittery<{ change: T[], close: any }>();
    emitter.on('change', setState);
    emitter.on('error', console.error);
    fn(emitter, Deriv, ...args);

    Deriv.on('authorize', async () => {
      fn(emitter, Deriv, ...args);
    });

    return () => {
      emitter.emit('close');
    };
  }, [fn, JSON.stringify(args)]);

  return state;
}

export default useChangeStream;
