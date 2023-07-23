import React from "react";
import watchAdverts from "@/logic/adverts/watch";
import listAdverts from "@/logic/adverts/list";
import useChangeStream from "@/utils/useChangeStream";
import useDerivAPI from "@/utils/useDerivAPI";
import usePromise from "@/utils/usePromise";

function Offers() {
  const Deriv = useDerivAPI();
  const adverts = useChangeStream(watchAdverts);
  // const adverts = usePromise(listAdverts);

  if (!Deriv.isAuthorized) { 
    return 'You need to be logged in';
  }

  if (adverts?.error) {
    return (
      <>
        <strong>Error:</strong>
        <p>{adverts.error.message}</p>
      </>
    )
  }

  if (!adverts) {
    return 'Loading...'
  }

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>ID</th>
          <th>Account Currency</th>
          <th>Active Orders</th>
          <th>Counterparty Type</th>
          <th>Local Currency</th>
          <th>Payment Method</th>
          <th>Ad ID</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {adverts.map((item, index) => (
          <tr key={index}>
            <td>{item.is_visible ? 'Y' : 'N'}</td>
            <td>{item.advertiser_details.id}</td>
            <td>{item.account_currency}</td>
            <td>{item.rate_display}</td>
            <td>{item.active_orders}</td>
            <td>{item.counterparty_type}</td>
            <td>{item.local_currency}</td>
            <td>{item.payment_method}</td>
            <td>{item.id}</td>
            <td>{item.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function OffersPage () {
  return (
    <>
      <Offers />
      <Offers />
    </>
  );
}
