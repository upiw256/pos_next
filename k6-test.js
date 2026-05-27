import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 20 }, // simulate ramp-up of traffic from 1 to 20 users over 5 seconds.
    { duration: '10s', target: 20 }, // stay at 20 users for 10 seconds
    { duration: '5s', target: 0 }, // ramp-down to 0 users
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/login');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
