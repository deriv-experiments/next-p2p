import { DerivAPI } from "@/utils/API";

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

async function listAdverts (Deriv: DerivAPI) : Promise<Advert[] | undefined> {
  if (!Deriv.isAuthorized) {
    return;
  }

  const data = await Deriv.send({
    p2p_advertiser_adverts: 1, offset: 0, limit: 50
  });

  return data.p2p_advertiser_adverts.list;
}

export default listAdverts;
