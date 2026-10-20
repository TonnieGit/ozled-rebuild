import { StoreChrome } from "@/components/layout/store-chrome";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return <StoreChrome>{children}</StoreChrome>;
}
