import React, { useEffect, useCallback, useMemo, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";

const Editor = ({ raw, onSave }) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: raw }]
    }
  ]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // const children = React.Children.toArray(props.children);

  console.log("#in editor", raw);

  const components = {
    h5: ({ children, ...props }) => <h1>{children}</h1>,
    wrapper: ({ children }) => {
      console.log("#MDXRenderer ", children)
      return <pre>{children}</pre>;
    }
  };

  // return <MDXRenderer>{children}</MDXRenderer>;

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Editable renderElement={renderElement} />
      {/* <MDXProvider components={components}> */}
      {/* <MDXRenderer components={components}>{children}</MDXRenderer> */}
      {/* </MDXProvider> */}
    </Slate>
  );
};

export default Editor;

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return (
    <p style={{ color: "blue" }} {...props.attributes}>
      {props.children}
    </p>
  );
};
