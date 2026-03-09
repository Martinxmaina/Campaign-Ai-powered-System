import TeamAssistantPreview from "@/components/team/TeamAssistantPreview";

export default function CommsAssistantPage() {
    return (
        <TeamAssistantPreview
            title="Comms AI Assistant"
            description="Generate talking points, campaign copy variants, and channel recommendations."
            prompts={[
                "Draft 3 message variants for cost-of-living rebuttal",
                "Summarize today's top opposition narratives for spokespersons",
                "Recommend best channel mix for youth turnout drive",
            ]}
            recentOutputs={[
                "Brief: 6-point spokesperson response pack",
                "Copy bank: WhatsApp + SMS + Email templates",
                "Content calendar: 7-day narrative defense plan",
            ]}
        />
    );
}

