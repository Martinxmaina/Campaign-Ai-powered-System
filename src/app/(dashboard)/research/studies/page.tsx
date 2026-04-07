import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function ResearchStudiesPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="research"
            title="Active studies"
            description="Overview of live and planned research projects."
            recordType="studies"
            columns={[
                { key: "title", label: "Study", source: "title", emphasize: true },
                { key: "type", label: "Type", source: "subtitle" },
                { key: "status", label: "Status", source: "status" },
                { key: "owner", label: "Owner", source: "owner_label" },
            ]}
        />
    );
}
