import {FileData} from "@/models/tool";

export interface UserFile {
    id: string,
    name: string,
    status: number,
    projectIndex: number,
    fileExtension: string,
    urn: string,
    modelDerivativeUrn: string,
    thumbnail: string,
    project?: any,
    isNew?: boolean,
    fileData?: FileData
    updatedOn?: Date
}

export interface UploadFileToProjectModel {
    projectId: string,
    data: FormData,
}


