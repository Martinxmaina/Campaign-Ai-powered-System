import TeamAssistantPreview from "@/components/team/TeamAssistantPreview";

export default function FinanceAssistantPage() {
    return (
        <TeamAssistantPreview
            title="Finance AI Assistant"
            description="Support budget planning, variance analysis, and compliance-ready summaries."
            prompts={[
                "Explain budget variance by cost center this month",
                "Generate a weekly finance brief for leadership",
                "Identify spend categories with abnormal growth",
            ]}
            recentOutputs={[
                "Variance summary: media spend +8% vs plan",
                "Cash-flow alert: runway reduced by 8 days",
                "Compliance checklist: quarter-end submissions",
            ]}
        />
    );
}

