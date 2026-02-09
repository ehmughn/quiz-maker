import { AlertCircle, Check } from "lucide-react";

export default function Input({
  label,
  error,
  success,
  hint,
  icon: Icon,
  className = "",
  required,
  ...props
}) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 border rounded-lg outline-none transition-all duration-200
            placeholder:text-gray-400
            focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${Icon ? "pl-10" : ""}
            ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : hasSuccess
                  ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                  : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"
            }
          `}
          {...props}
        />
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
        {hasSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  required,
  rows = 3,
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-lg outline-none transition-all duration-200 resize-none
          placeholder:text-gray-400
          focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${
            hasError
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
    </div>
  );
}
