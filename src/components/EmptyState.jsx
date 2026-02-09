import { Link } from "react-router-dom";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLink,
  actionIcon: ActionIcon,
}) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 font-medium"
        >
          {ActionIcon && <ActionIcon className="w-5 h-5" />}
          {action}
        </Link>
      )}
    </div>
  );
}
