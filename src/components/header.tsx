import { UserMenu } from "@/components/user-menu";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between p-5">
        <div className={`text-lg font-semibold`}>3D | GIS Viewer</div>
        <UserMenu />
      </div>
    </header>
  );
}
