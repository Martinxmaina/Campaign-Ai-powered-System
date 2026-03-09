import TeamAssistantPreview from "@/components/team/TeamAssistantPreview";

export default function CallCenterAssistantPage() {
    return (
        <TeamAssistantPreview
            title="Call Center AI Assistant"
            description="Help agents classify calls, suggest responses, and summarize issue trends."
            prompts={[
                "Summarize top 5 call reasons today",
                "Draft polite response for delayed service complaint",
                "Flag calls needing urgent follow-up",
            ]}
            recentOutputs={[
                "Issue digest: cost-of-living and jobs dominate calls",
                "Agent script update: 3 new objection handlers",
                "Escalation list: 12 high-priority constituent cases",
            ]}
        />
    );
}

