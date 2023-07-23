import { useContext, useEffect, useState } from "react";
import DerivAPIContext from "@/context/DerivAPIContext";

const usePromise = <T extends unknown>(fn: (...args: any[]) => Promise<T>, ...args: any[]): T | undefined => {
  const Deriv = useContext(DerivAPIContext);
  const [state, setState] = useState<T[]>();

  useEffect(() => {
    Deriv.on('authorize', async () => {
      fn(Deriv, ...args).then(setState);
    });
    fn(Deriv, ...args).then(setState);
  }, [fn, JSON.stringify(args)]);

  return state;
}

export default usePromise;
