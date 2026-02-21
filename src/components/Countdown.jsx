import React, { useEffect, useState } from "react";

const Countdown = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = endTime - Date.now();

    if (difference <= 0) {
      return null;
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
      seconds,
    ).padStart(2, "0")}s`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);

      if (!updated) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <div className="de_countdown">{timeLeft || "0h 00m 00s"}</div>;
};

export default Countdown;
