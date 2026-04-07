import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function OppositionAdsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="opposition-ads"
            title="Opposition Ads"
            description="Observed opposition ad campaigns tracked in the database."
            recordType="ads"
            columns={[
                { key: "title", label: "Campaign", source: "title", emphasize: true },
                { key: "platform", label: "Platform", source: "subtitle" },
                { key: "spend", label: "Spend", metaKey: "spend" },
                { key: "impressions", label: "Impressions", metaKey: "impressions" },
                { key: "objective", label: "Objective", metaKey: "objective" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
