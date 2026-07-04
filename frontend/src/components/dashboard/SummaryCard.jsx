import React from 'react';

const SummaryCard = ({ icon, text, number, color }) => {
    // Advanced mapping for premium glowing accents
    let colors = {
        bg: 'from-indigo-600/30 to-violet-600/20',
        border: 'border-indigo-500/20',
        text: 'text-indigo-400',
        glow: 'bg-indigo-500/10'
    };

    if (color?.includes("green")) {
        colors = {
            bg: 'from-emerald-600/30 to-teal-600/20',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            glow: 'bg-emerald-500/10'
        };
    } else if (color?.includes("blue")) {
        colors = {
            bg: 'from-cyan-600/30 to-blue-600/20',
            border: 'border-cyan-500/20',
            text: 'text-cyan-400',
            glow: 'bg-cyan-500/10'
        };
    } else if (color?.includes("yellow")) {
        colors = {
            bg: 'from-amber-600/30 to-orange-600/20',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            glow: 'bg-amber-500/10'
        };
    } else if (color?.includes("red")) {
        colors = {
            bg: 'from-rose-600/30 to-pink-600/20',
            border: 'border-rose-500/20',
            text: 'text-rose-400',
            glow: 'bg-rose-500/10'
        };
    }

    return (
        <div className="group glass-panel rounded-2xl border border-slate-800 p-6 relative overflow-hidden transition-all duration-300 hover:border-slate-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
            {/* Ambient background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-30 group-hover:opacity-60 transition-opacity ${colors.glow}`} />
            
            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                    <div className={`${colors.text} text-2xl`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{text}</p>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{number}</p>
                </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
    );
};

export default SummaryCard;