import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetaTags from "react-meta-tags";

const Edit = ({ setPage, logged, loginAction }) => {
  let navigate = useNavigate();

  useEffect(() => {
    if (logged) {
      setPage("edit");
    } else {
      navigate("/");
      setPage("home");
      loginAction();
    }
  }, [logged]);

  return (
    <div style={{ minHeight: "89vh" }}>
      <MetaTags>
        <title>
          Edycja treści | Samorząd Uczniowski 1 Liceum Ogólnokształcącego w
          Gliwicach
        </title>
        <meta
          name="description"
          content="Edycja zawartości strony Samorządu Uczniowskiego 1 Liceum Ogólnokształącego w Gliwicach."
        />
        <meta property="og:title" content="Edycja | SUILO Gliwice" />
        <meta property="og:image" content="" /> {/* TODO: Add image */}
      </MetaTags>
      <p>Edit</p>
    </div>
  );
};

export default Edit;
