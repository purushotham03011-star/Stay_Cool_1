import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Search, Calendar, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

// Common Input Container Interface
interface InputContainerProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const InputContainer: React.FC<InputContainerProps> = ({ label, error, required, className = '', children }) => (
  <div className={`space-y-1.5 w-full ${className}`}>
    {label && (
      <label className="block text-xs font-bold text-slate-750 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
  </div>
);

// 1. Text Input
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  required,
  className = '',
  ...props
}) => {
  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 shrink-0 select-none">
            {leftIcon}
          </div>
        )}
        <input
          type="text"
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 transition duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
          }`}
          required={required}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 shrink-0 select-none">
            {rightIcon}
          </div>
        )}
      </div>
    </InputContainer>
  );
};

// 2. Password Input
export interface PasswordInputProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon'> {
  showEyeToggle?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  required,
  className = '',
  showEyeToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <div className="relative flex items-center">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 py-2.5 text-xs text-slate-800 transition duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
          }`}
          required={required}
          {...props}
        />
        {showEyeToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-650 shrink-0 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </InputContainer>
  );
};

// 3. Search Input
export interface SearchInputProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  error,
  className = '',
  onClear,
  value,
  ...props
}) => {
  return (
    <InputContainer label={label} error={error} className={className}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 shrink-0 select-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="search"
          value={value}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2 text-xs text-slate-800 transition duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 text-slate-400 hover:text-slate-650 text-[10px] font-bold"
          >
            Clear
          </button>
        )}
      </div>
    </InputContainer>
  );
};

// 4. Dropdown (Select)
export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  error,
  options,
  placeholder,
  required,
  className = '',
  ...props
}) => {
  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <select
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 transition duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
        }`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </InputContainer>
  );
};

// 5. Date Picker
export interface DatePickerProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon'> {}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  required,
  className = '',
  ...props
}) => {
  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 shrink-0 select-none">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          type="date"
          className={`w-full rounded-xl border bg-white pl-10 pr-3.5 py-2.5 text-xs text-slate-800 transition duration-150 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
            error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
          }`}
          required={required}
          {...props}
        />
      </div>
    </InputContainer>
  );
};

// 6. File Upload Component with Drag & Drop
export interface FileUploadProps {
  label?: string;
  error?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  required,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  onFileSelect,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      alert(`File size exceeds the limit of ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center transition ${
          dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-300 hover:border-indigo-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-600 border">
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 max-w-[240px] truncate mx-auto">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready
              </p>
            </div>
            <button
              type="button"
              onClick={onButtonClick}
              className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Replace Document
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="inline-flex p-3 bg-indigo-50 rounded-full text-indigo-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Drag and drop your file, or{' '}
                <span onClick={onButtonClick} className="text-indigo-600 underline cursor-pointer hover:text-indigo-700">
                  browse
                </span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Supports PDF, PDF files or photos up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>
    </InputContainer>
  );
};

// 7. Auto-focusing OTP input (one-time passcode verification)
export interface OTPInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  length?: number;
  onComplete: (otp: string) => void;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  label,
  error,
  required,
  length = 6,
  onComplete,
  className = '',
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // pre-fill input array refs length
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const handleChange = (value: string, idx: number) => {
    const val = value.replace(/[^0-9]/g, ''); // Numeric only
    const updated = [...code];
    updated[idx] = val.substring(val.length - 1); // Get last typed digit
    setCode(updated);

    // Auto focus next box
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }

    // Trigger complete
    const fullCode = updated.join('');
    if (fullCode.length === length) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (!code[idx] && idx > 0) {
        // focus back if empty
        const updated = [...code];
        updated[idx - 1] = '';
        setCode(updated);
        inputsRef.current[idx - 1]?.focus();
      } else {
        const updated = [...code];
        updated[idx] = '';
        setCode(updated);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    const chars = pastedData.split('').slice(0, length);

    const updated = [...code];
    for (let i = 0; i < length; i++) {
      updated[i] = chars[i] || '';
    }
    setCode(updated);

    // Focus last or active slot
    const focusIdx = Math.min(chars.length, length - 1);
    inputsRef.current[focusIdx]?.focus();

    const fullCode = updated.join('');
    if (fullCode.length === length) {
      onComplete(fullCode);
    }
  };

  return (
    <InputContainer label={label} error={error} required={required} className={className}>
      <div className="flex gap-2 justify-between items-center max-w-sm mx-auto">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputsRef.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={idx === 0 ? handlePaste : undefined}
            className="w-11 h-12 text-center text-sm font-extrabold text-slate-900 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
          />
        ))}
      </div>
    </InputContainer>
  );
};
