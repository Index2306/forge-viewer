import React, {ReactNode} from 'react';
import {ProjectModalType} from "@/models/project";
import ConfirmModal from "@/components/Project/ProjectCard/ConfirmModal";
import ProjectModalEdit from "@/components/Project/ProjectModalEdit";

const ProjectModal: React.FC<ProjectModalProps>
    = ({isOpen, onClose, projectModal, setChangeData, onChangeToolsSelectedProject: onChangeToolSelectedProject}) => {

    const titleModal = (): ReactNode => {
        if (projectModal) {
            switch (projectModal.type) {
                case "edit": return <ProjectModalEdit isOpen={isOpen} onClose={onClose} project={projectModal?.project} setChangeData={setChangeData} onChangeToolsSelectedProject={onChangeToolSelectedProject}/>
                case "delete": return <ConfirmModal isOpen={isOpen} onClose={onClose} project={projectModal?.project}/>
                default: return <></>
            }
        }
        return <></>
    }

    return <>{titleModal()}</>;
};

export default React.memo(ProjectModal);

export interface ProjectModalProps {
    isOpen: boolean,
    onClose: () => void,
    setChangeData?: (value: boolean) => void,
    projectModal: ProjectModalType | undefined,
    onChangeToolsSelectedProject?: (id: string, tools: string[]) => void
}
