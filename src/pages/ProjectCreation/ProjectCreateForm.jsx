import React from "react";
import { ProjectCreationProvider } from "./ProjectCreationContext";
import ProjectCreationWizard from "./ProjectCreationWizard";

const CreateProjectForm = () => (
  <ProjectCreationProvider>
    <ProjectCreationWizard />
  </ProjectCreationProvider>
);

export default CreateProjectForm;
