"use client";

import AnnouncementHeader from "@/components/sections/announcement-header";
import Navigation from "@/components/sections/navigation";
import UpcomingProjects from "@/components/sections/upcoming-projects";

import FundedProjectsTable from "@/components/sections/funded-projects-table";
import NewsletterSection from "@/components/sections/newsletter";
import Footer from "@/components/sections/coinlist-footer";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <AnnouncementHeader />
      <Navigation />
      
      <div className="flex-1">
        <UpcomingProjects />
        <FundedProjectsTable />
        <NewsletterSection />
      </div>

      <Footer />
    </main>
  );
}
