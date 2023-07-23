import DerivAPIContext from "@/context/DerivAPIContext";
import { useContext, useEffect, useState } from "react";
import { DerivAPI } from "./API";

function useDerivAPI () : DerivAPI {
  const Deriv = useContext(DerivAPIContext);
  const [isConnected, setIsConnected] = useState();
  const [isAuthorized, setIsAuthorized] = useState();

  useEffect(() => {
    Deriv.on('open', () => setIsConnected(true));
    Deriv.on('authorize', () => setIsAuthorized(true));
  }, []);

  return Deriv;
}

export default useDerivAPI;
