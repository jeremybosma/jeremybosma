import million from 'million/compiler';
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default million.next(
  nextConfig, { auto: { rsc: true } }
);
