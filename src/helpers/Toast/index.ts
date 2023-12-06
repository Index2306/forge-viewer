import {toast, ToastPosition} from "react-toastify";

export const successToast = (message: any) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {backgroundColor: '#2a7f3c'}
    });
}

export const errorToast = (message: any, time?: number | false | undefined) => {
    toast.error(message, {
        position: "top-right",
        autoClose: time !== undefined ? time : 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {backgroundColor: '#ba1e24'}
    });
}

export const warningToast = (message: any, time?: number | false | undefined, position?: ToastPosition | undefined) => {
    toast.warning(message, {
        position: position ? position : "top-right",
        autoClose: time !== undefined ? time : 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {backgroundColor: '#e57124'}
    });
}


export const infoToast = (message: any) => {
    toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: {},
        toastId: 'unit-info'
    });
}

export const destroyToast = (id: number | string) => {
    toast.dismiss(id)
}