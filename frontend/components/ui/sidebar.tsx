"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

export interface ItemProps {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const SidebarGap = ({ className }: { className?: string }) => {
  return (
    <div className={cn("shrink-0 max-w-[250px] w-16 sm:w-full py-8 px-4", className)} />
  );
};

export const Sidebar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-start gap-5 py-8 px-4 h-screen max-w-[250px] w-16 sm:w-full bg-card rounded-r-xl fixed z-50",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("hidden sm:flex", className)}>{children}</div>;
};

export const SidebarBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:gap-0 items-start w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SidebarItem = ({
  item,
  className,
  ...props
}: {
  item: ItemProps;
  className?: string;
  props?: LinkProps;
}) => {
  const pathname = usePathname();

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-start gap-2 w-full hover:bg-slate-800 rounded-md p-2 font-medium [&.active]:text-active [&.active]:bg-slate-800 sm:[&.active]:bg-transparent",
        pathname === item.href ? "active" : "",
        className
      )}
      {...props}
    >
      <span>{item.icon}</span>
      <span className="hidden sm:block">{item.label}</span>
    </Link>
  );
};
