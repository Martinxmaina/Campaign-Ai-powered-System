import {
    Settings,
    Bell,
    Shield,
    Database,
    Palette,
    Globe,
    ChevronRight,
    Save,
} from "lucide-react";

const settingsSections = [
    {
        id: "account",
        label: "Account & Profile",
        icon: Settings,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        description: "Manage your profile and login credentials",
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        description: "Configure alerts and notification preferences",
    },
    {
        id: "security",
        label: "Security & Access",
        icon: Shield,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        description: "Two-factor auth, sessions, API keys",
    },
    {
        id: "data",
        label: "Data & Integrations",
        icon: Database,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        description: "Connect data sources and manage imports",
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: Palette,
        iconBg: "bg-pink-50",
        iconColor: "text-pink-600",
        description: "Customize the look and feel of the platform",
    },
    {
        id: "campaign",
        label: "Campaign Settings",
        icon: Globe,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        description: "Manage active campaigns, regions, and election dates",
    },
];

export default function SettingsPage() {
    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Manage platform configuration, notifications, and integrations.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Profile Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Full Name
                        </label>
                        <input
                            defaultValue="Sarah Jenkins"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Role
                        </label>
                        <input
                            defaultValue="Campaign Manager"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Email
                        </label>
                        <input
                            defaultValue="sarah.jenkins@votercore.app"
                            type="email"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Phone
                        </label>
                        <input
                            defaultValue="+254 712 345 678"
                            type="tel"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <button className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            {/* Campaign Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                    Active Campaign
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Campaign Name
                        </label>
                        <input
                            defaultValue="2027 General Election"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                            Election Date
                        </label>
                        <input
                            defaultValue="2027-08-09"
                            type="date"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.id}
                            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                            <div
                                className={`p-2 ${section.iconBg} ${section.iconColor} rounded-lg`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                    {section.label}
                                </p>
                                <p className="text-xs text-slate-500">{section.description}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                    );
                })}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h2 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h2>
                <p className="text-xs text-red-500 mb-3">
                    These actions are irreversible. Proceed with caution.
                </p>
                <button className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                    Remove Campaign Data
                </button>
            </div>
        </div>
    );
}
