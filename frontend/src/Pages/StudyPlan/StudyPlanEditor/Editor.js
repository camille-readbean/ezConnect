import { useState } from "react";

const getTitle = () => {
  return "New Study Plan";
};

function Editor() {
  const [title, setTitle] = useState(getTitle());

  return (
    <>
      <h1 className="text-2xl font-semibold pb-3">{title}</h1>
    </>
  );
}

export default Editor;
