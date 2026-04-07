import { WorkspaceRecordsTablePage } from "@/components/dashboard/WorkspaceReporting";

export default function FinanceTransactionsPage() {
    return (
        <WorkspaceRecordsTablePage
            workspace="finance"
            title="Transactions"
            description="Line-item finance transactions sourced from database-backed reporting records."
            recordType="transactions"
            columns={[
                { key: "code", label: "ID", source: "code" },
                { key: "date", label: "Date", source: "primary_date" },
                { key: "department", label: "Department", metaKey: "department" },
                { key: "category", label: "Category", source: "title", emphasize: true },
                { key: "amount", label: "Amount", metaKey: "amount" },
                { key: "status", label: "Status", source: "status" },
            ]}
        />
    );
}
