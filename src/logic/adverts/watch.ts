import { DerivAPI } from "@/utils/API";
import Emittery from "emittery";

type Advert = {
  account_currency: string;
  active_orders: number;
  advertiser_details: {
      id: string;
  };
  counterparty_type: string;
  id: string;
  is_active: 0 | 1;
  is_visible: 0 | 1;
  local_currency: string;
  payment_method: string;
  rate_display: string;
  type: string;
}

type AdvertsEmitter = Emittery<{ change: Advert[], close: any }>;

async function watchAdverts (emitter: AdvertsEmitter, Deriv: DerivAPI) {
  if (!Deriv.isAuthorized) {
    return;
  }

  const refresh = async () => {
    const data = await Deriv.send({
      p2p_advertiser_adverts: 1, offset: 0, limit: 50
    });

    if (data.error) {
      return;
    }
    emitter.emit('change', data.p2p_advertiser_adverts.list);
  };

  const timer = setInterval(refresh, 5000);
  refresh();

  emitter.on('close', () => {
    console.log('cleanup');
    clearInterval(timer);
  });
}

export default watchAdverts;
