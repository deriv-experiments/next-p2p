import { useState } from "react";

function RenderMultiplier({ component: Component, min = 0, max = 10 }) {
  const [counter, setCounter] = useState(1);

  const handleIncrement = () => {
    if (counter < max) {
      setCounter(counter + 1);
    }
  };

  const handleDecrement = () => {
    if (counter > min) {
      setCounter(counter - 1);
    }
  };

  return (
    <div>
      <div>Currently showing: {counter}</div>
      <button onClick={handleIncrement} disabled={counter === max}>Add</button>
      <button onClick={handleDecrement} disabled={counter === min}>Remove</button>
      <hr />
      {[...Array(counter)].map((_, index) => <Component key={index} />)}
    </div>
  );
}

export default RenderMultiplier;
