import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues> {
  field: Path<T>;
  optional?: boolean;
}

export function VoteInput<T extends FieldValues>({
  field,
  optional,
}: Props<T>) {
  return (
    <div className="flex flex-col w-full">
      <div>
        <div className="flex flex-row">
          {["1", "2", "3", "4", "5"].map((value, i) => (
            <div key={i} className="px-2 flex items-center">
              <label
                htmlFor={field + i}
                className="font-fraunces text-md font-medium text-black"
              >
                {value}
              </label>
              <input
                className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
                required={!optional}
                type="radio"
                value={value}
                name={field}
                id={field + i}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row">
        <span className="text-md font-light font-roboto text-black-800 text-center my-4">
          Absolutely not! ---------- yes please!!{" "}
        </span>
      </div>
    </div>
  );
}
