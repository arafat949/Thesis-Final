import type { ComponentChildren } from 'preact';

function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

type FieldInputProps = {
  id: string;
  name: string;
  type?: string;
  inputMode?: string;
  pattern?: string;
  autoComplete?: string;
  maxLength?: number;
  placeholder: string;
  errorId: string;
  errorMessage: string;
  value: string;
  trailingAdornment?: ComponentChildren;
  onInput: (value: string) => void;
  onBlur: () => void;
  onFocus: () => void;
};

export function FieldInput({
  id,
  name,
  type = 'tel',
  inputMode = 'numeric',
  pattern,
  autoComplete,
  maxLength,
  placeholder,
  errorId,
  errorMessage,
  value,
  trailingAdornment,
  onInput,
  onBlur,
  onFocus,
}: FieldInputProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div class="space-y-1">
      <div class="relative">
        <input
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          pattern={pattern}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={errorId}
          aria-invalid={hasError}
          class={classNames(
            'w-full rounded-xl border bg-slate-50 px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:bg-white focus:ring-2',
            trailingAdornment ? 'pr-24' : 'pr-12',
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200',
            'placeholder:text-slate-500',
          )}
          value={value}
          onInput={(event) => onInput(event.currentTarget.value)}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {trailingAdornment}
      </div>
      <div id={errorId} aria-live="polite" class="min-h-[18px] text-[13px] text-red-600">
        {errorMessage}
      </div>
    </div>
  );
}
