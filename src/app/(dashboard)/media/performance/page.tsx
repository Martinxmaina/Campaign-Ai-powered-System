import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function MediaPerformancePage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="media"
            title="Content performance"
            description="Performance placements and reach metrics stored in the reporting tables."
            recordType="placements"
            columns={[
                { key: "title", label: "Placement", source: "title", emphasize: true },
                { key: "channel", label: "Channel", metaKey: "channel" },
                { key: "reach", label: "Estimated reach", metaKey: "reach" },
                { key: "completion", label: "Video completion", metaKey: "completion" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
