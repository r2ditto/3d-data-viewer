import { ViewerLayout } from "@/components/viewer-layout";
import { ViewerProvider } from "@/contexts/viewer-context";

export default function Home() {
  return (
    <ViewerProvider>
      <ViewerLayout />
    </ViewerProvider>
  );
}
