import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarItem,
  ItemProps,
  SidebarGap,
} from "@/components/ui/sidebar";
import { House, Trophy } from "lucide-react";
import { cookieToInitialState } from "wagmi";
import { config as wagmiConfig } from "@/wagmi";
import { Providers } from "./providers";
import { headers } from "next/headers";
import Connect from "./_components/connect";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const items: ItemProps[] = [
  {
    href: "/",
    label: "Home",
    icon: <House className="size-4" />,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="size-4" />,
  },
];

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clicker",
  description:
    "Clicker is a simple clicker game where users can register, click, and see the top 10 users.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    (await headers()).get("cookie")
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <Toaster position="top-right" />
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="flex h-screen w-full">
            <SidebarGap />
            <Sidebar>
              <SidebarHeader>
                <h1 className="text-2xl font-bold text-active">Clicker</h1>
              </SidebarHeader>
              <SidebarBody>
                {items.map((item, index) => (
                  <SidebarItem item={item} key={index} />
                ))}
              </SidebarBody>
            </Sidebar>
            <div className="flex flex-col w-full">
              <div className="flex justify-end pt-8 max-w-6xl w-full mx-auto">
                {/* @ts-expect-error this is expected */}
                <appkit-button className="self-end" />
              </div>
              <div className="w-full h-full max-w-6xl mx-auto px-8">
                <Providers initialState={initialState}>
                  <Connect>{children}</Connect>
                </Providers>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
