interface TeamAssistantPreviewProps {
    title: string;
    description: string;
    prompts: string[];
    recentOutputs: string[];
}

export default function TeamAssistantPreview({
    title,
    description,
    prompts,
    recentOutputs,
}: TeamAssistantPreviewProps) {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Suggested prompts
                    </h3>
                    <div className="mt-3 space-y-2">
                        {prompts.map((prompt) => (
                            <button
                                key={prompt}
                                className="w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-slate-900">Recent outputs</h3>
                    <ul className="mt-3 space-y-2 text-xs text-slate-600">
                        {recentOutputs.map((output) => (
                            <li key={output} className="border-b border-slate-100 pb-2">
                                {output}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

