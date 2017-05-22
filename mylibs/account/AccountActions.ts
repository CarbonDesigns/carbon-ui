import { IEmailValidationModel, Response, ILoginModel, ILoginResult, IAccountInfo, IAddPasswordModel, IChangePasswordModel, IForgotPasswordModel, IResetPasswordModel } from "carbon-api";

export type AccountAction =
    {type: "Account_EmailValidation", response: Response<IEmailValidationModel, void>} |
    {type: "Account_LoginResponse", response: Response<ILoginModel, ILoginResult>} |
    {type: "Account_InfoUpdated", response: Response<IAccountInfo, void>} |
    {type: "Account_PasswordAdded", response: Response<IAddPasswordModel, void>} |
    {type: "Account_PasswordChanged", response: Response<IChangePasswordModel, void>} |
    {type: "Account_ForgotPasswordResponse", response: Response<IForgotPasswordModel, void>} |
    {type: "Account_ResetPasswordResponse", response: Response<IResetPasswordModel, void>} |
    {type: "Account_LoggedOut"};