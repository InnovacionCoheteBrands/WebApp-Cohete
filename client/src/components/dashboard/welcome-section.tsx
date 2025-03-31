import { User } from "@shared/schema";

interface WelcomeSectionProps {
  user: Omit<User, 'password'> | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-primary/90 to-secondary/90 p-6 text-primary-foreground">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">
          {user ? `Welcome, ${user.fullName}` : 'Welcome to Cohete Workflow'}
        </h2>
        <p className="max-w-3xl">
          Create, manage, and organize your marketing projects with AI-powered workflows and content scheduling.
        </p>
        <div className="mt-4">
          <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-white/90">
            View Quick Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
