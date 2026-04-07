import { WorkspaceDashboardPage } from "@/components/dashboard/WorkspaceReporting";

export default function PerformancePage() {
    return (
        <WorkspaceDashboardPage
            workspace="performance"
            title="Ad Performance"
            description="Campaign performance metrics and campaign rows sourced from the reporting tables."
            recordsHeading="Active campaigns"
            recordsDescription="Campaign-level ad performance records from the database."
            recordsType="campaigns"
            recordColumns={[
                { key: "title", label: "Campaign", source: "title", emphasize: true },
                { key: "platform", label: "Platform", source: "subtitle" },
                { key: "spend", label: "Spend", metaKey: "spend" },
                { key: "impressions", label: "Impressions", metaKey: "impressions" },
                { key: "ctr", label: "CTR", metaKey: "ctr" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
