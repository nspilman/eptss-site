import { InputField } from "./InputField";
import { FieldTypes } from "./types";

interface FormSections {
  id: string;
  placeholder: string;
  defaultValue: string | number;
  label: string;
  type?: FieldTypes;
  isSmall?: boolean;
  value?: number | string;
  hidden?: boolean;
  optional?: boolean;
}

interface Props {
  formSections?: FormSections[];
  disabled?: boolean;
  title: string;
  description: React.ReactNode;
  submitButtonText?: string;
}

export function Form({ formSections, disabled, title, description}: Props) {
  return (
    <div className="w-full flex-col items-center justify-center">
      <div className="flex flex-col text-center font-fraunces">
        <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2] pb-1">
          {title}
        </h1>
        <span className="text-white font-light text-sm">{description}</span>
      </div>
      {formSections?.map((field, i) => (
        <div
          key={field.id + i}
          className={`space-y-6 ${field.hidden ? "hidden" : ""}`}
        >
          <InputField
          //@ts-ignore
            field={{ ...field, field: field.id.toString() }}
            errors={[]}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
