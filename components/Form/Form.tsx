import { InputField } from "./InputField";

interface FormSections {
  id: string;
  placeholder: string;
  defaultValue: string | number;
  label: string;
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

export function Form({ formSections, disabled, title, description }: Props) {
  return (
    <div className="w-full flex-col items-center justify-center">
      <div className="flex flex-col text-center font-fraunces">
        <h1 className="py-4 text-center font-bold text-white text-lg">
          {title}
        </h1>
        <span className="text-white font-light text-sm">{description}</span>
      </div>
      {formSections?.map((field, i) => (
        <div
          key={field.id + i}
          className={`flex flex-col bg-gray-50 my-2 mx-1 p-4 rounded-2xl flex-1 min-w-[100px] sm:min-w-[${
            !!field.isSmall ? "250px" : "400px"
          }] ${field.hidden ? "hidden" : ""}`}
        >
          <InputField
            field={{ ...field, field: field.id.toString() }}
            errors={[]}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
