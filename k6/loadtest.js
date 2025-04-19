import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1, // virtual users
  duration: "10s", // test duration
};

export default function () {
  const res = http.post(
    "http://app:3000/nasa/request-apod",
    JSON.stringify({
      email: `user${Math.floor(Math.random() * 10000)}@example.com`,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
