import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function FinanceReportsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="finance"
            title="Finance reports"
            description="Structured financial outputs to share with leadership and auditors."
            recordType="reports"
            columns={[
                { key: "title", label: "Report", source: "title", emphasize: true },
                { key: "type", label: "Type", source: "subtitle" },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "owner", label: "Owner", source: "owner_label" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
