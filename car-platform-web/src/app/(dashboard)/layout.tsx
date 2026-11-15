import WorkspaceShell from '@/components/layout/WorkspaceShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell>{children}</WorkspaceShell>
  );
}
