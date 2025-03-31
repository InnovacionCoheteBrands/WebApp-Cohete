import { useAuth } from "@/hooks/use-auth";
import WelcomeSection from "@/components/dashboard/welcome-section";
import QuickActions from "@/components/dashboard/quick-actions";
import CreateScheduleSection from "@/components/dashboard/create-schedule-section";
import RecentProjects from "@/components/dashboard/recent-projects";
import RecentSchedules from "@/components/dashboard/recent-schedules";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeSection user={user} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Create Schedule Section */}
      <CreateScheduleSection />

      {/* Recent Projects Section */}
      <RecentProjects />

      {/* Recent Schedules Section */}
      <RecentSchedules />
    </div>
  );
}
