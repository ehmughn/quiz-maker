import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 
        ${hover ? "hover:border-purple-200 hover:shadow-md hover:shadow-purple-100/50 transition-all duration-200 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardLink({
  to,
  children,
  className = "",
  showArrow = true,
  ...props
}) {
  return (
    <Link
      to={to}
      className={`
        block bg-white rounded-xl border border-gray-200 
        hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100/50 
        transition-all duration-200 group
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex-1 min-w-0">{children}</div>
        {showArrow && (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all ml-4 shrink-0" />
        )}
      </div>
    </Link>
  );
}

export function StatCard({ icon: Icon, label, value, color = "purple" }) {
  const colors = {
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  return (
    <Card className="p-6 hover:border-purple-200 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${colors[color].bg} p-2.5 rounded-lg`}>
          <Icon className={`w-5 h-5 ${colors[color].text}`} />
        </div>
        <span className="text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </Card>
  );
}
