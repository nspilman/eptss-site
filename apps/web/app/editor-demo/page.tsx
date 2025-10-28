import { PageTitle } from "@/components/PageTitle";
import { EditorDemo } from "./EditorDemo";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Markdown Editor Demo | Everyone Plays the Same Song",
  description: "Test the rich text markdown editor for EPTSS reflections and blog posts.",
};

const EditorDemoPage = () => {
  return (
    <>
      <PageTitle title="Editor Demo" />
      <EditorDemo />
    </>
  );
};

export default EditorDemoPage;
