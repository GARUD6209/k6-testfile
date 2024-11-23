import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // ramp-up to 100 users over 1 minute
    { duration: '1m', target: 20 }, // stay at 200 users for 1 minute
    { duration: '1m', target: 0 },   // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(90)<1500'], // 90% of requests must complete below 1.5s
  },
};

export default function () {
  const signupUrl = 'http://localhost:8080/auth/signup';
  const signinUrl = 'http://localhost:8080/auth/signin';

  // Generate a unique username for each request to avoid conflicts
  const username = `user_${randomString(10)}`;
  const password = 'password123';
  const name = `Alex_${randomString(4)} Johnson`;
  const mobileNumber = `99${Math.floor(10000000 + Math.random() * 90000000)}`; // Random 10-digit number
  const email = `${randomString(8)}@example.com`;
  const gstNumber = `GST${randomString(5).toUpperCase()}XYZ`;
  const address = `789 Oak Avenue, Metropolis${randomString(5).toUpperCase()}`;

  // Signup payload
  const signupPayload = JSON.stringify({
    username: username,
    password: password,
    cityId: 1,
    name: name,
    mobileNumber: mobileNumber,
    email: email,
    gstNumber: gstNumber,
    address: address,
    otp: "112233",
    enabled: true,
  });

  // Signin payload
  const signinPayload = JSON.stringify({
    username: username,
    password: password,
   
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Signup request
  let signupRes = http.post(signupUrl, signupPayload, params);

  check(signupRes, {
    'signup status is 200': (r) => r.status === 200,
    'signup response contains User registered successfully': (r) => r.body.includes('User registered successfully'),
  });

  // Signin request
  let signinRes = http.post(signinUrl, signinPayload, params);

  check(signinRes, {
    'signin status is 200': (r) => r.status === 200,
    'signin response contains jwtToken': (r) => r.json().hasOwnProperty('jwtToken'),
  });

  sleep(1); // wait for 1 second between iterations
}
