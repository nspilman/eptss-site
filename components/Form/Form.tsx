import { motion } from "framer-motion";
import { InputField } from "./InputField";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
    <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans w-full">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-10"></div>
    
    <div className="max-w-2xl mx-auto relative z-10">
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]"
      >
        Submit Your Song
      </motion.h1>
    <div className="min-h-screen bg-[#0a0a1e] text-gray-100 p-6 md:p-12 relative overflow-hidden font-sans">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-10"></div>
    
    <div className="max-w-2xl mx-auto relative z-10">
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]"
      >
        Submit Your Song
      </motion.h1>

      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <motion.div 
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Label htmlFor="songTitle" className="text-gray-200 font-semibold mb-2 block">
            Song Title
          </Label>
          <Input 
            id="songTitle" 
            className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
            placeholder="Enter song title"
          />
        </motion.div>

        <motion.div 
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Label htmlFor="artist" className="text-gray-200 font-semibold mb-2 block">
            Artist
          </Label>
          <Input 
            id="artist" 
            className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
            placeholder="Enter artist name"
          />
        </motion.div>

        <motion.div 
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Label htmlFor="link" className="text-gray-200 font-semibold mb-2 block">
            Song Link (optional)
          </Label>
          <Input 
            id="link" 
            className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
            placeholder="Enter song link"
          />
          <a href="#" className="text-sm text-[#e2e240] hover:text-[#f0f050] mt-2 inline-block">
            Listen Here
          </a>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button className="w-full bg-gradient-to-r from-[#e2e240] to-[#40e2e2] text-gray-900 hover:from-[#f0f050] hover:to-[#50f0f0] transition-all duration-300">
            Submit Song
          </Button>
        </motion.div>
      </motion.form>
    </div>
  </div>
    </div>
  </div>
  );
}
