import TeamAssistantPreview from "@/components/team/TeamAssistantPreview";

export default function MediaAssistantPage() {
    return (
        <TeamAssistantPreview
            title="Media AI Assistant"
            description="Improve content strategy, creative testing, and media briefing quality."
            prompts={[
                "Summarize top-performing content themes this week",
                "Suggest A/B test ideas for youth creative",
                "Create briefing notes for tomorrow's media appearance",
            ]}
            recentOutputs={[
                "Creative recommendation: 3 hooks outperform control by 14%",
                "Content brief: issue-by-issue script pack for spokespeople",
                "Performance snapshot: channel-level CPM and engagement",
            ]}
        />
    );
}

