import { User } from "@/models/user";

export interface AuthModel {
    data: LoginResult | undefined,
    isFetching: boolean,
    isError: boolean,
    isSuccess: boolean,
    errorMessage: string[],
}

export interface LoginModel {
    userName: string,
    password: string
}

export interface LoginResult {
    user: User;
    access_token: string,
    refresh_token?: string | null | undefined,
    exp: number

}

export interface RegisterModel {
    firstName: string,
    lastName: string,
    companyName: string,
    country: string,
    email: string,
    password: string,
    confirmPassword: string
}

export interface ChangePasswordModel {
    password: string,
    newPassword: string,
    confirmPassword: string
}

export interface UpdateProfileModel {
    firstName: string,
    lastName: string,
    country: string,
    companyName: string
  }