import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import ProjectsComponent from '../../Components/module/ProjectsComponent';

const ProjectsScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <ProjectsComponent />
    </ContainerComponent>
  );
};

export default ProjectsScreen;
