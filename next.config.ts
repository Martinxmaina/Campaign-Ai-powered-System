import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	turbopack: {
		root: path.join(process.cwd()),
	},
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co",
			},
			{
				protocol: "https",
				hostname: "**.supabase.in",
			},
		],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === "production"
			? { exclude: ["error", "warn"] }
			: false,
	},
	experimental: {
		optimizePackageImports: ["recharts", "lucide-react", "@supabase/supabase-js"],
	},
};

export default nextConfig;
