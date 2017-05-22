import { LoginProvider } from "carbon-api";

export const LoginRequiredError = "login_required";

export const LoginProviders: LoginProvider[] = ["Google", "Facebook", "Twitter", "Microsoft"];

export const MinPasswordLength = 6;

export type ErrorCode =
    "unknownCompany" |
    "appRunError" |
    "appNotFound" |
    "badShareCode";

export type InfoCode =
    "passwordResetRequested" |
    "passwordReset";

export type Url =
    "/register" |
    "/account" |
    "/login";