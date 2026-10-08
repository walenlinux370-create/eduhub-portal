import type {NextConfig} from "next";

const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"X-DNS-Prefetch-Control",value:"off"},
  {key:"Cross-Origin-Opener-Policy",value:"same-origin"},
  {key:"Cross-Origin-Resource-Policy",value:"same-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"},
  {key:"Content-Security-Policy",value:[
    "default-src 'self'",
    "img-src 'self' data: https://raw.githubusercontent.com",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' https://www.googletagmanager.com",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com"
  ].join("; ")}
];

const nextConfig:NextConfig={
  poweredByHeader:false,
  reactStrictMode:true,
  async headers(){
    return [{source:"/(.*)",headers:securityHeaders}];
  }
};

export default nextConfig;
