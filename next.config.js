/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          port: "",
          pathname: "/dj2qrmf22/**"
        },
      ]
    }
  };
  
  export default nextConfig;

// import withPWA from 'next-pwa';

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: "standalone",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//         port: "",
//         pathname: "/dj2qrmf22/**",
//       },
//     ],
//   },
// };

// const pwaConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development', // PWA disabled in dev
// })(nextConfig);

// export default pwaConfig;
