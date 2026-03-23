import { CATEGORY_STYLES } from '../../../utils/constants';

export default function ActivityRow({ activity }) {
  const style = CATEGORY_STYLES[activity.category] || CATEGORY_STYLES.other;

  return (
    <div className={`border-l-4 ${style.border} pl-4 py-3`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-warm-500">{activity.time}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
            {activity.category}
          </span>
        </div>
        {activity.estimated_cost_usd > 0 && (
          <span className="text-sm text-warm-500 whitespace-nowrap">
            ${activity.estimated_cost_usd}
          </span>
        )}
      </div>

      <h4 className="font-semibold text-warm-800 text-sm mb-1">{activity.title}</h4>
      <p className="text-sm text-warm-600 leading-relaxed">{activity.description}</p>

      {activity.duration_mins && (
        <span className="text-xs text-warm-400 mt-1 inline-block">
          ~{activity.duration_mins} min
        </span>
      )}

      {activity.insider_tip && (
        <div className="mt-2 bg-[#FBF3D5] rounded-lg px-3 py-2">
          <p className="text-xs text-[#8B7A2B]">
            <span className="font-semibold">Insider tip:</span> {activity.insider_tip}
          </p>
        </div>
      )}
    </div>
  );
}
