/** @type {import('next').NextConfig} */
const nextConfig = {
  // The catalogue package ships TypeScript source, so Next must compile it.
  transpilePackages: ["@jaiisha/catalogue"],
  // The storefront is served from a different origin in development.
  //
  // The cart is cookie-backed, so these must be a credentialed-CORS pair: an
  // exact origin (never "*") plus Allow-Credentials. With "*" the browser
  // silently drops the cart cookie and every request looks like a new cart.
  async headers() {
    const origin = process.env.STOREFRONT_ORIGIN ?? "http://localhost:4321";
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: origin },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, X-Admin-Key" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
