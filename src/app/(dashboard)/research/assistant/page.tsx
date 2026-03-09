import TeamAssistantPreview from "@/components/team/TeamAssistantPreview";

export default function ResearchAssistantPage() {
    return (
        <TeamAssistantPreview
            title="Research AI Assistant"
            description="Accelerate polling analysis, issue framing, and insights synthesis."
            prompts={[
                "Summarize key drivers from latest tracking poll",
                "Compare voter sentiment changes by county",
                "Generate hypotheses for youth support decline",
            ]}
            recentOutputs={[
                "Insight memo: urban cost-of-living concern clusters",
                "Trend brief: opposition narrative acceleration",
                "Survey recommendation: undecided voter questionnaire update",
            ]}
        />
    );
}

